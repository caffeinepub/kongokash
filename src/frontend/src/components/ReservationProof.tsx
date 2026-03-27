import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "../lib/reservationAcknowledgment";

interface ReservationProofProps {
  bookingCode: string;
  serviceName: string;
  dates: string;
  amount: string;
  acknowledgedAt: number;
  proofHash: string;
  escrowStatus?: string;
  onClose?: () => void;
}

export function ReservationProof({
  bookingCode,
  serviceName,
  dates,
  amount,
  acknowledgedAt,
  proofHash,
  escrowStatus = "Fonds bloqués 🔒",
  onClose,
}: ReservationProofProps) {
  const copyProof = () => {
    const text = [
      "═══════════════════════════════════",
      "  PREUVE DE RÉSERVATION — KongoKash",
      "═══════════════════════════════════",
      `Code       : ${bookingCode}`,
      `Établissmt : ${serviceName}`,
      `Dates      : ${dates}`,
      `Montant    : ${amount}`,
      "───────────────────────────────────",
      "✅ ACCUSÉ DE RÉCEPTION",
      `Le         : ${formatDateTime(acknowledgedAt)}`,
      `Hash       : ${proofHash}`,
      "───────────────────────────────────",
      `Escrow     : ${escrowStatus}`,
      "═══════════════════════════════════",
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Preuve copiée dans le presse-papiers");
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "oklch(0.14 0.04 220)",
        border: "2px solid oklch(0.40 0.14 195 / 0.6)",
        boxShadow: "0 0 32px oklch(0.40 0.14 195 / 0.15)",
      }}
      data-ocid="reservation_proof.panel"
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.25 0.10 195), oklch(0.22 0.08 210))",
          borderBottom: "1px solid oklch(0.35 0.10 195 / 0.5)",
        }}
      >
        <div className="flex items-center gap-2">
          <Lock size={14} style={{ color: "oklch(0.72 0.14 195)" }} />
          <span
            className="text-sm font-bold tracking-widest uppercase"
            style={{ color: "oklch(0.88 0.06 80)" }}
          >
            Preuve de réservation
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/10 transition-colors"
            style={{ color: "oklch(0.60 0.04 220)" }}
            data-ocid="reservation_proof.close_button"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Reservation info */}
        <div className="space-y-2">
          {[
            { label: "Code", value: bookingCode, gold: true },
            { label: "Établissement", value: serviceName },
            { label: "Dates", value: dates },
            { label: "Montant", value: amount },
          ].map(({ label, value, gold }) => (
            <div key={label} className="flex justify-between gap-2">
              <span
                className="text-xs"
                style={{ color: "oklch(0.48 0.03 220)" }}
              >
                {label}
              </span>
              <span
                className="text-xs font-semibold text-right max-w-[200px] truncate"
                style={{
                  color: gold ? "oklch(0.77 0.13 85)" : "oklch(0.82 0.03 220)",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          className="border-t border-dashed"
          style={{ borderColor: "oklch(0.28 0.05 220)" }}
        />

        {/* Acknowledgment */}
        <div
          className="rounded-xl p-3 space-y-2"
          style={{
            background: "oklch(0.20 0.08 145 / 0.25)",
            border: "1px solid oklch(0.45 0.12 145 / 0.35)",
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} style={{ color: "oklch(0.70 0.15 145)" }} />
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "oklch(0.70 0.15 145)" }}
            >
              Accusé de réception
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-xs" style={{ color: "oklch(0.48 0.03 220)" }}>
              Le
            </span>
            <span className="text-xs" style={{ color: "oklch(0.72 0.04 220)" }}>
              {formatDateTime(acknowledgedAt)}
            </span>
          </div>
          <div className="flex justify-between gap-2 items-start">
            <span
              className="text-xs shrink-0"
              style={{ color: "oklch(0.48 0.03 220)" }}
            >
              Hash
            </span>
            <span
              className="font-mono text-xs text-right break-all"
              style={{ color: "oklch(0.62 0.12 195)" }}
            >
              {proofHash}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div
          className="border-t border-dashed"
          style={{ borderColor: "oklch(0.28 0.05 220)" }}
        />

        {/* Escrow status */}
        <div className="flex justify-between gap-2">
          <span className="text-xs" style={{ color: "oklch(0.48 0.03 220)" }}>
            Statut escrow
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "oklch(0.70 0.13 85)" }}
          >
            {escrowStatus}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={copyProof}
            className="flex-1 gap-2 text-xs h-8"
            style={{ background: "oklch(0.32 0.10 195)", color: "white" }}
            data-ocid="reservation_proof.button"
          >
            <Copy size={12} />
            Copier la preuve
          </Button>
          {onClose && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="flex-1 text-xs h-8 border-white/15 text-white/60"
              data-ocid="reservation_proof.close_button"
            >
              Fermer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
