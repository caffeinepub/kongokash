// P2P Audit Log — Journal d'audit immuable
export type AuditAction =
  | "OFFRE_CRÉÉE"
  | "TRANSACTION_LANCÉE"
  | "OFFRE_ACCEPTÉE"
  | "PAIEMENT_DÉCLARÉ"
  | "PREUVE_SOUMISE"
  | "VÉRIFICATION_NIVEAU_1"
  | "VÉRIFICATION_NIVEAU_2"
  | "VÉRIFICATION_NIVEAU_3"
  | "PAIEMENT_CONFIRMÉ"
  | "FONDS_LIBÉRÉS"
  | "LITIGE_OUVERT"
  | "LITIGE_RÉSOLU"
  | "LIBÉRATION_AUTO"
  | "ANNULATION"
  | "MESSAGE_ENVOYÉ";

export interface AuditEntry {
  id: string;
  tradeId: string;
  actorPrincipal: string;
  actorRole: "Acheteur" | "Vendeur" | "Système" | "Admin";
  action: AuditAction;
  timestamp: string;
  data: Record<string, unknown>;
  entryHash: string;
  prevHash: string;
  signature: string;
}

const STORAGE_KEY = "kk_p2p_audit_v1";

export async function computeHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loadLogs(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditEntry[];
  } catch {
    return [];
  }
}

function saveLogs(logs: AuditEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // silent
  }
}

export async function appendAuditEntry(
  entry: Omit<
    AuditEntry,
    "id" | "timestamp" | "entryHash" | "prevHash" | "signature"
  >,
): Promise<AuditEntry> {
  const logs = loadLogs();
  const now = new Date().toISOString();
  const lastEntry = logs.length > 0 ? logs[logs.length - 1] : null;
  const prevHash = lastEntry ? lastEntry.entryHash : "0".repeat(64);

  const signature = await computeHash(
    entry.actorPrincipal + entry.action + now,
  );

  const entryHash = await computeHash(
    prevHash +
      entry.tradeId +
      entry.actorPrincipal +
      entry.action +
      now +
      JSON.stringify(entry.data),
  );

  const fullEntry: AuditEntry = {
    id: crypto.randomUUID(),
    ...entry,
    timestamp: now,
    entryHash,
    prevHash,
    signature,
  };

  logs.push(fullEntry);
  saveLogs(logs);
  return fullEntry;
}

export function getAuditLogs(tradeId?: string): AuditEntry[] {
  const logs = loadLogs();
  if (!tradeId) return logs;
  return logs.filter((e) => e.tradeId === tradeId);
}

export function getAllAuditLogs(): AuditEntry[] {
  return loadLogs().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export async function verifyChainIntegrity(
  tradeId: string,
): Promise<{ valid: boolean; brokenAt?: string }> {
  const logs = loadLogs()
    .filter((e) => e.tradeId === tradeId)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

  for (let i = 0; i < logs.length; i++) {
    const entry = logs[i];
    const prevHash = i === 0 ? "0".repeat(64) : logs[i - 1].entryHash;

    const expectedHash = await computeHash(
      prevHash +
        entry.tradeId +
        entry.actorPrincipal +
        entry.action +
        entry.timestamp +
        JSON.stringify(entry.data),
    );

    if (expectedHash !== entry.entryHash) {
      return { valid: false, brokenAt: entry.id };
    }
  }

  return { valid: true };
}
