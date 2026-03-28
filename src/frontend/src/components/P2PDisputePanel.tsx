import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  ChevronRight,
  Clock,
  Lock,
  Scale,
  Shield,
  TrendingUp,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import {
  type DisputeLogEntry,
  type UserHistory,
  calculateTrustScore,
  createDisputeLog,
  getDisputeLog,
  getUserHistory,
} from "../utils/p2pDispute";
import {
  type VerificationResult,
  loadVerificationResult,
} from "../utils/p2pVerification";

// ─── Types ────────────────────────────────────────────────────────────────────

interface P2PTrade {
  id: bigint;
  offerId: bigint;
  sellerId: any;
  buyerId: any;
  asset: string;
  amount: number;
  totalPrice: number;
  currency: string;
  paymentMethod: string;
  status: Record<string, null>;
  createdAt: bigint;
  lockedAt: [] | [bigint];
  confirmedAt: [] | [bigint];
  completedAt: [] | [bigint];
  disputeReason: [] | [string];
  proofHash: [] | [string];
}

interface Props {
  trade: P2PTrade;
  isAdmin: boolean;
  onResolve?: (decision: "buyer" | "seller", reason: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTs(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function trustColor(score: number): string {
  if (score >= 70) return "oklch(0.62 0.15 145)";
  if (score >= 40) return "oklch(0.75 0.14 75)";
  return "oklch(0.62 0.16 25)";
}

function trustLabel(score: number): string {
  if (score >= 70) return "Fiable";
  if (score >= 40) return "Modéré";
  return "À risque";
}

function actorColor(actor: DisputeLogEntry["actor"]): string {
  switch (actor) {
    case "Système":
      return "oklch(0.62 0.13 250)";
    case "Admin":
      return "oklch(0.75 0.14 75)";
    case "Acheteur":
      return "oklch(0.62 0.13 185)";
    case "Vendeur":
      return "oklch(0.66 0.13 310)";
  }
}

function actorBg(actor: DisputeLogEntry["actor"]): string {
  switch (actor) {
    case "Système":
      return "oklch(0.22 0.08 250 / 0.3)";
    case "Admin":
      return "oklch(0.28 0.09 75 / 0.3)";
    case "Acheteur":
      return "oklch(0.22 0.07 185 / 0.3)";
    case "Vendeur":
      return "oklch(0.22 0.07 310 / 0.3)";
  }
}

function actorIcon(actor: DisputeLogEntry["actor"]) {
  switch (actor) {
    case "Système":
      return <Bot size={12} />;
    case "Admin":
      return <Shield size={12} />;
    case "Acheteur":
    case "Vendeur":
      return <User size={12} />;
  }
}

// ─── Trust Card ───────────────────────────────────────────────────────────────

function TrustCard({
  title,
  userId,
  side,
}: {
  title: string;
  userId: string;
  side: "Acheteur" | "Vendeur";
}) {
  const history = getUserHistory(userId);
  const score = calculateTrustScore(history);
  const color = trustColor(score);
  const label = trustLabel(score);

  const completionRate =
    history.totalTrades > 0
      ? Math.round((history.completedTrades / history.totalTrades) * 100)
      : 0;
  const disputeRate =
    history.totalTrades > 0
      ? Math.round((history.disputedTrades / history.totalTrades) * 100)
      : 0;

  return (
    <div
      className="rounded-xl p-4 space-y-3 flex-1 min-w-0"
      style={{
        background: "oklch(0.15 0.04 220)",
        border: `1px solid ${color}30`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: `${color}20`, color }}
          >
            {side === "Acheteur" ? "A" : "V"}
          </div>
          <div>
            <p
              className="text-xs font-semibold"
              style={{ color: "oklch(0.82 0.06 80)" }}
            >
              {title}
            </p>
            <p
              className="font-mono text-[10px]"
              style={{ color: "oklch(0.50 0.05 220)" }}
            >
              {userId.slice(0, 12)}…
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold" style={{ color }}>
            {score}
          </p>
          <p className="text-[10px]" style={{ color: "oklch(0.55 0.05 220)" }}>
            {label}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div
          className="flex justify-between text-[10px] mb-1"
          style={{ color: "oklch(0.55 0.05 220)" }}
        >
          <span>Score de confiance</span>
          <span>{score}/100</span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "oklch(0.22 0.04 220)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: color }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div
          className="rounded-lg px-2.5 py-2"
          style={{ background: "oklch(0.12 0.03 220)" }}
        >
          <p style={{ color: "oklch(0.50 0.05 220)" }}>Trades totaux</p>
          <p
            className="font-bold mt-0.5"
            style={{ color: "oklch(0.82 0.06 80)" }}
          >
            {history.totalTrades}
          </p>
        </div>
        <div
          className="rounded-lg px-2.5 py-2"
          style={{ background: "oklch(0.12 0.03 220)" }}
        >
          <p style={{ color: "oklch(0.50 0.05 220)" }}>Taux complétion</p>
          <p
            className="font-bold mt-0.5"
            style={{
              color:
                completionRate >= 80
                  ? "oklch(0.62 0.15 145)"
                  : "oklch(0.75 0.14 75)",
            }}
          >
            {completionRate}%
          </p>
        </div>
        <div
          className="rounded-lg px-2.5 py-2"
          style={{ background: "oklch(0.12 0.03 220)" }}
        >
          <p style={{ color: "oklch(0.50 0.05 220)" }}>Taux de litiges</p>
          <p
            className="font-bold mt-0.5"
            style={{
              color:
                disputeRate <= 5
                  ? "oklch(0.62 0.15 145)"
                  : "oklch(0.62 0.16 25)",
            }}
          >
            {disputeRate}%
          </p>
        </div>
        <div
          className="rounded-lg px-2.5 py-2"
          style={{ background: "oklch(0.12 0.03 220)" }}
        >
          <p style={{ color: "oklch(0.50 0.05 220)" }}>Volume total</p>
          <p
            className="font-bold mt-0.5"
            style={{ color: "oklch(0.82 0.06 80)" }}
          >
            {(history.totalVolumeCDF / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Member info */}
      <div
        className="text-[10px] flex items-center justify-between"
        style={{ color: "oklch(0.50 0.05 220)" }}
      >
        <span>
          Membre depuis{" "}
          {new Date(history.memberSince).toLocaleDateString("fr-FR", {
            month: "short",
            year: "numeric",
          })}
        </span>
        <span>Rép. moy. {history.avgResponseTimeMinutes}min</span>
      </div>
    </div>
  );
}

// ─── Verification Summary ─────────────────────────────────────────────────────

function VerificationSummary({ tradeId }: { tradeId: string }) {
  const vr = loadVerificationResult(tradeId);
  if (!vr) return null;

  const statusCfg: Record<
    VerificationResult["status"],
    { label: string; color: string; icon: string }
  > = {
    auto_validated: {
      label: "Auto-validé",
      color: "oklch(0.62 0.15 145)",
      icon: "✅",
    },
    ai_check: { label: "Analyse IA", color: "oklch(0.75 0.14 75)", icon: "🤖" },
    manual_required: {
      label: "Arbitrage requis",
      color: "oklch(0.62 0.16 25)",
      icon: "⚠️",
    },
  };

  const cfg = statusCfg[vr.status];

  return (
    <div
      className="rounded-xl p-3 space-y-2"
      style={{
        background: "oklch(0.15 0.04 220)",
        border: `1px solid ${cfg.color}30`,
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-semibold"
          style={{ color: "oklch(0.72 0.05 220)" }}
        >
          🔍 Vérification des preuves
        </p>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: `${cfg.color}20`, color: cfg.color }}
        >
          {cfg.icon} {cfg.label}
        </span>
      </div>

      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "oklch(0.22 0.04 220)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${vr.score}%`, background: cfg.color }}
        />
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
        {[
          { key: "amountMatch", label: "Montant" },
          { key: "imageMetaOk", label: "Image" },
          { key: "noDuplicate", label: "Dupliqué" },
          { key: "timestampOk", label: "Horodatage" },
          { key: "apiConfirmed", label: "API" },
        ].map(({ key, label }) => {
          const val = vr.checks[key as keyof typeof vr.checks];
          const ok = val === true;
          const neutral = val === null;
          return (
            <div
              key={key}
              className="rounded px-1.5 py-1 flex items-center gap-1"
              style={{
                background: neutral
                  ? "oklch(0.20 0.05 220 / 0.5)"
                  : ok
                    ? "oklch(0.20 0.06 145 / 0.4)"
                    : "oklch(0.20 0.07 25 / 0.4)",
              }}
            >
              <span
                style={{
                  color: neutral
                    ? "oklch(0.60 0.05 220)"
                    : ok
                      ? "oklch(0.62 0.15 145)"
                      : "oklch(0.62 0.16 25)",
                }}
              >
                {neutral ? "–" : ok ? "✓" : "✗"}
              </span>
              <span style={{ color: "oklch(0.65 0.05 220)" }}>{label}</span>
            </div>
          );
        })}
      </div>

      {vr.flags.length > 0 && (
        <div className="space-y-1">
          {vr.flags.slice(0, 3).map((flag) => (
            <div
              key={flag}
              className="flex items-start gap-1.5 text-[10px] px-2 py-1 rounded"
              style={{
                background: "oklch(0.18 0.06 75 / 0.3)",
                color: "oklch(0.72 0.12 75)",
              }}
            >
              <AlertTriangle size={10} className="mt-0.5 shrink-0" />
              {flag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Log Timeline ─────────────────────────────────────────────────────────────

function DisputeTimeline({ disputeId }: { disputeId: string }) {
  const [entries, setEntries] = useState<DisputeLogEntry[]>([]);

  useEffect(() => {
    setEntries(getDisputeLog(disputeId));
    const id = setInterval(() => {
      setEntries(getDisputeLog(disputeId));
    }, 3_000);
    return () => clearInterval(id);
  }, [disputeId]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "oklch(0.13 0.04 220)",
        border: "1px solid oklch(0.22 0.05 220)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{
          background: "oklch(0.16 0.05 220)",
          borderBottom: "1px solid oklch(0.22 0.05 220)",
        }}
      >
        <Lock size={12} style={{ color: "oklch(0.62 0.15 145)" }} />
        <p
          className="text-xs font-bold"
          style={{ color: "oklch(0.78 0.13 85)" }}
        >
          🔒 Log immuable — Journal des décisions
        </p>
        <span
          className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
          style={{
            background: "oklch(0.20 0.06 145 / 0.4)",
            color: "oklch(0.62 0.15 145)",
          }}
        >
          {entries.length} entrée{entries.length !== 1 ? "s" : ""}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-xs" style={{ color: "oklch(0.50 0.05 220)" }}>
            Aucune entrée pour l'instant
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-64">
          <div className="px-4 py-3 space-y-3">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex gap-3"
              >
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: actorBg(entry.actor),
                      color: actorColor(entry.actor),
                    }}
                  >
                    {actorIcon(entry.actor)}
                  </div>
                  {i < entries.length - 1 && (
                    <div
                      className="w-px flex-1 mt-1"
                      style={{ background: "oklch(0.22 0.04 220)" }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="pb-3 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                      style={{
                        background: actorBg(entry.actor),
                        color: actorColor(entry.actor),
                      }}
                    >
                      {entry.actor}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.78 0.06 80)" }}
                    >
                      {entry.action}
                    </span>
                  </div>
                  {entry.reason && (
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ color: "oklch(0.62 0.05 220)" }}
                    >
                      {entry.reason}
                    </p>
                  )}
                  <p
                    className="text-[10px] mt-1 font-mono"
                    style={{ color: "oklch(0.45 0.04 220)" }}
                  >
                    {formatTs(entry.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ─── Admin Decision Form ──────────────────────────────────────────────────────

function AdminDecisionForm({
  onResolve,
}: {
  onResolve: (decision: "buyer" | "seller", reason: string) => void;
}) {
  const [decision, setDecision] = useState<"buyer" | "seller" | "">("");
  const [reason, setReason] = useState("");

  return (
    <div
      className="rounded-xl p-4 space-y-4"
      style={{
        background: "oklch(0.16 0.06 75 / 0.15)",
        border: "1px solid oklch(0.45 0.14 75 / 0.3)",
      }}
    >
      <div className="flex items-center gap-2">
        <Scale size={14} style={{ color: "oklch(0.78 0.13 85)" }} />
        <p
          className="text-sm font-bold"
          style={{ color: "oklch(0.82 0.06 80)" }}
        >
          Décision d'arbitrage
        </p>
      </div>

      <RadioGroup
        value={decision}
        onValueChange={(v) => setDecision(v as "buyer" | "seller")}
        className="space-y-2"
      >
        <div
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors"
          style={{
            background:
              decision === "buyer"
                ? "oklch(0.20 0.07 185 / 0.4)"
                : "oklch(0.13 0.03 220)",
            border: `1px solid ${decision === "buyer" ? "oklch(0.45 0.12 185 / 0.6)" : "oklch(0.22 0.04 220)"}`,
          }}
        >
          <RadioGroupItem value="buyer" id="favor-buyer" />
          <Label htmlFor="favor-buyer" className="cursor-pointer flex-1">
            <span
              className="text-sm font-semibold"
              style={{ color: "oklch(0.62 0.13 185)" }}
            >
              ✅ Libérer les fonds → Acheteur
            </span>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: "oklch(0.55 0.05 220)" }}
            >
              Le vendeur n'a pas confirmé ou le paiement est invalide
            </p>
          </Label>
        </div>

        <div
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors"
          style={{
            background:
              decision === "seller"
                ? "oklch(0.20 0.07 310 / 0.4)"
                : "oklch(0.13 0.03 220)",
            border: `1px solid ${decision === "seller" ? "oklch(0.45 0.12 310 / 0.6)" : "oklch(0.22 0.04 220)"}`,
          }}
        >
          <RadioGroupItem value="seller" id="favor-seller" />
          <Label htmlFor="favor-seller" className="cursor-pointer flex-1">
            <span
              className="text-sm font-semibold"
              style={{ color: "oklch(0.66 0.13 310)" }}
            >
              💸 Rembourser → Vendeur
            </span>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: "oklch(0.55 0.05 220)" }}
            >
              La preuve de paiement est frauduleuse ou insuffisante
            </p>
          </Label>
        </div>
      </RadioGroup>

      <div className="space-y-1.5">
        <Label className="text-xs" style={{ color: "oklch(0.65 0.05 220)" }}>
          Motif de la décision{" "}
          <span style={{ color: "oklch(0.62 0.16 25)" }}>*</span>
        </Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Expliquez votre décision en détail…"
          className="min-h-[80px] bg-white/5 border-white/20 text-white placeholder:text-white/30 text-sm"
          data-ocid="admin.p2p.textarea"
        />
      </div>

      <Button
        onClick={() => {
          if (decision && reason.trim()) {
            onResolve(decision as "buyer" | "seller", reason.trim());
          }
        }}
        disabled={!decision || !reason.trim()}
        className="w-full gap-2"
        style={{ background: "oklch(0.52 0.13 185)", color: "white" }}
        data-ocid="admin.p2p.confirm_button"
      >
        <Scale size={13} />
        Confirmer la décision
      </Button>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function P2PDisputePanel({ trade, isAdmin, onResolve }: Props) {
  const disputeId = `dispute_${String(trade.id)}`;
  const buyerId = trade.buyerId?.toString?.() ?? String(trade.buyerId);
  const sellerId = trade.sellerId?.toString?.() ?? String(trade.sellerId);

  return (
    <div className="space-y-5" data-ocid="p2p.dialog">
      {/* Header */}
      <div
        className="rounded-xl px-4 py-3"
        style={{
          background: "oklch(0.16 0.06 25 / 0.25)",
          border: "1px solid oklch(0.45 0.14 25 / 0.4)",
        }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚖️</span>
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: "oklch(0.82 0.06 80)" }}
              >
                Litige — Trade #{String(trade.id)}
              </p>
              <p
                className="text-[11px] font-mono"
                style={{ color: "oklch(0.50 0.05 220)" }}
              >
                ID Litige : {disputeId}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className="text-sm font-bold"
              style={{ color: "oklch(0.78 0.13 85)" }}
            >
              {trade.amount} {trade.asset}
            </p>
            <p className="text-xs" style={{ color: "oklch(0.60 0.05 220)" }}>
              {trade.totalPrice.toLocaleString("fr-FR")} {trade.currency}
            </p>
          </div>
        </div>

        {trade.disputeReason[0] && (
          <div
            className="mt-2 rounded-lg px-3 py-2 text-xs flex items-start gap-2"
            style={{
              background: "oklch(0.18 0.06 25 / 0.4)",
              color: "oklch(0.72 0.14 25)",
            }}
          >
            <AlertTriangle size={11} className="mt-0.5 shrink-0" />
            {trade.disputeReason[0]}
          </div>
        )}
      </div>

      {/* Trust cards */}
      <div>
        <p
          className="text-xs font-semibold mb-2"
          style={{ color: "oklch(0.55 0.05 220)" }}
        >
          Analyse des comptes
        </p>
        <div className="flex gap-3">
          <TrustCard title="Acheteur" userId={buyerId} side="Acheteur" />
          <TrustCard title="Vendeur" userId={sellerId} side="Vendeur" />
        </div>
      </div>

      {/* Verification summary */}
      <VerificationSummary tradeId={String(trade.id)} />

      {/* Immutable log */}
      <DisputeTimeline disputeId={disputeId} />

      {/* Admin decision form */}
      {isAdmin && onResolve && (
        <AdminDecisionForm
          onResolve={(decision, reason) => {
            createDisputeLog(
              disputeId,
              "Décision d'arbitrage",
              "Admin",
              reason,
              {
                decision,
                tradeId: String(trade.id),
              },
            );
            onResolve(decision, reason);
          }}
        />
      )}

      {/* Read-only status for users */}
      {!isAdmin && (
        <div
          className="rounded-xl px-4 py-3 text-center"
          style={{
            background: "oklch(0.15 0.04 220)",
            border: "1px solid oklch(0.22 0.05 220)",
          }}
        >
          <p className="text-xs" style={{ color: "oklch(0.60 0.05 220)" }}>
            🔍 Votre litige est en cours d'examen par notre équipe. Vous serez
            notifié(e) sous 48h.
          </p>
        </div>
      )}
    </div>
  );
}
