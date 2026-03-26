import { useCallback, useEffect, useState } from "react";
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

export function getPartnerWalletStatus(partnerId: string): "active" | "none" {
  const key = `kk_partner_${partnerId}_encrypted`;
  const addrKey = `kk_partner_${partnerId}_address`;
  return localStorage.getItem(key) && localStorage.getItem(addrKey)
    ? "active"
    : "none";
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
  clearWallet: () => void;
}

export function usePartnerWallet(partnerId: string): PartnerWalletHook {
  const lsEncrypted = `kk_partner_${partnerId}_encrypted`;
  const lsSalt = `kk_partner_${partnerId}_salt`;
  const lsIv = `kk_partner_${partnerId}_iv`;
  const lsWebauthnId = `kk_partner_${partnerId}_webauthn_id`;
  const lsAddress = `kk_partner_${partnerId}_address`;

  const [walletState, setWalletState] = useState<WalletState>("no-wallet");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setBiometricAvailable)
        .catch(() => setBiometricAvailable(false));
    }
    const encrypted = localStorage.getItem(lsEncrypted);
    const address = localStorage.getItem(lsAddress);
    if (encrypted && address) {
      setWalletState("locked");
      setWalletAddress(address);
    } else {
      setWalletState("no-wallet");
    }
    setIsLoading(false);
  }, [lsEncrypted, lsAddress]);

  const createWallet = useCallback(
    async (words: string[], _password: string) => {
      const rawSalt = crypto.getRandomValues(new Uint8Array(16));
      localStorage.setItem(lsSalt, toBase64(rawSalt));
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
      localStorage.setItem(lsEncrypted, toBase64(encrypted));
      localStorage.setItem(lsIv, toBase64(iv));
      localStorage.setItem(lsAddress, address);
      setWalletAddress(address);
      setWalletState("unlocked");
    },
    [lsEncrypted, lsSalt, lsIv, lsAddress, partnerId],
  );

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    const credIdB64 = localStorage.getItem(lsWebauthnId);
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
        const address = localStorage.getItem(lsAddress);
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
        localStorage.setItem(lsWebauthnId, toBase64(idArr));
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

  const clearWallet = useCallback(() => {
    localStorage.removeItem(lsEncrypted);
    localStorage.removeItem(lsSalt);
    localStorage.removeItem(lsIv);
    localStorage.removeItem(lsWebauthnId);
    localStorage.removeItem(lsAddress);
    setWalletState("no-wallet");
    setWalletAddress(null);
  }, [lsEncrypted, lsSalt, lsIv, lsWebauthnId, lsAddress]);

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
