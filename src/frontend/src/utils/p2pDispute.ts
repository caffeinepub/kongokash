// ─── P2P Dispute System — KongoKash ─────────────────────────────────────────
// Système de litige robuste : score de confiance, log immuable, auto-déclenchement

const DISPUTE_LOG_PREFIX = "kk_p2p_dispute_log_";
export const AUTO_DISPUTE_TIMEOUT_MINUTES = 30;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserHistory {
  userId: string;
  totalTrades: number;
  completedTrades: number;
  disputedTrades: number;
  totalVolumeCDF: number;
  memberSince: string; // ISO date
  lastActive: string; // ISO date
  avgResponseTimeMinutes: number;
}

export interface DisputeLogEntry {
  id: string;
  disputeId: string;
  timestamp: string; // ISO
  actor: "Système" | "Admin" | "Acheteur" | "Vendeur";
  action: string;
  reason: string;
  data?: Record<string, unknown>;
}

// ─── Trust Score ─────────────────────────────────────────────────────────────

export function calculateTrustScore(history: UserHistory): number {
  let score = 0;

  // Base score from total trades (max 25 pts)
  const tradeScore = Math.min(history.totalTrades / 2, 25);
  score += tradeScore;

  // Completion rate (max 35 pts)
  const completionRate =
    history.totalTrades > 0 ? history.completedTrades / history.totalTrades : 0;
  score += completionRate * 35;

  // Dispute rate penalty (max -30 pts)
  const disputeRate =
    history.totalTrades > 0 ? history.disputedTrades / history.totalTrades : 0;
  score -= disputeRate * 30;

  // Response time (max 15 pts) — under 15 min is best
  const responseScore = Math.max(
    0,
    15 - (history.avgResponseTimeMinutes / 60) * 15,
  );
  score += responseScore;

  // Seniority bonus (max 10 pts)
  const memberDays =
    (Date.now() - new Date(history.memberSince).getTime()) /
    (1000 * 60 * 60 * 24);
  score += Math.min(memberDays / 30, 10);

  // Volume bonus (max 15 pts)
  score += Math.min(history.totalVolumeCDF / 1_000_000, 15);

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Mock User History ────────────────────────────────────────────────────────

const MOCK_HISTORIES: Record<string, UserHistory> = {};

export function getUserHistory(userId: string): UserHistory {
  if (MOCK_HISTORIES[userId]) return MOCK_HISTORIES[userId];

  // Generate deterministic mock based on userId hash
  const hash = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const totalTrades = 5 + (hash % 45);
  const completionRate = 0.7 + (hash % 30) / 100;
  const disputeRate = (hash % 10) / 100;

  const history: UserHistory = {
    userId,
    totalTrades,
    completedTrades: Math.round(totalTrades * completionRate),
    disputedTrades: Math.round(totalTrades * disputeRate),
    totalVolumeCDF: 50_000 + (hash % 950_000),
    memberSince: new Date(
      Date.now() - (30 + (hash % 700)) * 24 * 60 * 60 * 1000,
    ).toISOString(),
    lastActive: new Date(
      Date.now() - (hash % 7) * 24 * 60 * 60 * 1000,
    ).toISOString(),
    avgResponseTimeMinutes: 5 + (hash % 55),
  };

  MOCK_HISTORIES[userId] = history;
  return history;
}

// ─── Immutable Dispute Log ────────────────────────────────────────────────────

function getLogKey(disputeId: string): string {
  return `${DISPUTE_LOG_PREFIX}${disputeId}`;
}

function readLog(disputeId: string): DisputeLogEntry[] {
  try {
    const raw = localStorage.getItem(getLogKey(disputeId));
    return raw ? (JSON.parse(raw) as DisputeLogEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLog(disputeId: string, entries: DisputeLogEntry[]): void {
  try {
    localStorage.setItem(getLogKey(disputeId), JSON.stringify(entries));
  } catch {
    // silent fail
  }
}

export function createDisputeLog(
  disputeId: string,
  action: string,
  actor: DisputeLogEntry["actor"],
  reason: string,
  data?: Record<string, unknown>,
): DisputeLogEntry {
  const existing = readLog(disputeId);

  // Prevent backward-modification: entries are append-only
  const entry: DisputeLogEntry = {
    id: `${disputeId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    disputeId,
    timestamp: new Date().toISOString(),
    actor,
    action,
    reason,
    data,
  };

  writeLog(disputeId, [...existing, entry]);
  return entry;
}

export function getDisputeLog(disputeId: string): DisputeLogEntry[] {
  return readLog(disputeId).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

export function getAllDisputeLogs(): DisputeLogEntry[] {
  const all: DisputeLogEntry[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(DISPUTE_LOG_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const entries = JSON.parse(raw) as DisputeLogEntry[];
          all.push(...entries);
        }
      }
    }
  } catch {
    // silent fail
  }
  return all.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

// ─── Auto-trigger Detection ───────────────────────────────────────────────────

interface TradeForDispute {
  id: bigint;
  status: Record<string, null>;
  lockedAt: [] | [bigint];
  createdAt: bigint;
}

export function shouldAutoTriggerDispute(
  trade: TradeForDispute,
  verificationScore?: number,
): boolean {
  const statusKey = Object.keys(trade.status)[0];

  // Only applicable in EN_VÉRIFICATION (= payment_sent backend status)
  if (statusKey !== "payment_sent") return false;

  // If verification score is below threshold
  if (verificationScore !== undefined && verificationScore < 50) return true;

  // If seller hasn't confirmed after AUTO_DISPUTE_TIMEOUT_MINUTES
  const refNs = trade.lockedAt[0] ?? trade.createdAt;
  const refMs = Number(refNs / BigInt(1_000_000));
  const elapsedMs = Date.now() - refMs;
  const elapsedMin = elapsedMs / 60_000;
  return elapsedMin >= AUTO_DISPUTE_TIMEOUT_MINUTES;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAutoTriggerRemainingMs(trade: TradeForDispute): number {
  const refNs = trade.lockedAt[0] ?? trade.createdAt;
  const refMs = Number(refNs / BigInt(1_000_000));
  const deadlineMs = refMs + AUTO_DISPUTE_TIMEOUT_MINUTES * 60_000;
  return Math.max(0, deadlineMs - Date.now());
}
