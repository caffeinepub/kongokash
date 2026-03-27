import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Lock,
  RefreshCw,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { EscrowEntry } from "../declarations/backend.did";
import { useActor } from "../hooks/useActor";
import {
  type AcknowledgmentData,
  formatDateTime,
  loadAcknowledgment,
} from "../lib/reservationAcknowledgment";

interface EscrowPaymentInfoProps {
  reservationId: number;
  bookingCode?: string;
}

function getStatusInfo(status: EscrowEntry["status"]) {
  if ("locked" in status)
    return {
      label: "Fonds bloqués",
      icon: "🔒",
      color: "oklch(0.70 0.15 85)",
      bg: "oklch(0.25 0.08 85 / 0.3)",
    };
  if ("released" in status)
    return {
      label: "Libéré",
      icon: "✅",
      color: "oklch(0.70 0.15 145)",
      bg: "oklch(0.25 0.08 145 / 0.3)",
    };
  if ("refunded" in status)
    return {
      label: "Remboursé",
      icon: "💸",
      color: "oklch(0.70 0.15 250)",
      bg: "oklch(0.25 0.08 250 / 0.3)",
    };
  if ("disputed" in status)
    return {
      label: "Litige en cours",
      icon: "⚠️",
      color: "oklch(0.70 0.15 20)",
      bg: "oklch(0.25 0.08 20 / 0.3)",
    };
  if ("resolved" in status)
    return {
      label: "Résolu",
      icon: "✔️",
      color: "oklch(0.60 0.04 220)",
      bg: "oklch(0.22 0.03 220 / 0.3)",
    };
  return {
    label: "Inconnu",
    icon: "❓",
    color: "oklch(0.60 0.04 220)",
    bg: "oklch(0.22 0.03 220 / 0.3)",
  };
}

function formatNs(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EscrowPaymentInfo({
  reservationId,
  bookingCode,
}: EscrowPaymentInfoProps) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [ackData, setAckData] = useState<AcknowledgmentData | null>(null);
  useEffect(() => {
    if (bookingCode) {
      loadAcknowledgment(bookingCode).then(setAckData);
    } else {
      setAckData(null);
    }
  }, [bookingCode]);

  const { data: escrowData, isLoading } = useQuery<
    EscrowEntry | null,
    Error,
    EscrowEntry | null
  >({
    queryKey: ["escrow", reservationId],
    queryFn: async () => {
      if (!actor) return null;
      const result = (await (actor as any).getEscrowStatus(
        BigInt(reservationId),
      )) as [] | [EscrowEntry];
      return (result.length > 0 ? result[0] : null) as EscrowEntry | null;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
  const escrow: EscrowEntry | null = escrowData ?? null;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["escrow", reservationId] });

  const confirmCheckin = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor non disponible");
      return (actor as any).confirmCheckin(BigInt(reservationId));
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          "Check-in confirmé ! Les fonds ont été libérés au partenaire.",
        );
        invalidate();
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur lors de la confirmation"),
  });

  const autoRelease = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor non disponible");
      return (actor as any).autoReleaseEscrow(BigInt(reservationId));
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Fonds libérés automatiquement.");
        invalidate();
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur lors de la libération automatique"),
  });

  const openDispute = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor non disponible");
      return (actor as any).openDispute(BigInt(reservationId), disputeReason);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Litige ouvert. Notre équipe examine votre demande.");
        setDisputeOpen(false);
        setDisputeReason("");
        invalidate();
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur lors de l'ouverture du litige"),
  });

  if (isLoading) {
    return (
      <div
        className="mt-2 px-3 py-2 rounded-lg text-xs animate-pulse"
        style={{ background: "oklch(0.20 0.04 220 / 0.4)" }}
        data-ocid="escrow.loading_state"
      >
        <RefreshCw size={12} className="inline mr-1 animate-spin" />
        Chargement escrow...
      </div>
    );
  }

  if (!escrow) return null;

  const statusInfo = getStatusInfo(escrow.status);
  const isLocked = "locked" in escrow.status;
  const nowNs = BigInt(Date.now()) * 1_000_000n;
  const canAutoRelease = isLocked && nowNs >= escrow.releaseTime;

  return (
    <div
      className="mt-3 rounded-xl p-3 space-y-2"
      style={{
        background: "oklch(0.17 0.04 220 / 0.6)",
        border: `1px solid ${statusInfo.color}40`,
      }}
      data-ocid="escrow.panel"
    >
      {/* Neutral intermediary info badge */}
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2 mb-1 text-xs"
        style={{
          background: "oklch(0.22 0.07 195 / 0.4)",
          border: "1px solid oklch(0.52 0.12 160 / 0.3)",
          color: "oklch(0.72 0.10 160)",
        }}
      >
        <span>⚖️</span>
        <span>
          KongoKash agit comme intermédiaire neutre — nous ne détenons jamais
          vos fonds directement.
        </span>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Lock size={12} style={{ color: statusInfo.color }} />
          <span
            className="text-xs font-semibold"
            style={{ color: statusInfo.color }}
          >
            Escrow sécurisé
          </span>
        </div>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: statusInfo.bg, color: statusInfo.color }}
          data-ocid="escrow.success_state"
        >
          {statusInfo.icon} {statusInfo.label}
        </span>
      </div>

      {/* Info */}
      <div
        className="flex items-center justify-between text-xs"
        style={{ color: "oklch(0.60 0.04 220)" }}
      >
        <span>
          {escrow.amount.toLocaleString("fr-FR")} {escrow.currency}
        </span>
        {isLocked && (
          <span className="flex items-center gap-1">
            <Clock size={10} />
            Auto-libération : {formatNs(escrow.releaseTime)}
          </span>
        )}
      </div>

      {/* Actions */}
      {isLocked && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            size="sm"
            className="h-7 text-xs px-3"
            style={{ background: "oklch(0.35 0.12 145)", color: "white" }}
            onClick={() => confirmCheckin.mutate()}
            disabled={confirmCheckin.isPending}
            data-ocid="escrow.confirm_button"
          >
            <CheckCircle size={12} className="mr-1" />
            Confirmer le check-in
          </Button>

          {canAutoRelease && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-3 border-teal-500/40 text-teal-400 hover:bg-teal-500/10"
              onClick={() => autoRelease.mutate()}
              disabled={autoRelease.isPending}
              data-ocid="escrow.button"
            >
              <RefreshCw size={12} className="mr-1" />
              Libération auto disponible
            </Button>
          )}

          <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-3 border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
                data-ocid="escrow.open_modal_button"
              >
                <AlertTriangle size={12} className="mr-1" />
                Ouvrir un litige
              </Button>
            </DialogTrigger>
            <DialogContent
              style={{
                background: "oklch(0.15 0.04 220)",
                border: "1px solid oklch(0.25 0.05 220)",
              }}
              data-ocid="escrow.dialog"
            >
              <DialogHeader>
                <DialogTitle style={{ color: "oklch(0.88 0.06 80)" }}>
                  ⚠️ Ouvrir un litige
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                {ackData?.acknowledged &&
                  ackData.acknowledgedAt &&
                  ackData.proofHash && (
                    <div
                      className="rounded-xl p-3 space-y-1.5"
                      style={{
                        background: "oklch(0.26 0.10 85 / 0.2)",
                        border: "1px solid oklch(0.55 0.14 85 / 0.45)",
                      }}
                      data-ocid="escrow.error_state"
                    >
                      <p
                        className="text-xs font-bold"
                        style={{ color: "oklch(0.72 0.13 85)" }}
                      >
                        ⚠️ Attention — Accusé de réception enregistré
                      </p>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "oklch(0.65 0.08 85)" }}
                      >
                        Un accusé de réception a été enregistré pour cette
                        réservation le{" "}
                        <strong>
                          {formatDateTime(ackData.acknowledgedAt)}
                        </strong>
                        . La preuve on-chain{" "}
                        <span className="font-mono">{ackData.proofHash}</span>{" "}
                        confirme que vous avez bien reçu votre confirmation.
                        Toute déclaration contraire sera rejetée.
                      </p>
                    </div>
                  )}
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.65 0.04 220)" }}
                >
                  Décrivez le problème rencontré. Notre équipe examinera votre
                  demande et prendra une décision sous 48h.
                </p>
                <Textarea
                  placeholder="Ex: Le service n'a pas été rendu comme convenu..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  data-ocid="escrow.textarea"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDisputeOpen(false)}
                  className="border-white/20 text-white/70"
                  data-ocid="escrow.cancel_button"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => openDispute.mutate()}
                  disabled={!disputeReason.trim() || openDispute.isPending}
                  style={{ background: "oklch(0.55 0.15 30)", color: "white" }}
                  data-ocid="escrow.submit_button"
                >
                  <Undo2 size={14} className="mr-1" />
                  Soumettre le litige
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

// ─── Admin Escrow Dispute Tab ─────────────────────────────────────────────────

export function EscrowDisputeTab() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const { data: disputed = [], isLoading: loadingDisputed } = useQuery<
    EscrowEntry[]
  >({
    queryKey: ["adminDisputedEscrows"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetDisputedEscrows();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  const { data: allEscrows = [], isLoading: loadingAll } = useQuery<
    EscrowEntry[]
  >({
    queryKey: ["adminAllEscrows"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetAllEscrows();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  const resolveDispute = useMutation({
    mutationFn: async ({
      id,
      favorUser,
    }: { id: bigint; favorUser: boolean }) => {
      if (!actor) throw new Error("Actor non disponible");
      return (actor as any).resolveDispute(id, favorUser);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Litige résolu.");
        queryClient.invalidateQueries({ queryKey: ["adminDisputedEscrows"] });
        queryClient.invalidateQueries({ queryKey: ["adminAllEscrows"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur lors de la résolution"),
  });

  const refundEscrow = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor non disponible");
      return (actor as any).refundEscrow(id);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Remboursement effectué.");
        queryClient.invalidateQueries({ queryKey: ["adminAllEscrows"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur lors du remboursement"),
  });

  return (
    <div className="space-y-8">
      {/* Disputed Escrows */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3
            className="text-lg font-bold"
            style={{ color: "oklch(0.88 0.06 80)" }}
          >
            Litiges actifs
          </h3>
          {disputed.length > 0 && (
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
              style={{ background: "oklch(0.55 0.18 20)", color: "white" }}
              data-ocid="admin.litiges.panel"
            >
              {disputed.length}
            </span>
          )}
        </div>

        {loadingDisputed ? (
          <div
            className="flex justify-center py-10"
            data-ocid="admin.loading_state"
          >
            <RefreshCw className="animate-spin text-teal-400" size={24} />
          </div>
        ) : disputed.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: "oklch(0.16 0.04 220)",
              border: "1px solid oklch(0.25 0.04 220)",
            }}
            data-ocid="admin.litiges.empty_state"
          >
            <p className="text-3xl mb-2">✅</p>
            <p style={{ color: "oklch(0.65 0.04 220)" }}>Aucun litige actif</p>
          </div>
        ) : (
          <div className="space-y-3">
            {disputed.map((e, idx) => (
              <div
                key={String(e.reservationId)}
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "oklch(0.18 0.05 20 / 0.3)",
                  border: "1px solid oklch(0.45 0.12 20 / 0.4)",
                }}
                data-ocid={`admin.litiges.item.${idx + 1}`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: "oklch(0.77 0.13 85)" }}
                    >
                      Réservation #{String(e.reservationId)}
                    </span>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.60 0.04 220)" }}
                    >
                      Partenaire : {e.partnerId}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.60 0.04 220)" }}
                    >
                      Utilisateur : {e.userId.toString().slice(0, 16)}…
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-bold"
                      style={{ color: "oklch(0.77 0.13 85)" }}
                    >
                      {e.amount.toLocaleString("fr-FR")} {e.currency}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.55 0.04 220)" }}
                    >
                      Ouvert le {formatNs(e.createdAt)}
                    </p>
                  </div>
                </div>
                {e.disputeReason.length > 0 && (
                  <div
                    className="rounded-lg p-2 text-xs"
                    style={{
                      background: "oklch(0.14 0.03 220)",
                      color: "oklch(0.65 0.04 220)",
                    }}
                  >
                    <strong style={{ color: "oklch(0.70 0.08 20)" }}>
                      Motif :
                    </strong>{" "}
                    {e.disputeReason[0]}
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      resolveDispute.mutate({
                        id: e.reservationId,
                        favorUser: true,
                      })
                    }
                    disabled={resolveDispute.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: "oklch(0.30 0.10 250 / 0.4)",
                      color: "oklch(0.65 0.15 250)",
                      border: "1px solid oklch(0.45 0.12 250 / 0.4)",
                    }}
                    data-ocid={`admin.litiges.confirm_button.${idx + 1}`}
                  >
                    💸 Rembourser l&apos;utilisateur
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      resolveDispute.mutate({
                        id: e.reservationId,
                        favorUser: false,
                      })
                    }
                    disabled={resolveDispute.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: "oklch(0.30 0.10 145 / 0.4)",
                      color: "oklch(0.65 0.15 145)",
                      border: "1px solid oklch(0.45 0.12 145 / 0.4)",
                    }}
                    data-ocid={`admin.litiges.secondary_button.${idx + 1}`}
                  >
                    ✅ Libérer au partenaire
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Escrows */}
      <div>
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: "oklch(0.88 0.06 80)" }}
        >
          Tous les Escrows
        </h3>
        {loadingAll ? (
          <div
            className="flex justify-center py-10"
            data-ocid="admin.loading_state"
          >
            <RefreshCw className="animate-spin text-teal-400" size={24} />
          </div>
        ) : allEscrows.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: "oklch(0.16 0.04 220)",
              border: "1px solid oklch(0.25 0.04 220)",
            }}
            data-ocid="admin.escrow.empty_state"
          >
            <p style={{ color: "oklch(0.65 0.04 220)" }}>
              Aucun escrow enregistré
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {allEscrows.map((e, idx) => {
              const sInfo = getStatusInfo(e.status);
              const isRefunded =
                "refunded" in e.status ||
                "released" in e.status ||
                "resolved" in e.status;
              return (
                <div
                  key={String(e.reservationId)}
                  className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap"
                  style={{
                    background: "oklch(0.16 0.04 220)",
                    border: "1px solid oklch(0.25 0.04 220)",
                  }}
                  data-ocid={`admin.escrow.item.${idx + 1}`}
                >
                  <div>
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: "oklch(0.77 0.13 85)" }}
                    >
                      #{String(e.reservationId)}
                    </span>
                    <span
                      className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: sInfo.bg, color: sInfo.color }}
                    >
                      {sInfo.icon} {sInfo.label}
                    </span>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.55 0.04 220)" }}
                    >
                      {e.amount.toLocaleString("fr-FR")} {e.currency} ·{" "}
                      {e.partnerId}
                    </p>
                  </div>
                  {!isRefunded && (
                    <button
                      type="button"
                      onClick={() => refundEscrow.mutate(e.reservationId)}
                      disabled={refundEscrow.isPending}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      style={{
                        background: "oklch(0.25 0.08 20 / 0.4)",
                        color: "oklch(0.65 0.15 20)",
                        border: "1px solid oklch(0.40 0.10 20 / 0.4)",
                      }}
                      data-ocid={`admin.escrow.delete_button.${idx + 1}`}
                    >
                      Rembourser
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
