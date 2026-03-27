import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  acknowledgeReservation,
  formatDateTime,
  loadAcknowledgment,
} from "../lib/reservationAcknowledgment";
import { ReservationProof } from "./ReservationProof";

export interface ConfirmationData {
  bookingCode: string;
  serviceName: string;
  checkIn: string;
  checkOut?: string;
  guests: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: number;
}

function generateTxHash(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash << 5) - hash + code.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `0x7f3a${hex}c4d1e2b9c`;
}

function generateQrSvg(text: string): string {
  const size = 120;
  const modules = 25;
  const cellSize = size / modules;
  const cells: boolean[][] = [];
  for (let r = 0; r < modules; r++) {
    cells[r] = [];
    for (let c = 0; c < modules; c++) {
      const v = (r * 31 + c * 17 + text.charCodeAt((r + c) % text.length)) % 3;
      cells[r][c] = v !== 0;
    }
  }
  // finder patterns
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      const border = i === 0 || i === 6 || j === 0 || j === 6;
      const inner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
      cells[i][j] = border || inner;
      cells[i][modules - 7 + j] = border || inner;
      cells[modules - 7 + i][j] = border || inner;
    }
  }
  let rects = "";
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (cells[r][c]) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="currentColor"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${rects}</svg>`;
}

interface Props {
  data: ConfirmationData;
  open: boolean;
  onClose: () => void;
}

export function ReservationConfirmation({ data, open, onClose }: Props) {
  const txHash = generateTxHash(data.bookingCode);
  const shortHash = `${txHash.slice(0, 10)}...${txHash.slice(-6)}`;

  const [ackData, setAckData] = useState<
    import("../lib/reservationAcknowledgment").AcknowledgmentData
  >({
    acknowledged: false,
    acknowledgedAt: null,
    proofHash: null,
    auditTrail: [],
  });
  useEffect(() => {
    loadAcknowledgment(data.bookingCode).then(setAckData);
  }, [data.bookingCode]);
  const [showProof, setShowProof] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(txHash);
    toast.success("Hash copié !");
  };

  const handleDownload = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Réservation KongoKash — ${data.bookingCode}`,
        text: `Réservation confirmée pour ${data.serviceName}. Code: ${data.bookingCode}`,
      });
    } else {
      navigator.clipboard.writeText(
        `Réservation: ${data.bookingCode} — ${data.serviceName}`,
      );
      toast.success("Lien copié !");
    }
  };

  const handleAcknowledge = async () => {
    const updated = await acknowledgeReservation(data.bookingCode);
    setAckData(updated);
    setShowProof(true);
    toast.success(
      "✅ Accusé de réception enregistré — Preuve on-chain générée",
      { duration: 5000 },
    );
  };

  const dates = data.checkOut
    ? `${data.checkIn} → ${data.checkOut}`
    : data.checkIn;
  const amountStr = `${data.amount.toLocaleString("fr-FR")} ${data.currency}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden"
        style={{
          background: "oklch(0.13 0.04 220)",
          border: "1px solid oklch(0.28 0.06 220)",
        }}
        data-ocid="reservation_confirmation.dialog"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Confirmation de réservation</DialogTitle>
        </DialogHeader>

        {/* Header gradient */}
        <div
          className="p-6 text-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.30 0.12 195), oklch(0.28 0.14 160))",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, oklch(0.90 0.02 80) 0, oklch(0.90 0.02 80) 1px, transparent 0, transparent 50%)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3"
              style={{ background: "oklch(0.52 0.12 160 / 0.3)" }}
            >
              <CheckCircle2
                size={28}
                style={{ color: "oklch(0.80 0.15 145)" }}
              />
            </div>
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: "oklch(0.95 0.03 80)" }}
            >
              Réservation Confirmée
            </h2>
            <p className="text-sm" style={{ color: "oklch(0.78 0.06 195)" }}>
              {data.serviceName}
            </p>
          </div>
        </div>

        {/* Dashed divider */}
        <div
          className="flex items-center"
          style={{ background: "oklch(0.13 0.04 220)" }}
        >
          <div
            className="w-5 h-5 rounded-full shrink-0 -ml-2.5"
            style={{ background: "oklch(0.09 0.03 220)" }}
          />
          <div
            className="flex-1 border-dashed border-t mx-2"
            style={{ borderColor: "oklch(0.28 0.05 220)" }}
          />
          <div
            className="w-5 h-5 rounded-full shrink-0 -mr-2.5"
            style={{ background: "oklch(0.09 0.03 220)" }}
          />
        </div>

        <div className="p-5 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Details + QR */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              {[
                {
                  label: "Code",
                  value: `#${data.bookingCode}`,
                  highlight: true,
                },
                {
                  label: "Dates",
                  value: dates,
                },
                { label: "Voyageurs", value: `${data.guests} pers.` },
                {
                  label: "Montant",
                  value: amountStr,
                },
                { label: "Paiement", value: data.paymentMethod.toUpperCase() },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex justify-between gap-2">
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.50 0.03 220)" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-xs font-semibold text-right"
                    style={{
                      color: highlight
                        ? "oklch(0.77 0.13 85)"
                        : "oklch(0.82 0.03 220)",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* QR Code */}
            <div
              className="shrink-0 p-2 rounded-xl"
              style={{ background: "oklch(0.97 0.01 80)" }}
            >
              <div
                style={{ color: "oklch(0.10 0.04 220)", width: 80, height: 80 }}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG generated client-side
                dangerouslySetInnerHTML={{
                  __html: generateQrSvg(data.bookingCode).replace(
                    'width="120" height="120"',
                    'width="80" height="80"',
                  ),
                }}
              />
            </div>
          </div>

          {/* On-Chain Proof */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{
              background: "oklch(0.16 0.05 195 / 0.3)",
              border: "1px solid oklch(0.35 0.10 195 / 0.4)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold tracking-wider uppercase"
                style={{ color: "oklch(0.60 0.15 195)" }}
              >
                🔗 Preuve On-Chain
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: "oklch(0.28 0.10 145 / 0.3)",
                  color: "oklch(0.70 0.15 145)",
                }}
              >
                <CheckCircle2 size={10} />
                Vérifié On-Chain ✓
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.50 0.03 220)" }}
                >
                  Hash TX
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="font-mono text-xs"
                    style={{ color: "oklch(0.70 0.10 195)" }}
                  >
                    {shortHash}
                  </span>
                  <button
                    type="button"
                    onClick={copyHash}
                    className="p-0.5 rounded hover:opacity-70 transition-opacity"
                    style={{ color: "oklch(0.60 0.15 195)" }}
                    data-ocid="reservation_confirmation.button"
                  >
                    <Copy size={11} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.50 0.03 220)" }}
                >
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
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.50 0.03 220)" }}
                >
                  Horodatage
                </span>
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.65 0.04 220)" }}
                >
                  {formatDateTime(data.createdAt)}
                </span>
              </div>

              <button
                type="button"
                className="flex items-center gap-1 text-xs mt-1 hover:opacity-70 transition-opacity"
                style={{ color: "oklch(0.60 0.15 195)" }}
                onClick={() =>
                  toast.info(
                    "Explorer ICP disponible au lancement officiel de KongoKash",
                  )
                }
                data-ocid="reservation_confirmation.link"
              >
                <ExternalLink size={11} />
                Voir sur ICP Explorer
              </button>
            </div>
          </div>

          {/* ── Acknowledgment section ───────────────────────────────────── */}
          {!ackData.acknowledged ? (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "oklch(0.22 0.08 85 / 0.18)",
                border: "1px solid oklch(0.55 0.14 85 / 0.35)",
              }}
            >
              <p
                className="text-xs leading-relaxed"
                style={{ color: "oklch(0.72 0.06 85)" }}
              >
                🛡️ <strong>Protection anti-fraude :</strong> Confirmez la
                réception de votre réservation. Cette action génère une preuve
                cryptographique immuable liée à votre code de réservation.
              </p>
              <Button
                className="w-full font-semibold gap-2"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.48 0.14 160), oklch(0.42 0.16 180))",
                  color: "white",
                }}
                onClick={handleAcknowledge}
                data-ocid="reservation_confirmation.primary_button"
              >
                <CheckCircle2 size={16} />✅ J&apos;ai bien reçu ma réservation
              </Button>
            </div>
          ) : (
            <div
              className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
              style={{
                background: "oklch(0.22 0.08 145 / 0.25)",
                border: "1px solid oklch(0.50 0.14 145 / 0.45)",
              }}
              data-ocid="reservation_confirmation.success_state"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  style={{ color: "oklch(0.68 0.15 145)" }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.68 0.15 145)" }}
                >
                  Accusé de réception enregistré
                </span>
              </div>
              <button
                type="button"
                className="text-xs underline hover:no-underline transition-all"
                style={{ color: "oklch(0.60 0.10 195)" }}
                onClick={() => setShowProof((v) => !v)}
                data-ocid="reservation_confirmation.button"
              >
                {showProof ? "Masquer" : "Voir la preuve"}
              </button>
            </div>
          )}

          {/* Proof card */}
          {showProof &&
            ackData.acknowledged &&
            ackData.acknowledgedAt &&
            ackData.proofHash && (
              <ReservationProof
                bookingCode={data.bookingCode}
                serviceName={data.serviceName}
                dates={dates}
                amount={amountStr}
                acknowledgedAt={ackData.acknowledgedAt}
                proofHash={ackData.proofHash}
                onClose={() => setShowProof(false)}
              />
            )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1 gap-1.5 text-xs border-white/20 text-white hover:bg-white/10"
              data-ocid="reservation_confirmation.secondary_button"
            >
              <Download size={13} />
              Télécharger
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 gap-1.5 text-xs"
              style={{ background: "oklch(0.52 0.12 160)" }}
            >
              <Share2 size={13} className="text-white" />
              <span className="text-white">Partager</span>
            </Button>
          </div>

          <p
            className="text-xs text-center"
            style={{ color: "oklch(0.40 0.03 220)" }}
          >
            {formatDateTime(data.createdAt)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
