// ─── Reservation Acknowledgment + Audit Trail ────────────────────────────────
// Stored in IndexedDB (via secureStorage) for protection against XSS.
// KongoKash never stores private keys or funds — this is purely anti-fraud proof.

import { secureGet, secureSet } from "./secureStorage";

export interface AuditEvent {
  event: string;
  timestamp: number;
  actor: string;
}

export interface AcknowledgmentData {
  acknowledged: boolean;
  acknowledgedAt: number | null;
  proofHash: string | null;
  auditTrail: AuditEvent[];
}

const EMPTY_ACK: AcknowledgmentData = {
  acknowledged: false,
  acknowledgedAt: null,
  proofHash: null,
  auditTrail: [],
};

const storageKey = (bookingCode: string) => `kk_ack_${bookingCode}`;

export async function loadAcknowledgment(
  bookingCode: string,
): Promise<AcknowledgmentData> {
  try {
    const raw = await secureGet(storageKey(bookingCode));
    if (!raw) return { ...EMPTY_ACK };
    return JSON.parse(raw) as AcknowledgmentData;
  } catch {
    return { ...EMPTY_ACK };
  }
}

export async function saveAcknowledgment(
  bookingCode: string,
  data: AcknowledgmentData,
): Promise<void> {
  await secureSet(storageKey(bookingCode), JSON.stringify(data));
}

export function generateProofHash(
  bookingCode: string,
  timestamp: number,
): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `KK-${bookingCode}-${timestamp}-${rand}`;
}

export async function addAuditEvent(
  bookingCode: string,
  event: string,
  actor = "client",
): Promise<AcknowledgmentData> {
  const data = await loadAcknowledgment(bookingCode);
  const updated: AcknowledgmentData = {
    ...data,
    auditTrail: [...data.auditTrail, { event, timestamp: Date.now(), actor }],
  };
  await saveAcknowledgment(bookingCode, updated);
  return updated;
}

export async function acknowledgeReservation(
  bookingCode: string,
): Promise<AcknowledgmentData> {
  const now = Date.now();
  const proofHash = generateProofHash(bookingCode, now);
  const data = await loadAcknowledgment(bookingCode);
  const updated: AcknowledgmentData = {
    ...data,
    acknowledged: true,
    acknowledgedAt: now,
    proofHash,
    auditTrail: [
      ...data.auditTrail,
      { event: "Accusé de réception client", timestamp: now, actor: "client" },
    ],
  };
  await saveAcknowledgment(bookingCode, updated);
  return updated;
}

export function formatDateTime(ts: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}
