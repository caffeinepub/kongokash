import { useCallback, useEffect, useState } from "react";
import {
  migrateFromLocalStorage,
  secureGet,
  secureRemove,
  secureSet,
} from "../lib/secureStorage";
import {
  type WalletState,
  deriveAddress,
  deriveKeyFromSeed,
  generateSeedPhrase,
} from "./useNonCustodialWallet";

function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(b64: string): Uint8Array {
  return new Uint8Array(
    atob(b64)
      .split("")
      .map((c) => c.charCodeAt(0)),
  );
}

export async function getPartnerWalletStatus(
  partnerId: string,
): Promise<"active" | "none"> {
  const key = `kk_partner_${partnerId}_encrypted`;
  const addrKey = `kk_partner_${partnerId}_address`;
  const encrypted = await secureGet(key);
  const addr = await secureGet(addrKey);
  return encrypted && addr ? "active" : "none";
}

export interface PartnerWalletHook {
  walletState: WalletState;
  walletAddress: string | null;
  biometricAvailable: boolean;
  isLoading: boolean;
  generateSeedPhrase: (length: 12 | 24) => string[];
  deriveAddress: (words: string[]) => string;
  createWallet: (words: string[], password: string) => Promise<void>;
  unlockWithBiometric: () => Promise<boolean>;
  enrollBiometric: (address: string) => Promise<boolean>;
  lockWallet: () => void;
  clearWallet: () => Promise<void>;
}

export function usePartnerWallet(partnerId: string): PartnerWalletHook {
  const lsEncrypted = `kk_partner_${partnerId}_encrypted`;
  const lsSalt = `kk_partner_${partnerId}_salt`;
  const lsIv = `kk_partner_${partnerId}_iv`;
  const lsWebauthnId = `kk_partner_${partnerId}_webauthn_id`;
  const lsAddress = `kk_partner_${partnerId}_address`;
  const lsKdf = `kk_partner_${partnerId}_kdf`;

  const [walletState, setWalletState] = useState<WalletState>("no-wallet");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (window.PublicKeyCredential) {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          .then(setBiometricAvailable)
          .catch(() => setBiometricAvailable(false));
      }
      // One-time migration from localStorage
      await migrateFromLocalStorage([
        lsEncrypted,
        lsSalt,
        lsIv,
        lsWebauthnId,
        lsAddress,
        lsKdf,
      ]);
      const encrypted = await secureGet(lsEncrypted);
      const address = await secureGet(lsAddress);
      if (!mounted) return;
      if (encrypted && address) {
        setWalletState("locked");
        setWalletAddress(address);
      } else {
        setWalletState("no-wallet");
      }
      setIsLoading(false);
    };
    init();
    return () => {
      mounted = false;
    };
  }, [lsEncrypted, lsAddress, lsSalt, lsIv, lsWebauthnId, lsKdf]);

  const createWallet = useCallback(
    async (words: string[], _password: string) => {
      const rawSalt = crypto.getRandomValues(new Uint8Array(32));
      await secureSet(lsSalt, toBase64(rawSalt));
      await secureSet(lsKdf, "scrypt");
      const derivedKey = await deriveKeyFromSeed(words, rawSalt);
      const address = deriveAddress(words);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(
        JSON.stringify({ address, createdAt: Date.now(), partnerId }),
      );
      const buf = new ArrayBuffer(encoded.length);
      new Uint8Array(buf).set(encoded);
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        derivedKey,
        buf,
      );
      await secureSet(lsEncrypted, toBase64(encrypted));
      await secureSet(lsIv, toBase64(iv));
      await secureSet(lsAddress, address);
      setWalletAddress(address);
      setWalletState("unlocked");
    },
    [lsEncrypted, lsSalt, lsIv, lsAddress, lsKdf, partnerId],
  );

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    const credIdB64 = await secureGet(lsWebauthnId);
    if (
      !credIdB64 ||
      !window.PublicKeyCredential ||
      !navigator.credentials?.get
    )
      return false;
    try {
      const credId = fromBase64(credIdB64);
      const buf = new ArrayBuffer(credId.length);
      new Uint8Array(buf).set(credId);
      const rawChallenge = crypto.getRandomValues(new Uint8Array(32));
      const challenge = new ArrayBuffer(32);
      new Uint8Array(challenge).set(rawChallenge);
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ id: buf, type: "public-key" }],
          userVerification: "required",
          timeout: 60000,
        },
      });
      if (credential) {
        const address = await secureGet(lsAddress);
        setWalletAddress(address);
        setWalletState("unlocked");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [lsWebauthnId, lsAddress]);

  const enrollBiometricForPartner = useCallback(
    async (address: string): Promise<boolean> => {
      if (!window.PublicKeyCredential || !navigator.credentials?.create)
        return false;
      try {
        const rawChallenge = crypto.getRandomValues(new Uint8Array(32));
        const challenge = new ArrayBuffer(32);
        new Uint8Array(challenge).set(rawChallenge);
        const rawUserId = new TextEncoder().encode(
          address.slice(0, 64).padEnd(64, "0"),
        );
        const userId = new ArrayBuffer(rawUserId.length);
        new Uint8Array(userId).set(rawUserId);
        const credential = (await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: {
              name: "KongoKash Partner Wallet",
              id: window.location.hostname,
            },
            user: { id: userId, name: address, displayName: "Partner Wallet" },
            pubKeyCredParams: [
              { alg: -7, type: "public-key" },
              { alg: -257, type: "public-key" },
            ],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required",
            },
            timeout: 60000,
          },
        })) as PublicKeyCredential | null;
        if (!credential) return false;
        const idArr = new Uint8Array(credential.rawId);
        await secureSet(lsWebauthnId, toBase64(idArr));
        return true;
      } catch {
        return false;
      }
    },
    [lsWebauthnId],
  );

  const lockWallet = useCallback(() => {
    setWalletState("locked");
  }, []);

  const clearWallet = useCallback(async () => {
    await secureRemove(lsEncrypted);
    await secureRemove(lsSalt);
    await secureRemove(lsIv);
    await secureRemove(lsWebauthnId);
    await secureRemove(lsAddress);
    await secureRemove(lsKdf);
    setWalletState("no-wallet");
    setWalletAddress(null);
  }, [lsEncrypted, lsSalt, lsIv, lsWebauthnId, lsAddress, lsKdf]);

  return {
    walletState,
    walletAddress,
    biometricAvailable,
    isLoading,
    generateSeedPhrase,
    deriveAddress,
    createWallet,
    unlockWithBiometric,
    enrollBiometric: enrollBiometricForPartner,
    lockWallet,
    clearWallet,
  };
}
