import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// ─── Types ────────────────────────────────────────────────────────────────────

type P2PStatusKey =
  | "open"
  | "locked"
  | "payment_sent"
  | "confirmed"
  | "disputed"
  | "cancelled"
  | "completed";

interface P2POffer {
  id: bigint;
  sellerId: any;
  asset: string;
  amount: number;
  pricePerUnit: number;
  currency: string;
  paymentMethod: string;
  status: Record<string, null>;
  createdAt: bigint;
  buyerId: [] | [any];
  tradeId: [] | [bigint];
  minAmount: number;
  maxAmount: number;
}

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getP2PStatusKey(status: Record<string, null>): P2PStatusKey {
  return (Object.keys(status)[0] as P2PStatusKey) ?? "open";
}

const STATUS_CONFIG: Record<
  P2PStatusKey,
  { label: string; color: string; bg: string; icon: string }
> = {
  open: {
    label: "Ouvert",
    color: "oklch(0.62 0.13 185)",
    bg: "oklch(0.25 0.07 185 / 0.3)",
    icon: "🟢",
  },
  locked: {
    label: "Verrouillé",
    color: "oklch(0.75 0.14 75)",
    bg: "oklch(0.28 0.09 75 / 0.3)",
    icon: "🔒",
  },
  payment_sent: {
    label: "Paiement envoyé",
    color: "oklch(0.60 0.15 250)",
    bg: "oklch(0.22 0.08 250 / 0.3)",
    icon: "💸",
  },
  confirmed: {
    label: "Confirmé",
    color: "oklch(0.68 0.14 145)",
    bg: "oklch(0.24 0.08 145 / 0.3)",
    icon: "✅",
  },
  disputed: {
    label: "Litige",
    color: "oklch(0.66 0.16 25)",
    bg: "oklch(0.24 0.09 25 / 0.3)",
    icon: "⚠️",
  },
  cancelled: {
    label: "Annulé",
    color: "oklch(0.50 0.04 220)",
    bg: "oklch(0.20 0.03 220 / 0.3)",
    icon: "❌",
  },
  completed: {
    label: "Complété",
    color: "oklch(0.68 0.14 145)",
    bg: "oklch(0.24 0.08 145 / 0.3)",
    icon: "🎉",
  },
};

const ASSETS = ["BTC", "ETH", "USDT", "ICP", "OKP"];
const PAYMENT_METHODS = ["Airtel Money", "M-Pesa", "Virement Bancaire"];

function StatusBadge({ status }: { status: Record<string, null> }) {
  const key = getP2PStatusKey(status);
  const cfg = STATUS_CONFIG[key] ?? STATUS_CONFIG.open;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
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

// ─── Security Banner ──────────────────────────────────────────────────────────

// ─── Escrow Flow Diagram ─────────────────────────────────────────────────────

function EscrowFlowDiagram({ compact = false }: { compact?: boolean }) {
  const steps = [
    { icon: "🔒", label: "Offre créée", sub: "Fonds verrouillés" },
    { icon: "💸", label: "Acheteur paie", sub: "Paiement envoyé" },
    { icon: "✅", label: "Vendeur confirme", sub: "Réception vérifiée" },
    { icon: "🚀", label: "Fonds libérés", sub: "À l'acheteur" },
  ];
  return (
    <div
      className={`rounded-xl ${compact ? "p-3" : "p-4"}`}
      style={{
        background: "oklch(0.18 0.05 185 / 0.25)",
        border: "1px solid oklch(0.45 0.12 185 / 0.35)",
      }}
    >
      {!compact && (
        <p
          className="text-xs font-semibold mb-3 flex items-center gap-1.5"
          style={{ color: "oklch(0.68 0.10 185)" }}
        >
          <Shield size={12} /> Flux escrow sécurisé — KongoKash
        </p>
      )}
      <div
        className={`flex ${compact ? "gap-1" : "gap-2"} items-center flex-wrap`}
      >
        {steps.map((step, i) => (
          <div
            key={step.label}
            className="flex items-center gap-1 flex-shrink-0"
          >
            <div
              className={`flex flex-col items-center ${compact ? "gap-0" : "gap-0.5"}`}
            >
              <span className={compact ? "text-base" : "text-xl"}>
                {step.icon}
              </span>
              <span
                className={`font-semibold leading-tight ${compact ? "text-[9px]" : "text-xs"}`}
                style={{ color: "oklch(0.80 0.05 220)" }}
              >
                {step.label}
              </span>
              {!compact && (
                <span
                  className="text-[10px] leading-tight"
                  style={{ color: "oklch(0.55 0.05 185)" }}
                >
                  {step.sub}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <span
                className="text-xs opacity-40 mx-0.5"
                style={{ color: "oklch(0.55 0.08 185)" }}
              >
                →
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function P2PSecurityBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 space-y-3 mb-6"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.18 0.07 195 / 0.5), oklch(0.16 0.05 220 / 0.5))",
        border: "1px solid oklch(0.45 0.12 185 / 0.4)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "oklch(0.35 0.12 185 / 0.4)" }}
        >
          <Shield size={18} style={{ color: "oklch(0.62 0.13 185)" }} />
        </div>
        <div>
          <p
            className="text-sm font-bold"
            style={{ color: "oklch(0.82 0.06 185)" }}
          >
            🔒 Fonds protégés par Smart Escrow
          </p>
          <p
            className="text-xs mt-0.5 leading-relaxed"
            style={{ color: "oklch(0.60 0.06 200)" }}
          >
            Les fonds crypto sont automatiquement verrouillés dès acceptation —
            ni le vendeur ni KongoKash ne peut y accéder sans validation.
          </p>
        </div>
      </div>

      {/* Trade flow steps */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {[
          { label: "Offre créée", icon: "📋" },
          { label: "Fonds verrouillés", icon: "🔒" },
          { label: "Paiement envoyé", icon: "💸" },
          { label: "Confirmé", icon: "✅" },
          { label: "Libéré", icon: "🎉" },
        ].map((step, i, arr) => (
          <div
            key={step.label}
            className="flex items-center gap-1 flex-shrink-0"
          >
            <div className="flex flex-col items-center">
              <span className="text-base">{step.icon}</span>
              <span
                className="text-[10px] mt-0.5 whitespace-nowrap"
                style={{ color: "oklch(0.55 0.06 200)" }}
              >
                {step.label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <span
                className="text-lg mx-0.5 flex-shrink-0"
                style={{ color: "oklch(0.40 0.06 200)" }}
              >
                →
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        className="rounded-lg px-3 py-2 text-xs"
        style={{
          background: "oklch(0.22 0.08 75 / 0.3)",
          border: "1px solid oklch(0.55 0.13 75 / 0.3)",
          color: "oklch(0.72 0.12 75)",
        }}
      >
        ⚠️ Ne libérez les fonds QUE si vous avez reçu le paiement. Tout litige
        sera arbitré par KongoKash.
      </div>
    </motion.div>
  );
}

// ─── Create Offer Dialog ──────────────────────────────────────────────────────

function CreateOfferDialog({ onCreated }: { onCreated: () => void }) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [open, setOpen] = useState(false);
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Airtel Money");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");

  const createOffer = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Non connecté");
      return (actor as any).createP2POffer(
        asset,
        Number(amount),
        Number(price),
        "CDF",
        paymentMethod,
        Number(minAmt) || 0,
        Number(maxAmt) || Number(amount),
      ) as Promise<{ success: boolean; message: string; offerId: bigint }>;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Offre créée ! ID: #${data.offerId}`);
        setOpen(false);
        setAmount("");
        setPrice("");
        setMinAmt("");
        setMaxAmt("");
        onCreated();
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur lors de la création de l'offre"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5"
          style={{ background: "oklch(0.52 0.13 185)", color: "white" }}
          disabled={!identity || isFetching}
          data-ocid="p2p.open_modal_button"
        >
          <Plus size={14} />
          Créer une offre
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
          background: "oklch(0.14 0.04 220)",
          border: "1px solid oklch(0.25 0.05 220)",
        }}
        data-ocid="p2p.dialog"
      >
        <DialogHeader>
          <DialogTitle style={{ color: "oklch(0.82 0.06 80)" }}>
            📋 Créer une offre P2P
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label style={{ color: "oklch(0.65 0.04 220)" }}>Actif</Label>
              <Select value={asset} onValueChange={setAsset}>
                <SelectTrigger
                  style={{
                    background: "oklch(0.18 0.04 220)",
                    border: "1px solid oklch(0.28 0.05 220)",
                    color: "white",
                  }}
                  data-ocid="p2p.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSETS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label style={{ color: "oklch(0.65 0.04 220)" }}>Quantité</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  background: "oklch(0.18 0.04 220)",
                  border: "1px solid oklch(0.28 0.05 220)",
                  color: "white",
                }}
                data-ocid="p2p.input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label style={{ color: "oklch(0.65 0.04 220)" }}>
              Prix unitaire (CDF)
            </Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 5500 CDF par USDT"
              style={{
                background: "oklch(0.18 0.04 220)",
                border: "1px solid oklch(0.28 0.05 220)",
                color: "white",
              }}
              data-ocid="p2p.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label style={{ color: "oklch(0.65 0.04 220)" }}>
              Méthode de paiement
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger
                style={{
                  background: "oklch(0.18 0.04 220)",
                  border: "1px solid oklch(0.28 0.05 220)",
                  color: "white",
                }}
                data-ocid="p2p.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label style={{ color: "oklch(0.65 0.04 220)" }}>
                Montant min acheteur
              </Label>
              <Input
                type="number"
                value={minAmt}
                onChange={(e) => setMinAmt(e.target.value)}
                placeholder="Min"
                style={{
                  background: "oklch(0.18 0.04 220)",
                  border: "1px solid oklch(0.28 0.05 220)",
                  color: "white",
                }}
                data-ocid="p2p.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: "oklch(0.65 0.04 220)" }}>
                Montant max acheteur
              </Label>
              <Input
                type="number"
                value={maxAmt}
                onChange={(e) => setMaxAmt(e.target.value)}
                placeholder="Max"
                style={{
                  background: "oklch(0.18 0.04 220)",
                  border: "1px solid oklch(0.28 0.05 220)",
                  color: "white",
                }}
                data-ocid="p2p.input"
              />
            </div>
          </div>
        </div>

        {amount && Number(amount) > 0 && (
          <div
            className="rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs"
            style={{
              background: "oklch(0.28 0.10 75 / 0.25)",
              border: "1px solid oklch(0.55 0.15 75 / 0.5)",
            }}
          >
            <span className="text-base leading-none mt-0.5">⚠️</span>
            <p style={{ color: "oklch(0.78 0.12 75)" }}>
              En créant cette offre, vos{" "}
              <strong>
                {amount} {asset}
              </strong>{" "}
              seront immédiatement verrouillés dans le smart contract escrow.
              Personne ne peut y accéder pendant la transaction.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-white/20 text-white/70"
            data-ocid="p2p.cancel_button"
          >
            Annuler
          </Button>
          <Button
            onClick={() => createOffer.mutate()}
            disabled={
              createOffer.isPending ||
              !amount ||
              !price ||
              Number(amount) <= 0 ||
              Number(price) <= 0
            }
            style={{ background: "oklch(0.52 0.13 185)", color: "white" }}
            data-ocid="p2p.submit_button"
          >
            {createOffer.isPending ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : null}
            Publier l'offre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Accept Offer Dialog ──────────────────────────────────────────────────────

function AcceptOfferDialog({
  offer,
  onAccepted,
}: {
  offer: P2POffer;
  onAccepted: () => void;
}) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(offer.minAmount || offer.amount));

  const acceptOffer = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Non connecté");
      return (actor as any).acceptP2POffer(
        offer.id,
        Number(amount),
      ) as Promise<{ success: boolean; message: string; tradeId: bigint }>;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          `Trade lancé ! ID: #${data.tradeId} — Les fonds sont maintenant verrouillés.`,
        );
        setOpen(false);
        onAccepted();
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur lors de l'acceptation de l'offre"),
  });

  const total = Number(amount) * offer.pricePerUnit;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1"
          style={{ background: "oklch(0.52 0.13 185)", color: "white" }}
          disabled={!identity}
          data-ocid="p2p.primary_button"
        >
          Acheter
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
          background: "oklch(0.14 0.04 220)",
          border: "1px solid oklch(0.25 0.05 220)",
        }}
        data-ocid="p2p.dialog"
      >
        <DialogHeader>
          <DialogTitle style={{ color: "oklch(0.82 0.06 80)" }}>
            🤝 Accepter l'offre #{String(offer.id)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div
            className="rounded-xl p-3 space-y-1"
            style={{
              background: "oklch(0.18 0.04 220)",
              border: "1px solid oklch(0.28 0.05 220)",
            }}
          >
            <div className="flex justify-between text-sm">
              <span style={{ color: "oklch(0.60 0.04 220)" }}>Actif</span>
              <span
                className="font-bold"
                style={{ color: "oklch(0.80 0.04 220)" }}
              >
                {offer.asset}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "oklch(0.60 0.04 220)" }}>Prix/unité</span>
              <span
                className="font-bold"
                style={{ color: "oklch(0.78 0.13 85)" }}
              >
                {offer.pricePerUnit.toLocaleString("fr-FR")} {offer.currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "oklch(0.60 0.04 220)" }}>
                Paiement via
              </span>
              <span style={{ color: "oklch(0.80 0.04 220)" }}>
                {offer.paymentMethod}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label style={{ color: "oklch(0.65 0.04 220)" }}>
              Quantité à acheter ({offer.minAmount} –{" "}
              {offer.maxAmount || offer.amount} max)
            </Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={offer.minAmount}
              max={offer.maxAmount || offer.amount}
              style={{
                background: "oklch(0.18 0.04 220)",
                border: "1px solid oklch(0.28 0.05 220)",
                color: "white",
              }}
              data-ocid="p2p.input"
            />
          </div>

          {Number(amount) > 0 && (
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: "oklch(0.22 0.08 185 / 0.3)",
                border: "1px solid oklch(0.45 0.12 185 / 0.4)",
              }}
            >
              <p className="text-xs" style={{ color: "oklch(0.60 0.06 185)" }}>
                Total à payer
              </p>
              <p
                className="text-xl font-bold mt-0.5"
                style={{ color: "oklch(0.78 0.13 85)" }}
              >
                {total.toLocaleString("fr-FR")} {offer.currency}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "oklch(0.55 0.06 185)" }}
              >
                🔒 Les fonds crypto seront verrouillés immédiatement
              </p>
            </div>
          )}
        </div>

        <EscrowFlowDiagram compact />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-white/20 text-white/70"
            data-ocid="p2p.cancel_button"
          >
            Annuler
          </Button>
          <Button
            onClick={() => acceptOffer.mutate()}
            disabled={acceptOffer.isPending || !amount || Number(amount) <= 0}
            style={{ background: "oklch(0.52 0.13 185)", color: "white" }}
            data-ocid="p2p.confirm_button"
          >
            {acceptOffer.isPending ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : (
              <Lock size={14} className="mr-1.5" />
            )}
            Confirmer et verrouiller
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Trade Card ───────────────────────────────────────────────────────────────

function TradeCard({
  trade,
  myPrincipal,
  onAction,
}: {
  trade: P2PTrade;
  myPrincipal: string;
  onAction: () => void;
}) {
  const { actor } = useActor();
  const statusKey = getP2PStatusKey(trade.status);
  const isBuyer = trade.buyerId.toString() === myPrincipal;
  const isSeller = trade.sellerId.toString() === myPrincipal;

  const [proofOpen, setProofOpen] = useState(false);
  const [proofHash, setProofHash] = useState("");
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [countdown, setCountdown] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (statusKey !== "locked" && statusKey !== "payment_sent") return;
    const THIRTY_MIN_NS = BigInt(30 * 60 * 1_000_000_000);
    const deadline = Number(
      (trade.createdAt + THIRTY_MIN_NS) / BigInt(1_000_000),
    );
    const tick = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        setIsExpired(true);
        setCountdown("");
      } else {
        const mins = Math.floor(remaining / 60_000);
        const secs = Math.floor((remaining % 60_000) / 1_000);
        setCountdown(
          `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`,
        );
        setIsExpired(false);
      }
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [statusKey, trade.createdAt]);

  const confirmPaymentSent = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error();
      return (actor as any).buyerConfirmPaymentSent(
        trade.id,
        proofHash.trim(),
      ) as Promise<{ success: boolean; message: string }>;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Paiement signalé ! En attente de confirmation vendeur.");
        setProofOpen(false);
        onAction();
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur"),
  });

  const confirmReceived = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error();
      return (actor as any).sellerConfirmPaymentReceived(trade.id) as Promise<{
        success: boolean;
        message: string;
      }>;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Paiement confirmé ! Fonds libérés à l'acheteur.");
        onAction();
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur"),
  });

  const openDispute = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error();
      return (actor as any).openP2PDispute(
        trade.id,
        disputeReason.trim(),
      ) as Promise<{ success: boolean; message: string }>;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Litige ouvert. Notre équipe examinera sous 48h.");
        setDisputeOpen(false);
        onAction();
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur"),
  });

  const canDispute = statusKey === "locked" || statusKey === "payment_sent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: "oklch(0.16 0.04 220)",
        border: `1px solid ${STATUS_CONFIG[statusKey]?.color ?? "oklch(0.25 0.04 220)"}30`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-sm font-bold"
              style={{ color: "oklch(0.78 0.13 85)" }}
            >
              Trade #{String(trade.id)}
            </span>
            <StatusBadge status={trade.status} />
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: "oklch(0.22 0.05 220)",
                color: isBuyer ? "oklch(0.62 0.13 185)" : "oklch(0.72 0.13 55)",
              }}
            >
              {isBuyer ? "Vous achetez" : isSeller ? "Vous vendez" : ""}
            </span>
          </div>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.55 0.04 220)" }}
          >
            {formatNs(trade.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-bold text-sm"
            style={{ color: "oklch(0.80 0.04 220)" }}
          >
            {trade.amount} {trade.asset}
          </p>
          <p className="text-xs" style={{ color: "oklch(0.78 0.13 85)" }}>
            {trade.totalPrice.toLocaleString("fr-FR")} {trade.currency}
          </p>
        </div>
      </div>

      {/* Escrow timeline */}
      <div
        className="rounded-xl px-3 py-2"
        style={{ background: "oklch(0.13 0.03 220)" }}
      >
        <div className="flex items-center gap-1 text-xs overflow-x-auto">
          {["open", "locked", "payment_sent", "confirmed", "completed"].map(
            (s, i, arr) => {
              const stepIdx = [
                "open",
                "locked",
                "payment_sent",
                "confirmed",
                "completed",
              ].indexOf(statusKey);
              const isCurrent = s === statusKey;
              const isPast = i < stepIdx;
              const cfg = STATUS_CONFIG[s as P2PStatusKey];
              return (
                <div key={s} className="flex items-center gap-1 flex-shrink-0">
                  <span
                    className={`text-xs font-medium ${
                      isCurrent
                        ? "opacity-100"
                        : isPast
                          ? "opacity-70"
                          : "opacity-30"
                    }`}
                    style={{ color: isCurrent ? cfg.color : undefined }}
                  >
                    {cfg.icon} {cfg.label}
                  </span>
                  {i < arr.length - 1 && (
                    <span
                      className="opacity-30 flex-shrink-0"
                      style={{ color: "oklch(0.50 0.04 220)" }}
                    >
                      →
                    </span>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Payment method */}
      <div
        className="flex items-center gap-2 text-xs"
        style={{ color: "oklch(0.60 0.04 220)" }}
      >
        <span>💳 {trade.paymentMethod}</span>
        {trade.proofHash.length > 0 && (
          <span className="flex items-center gap-1">
            <CheckCircle size={11} style={{ color: "oklch(0.62 0.13 145)" }} />
            Preuve:{" "}
            <span className="font-mono">
              {trade.proofHash[0]?.slice(0, 16)}…
            </span>
          </span>
        )}
      </div>

      {/* Countdown timer */}
      {(statusKey === "locked" || statusKey === "payment_sent") && (
        <div className="flex items-center gap-2">
          {isExpired ? (
            <span
              className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{
                background: "oklch(0.22 0.08 25 / 0.3)",
                color: "oklch(0.68 0.15 25)",
              }}
            >
              ⚠️ Délai expiré
            </span>
          ) : (
            <span
              className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{
                background: "oklch(0.25 0.08 75 / 0.3)",
                color: "oklch(0.78 0.13 75)",
              }}
            >
              ⏱ {countdown} restantes
            </span>
          )}
          {isExpired && statusKey === "locked" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10"
              onClick={async () => {
                if (!actor) return;
                try {
                  await (actor as any).cancelP2POffer(trade.offerId);
                  toast.success("Trade annulé.");
                  onAction();
                } catch {
                  toast.error("Erreur lors de l'annulation");
                }
              }}
              data-ocid="p2p.delete_button"
            >
              <XCircle size={12} />
              Annuler le trade
            </Button>
          )}
        </div>
      )}

      {/* Payment instructions for buyer when locked */}
      {isBuyer && statusKey === "locked" && (
        <div
          className="rounded-xl px-3 py-2.5 space-y-1"
          style={{
            background: "oklch(0.20 0.08 145 / 0.25)",
            border: "1px solid oklch(0.45 0.12 145 / 0.4)",
          }}
        >
          <p
            className="text-xs font-semibold"
            style={{ color: "oklch(0.68 0.12 145)" }}
          >
            📋 Instructions de paiement
          </p>
          <p className="text-xs" style={{ color: "oklch(0.75 0.05 220)" }}>
            Envoyez{" "}
            <strong style={{ color: "oklch(0.78 0.13 85)" }}>
              {trade.totalPrice.toLocaleString("fr-FR")} {trade.currency}
            </strong>{" "}
            via <strong>{trade.paymentMethod}</strong> et confirmez ci-dessous
          </p>
          <p className="text-xs" style={{ color: "oklch(0.60 0.05 220)" }}>
            Contact vendeur :{" "}
            <span
              className="font-mono"
              style={{ color: "oklch(0.72 0.10 185)" }}
            >
              {trade.paymentMethod.toLowerCase().includes("airtel")
                ? "Airtel Money : +243 810 XXX XXX"
                : trade.paymentMethod.toLowerCase().includes("mpesa") ||
                    trade.paymentMethod.toLowerCase().includes("m-pesa")
                  ? "M-Pesa : +243 820 XXX XXX"
                  : "Virement : Equity BCDC — Compte partenaire"}
            </span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {/* Buyer: confirm payment sent */}
        {isBuyer && statusKey === "locked" && (
          <Dialog open={proofOpen} onOpenChange={setProofOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-1.5"
                style={{ background: "oklch(0.42 0.12 250)", color: "white" }}
                data-ocid="p2p.primary_button"
              >
                <CheckCircle size={13} />
                J'ai envoyé le paiement
              </Button>
            </DialogTrigger>
            <DialogContent
              style={{
                background: "oklch(0.14 0.04 220)",
                border: "1px solid oklch(0.25 0.05 220)",
              }}
              data-ocid="p2p.dialog"
            >
              <DialogHeader>
                <DialogTitle style={{ color: "oklch(0.82 0.06 80)" }}>
                  💸 Confirmer l'envoi du paiement
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.65 0.04 220)" }}
                >
                  Collez la référence ou preuve de votre paiement via{" "}
                  <strong>{trade.paymentMethod}</strong>.
                </p>
                <div className="space-y-1.5">
                  <Label style={{ color: "oklch(0.65 0.04 220)" }}>
                    Référence / Preuve de paiement
                  </Label>
                  <Textarea
                    value={proofHash}
                    onChange={(e) => setProofHash(e.target.value)}
                    placeholder="Ex: TXN-20250101-XXXXXX ou hash de transaction"
                    className="min-h-[80px] bg-white/5 border-white/20 text-white placeholder:text-white/30"
                    data-ocid="p2p.textarea"
                  />
                </div>
                <div
                  className="rounded-lg px-3 py-2 text-xs"
                  style={{
                    background: "oklch(0.22 0.08 75 / 0.25)",
                    color: "oklch(0.68 0.10 75)",
                  }}
                >
                  ⚠️ Cette preuve sera enregistrée on-chain et utilisée en cas de
                  litige.
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setProofOpen(false)}
                  className="border-white/20 text-white/70"
                  data-ocid="p2p.cancel_button"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => confirmPaymentSent.mutate()}
                  disabled={confirmPaymentSent.isPending || !proofHash.trim()}
                  style={{ background: "oklch(0.42 0.12 250)", color: "white" }}
                  data-ocid="p2p.confirm_button"
                >
                  {confirmPaymentSent.isPending ? (
                    <Loader2 size={13} className="mr-1.5 animate-spin" />
                  ) : null}
                  Confirmer l'envoi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Seller: confirm payment received */}
        {isSeller && statusKey === "payment_sent" && (
          <Button
            size="sm"
            className="gap-1.5"
            style={{ background: "oklch(0.35 0.12 145)", color: "white" }}
            onClick={() => confirmReceived.mutate()}
            disabled={confirmReceived.isPending}
            data-ocid="p2p.confirm_button"
          >
            {confirmReceived.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <CheckCircle size={13} />
            )}
            Confirmer réception du paiement
          </Button>
        )}

        {/* Open dispute */}
        {canDispute && (isBuyer || isSeller) && (
          <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
                data-ocid="p2p.open_modal_button"
              >
                <AlertTriangle size={13} />
                Ouvrir un litige
              </Button>
            </DialogTrigger>
            <DialogContent
              style={{
                background: "oklch(0.14 0.04 220)",
                border: "1px solid oklch(0.25 0.05 220)",
              }}
              data-ocid="p2p.dialog"
            >
              <DialogHeader>
                <DialogTitle style={{ color: "oklch(0.82 0.06 80)" }}>
                  ⚠️ Ouvrir un litige P2P
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.65 0.04 220)" }}
                >
                  Décrivez le problème. KongoKash examinera et rendra une
                  décision sous 48h.
                </p>
                <Textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Ex: J'ai envoyé le paiement mais le vendeur ne confirme pas..."
                  className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  data-ocid="p2p.textarea"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDisputeOpen(false)}
                  className="border-white/20 text-white/70"
                  data-ocid="p2p.cancel_button"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => openDispute.mutate()}
                  disabled={openDispute.isPending || !disputeReason.trim()}
                  style={{ background: "oklch(0.55 0.15 30)", color: "white" }}
                  data-ocid="p2p.submit_button"
                >
                  {openDispute.isPending ? (
                    <Loader2 size={13} className="mr-1.5 animate-spin" />
                  ) : null}
                  Soumettre le litige
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </motion.div>
  );
}

// ─── Available Offers Tab ─────────────────────────────────────────────────────

function OffresDisponiblesTab() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const myPrincipal = identity?.getPrincipal().toString() ?? "";

  const { data: offers = [], isLoading } = useQuery<P2POffer[]>({
    queryKey: ["p2pOffers"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getP2POffers() as Promise<P2POffer[]>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15_000,
  });

  const visibleOffers = myPrincipal
    ? offers.filter((o) => o.sellerId.toString() !== myPrincipal)
    : offers;

  const reload = () =>
    queryClient.invalidateQueries({ queryKey: ["p2pOffers"] });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16" data-ocid="p2p.loading_state">
        <Loader2
          className="animate-spin"
          style={{ color: "oklch(0.62 0.13 185)" }}
          size={28}
        />
      </div>
    );
  }

  if (visibleOffers.length === 0) {
    return (
      <div
        className="rounded-2xl p-12 text-center"
        style={{
          background: "oklch(0.16 0.04 220)",
          border: "1px solid oklch(0.25 0.04 220)",
        }}
        data-ocid="p2p.empty_state"
      >
        <p className="text-3xl mb-3">🔍</p>
        <p className="font-semibold" style={{ color: "oklch(0.70 0.04 220)" }}>
          Aucune offre disponible
        </p>
        <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.04 220)" }}>
          Soyez le premier à créer une offre P2P
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "oklch(0.60 0.04 220)" }}>
          {visibleOffers.length} offre{visibleOffers.length > 1 ? "s" : ""}{" "}
          disponible
          {visibleOffers.length > 1 ? "s" : ""}
        </p>
        <Button
          size="sm"
          variant="ghost"
          onClick={reload}
          className="gap-1.5 text-xs"
          style={{ color: "oklch(0.55 0.06 185)" }}
        >
          <RefreshCw size={12} />
          Rafraîchir
        </Button>
      </div>

      <AnimatePresence>
        {visibleOffers.map((offer, idx) => (
          <motion.div
            key={String(offer.id)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap"
            style={{
              background: "oklch(0.16 0.04 220)",
              border: "1px solid oklch(0.27 0.05 220)",
            }}
            data-ocid={`p2p.item.${idx + 1}`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-sm"
                  style={{ color: "oklch(0.80 0.04 220)" }}
                >
                  {offer.amount} {offer.asset}
                </span>
                <StatusBadge status={offer.status} />
              </div>
              <div
                className="flex items-center gap-3 text-xs"
                style={{ color: "oklch(0.60 0.04 220)" }}
              >
                <span>
                  💰{" "}
                  <strong style={{ color: "oklch(0.78 0.13 85)" }}>
                    {offer.pricePerUnit.toLocaleString("fr-FR")}
                  </strong>{" "}
                  {offer.currency}/unité
                </span>
                <span>💳 {offer.paymentMethod}</span>
                {offer.minAmount > 0 && (
                  <span>
                    Min: {offer.minAmount} — Max:{" "}
                    {offer.maxAmount || offer.amount}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "oklch(0.22 0.08 145 / 0.3)",
                  border: "1px solid oklch(0.45 0.12 145 / 0.4)",
                  color: "oklch(0.65 0.12 145)",
                }}
              >
                🔒 Fonds escrow garantis
              </span>
              <AcceptOfferDialog offer={offer} onAccepted={reload} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── My Offers Tab ────────────────────────────────────────────────────────────

function MesOffresTab() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const { data: myOffers = [], isLoading } = useQuery<P2POffer[]>({
    queryKey: ["myP2POffers"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getUserP2POffers() as Promise<P2POffer[]>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15_000,
  });

  const cancelOffer = useMutation({
    mutationFn: async (offerId: bigint) => {
      if (!actor) throw new Error();
      return (actor as any).cancelP2POffer(offerId) as Promise<{
        success: boolean;
        message: string;
      }>;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Offre annulée.");
        queryClient.invalidateQueries({ queryKey: ["myP2POffers"] });
        queryClient.invalidateQueries({ queryKey: ["p2pOffers"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur lors de l'annulation"),
  });

  const reload = () =>
    queryClient.invalidateQueries({ queryKey: ["myP2POffers"] });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "oklch(0.60 0.04 220)" }}>
          Mes offres publiées
        </p>
        <CreateOfferDialog onCreated={reload} />
      </div>

      {isLoading ? (
        <div
          className="flex justify-center py-12"
          data-ocid="p2p.loading_state"
        >
          <Loader2
            className="animate-spin"
            style={{ color: "oklch(0.62 0.13 185)" }}
            size={24}
          />
        </div>
      ) : myOffers.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: "oklch(0.16 0.04 220)",
            border: "1px solid oklch(0.25 0.04 220)",
          }}
          data-ocid="p2p.empty_state"
        >
          <p className="text-3xl mb-3">📋</p>
          <p
            className="font-semibold"
            style={{ color: "oklch(0.70 0.04 220)" }}
          >
            Aucune offre publiée
          </p>
          <p
            className="text-sm mt-1 mb-4"
            style={{ color: "oklch(0.50 0.04 220)" }}
          >
            Créez votre première offre P2P
          </p>
          <CreateOfferDialog onCreated={reload} />
        </div>
      ) : (
        <AnimatePresence>
          {myOffers.map((offer, idx) => {
            const statusKey = getP2PStatusKey(offer.status);
            const _cfg = STATUS_CONFIG[statusKey];
            return (
              <motion.div
                key={String(offer.id)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-2xl p-4 space-y-3"
                style={{
                  background: "oklch(0.16 0.04 220)",
                  border: `1px solid ${_cfg.color}30`,
                }}
                data-ocid={`p2p.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-sm font-bold"
                        style={{ color: "oklch(0.78 0.13 85)" }}
                      >
                        Offre #{String(offer.id)}
                      </span>
                      <StatusBadge status={offer.status} />
                    </div>
                    <div
                      className="flex items-center gap-3 text-xs mt-1"
                      style={{ color: "oklch(0.60 0.04 220)" }}
                    >
                      <span>
                        {offer.amount} {offer.asset}
                      </span>
                      <span>
                        {offer.pricePerUnit.toLocaleString("fr-FR")}{" "}
                        {offer.currency}/unité
                      </span>
                      <span>{offer.paymentMethod}</span>
                    </div>
                  </div>

                  {statusKey === "open" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => cancelOffer.mutate(offer.id)}
                      disabled={cancelOffer.isPending}
                      data-ocid={`p2p.delete_button.${idx + 1}`}
                    >
                      <XCircle size={13} />
                      Annuler
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── My Trades Tab ────────────────────────────────────────────────────────────

function MesTradesTab() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const myPrincipal = identity?.getPrincipal().toString() ?? "";

  const { data: trades = [], isLoading } = useQuery<P2PTrade[]>({
    queryKey: ["myP2PTrades"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getUserP2PTrades() as Promise<P2PTrade[]>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15_000,
  });

  const reload = () =>
    queryClient.invalidateQueries({ queryKey: ["myP2PTrades"] });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16" data-ocid="p2p.loading_state">
        <Loader2
          className="animate-spin"
          style={{ color: "oklch(0.62 0.13 185)" }}
          size={28}
        />
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div
        className="rounded-2xl p-12 text-center"
        style={{
          background: "oklch(0.16 0.04 220)",
          border: "1px solid oklch(0.25 0.04 220)",
        }}
        data-ocid="p2p.empty_state"
      >
        <p className="text-3xl mb-3">🤝</p>
        <p className="font-semibold" style={{ color: "oklch(0.70 0.04 220)" }}>
          Aucun trade en cours
        </p>
        <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.04 220)" }}>
          Acceptez une offre dans l'onglet "Offres disponibles"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "oklch(0.60 0.04 220)" }}>
          {trades.length} trade{trades.length > 1 ? "s" : ""}
        </p>
        <Button
          size="sm"
          variant="ghost"
          onClick={reload}
          className="gap-1.5 text-xs"
          style={{ color: "oklch(0.55 0.06 185)" }}
        >
          <RefreshCw size={12} />
          Rafraîchir
        </Button>
      </div>

      <AnimatePresence>
        {trades.map((trade) => (
          <TradeCard
            key={String(trade.id)}
            trade={trade}
            myPrincipal={myPrincipal}
            onAction={reload}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Main P2P Section ─────────────────────────────────────────────────────────

export default function P2PSection() {
  const { identity } = useInternetIdentity();

  return (
    <div className="space-y-4">
      <P2PSecurityBanner />
      <EscrowFlowDiagram />

      {!identity && (
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: "oklch(0.16 0.05 220)",
            border: "1px solid oklch(0.28 0.08 185 / 0.4)",
          }}
        >
          <Lock
            size={28}
            className="mx-auto mb-3"
            style={{ color: "oklch(0.62 0.13 185)" }}
          />
          <p
            className="font-semibold"
            style={{ color: "oklch(0.75 0.05 220)" }}
          >
            Connectez-vous pour accéder au P2P
          </p>
          <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.05 220)" }}>
            Créez et gérez des trades P2P sécurisés
          </p>
        </div>
      )}

      <Tabs defaultValue="offres">
        <TabsList
          className="grid w-full grid-cols-3"
          style={{
            background: "oklch(0.15 0.03 220)",
            border: "1px solid oklch(0.25 0.04 220)",
          }}
        >
          <TabsTrigger
            value="offres"
            className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-teal-700"
            data-ocid="p2p.tab"
          >
            🌍 Offres disponibles
          </TabsTrigger>
          <TabsTrigger
            value="mes-offres"
            className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-teal-700"
            data-ocid="p2p.tab"
          >
            📋 Mes offres
          </TabsTrigger>
          <TabsTrigger
            value="mes-trades"
            className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-teal-700"
            data-ocid="p2p.tab"
          >
            🤝 Mes trades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offres" className="mt-4">
          <OffresDisponiblesTab />
        </TabsContent>
        <TabsContent value="mes-offres" className="mt-4">
          <MesOffresTab />
        </TabsContent>
        <TabsContent value="mes-trades" className="mt-4">
          <MesTradesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Admin P2P Disputes Tab ───────────────────────────────────────────────────

export function AdminP2PTab() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const { data: disputes = [], isLoading: loadingDisputes } = useQuery<
    P2PTrade[]
  >({
    queryKey: ["adminP2PDisputes"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetP2PDisputes() as Promise<P2PTrade[]>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  const { data: allTrades = [], isLoading: loadingAll } = useQuery<P2PTrade[]>({
    queryKey: ["adminAllP2PTrades"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetAllP2PTrades() as Promise<P2PTrade[]>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  const resolveDispute = useMutation({
    mutationFn: async ({
      tradeId,
      favorBuyer,
    }: {
      tradeId: bigint;
      favorBuyer: boolean;
    }) => {
      if (!actor) throw new Error();
      return (actor as any).resolveP2PDispute(tradeId, favorBuyer) as Promise<{
        success: boolean;
        message: string;
      }>;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Litige P2P résolu.");
        queryClient.invalidateQueries({ queryKey: ["adminP2PDisputes"] });
        queryClient.invalidateQueries({ queryKey: ["adminAllP2PTrades"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erreur lors de la résolution"),
  });

  return (
    <div className="space-y-8">
      {/* Disputes */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3
            className="text-lg font-bold"
            style={{ color: "oklch(0.88 0.06 80)" }}
          >
            Litiges P2P actifs
          </h3>
          {disputes.length > 0 && (
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
              style={{ background: "oklch(0.55 0.18 20)", color: "white" }}
              data-ocid="admin.p2p.panel"
            >
              {disputes.length}
            </span>
          )}
        </div>

        {loadingDisputes ? (
          <div
            className="flex justify-center py-10"
            data-ocid="admin.loading_state"
          >
            <Loader2 className="animate-spin text-teal-400" size={24} />
          </div>
        ) : disputes.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: "oklch(0.16 0.04 220)",
              border: "1px solid oklch(0.25 0.04 220)",
            }}
            data-ocid="admin.p2p.empty_state"
          >
            <p className="text-3xl mb-2">✅</p>
            <p style={{ color: "oklch(0.65 0.04 220)" }}>
              Aucun litige P2P actif
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map((trade, idx) => (
              <div
                key={String(trade.id)}
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "oklch(0.18 0.05 20 / 0.3)",
                  border: "1px solid oklch(0.45 0.12 20 / 0.4)",
                }}
                data-ocid={`admin.p2p.item.${idx + 1}`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: "oklch(0.77 0.13 85)" }}
                    >
                      Trade P2P #{String(trade.id)}
                    </span>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.60 0.04 220)" }}
                    >
                      Vendeur: {trade.sellerId.toString().slice(0, 18)}…
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.60 0.04 220)" }}
                    >
                      Acheteur: {trade.buyerId.toString().slice(0, 18)}…
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-bold"
                      style={{ color: "oklch(0.77 0.13 85)" }}
                    >
                      {trade.amount} {trade.asset}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.60 0.04 220)" }}
                    >
                      {trade.totalPrice.toLocaleString("fr-FR")}{" "}
                      {trade.currency}
                    </p>
                  </div>
                </div>

                {trade.disputeReason.length > 0 && (
                  <div
                    className="rounded-lg p-2 text-xs"
                    style={{
                      background: "oklch(0.14 0.03 220)",
                      color: "oklch(0.65 0.04 220)",
                    }}
                  >
                    <strong style={{ color: "oklch(0.70 0.08 20)" }}>
                      Motif:
                    </strong>{" "}
                    {trade.disputeReason[0]}
                  </div>
                )}

                {trade.proofHash.length > 0 && (
                  <div
                    className="rounded-lg p-2 text-xs font-mono"
                    style={{
                      background: "oklch(0.14 0.03 220)",
                      color: "oklch(0.55 0.04 220)",
                    }}
                  >
                    Preuve: {trade.proofHash[0]}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      resolveDispute.mutate({
                        tradeId: trade.id,
                        favorBuyer: true,
                      })
                    }
                    disabled={resolveDispute.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: "oklch(0.30 0.10 250 / 0.4)",
                      color: "oklch(0.65 0.15 250)",
                      border: "1px solid oklch(0.45 0.12 250 / 0.4)",
                    }}
                    data-ocid={`admin.p2p.confirm_button.${idx + 1}`}
                  >
                    💸 Favoriser acheteur
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      resolveDispute.mutate({
                        tradeId: trade.id,
                        favorBuyer: false,
                      })
                    }
                    disabled={resolveDispute.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: "oklch(0.30 0.10 145 / 0.4)",
                      color: "oklch(0.65 0.15 145)",
                      border: "1px solid oklch(0.45 0.12 145 / 0.4)",
                    }}
                    data-ocid={`admin.p2p.secondary_button.${idx + 1}`}
                  >
                    ✅ Favoriser vendeur
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Trades */}
      <div>
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: "oklch(0.88 0.06 80)" }}
        >
          Tous les Trades P2P
        </h3>
        {loadingAll ? (
          <div
            className="flex justify-center py-10"
            data-ocid="admin.loading_state"
          >
            <Loader2 className="animate-spin text-teal-400" size={24} />
          </div>
        ) : allTrades.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: "oklch(0.16 0.04 220)",
              border: "1px solid oklch(0.25 0.04 220)",
            }}
            data-ocid="admin.p2p.empty_state"
          >
            <p style={{ color: "oklch(0.65 0.04 220)" }}>
              Aucun trade P2P enregistré
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {allTrades.map((trade, idx) => {
              const statusKey = getP2PStatusKey(trade.status);
              const _cfg = STATUS_CONFIG[statusKey];
              return (
                <div
                  key={String(trade.id)}
                  className="rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap"
                  style={{
                    background: "oklch(0.16 0.04 220)",
                    border: "1px solid oklch(0.25 0.04 220)",
                  }}
                  data-ocid={`admin.p2p.row.${idx + 1}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: "oklch(0.77 0.13 85)" }}
                      >
                        #{String(trade.id)}
                      </span>
                      <StatusBadge status={trade.status} />
                    </div>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.55 0.04 220)" }}
                    >
                      {trade.amount} {trade.asset} ·{" "}
                      {trade.totalPrice.toLocaleString("fr-FR")}{" "}
                      {trade.currency} · {trade.paymentMethod}
                    </p>
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "oklch(0.50 0.04 220)" }}
                  >
                    {formatNs(trade.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
