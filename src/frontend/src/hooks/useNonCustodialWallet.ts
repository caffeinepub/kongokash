import { useCallback, useEffect, useState } from "react";
import { BIP39_WORDLIST } from "../data/bip39-wordlist";

export type WalletState = "no-wallet" | "locked" | "unlocked";

const LS_ENCRYPTED = "kk_wallet_encrypted";
const LS_SALT = "kk_wallet_salt";
const LS_IV = "kk_wallet_iv";
const LS_WEBAUTHN_ID = "kk_webauthn_id";

function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(
    atob(b64)
      .split("")
      .map((c) => c.charCodeAt(0)),
  ).buffer
    ? (new Uint8Array(
        atob(b64)
          .split("")
          .map((c) => c.charCodeAt(0)),
      ) as unknown as Uint8Array<ArrayBuffer>)
    : (new Uint8Array(0) as unknown as Uint8Array<ArrayBuffer>);
}

function toFixedUint8Array(u: Uint8Array): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(u.length);
  new Uint8Array(buf).set(u);
  return new Uint8Array(buf) as unknown as Uint8Array<ArrayBuffer>;
}

export function generateSeedPhrase(length: 12 | 24): string[] {
  const entropy = new Uint32Array(length);
  crypto.getRandomValues(entropy);
  return Array.from(entropy).map(
    (n) => BIP39_WORDLIST[n % BIP39_WORDLIST.length],
  );
}

export function deriveAddress(seedWords: string[]): string {
  // Deterministic hex address from seed
  const hex = Array.from(seedWords)
    .map((w) => {
      let h = 0;
      for (const c of w) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      return h.toString(16).padStart(8, "0");
    })
    .join("");
  return `0x${hex.slice(0, 40)}`;
}

export async function deriveKeyFromSeed(
  seedWords: string[],
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(seedWords.join(" ")),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const fixedSalt = toFixedUint8Array(salt);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: fixedSalt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptAndStore(
  walletData: object,
  derivedKey: CryptoKey,
): Promise<void> {
  const rawIv = crypto.getRandomValues(new Uint8Array(12));
  const iv = toFixedUint8Array(rawIv);
  const encoded = new TextEncoder().encode(JSON.stringify(walletData));
  const fixedEncoded = toFixedUint8Array(encoded);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    fixedEncoded,
  );
  localStorage.setItem(LS_ENCRYPTED, toBase64(encrypted));
  localStorage.setItem(LS_IV, toBase64(iv));
}

export async function decryptFromStorage(
  derivedKey: CryptoKey,
): Promise<object | null> {
  const encryptedB64 = localStorage.getItem(LS_ENCRYPTED);
  const ivB64 = localStorage.getItem(LS_IV);
  if (!encryptedB64 || !ivB64) return null;
  try {
    const iv = fromBase64(ivB64);
    const encData = fromBase64(encryptedB64);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      derivedKey,
      encData,
    );
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch {
    return null;
  }
}

export async function enrollBiometric(walletAddress: string): Promise<boolean> {
  if (!window.PublicKeyCredential || !navigator.credentials?.create)
    return false;
  try {
    const rawChallenge = crypto.getRandomValues(new Uint8Array(32));
    const challenge = toFixedUint8Array(rawChallenge);
    const rawUserId = new TextEncoder().encode(
      walletAddress.slice(0, 64).padEnd(64, "0"),
    );
    const userId = toFixedUint8Array(rawUserId);
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "KongoKash Wallet", id: window.location.hostname },
        user: {
          id: userId,
          name: walletAddress,
          displayName: "KongoKash Wallet",
        },
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
    localStorage.setItem(LS_WEBAUTHN_ID, toBase64(credential.rawId));
    return true;
  } catch {
    return false;
  }
}

export async function authenticateBiometric(): Promise<boolean> {
  const credIdB64 = localStorage.getItem(LS_WEBAUTHN_ID);
  if (!credIdB64 || !window.PublicKeyCredential || !navigator.credentials?.get)
    return false;
  try {
    const rawChallenge = crypto.getRandomValues(new Uint8Array(32));
    const challenge = toFixedUint8Array(rawChallenge);
    const credId = fromBase64(credIdB64);
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [
          {
            id: credId,
            type: "public-key",
          },
        ],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return !!credential;
  } catch {
    return false;
  }
}

export interface NonCustodialWalletHook {
  walletState: WalletState;
  seedPhrase: string[] | null;
  walletAddress: string | null;
  biometricAvailable: boolean;
  isLoading: boolean;
  generateSeedPhrase: (length: 12 | 24) => string[];
  deriveAddress: (words: string[]) => string;
  createWallet: (words: string[]) => Promise<void>;
  unlockWithBiometric: () => Promise<boolean>;
  unlockWithSeed: (words: string[]) => Promise<boolean>;
  restoreFromSeed: (
    words: string[],
  ) => Promise<{ address: string; success: boolean }>;
  enrollBiometric: (address: string) => Promise<boolean>;
  lockWallet: () => void;
  clearWallet: () => void;
}

export function useNonCustodialWallet(): NonCustodialWalletHook {
  const [walletState, setWalletState] = useState<WalletState>("no-wallet");
  const [seedPhrase, setSeedPhrase] = useState<string[] | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setBiometricAvailable)
        .catch(() => setBiometricAvailable(false));
    }
    const encrypted = localStorage.getItem(LS_ENCRYPTED);
    const address = localStorage.getItem("kk_wallet_address");
    if (encrypted && address) {
      setWalletState("locked");
      setWalletAddress(address);
    } else {
      setWalletState("no-wallet");
    }
    setIsLoading(false);
  }, []);

  const createWallet = useCallback(async (words: string[]) => {
    const rawSalt = crypto.getRandomValues(new Uint8Array(16));
    localStorage.setItem(LS_SALT, toBase64(rawSalt));
    const derivedKey = await deriveKeyFromSeed(words, rawSalt);
    const address = deriveAddress(words);
    await encryptAndStore({ address, createdAt: Date.now() }, derivedKey);
    localStorage.setItem("kk_wallet_address", address);
    setWalletAddress(address);
    setWalletState("unlocked");
    setSeedPhrase(null);
  }, []);

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    const ok = await authenticateBiometric();
    if (ok) {
      const address = localStorage.getItem("kk_wallet_address");
      setWalletAddress(address);
      setWalletState("unlocked");
    }
    return ok;
  }, []);

  const unlockWithSeed = useCallback(
    async (words: string[]): Promise<boolean> => {
      const saltB64 = localStorage.getItem(LS_SALT);
      if (!saltB64) return false;
      try {
        const salt = fromBase64(saltB64);
        const derivedKey = await deriveKeyFromSeed(words, salt);
        const data = await decryptFromStorage(derivedKey);
        if (!data) return false;
        const address = (data as { address: string }).address;
        setWalletAddress(address);
        setWalletState("unlocked");
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const restoreFromSeed = useCallback(
    async (words: string[]): Promise<{ address: string; success: boolean }> => {
      const address = deriveAddress(words);
      const rawSalt = crypto.getRandomValues(new Uint8Array(16));
      localStorage.setItem(LS_SALT, toBase64(rawSalt));
      const derivedKey = await deriveKeyFromSeed(words, rawSalt);
      await encryptAndStore({ address, restoredAt: Date.now() }, derivedKey);
      localStorage.setItem("kk_wallet_address", address);
      setWalletAddress(address);
      setWalletState("unlocked");
      return { address, success: true };
    },
    [],
  );

  const lockWallet = useCallback(() => {
    setWalletState("locked");
    setSeedPhrase(null);
  }, []);

  const clearWallet = useCallback(() => {
    localStorage.removeItem(LS_ENCRYPTED);
    localStorage.removeItem(LS_SALT);
    localStorage.removeItem(LS_IV);
    localStorage.removeItem(LS_WEBAUTHN_ID);
    localStorage.removeItem("kk_wallet_address");
    setWalletState("no-wallet");
    setWalletAddress(null);
    setSeedPhrase(null);
  }, []);

  return {
    walletState,
    seedPhrase,
    walletAddress,
    biometricAvailable,
    isLoading,
    generateSeedPhrase,
    deriveAddress,
    createWallet,
    unlockWithBiometric,
    unlockWithSeed,
    restoreFromSeed,
    enrollBiometric,
    lockWallet,
    clearWallet,
  };
}
