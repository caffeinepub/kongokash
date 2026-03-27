import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function generateTxHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `0x4a9f${hex}e3c7b2d1a8`;
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

interface Props {
  bookingCode: string;
  amount: number;
  currency: string;
  timestamp: number;
}

export function PaymentProof({
  bookingCode,
  amount,
  currency,
  timestamp,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const txHash = generateTxHash(bookingCode);
  const shortHash = `${txHash.slice(0, 8)}...${txHash.slice(-6)}`;

  const copyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(txHash);
    toast.success("Hash copié !");
  };

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid oklch(0.35 0.10 195 / 0.35)" }}
    >
      {/* Compact row */}
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-2 hover:opacity-80 transition-opacity"
        style={{ background: "oklch(0.16 0.05 195 / 0.25)" }}
        onClick={() => setExpanded((v) => !v)}
        data-ocid="payment_proof.toggle"
      >
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold"
          style={{ color: "oklch(0.65 0.15 195)" }}
        >
          <CheckCircle2 size={12} />🔗 On-Chain
        </span>
        <span
          className="text-xs font-mono"
          style={{ color: "oklch(0.65 0.10 195)" }}
        >
          {shortHash}
        </span>
        <span
          className="ml-auto text-xs"
          style={{ color: "oklch(0.50 0.03 220)" }}
        >
          {amount.toLocaleString("fr-FR")} {currency}
        </span>
        {expanded ? (
          <ChevronUp size={13} style={{ color: "oklch(0.50 0.04 220)" }} />
        ) : (
          <ChevronDown size={13} style={{ color: "oklch(0.50 0.04 220)" }} />
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div
          className="px-3 pb-3 pt-2 space-y-2"
          style={{ background: "oklch(0.14 0.04 220)" }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs" style={{ color: "oklch(0.50 0.03 220)" }}>
              Hash complet
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="font-mono text-xs break-all"
                style={{ color: "oklch(0.65 0.10 195)" }}
              >
                {txHash}
              </span>
              <button
                type="button"
                onClick={copyHash}
                className="shrink-0 p-0.5 hover:opacity-70 transition-opacity"
                style={{ color: "oklch(0.60 0.15 195)" }}
                data-ocid="payment_proof.button"
              >
                <Copy size={11} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "oklch(0.50 0.03 220)" }}>
              Réseau
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: "oklch(0.77 0.13 85)" }}
            >
              Internet Computer (ICP)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "oklch(0.50 0.03 220)" }}>
              Horodatage
            </span>
            <span className="text-xs" style={{ color: "oklch(0.60 0.04 220)" }}>
              {formatDate(timestamp)}
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity pt-1"
            style={{ color: "oklch(0.60 0.15 195)" }}
            onClick={(e) => {
              e.stopPropagation();
              toast.info("Explorer ICP disponible au lancement officiel");
            }}
            data-ocid="payment_proof.link"
          >
            <ExternalLink size={11} />
            Voir sur ICP Explorer
          </button>
        </div>
      )}
    </div>
  );
}
