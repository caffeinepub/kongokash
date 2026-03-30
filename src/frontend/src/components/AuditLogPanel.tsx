import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import {
  type AuditAction,
  type AuditEntry,
  getAuditLogs,
  verifyChainIntegrity,
} from "../utils/p2pAuditLog";

interface Props {
  tradeId: string;
  actorPrincipal?: string;
}

const ACTION_ICONS: Record<AuditAction, string> = {
  OFFRE_CRÉÉE: "📋",
  TRANSACTION_LANCÉE: "🚀",
  OFFRE_ACCEPTÉE: "🤝",
  PAIEMENT_DÉCLARÉ: "💸",
  PREUVE_SOUMISE: "📎",
  VÉRIFICATION_NIVEAU_1: "🔍",
  VÉRIFICATION_NIVEAU_2: "🤖",
  VÉRIFICATION_NIVEAU_3: "👤",
  PAIEMENT_CONFIRMÉ: "✅",
  FONDS_LIBÉRÉS: "🔓",
  LITIGE_OUVERT: "⚠️",
  LITIGE_RÉSOLU: "🤝",
  LIBÉRATION_AUTO: "⚡",
  ANNULATION: "🚫",
  MESSAGE_ENVOYÉ: "💬",
};

const ACTION_LABELS: Record<AuditAction, string> = {
  OFFRE_CRÉÉE: "Offre créée",
  TRANSACTION_LANCÉE: "Transaction lancée",
  OFFRE_ACCEPTÉE: "Offre acceptée",
  PAIEMENT_DÉCLARÉ: "Paiement déclaré",
  PREUVE_SOUMISE: "Preuve soumise",
  VÉRIFICATION_NIVEAU_1: "Vérification automatique",
  VÉRIFICATION_NIVEAU_2: "Analyse IA",
  VÉRIFICATION_NIVEAU_3: "Arbitrage manuel",
  PAIEMENT_CONFIRMÉ: "Paiement confirmé",
  FONDS_LIBÉRÉS: "Fonds libérés",
  LITIGE_OUVERT: "Litige ouvert",
  LITIGE_RÉSOLU: "Litige résolu",
  LIBÉRATION_AUTO: "Libération automatique",
  ANNULATION: "Annulation",
  MESSAGE_ENVOYÉ: "Message envoyé",
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  Acheteur: { bg: "oklch(0.20 0.08 250 / 0.5)", text: "oklch(0.70 0.12 250)" },
  Vendeur: { bg: "oklch(0.18 0.08 145 / 0.5)", text: "oklch(0.65 0.14 145)" },
  Système: { bg: "oklch(0.22 0.02 220 / 0.6)", text: "oklch(0.60 0.04 220)" },
  Admin: { bg: "oklch(0.20 0.08 290 / 0.5)", text: "oklch(0.68 0.14 290)" },
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} à ${hh}:${mi}:${ss}`;
}

function shortHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false);
  const roleColor = ROLE_COLORS[entry.actorRole] ?? ROLE_COLORS.Système;

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      className="border-l-2 pl-3 py-1"
      style={{ borderColor: "oklch(0.35 0.08 185)" }}
    >
      <button
        className="w-full text-left"
        onClick={() => setExpanded((v) => !v)}
        data-ocid="audit.row"
        type="button"
      >
        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-base leading-none mt-0.5">
            {ACTION_ICONS[entry.action] ?? "📌"}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-sm font-medium"
                style={{ color: "oklch(0.88 0.04 220)" }}
              >
                {ACTION_LABELS[entry.action] ?? entry.action}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  background: roleColor.bg,
                  color: roleColor.text,
                }}
              >
                {entry.actorRole}
              </span>
              {expanded ? (
                <ChevronDown
                  size={12}
                  style={{ color: "oklch(0.55 0.05 185)" }}
                />
              ) : (
                <ChevronRight
                  size={12}
                  style={{ color: "oklch(0.45 0.05 185)" }}
                />
              )}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.55 0.04 220)" }}
            >
              {formatTimestamp(entry.timestamp)}
            </div>
            <div
              className="text-xs mt-0.5 font-mono"
              style={{ color: "oklch(0.45 0.06 185)" }}
            >
              #{shortHash(entry.entryHash)}
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-lg p-3 space-y-1.5 text-xs font-mono"
              style={{
                background: "oklch(0.12 0.03 220)",
                border: "1px solid oklch(0.22 0.04 220)",
              }}
            >
              <div>
                <span style={{ color: "oklch(0.55 0.06 185)" }}>acteur: </span>
                <span style={{ color: "oklch(0.72 0.04 220)" }}>
                  {entry.actorPrincipal}
                </span>
              </div>
              <div>
                <span style={{ color: "oklch(0.55 0.06 185)" }}>
                  entryHash:{" "}
                </span>
                <span style={{ color: "oklch(0.65 0.10 185)" }}>
                  {entry.entryHash}
                </span>
              </div>
              <div>
                <span style={{ color: "oklch(0.55 0.06 185)" }}>
                  prevHash:{" "}
                </span>
                <span style={{ color: "oklch(0.52 0.08 185)" }}>
                  {entry.prevHash}
                </span>
              </div>
              <div>
                <span style={{ color: "oklch(0.55 0.06 185)" }}>
                  signature:{" "}
                </span>
                <span style={{ color: "oklch(0.60 0.10 75)" }}>
                  {entry.signature}
                </span>
              </div>
              {Object.keys(entry.data).length > 0 && (
                <div>
                  <span style={{ color: "oklch(0.55 0.06 185)" }}>
                    données:{" "}
                  </span>
                  <pre
                    className="mt-0.5 text-xs overflow-x-auto whitespace-pre-wrap break-all"
                    style={{ color: "oklch(0.65 0.04 220)" }}
                  >
                    {JSON.stringify(entry.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AuditLogPanel({ tradeId }: Props) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [integrity, setIntegrity] = useState<{
    valid: boolean;
    brokenAt?: string;
  } | null>(null);

  const refresh = useCallback(() => {
    setEntries(getAuditLogs(tradeId));
  }, [tradeId]);

  const checkIntegrity = useCallback(async () => {
    const result = await verifyChainIntegrity(tradeId);
    setIntegrity(result);
  }, [tradeId]);

  useEffect(() => {
    refresh();
    checkIntegrity();
    const poll = setInterval(refresh, 3000);
    const integrityPoll = setInterval(checkIntegrity, 30000);
    return () => {
      clearInterval(poll);
      clearInterval(integrityPoll);
    };
  }, [refresh, checkIntegrity]);

  return (
    <div
      className="rounded-xl p-3 space-y-3"
      style={{
        background: "oklch(0.14 0.04 220)",
        border: "1px solid oklch(0.22 0.05 220)",
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-sm font-semibold flex items-center gap-1.5"
          style={{ color: "oklch(0.80 0.06 185)" }}
        >
          🔒 Journal d’Audit Immuable
        </p>
        {integrity !== null && (
          <div className="flex items-center gap-1.5">
            {integrity.valid ? (
              <Badge
                className="flex items-center gap-1 text-xs"
                style={{
                  background: "oklch(0.18 0.08 145 / 0.5)",
                  color: "oklch(0.65 0.14 145)",
                  border: "1px solid oklch(0.35 0.10 145 / 0.4)",
                }}
              >
                <ShieldCheck size={11} />
                Intégrité vérifiée
              </Badge>
            ) : (
              <Badge
                className="flex items-center gap-1 text-xs"
                style={{
                  background: "oklch(0.18 0.10 25 / 0.5)",
                  color: "oklch(0.70 0.16 25)",
                  border: "1px solid oklch(0.40 0.14 25 / 0.4)",
                }}
              >
                <ShieldAlert size={11} />
                Altération détectée
              </Badge>
            )}
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <p
          className="text-xs text-center py-3"
          style={{ color: "oklch(0.48 0.04 220)" }}
        >
          Aucune action enregistrée pour ce trade
        </p>
      ) : (
        <ScrollArea className="max-h-64">
          <div className="space-y-2 pr-2">
            {entries.map((entry) => (
              <AuditRow key={entry.id} entry={entry} />
            ))}
          </div>
        </ScrollArea>
      )}

      <p className="text-xs" style={{ color: "oklch(0.42 0.04 220)" }}>
        {entries.length} action{entries.length !== 1 ? "s" : ""} enregistrée
        {entries.length !== 1 ? "s" : ""} · Horodatage automatique · Hash
        SHA-256
      </p>
    </div>
  );
}
