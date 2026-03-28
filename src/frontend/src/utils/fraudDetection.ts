// ─── Fraud Detection Module ─────────────────────────────────────────────────
// Détection automatique de fraude : multi-comptes, schémas suspects, IP

export type SanctionType =
  | "BLOCAGE_IMMEDIAT"
  | "GEL_TEMPORAIRE"
  | "BLACKLIST_GLOBALE";

export interface FraudAlert {
  id: string;
  userId: string;
  userPseudo: string;
  reason: string;
  fraudScore: number;
  detectedAt: number;
  fingerprint: string;
  ipSimulated: string;
  patterns: string[];
  sanctionType?: SanctionType;
  sanctionExpiry?: number;
  resolved: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  adminId: string;
  action: string;
  targetUserId: string;
  motif: string;
  sanctionType?: SanctionType;
}

const ALERTS_KEY = "kk_fraud_alerts";
const AUDIT_KEY = "kk_fraud_audit";
const FINGERPRINT_KEY = "kk_device_fingerprint";
const USER_FINGERPRINT_MAP_KEY = "kk_user_fp_map";

// ── Device Fingerprint ────────────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#0d9488";
    ctx.fillRect(10, 10, 100, 30);
    ctx.fillStyle = "#d97706";
    ctx.font = "14px Arial";
    ctx.fillText("KongoKash🦌", 15, 30);
    ctx.strokeStyle = "rgba(102,204,0,0.7)";
    ctx.beginPath();
    ctx.arc(80, 25, 15, 0, Math.PI * 2);
    ctx.stroke();
    return canvas.toDataURL();
  } catch {
    return "canvas-error";
  }
}

export async function generateFingerprint(): Promise<string> {
  const cached = localStorage.getItem(FINGERPRINT_KEY);
  if (cached) return cached;

  const canvas = getCanvasFingerprint();
  const components = [
    navigator.userAgent,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    String(navigator.hardwareConcurrency ?? 0),
    navigator.platform,
    canvas.slice(0, 200),
  ].join("|");

  const fp = await sha256(components);
  localStorage.setItem(FINGERPRINT_KEY, fp);
  return fp;
}

// ── Storage Helpers ───────────────────────────────────────────────────────────

function loadAlerts(): FraudAlert[] {
  try {
    return JSON.parse(localStorage.getItem(ALERTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAlerts(alerts: FraudAlert[]): void {
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

function loadAuditLog(): AuditLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAuditLog(log: AuditLogEntry[]): void {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
}

function loadUserFpMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(USER_FINGERPRINT_MAP_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveUserFpMap(map: Record<string, string>): void {
  localStorage.setItem(USER_FINGERPRINT_MAP_KEY, JSON.stringify(map));
}

// ── Fraud Score ───────────────────────────────────────────────────────────────

function computeFraudScore(patterns: string[]): number {
  let score = 0;
  if (patterns.includes("multi-comptes")) score += 40;
  if (patterns.includes("litiges-frequents")) score += 30;
  if (patterns.includes("annulations-massives")) score += 25;
  if (patterns.includes("ip-suspecte")) score += 35;
  if (patterns.includes("tentatives-echouees")) score += 20;
  return Math.min(score, 100);
}

// ── Pattern Detection ─────────────────────────────────────────────────────────

export function checkRepetitiveScams(_userId: string): {
  suspicious: boolean;
  reason: string;
} {
  // In production, this would query on-chain data.
  // Here we return a deterministic simulation.
  return { suspicious: false, reason: "" };
}

// ── Sanction Check ────────────────────────────────────────────────────────────

export function checkUserSanction(userId: string): {
  blocked: boolean;
  type?: SanctionType;
  message?: string;
  expiry?: Date;
} {
  const alerts = loadAlerts();
  const active = alerts.find(
    (a) => a.userId === userId && a.sanctionType !== undefined && !a.resolved,
  );

  if (!active) return { blocked: false };

  if (active.sanctionType === "GEL_TEMPORAIRE" && active.sanctionExpiry) {
    if (Date.now() > active.sanctionExpiry) {
      // Expired — auto-lift
      active.resolved = true;
      saveAlerts(alerts);
      return { blocked: false };
    }
    return {
      blocked: true,
      type: "GEL_TEMPORAIRE",
      message: "Votre compte est temporairement gelé pour activité suspecte.",
      expiry: new Date(active.sanctionExpiry),
    };
  }

  if (active.sanctionType === "BLOCAGE_IMMEDIAT") {
    return {
      blocked: true,
      type: "BLOCAGE_IMMEDIAT",
      message:
        "Votre compte a été bloqué immédiatement pour activité suspecte.",
    };
  }

  if (active.sanctionType === "BLACKLIST_GLOBALE") {
    return {
      blocked: true,
      type: "BLACKLIST_GLOBALE",
      message: "Votre compte a été inscrit sur la blacklist globale.",
    };
  }

  return { blocked: false };
}

// ── Auto Detection ────────────────────────────────────────────────────────────

export async function runAutoDetection(userId?: string): Promise<void> {
  if (!userId) return;

  const fp = await generateFingerprint();
  const fpMap = loadUserFpMap();

  // Register current user fingerprint
  const previousUserId = Object.entries(fpMap).find(
    ([uid, storedFp]) => storedFp === fp && uid !== userId,
  )?.[0];

  fpMap[userId] = fp;
  saveUserFpMap(fpMap);

  if (previousUserId) {
    // Multi-account detected
    const alerts = loadAlerts();
    const alreadyFlagged = alerts.some(
      (a) =>
        a.fingerprint === fp &&
        a.patterns.includes("multi-comptes") &&
        !a.resolved,
    );
    if (!alreadyFlagged) {
      const patterns = ["multi-comptes"];
      const score = computeFraudScore(patterns);
      const alert: FraudAlert = {
        id: `fraud_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId,
        userPseudo: `${userId.slice(0, 8)}...`,
        reason: `Même device détecté sur 2 comptes (${previousUserId.slice(0, 8)}... et ${userId.slice(0, 8)}...)`,
        fraudScore: score,
        detectedAt: Date.now(),
        fingerprint: fp,
        ipSimulated: simulateIp(userId),
        patterns,
        resolved: false,
      };
      alerts.push(alert);
      saveAlerts(alerts);
    }
  }
}

function simulateIp(seed: string): string {
  // Deterministic fake IP based on seed string for demo
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const a = (Math.abs(hash) % 200) + 50;
  const b = Math.abs(hash >> 4) % 255;
  const c = Math.abs(hash >> 8) % 255;
  const d = Math.abs(hash >> 12) % 255;
  return `${a}.${b}.${c}.${d}`;
}

// ── Admin Actions ─────────────────────────────────────────────────────────────

export function applySanction(
  alertId: string,
  sanctionType: SanctionType,
  adminId: string,
  motif: string,
  durationDays?: number,
): void {
  const alerts = loadAlerts();
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) return;

  alert.sanctionType = sanctionType;
  if (sanctionType === "GEL_TEMPORAIRE" && durationDays) {
    alert.sanctionExpiry = Date.now() + durationDays * 24 * 60 * 60 * 1000;
  }
  saveAlerts(alerts);

  appendAuditLog({
    action: `Sanction appliquée: ${sanctionType}`,
    targetUserId: alert.userId,
    adminId,
    motif,
    sanctionType,
  });
}

export function liftSanction(
  alertId: string,
  adminId: string,
  motif: string,
): void {
  const alerts = loadAlerts();
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) return;

  alert.resolved = true;
  alert.sanctionType = undefined;
  alert.sanctionExpiry = undefined;
  saveAlerts(alerts);

  appendAuditLog({
    action: "Sanction levée",
    targetUserId: alert.userId,
    adminId,
    motif,
  });
}

export function ignoreAlert(alertId: string, adminId: string): void {
  const alerts = loadAlerts();
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) return;

  alert.resolved = true;
  saveAlerts(alerts);

  appendAuditLog({
    action: "Alerte ignorée",
    targetUserId: alert.userId,
    adminId,
    motif: "Ignoré par l'administrateur",
  });
}

function appendAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): void {
  const log = loadAuditLog();
  log.push({
    ...entry,
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
  });
  saveAuditLog(log);
}

// ── Public Accessors ──────────────────────────────────────────────────────────

export function getFraudAlerts(): FraudAlert[] {
  return loadAlerts();
}

export function getAuditLog(): AuditLogEntry[] {
  return loadAuditLog();
}

export function getActiveAlertsCount(): number {
  return loadAlerts().filter((a) => !a.resolved).length;
}

// ── Seed Demo Data (called once) ──────────────────────────────────────────────

export function seedDemoFraudAlerts(): void {
  const existing = loadAlerts();
  if (existing.length > 0) return; // Already seeded

  const demos: FraudAlert[] = [
    {
      id: "demo_fraud_001",
      userId: "user_abc123",
      userPseudo: "mukanda_k",
      reason: "Même device détecté sur 2 comptes (mukanda_k et mbeki_j)",
      fraudScore: 85,
      detectedAt: Date.now() - 2 * 60 * 60 * 1000,
      fingerprint: "a3f9c2e1b4d870f2",
      ipSimulated: "105.224.67.12",
      patterns: ["multi-comptes"],
      resolved: false,
    },
    {
      id: "demo_fraud_002",
      userId: "user_def456",
      userPseudo: "tshimanga_b",
      reason: "3 litiges P2P ouverts en 5 jours — schéma répétitif détecté",
      fraudScore: 72,
      detectedAt: Date.now() - 18 * 60 * 60 * 1000,
      fingerprint: "b7c3d1a0e5f920c4",
      ipSimulated: "196.217.88.45",
      patterns: ["litiges-frequents"],
      resolved: false,
    },
    {
      id: "demo_fraud_003",
      userId: "user_ghi789",
      userPseudo: "lulendo_m",
      reason: "5 annulations de réservation en moins de 24h",
      fraudScore: 60,
      detectedAt: Date.now() - 36 * 60 * 60 * 1000,
      fingerprint: "c9e4f2b1d6a830e5",
      ipSimulated: "41.243.120.78",
      patterns: ["annulations-massives"],
      resolved: false,
    },
    {
      id: "demo_fraud_004",
      userId: "user_jkl012",
      userPseudo: "kasongo_f",
      reason:
        "IP suspecte 41.243.50.33 — 3 comptes différents depuis la même IP en 1h",
      fraudScore: 90,
      detectedAt: Date.now() - 5 * 60 * 60 * 1000,
      fingerprint: "d1f5a3c2b7e940f6",
      ipSimulated: "41.243.50.33",
      patterns: ["ip-suspecte", "multi-comptes"],
      resolved: false,
    },
    {
      id: "demo_fraud_005",
      userId: "user_mno345",
      userPseudo: "nzuzi_p",
      reason: "Tentatives de paiement échouées répétées (8 en 30 min)",
      fraudScore: 45,
      detectedAt: Date.now() - 72 * 60 * 60 * 1000,
      fingerprint: "e2a6b4d3c8f051g7",
      ipSimulated: "154.72.45.201",
      patterns: ["tentatives-echouees"],
      resolved: false,
    },
  ];

  saveAlerts(demos);
}
