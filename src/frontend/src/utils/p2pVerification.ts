// ─── P2P Hybrid Verification Engine ─────────────────────────────────────────
// Niveau 1 (auto) : matching montant, confirmation API simulée
// Niveau 2 (IA)   : analyse métadonnées image, déduplication, horodatage
// Niveau 3 (manuel): score insuffisant → arbitre humain

export interface VerificationResult {
  level: 1 | 2 | 3;
  status: "auto_validated" | "ai_check" | "manual_required";
  score: number; // 0–100
  checks: {
    amountMatch: boolean;
    apiConfirmed: boolean | null; // null = API indisponible
    imageMetaOk: boolean;
    noDuplicate: boolean;
    timestampOk: boolean;
    suspiciousBehavior: boolean;
  };
  flags: string[];
}

export interface VerifyParams {
  declaredAmount: number;
  expectedAmount: number;
  fileHash: string;
  fileSize: number;
  fileMimeType: string;
  fileLastModified: number; // timestamp ms
  tradeDateMs: number;
  previousHashes: string[];
  transactionId: string;
  senderName: string;
  expectedSenderName?: string;
}

// Simulated API confirmation (M-Pesa / Orange Money / bank)
function simulateApiConfirmation(): boolean | null {
  const r = Math.random();
  if (r < 0.7) return true; // 70 % confirmed
  if (r < 0.9) return null; // 20 % unavailable
  return false; // 10 % failed
}

export function verifyPaymentProof(params: VerifyParams): VerificationResult {
  const flags: string[] = [];
  let score = 50;

  // ── Niveau 1 ─────────────────────────────────────────────────────────────
  const tolerance = params.expectedAmount * 0.01;
  const amountMatch =
    Math.abs(params.declaredAmount - params.expectedAmount) <= tolerance;

  const apiConfirmed = simulateApiConfirmation();

  if (amountMatch) {
    score += 15;
  } else {
    score -= 20;
    flags.push(
      `Montant déclaré (${params.declaredAmount}) ≠ montant attendu (${params.expectedAmount})`,
    );
  }

  if (apiConfirmed === true) {
    score += 15;
  } else if (apiConfirmed === false) {
    score -= 20;
    flags.push("L'API de paiement n'a pas pu confirmer cette transaction.");
  } else {
    // null — API indisponible, score neutre
    flags.push(
      "API de vérification temporairement indisponible — vérification manuelle recommandée.",
    );
  }

  // ── Niveau 2 (métadonnées / IA) ──────────────────────────────────────────
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const imageMetaOk =
    params.fileSize <= MAX_FILE_SIZE &&
    IMAGE_MIMES.includes(params.fileMimeType) &&
    params.fileLastModified <= now + 60_000; // +1 min tolerance for clock skew

  const noDuplicate = !params.previousHashes.includes(params.fileHash);

  const timestampOk =
    params.tradeDateMs - params.fileLastModified <= sevenDaysMs;

  const suspiciousBehavior =
    !amountMatch &&
    !!params.expectedSenderName &&
    params.senderName.trim().toLowerCase() !==
      params.expectedSenderName.trim().toLowerCase();

  if (!imageMetaOk) {
    score -= 25;
    if (params.fileSize > MAX_FILE_SIZE)
      flags.push("Fichier trop volumineux (> 10 Mo) — capture suspecte.");
    if (!IMAGE_MIMES.includes(params.fileMimeType))
      flags.push(`Type de fichier non accepté : ${params.fileMimeType}`);
    if (params.fileLastModified > now + 60_000)
      flags.push(
        "La date de modification du fichier est dans le futur — possible falsification.",
      );
  } else {
    score += 5;
  }

  if (!noDuplicate) {
    score -= 30;
    flags.push(
      "⛔ Preuve dupliquée : ce fichier a déjà été soumis dans un autre trade.",
    );
  } else {
    score += 5;
  }

  if (!timestampOk) {
    score -= 15;
    flags.push(
      "L'image date de plus de 7 jours avant la date du trade — incohérence temporelle.",
    );
  } else {
    score += 5;
  }

  if (suspiciousBehavior) {
    score -= 15;
    flags.push(
      `Comportement suspect : le nom de l'expéditeur (${params.senderName}) ne correspond pas.`,
    );
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // ── Niveau 3 — arbitrage ─────────────────────────────────────────────────
  let status: VerificationResult["status"];
  let level: VerificationResult["level"];

  if (score >= 80) {
    status = "auto_validated";
    level = 1;
  } else if (score >= 50) {
    status = "ai_check";
    level = 2;
  } else {
    status = "manual_required";
    level = 3;
  }

  return {
    level,
    status,
    score,
    checks: {
      amountMatch,
      apiConfirmed,
      imageMetaOk,
      noDuplicate,
      timestampOk,
      suspiciousBehavior,
    },
    flags,
  };
}

// ── Storage helpers ────────────────────────────────────────────────────────
const STORAGE_PREFIX = "kk_p2p_verification_";

export function saveVerificationResult(
  tradeId: string,
  result: VerificationResult,
): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${tradeId}`, JSON.stringify(result));
  } catch {
    // silent fail
  }
}

export function loadVerificationResult(
  tradeId: string,
): VerificationResult | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${tradeId}`);
    return raw ? (JSON.parse(raw) as VerificationResult) : null;
  } catch {
    return null;
  }
}

export function loadAllVerificationResults(): Record<
  string,
  VerificationResult
> {
  const results: Record<string, VerificationResult> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        const tradeId = key.slice(STORAGE_PREFIX.length);
        const raw = localStorage.getItem(key);
        if (raw) results[tradeId] = JSON.parse(raw) as VerificationResult;
      }
    }
  } catch {
    // silent fail
  }
  return results;
}

// ── Auto-Release Log ──────────────────────────────────────────────────────────

export type AutoReleaseCondition =
  | "VENDEUR_CONFIRMÉ"
  | "PREUVE_VALIDÉE_AUTO"
  | "TIMEOUT_PREUVE_COHÉRENTE";

export interface AutoReleaseEntry {
  id: string;
  tradeId: string;
  amount: number;
  asset: string;
  condition: AutoReleaseCondition;
  actor: string;
  timestamp: string; // ISO
  score?: number;
}

const AUTO_RELEASE_KEY = "kk_p2p_auto_releases";
const MAX_ENTRIES = 50;

export function saveAutoRelease(entry: AutoReleaseEntry): void {
  try {
    const existing = loadAutoReleases();
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(AUTO_RELEASE_KEY, JSON.stringify(updated));
  } catch {
    // silent
  }
}

export function loadAutoReleases(): AutoReleaseEntry[] {
  try {
    const raw = localStorage.getItem(AUTO_RELEASE_KEY);
    return raw ? (JSON.parse(raw) as AutoReleaseEntry[]) : [];
  } catch {
    return [];
  }
}

export function getRecentAutoReleases(limit = 5): AutoReleaseEntry[] {
  return loadAutoReleases().slice(0, limit);
}
