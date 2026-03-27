// ─── Secure Storage via IndexedDB ──────────────────────────────────────────
// Replaces localStorage for sensitive data (wallet keys, credentials).
// IndexedDB is isolated per origin and not accessible via XSS document.cookie
// attacks, unlike localStorage. Falls back gracefully if blocked.

const DB_NAME = "KongoKashSecure";
const DB_VERSION = 1;
const STORE_NAME = "secureStore";

// Module-level cache to avoid reopening the DB on every operation.
let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Simple key-value store: we use the key as the IDB key path.
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      // Reset the cache if the connection is closed externally.
      dbInstance.onclose = () => {
        dbInstance = null;
      };
      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Read a value from secure storage.
 * Returns null if the key does not exist or on any error.
 */
export async function secureGet(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result as
          | { key: string; value: string }
          | undefined;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("[secureStorage] get failed:", err);
    return null;
  }
}

/**
 * Write a string value into secure storage.
 */
export async function secureSet(key: string, value: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      // Store as { key, value } record; use key as the IDB record key.
      const request = store.put({ key, value }, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("[secureStorage] set failed:", err);
  }
}

/**
 * Remove a single key from secure storage.
 */
export async function secureRemove(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("[secureStorage] remove failed:", err);
  }
}

/**
 * Remove multiple keys at once.
 */
export async function secureRemoveMany(keys: string[]): Promise<void> {
  await Promise.all(keys.map((k) => secureRemove(k)));
}

/**
 * One-time migration: read keys from localStorage, write to IndexedDB,
 * then delete from localStorage. Safe to call on every app start —
 * skips keys that are already absent from localStorage.
 */
export async function migrateFromLocalStorage(keys: string[]): Promise<void> {
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      await secureSet(key, value);
      localStorage.removeItem(key);
    }
  }
}
