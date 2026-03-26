import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  CheckCircle,
  Copy,
  Download,
  Plane,
  TreePine,
} from "lucide-react";
import { toast } from "sonner";

// ─── QR Code Generator (SVG-based, deterministic from booking code) ───────────

function generateQRMatrix(code: string): boolean[][] {
  const size = 21;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );

  // Seed from booking code characters
  const seed = code
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Finder patterns (corners)
  const addFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        matrix[row + r][col + c] =
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      }
    }
  };
  addFinder(0, 0);
  addFinder(0, 14);
  addFinder(14, 0);

  // Timing patterns
  for (let i = 8; i < 13; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Data modules — pseudo-random from code
  let pseudo = seed;
  for (let r = 8; r < size - 8; r++) {
    for (let c = 8; c < size - 8; c++) {
      pseudo = (pseudo * 1664525 + 1013904223) & 0x7fffffff;
      matrix[r][c] = pseudo % 3 !== 0;
    }
  }

  return matrix;
}

function QRCodeSVG({ code }: { code: string }) {
  const matrix = generateQRMatrix(code);
  const size = 21;
  const cellSize = 8;
  const totalSize = size * cellSize;

  return (
    <svg
      width={totalSize}
      height={totalSize}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      style={{ borderRadius: 4 }}
      aria-label="QR Code"
    >
      <title>QR Code</title>
      <rect width={totalSize} height={totalSize} fill="#ffffff" />
      {matrix.flatMap((row, r) =>
        row.flatMap((cell, c) =>
          cell
            ? [
                <rect
                  key={`qr-r${String(r).padStart(2, "0")}c${String(c).padStart(2, "0")}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="oklch(0.14 0.03 220)"
                />,
              ]
            : [],
        ),
      )}
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type TicketType = "VOL" | "PARC" | "HÔTEL" | "STRUCTURE";

export interface TicketData {
  type: TicketType;
  serviceName: string;
  passenger: string;
  date: string;
  time?: string;
  bookingCode: string;
  details?: string;
  price?: string;
}

interface DigitalTicketProps {
  ticket: TicketData | null;
  open: boolean;
  onClose: () => void;
}

function typeIcon(type: TicketType) {
  switch (type) {
    case "VOL":
      return <Plane size={16} />;
    case "PARC":
      return <TreePine size={16} />;
    default:
      return <Building2 size={16} />;
  }
}

function typeColor(type: TicketType): string {
  switch (type) {
    case "VOL":
      return "oklch(0.60 0.15 250)";
    case "PARC":
      return "oklch(0.60 0.15 145)";
    default:
      return "oklch(0.60 0.15 195)";
  }
}

// ─── Digital Ticket Component ─────────────────────────────────────────────────

export function DigitalTicket({ ticket, open, onClose }: DigitalTicketProps) {
  if (!ticket) return null;

  const color = typeColor(ticket.type);

  function handleCopy() {
    navigator.clipboard.writeText(ticket!.bookingCode);
    toast.success("Code copié dans le presse-papiers");
  }

  function handlePrint() {
    window.print();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm p-0 overflow-hidden"
        style={{
          background: "oklch(0.12 0.03 220)",
          border: "1px solid oklch(0.28 0.06 220)",
        }}
        data-ocid="ticket.dialog"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Ticket Numérique</DialogTitle>
        </DialogHeader>

        {/* Gradient top bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.52 0.12 195), oklch(0.77 0.13 85))",
          }}
        />

        {/* Ticket body */}
        <div className="p-6 space-y-5">
          {/* Header: logo + type */}
          <div className="flex items-center justify-between">
            <div>
              <span
                className="font-bold text-xl tracking-tight"
                style={{ color: "oklch(0.60 0.15 195)" }}
              >
                Kongo
              </span>
              <span
                className="font-bold text-xl tracking-tight"
                style={{ color: "oklch(0.77 0.13 85)" }}
              >
                Kash
              </span>
            </div>
            <Badge
              className="flex items-center gap-1 px-2.5 py-1 font-bold text-xs uppercase"
              style={{
                background: `${color}22`,
                color,
                border: `1px solid ${color}55`,
              }}
            >
              {typeIcon(ticket.type)}
              {ticket.type}
            </Badge>
          </div>

          {/* Dashed separator */}
          <div
            className="border-t border-dashed"
            style={{ borderColor: "oklch(0.28 0.05 220)" }}
          />

          {/* Service name */}
          <div>
            <p
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: "oklch(0.50 0.04 220)" }}
            >
              Service
            </p>
            <p
              className="font-bold text-base leading-tight"
              style={{ color: "oklch(0.92 0.04 80)" }}
            >
              {ticket.serviceName}
            </p>
            {ticket.details && (
              <p
                className="text-sm mt-0.5"
                style={{ color: "oklch(0.60 0.04 220)" }}
              >
                {ticket.details}
              </p>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "oklch(0.50 0.04 220)" }}
              >
                Passager / Visiteur
              </p>
              <p
                className="font-semibold text-sm"
                style={{ color: "oklch(0.85 0.04 220)" }}
              >
                {ticket.passenger}
              </p>
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "oklch(0.50 0.04 220)" }}
              >
                Date
              </p>
              <p
                className="font-semibold text-sm"
                style={{ color: "oklch(0.85 0.04 220)" }}
              >
                {ticket.date}
              </p>
            </div>
            {ticket.time && (
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: "oklch(0.50 0.04 220)" }}
                >
                  Heure
                </p>
                <p
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.85 0.04 220)" }}
                >
                  {ticket.time}
                </p>
              </div>
            )}
            {ticket.price && (
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: "oklch(0.50 0.04 220)" }}
                >
                  Montant
                </p>
                <p
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.77 0.13 85)" }}
                >
                  {ticket.price}
                </p>
              </div>
            )}
          </div>

          {/* Dashed separator */}
          <div
            className="border-t border-dashed"
            style={{ borderColor: "oklch(0.28 0.05 220)" }}
          />

          {/* QR Code + Booking Code */}
          <div className="flex items-center gap-4">
            <div
              className="rounded-lg overflow-hidden p-1.5 shrink-0"
              style={{ background: "white" }}
            >
              <QRCodeSVG code={ticket.bookingCode} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: "oklch(0.50 0.04 220)" }}
              >
                Code de réservation
              </p>
              <p
                className="font-mono font-bold text-lg tracking-widest break-all"
                style={{ color: "oklch(0.77 0.13 85)" }}
              >
                {ticket.bookingCode}
              </p>
              <div className="mt-2 flex items-center gap-1">
                <CheckCircle
                  size={12}
                  style={{ color: "oklch(0.65 0.15 145)" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.65 0.15 145)" }}
                >
                  Confirmé
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 gap-2 border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              data-ocid="ticket.button"
            >
              <Copy size={13} /> Copier le code
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="flex-1 gap-2"
              style={{ background: "oklch(0.52 0.12 195)" }}
              data-ocid="ticket.primary_button"
            >
              <Download size={13} /> Télécharger
            </Button>
          </div>
        </div>

        {/* Gradient bottom bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.77 0.13 85), oklch(0.52 0.12 195))",
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default DigitalTicket;
