import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useMyExternalTransfers,
  useNetworkFees,
  useSubmitExternalTransfer,
} from "../hooks/useQueries";

const NETWORKS = [
  {
    id: "TRC20",
    label: "TRC20 (Tron)",
    recommended: true,
    desc: "Réseau Tron — Frais très bas",
  },
  {
    id: "BEP20",
    label: "BEP20 (BSC)",
    recommended: false,
    desc: "Réseau BNB Smart Chain",
  },
  {
    id: "ERC20",
    label: "ERC20 (Ethereum)",
    recommended: false,
    desc: "Réseau Ethereum — Frais élevés",
  },
];

const ASSETS = ["USDT", "BTC", "ETH", "ICP"];

function truncateAddr(addr: string): string {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

function statusBadge(status: string) {
  if (status === "confirmed")
    return (
      <Badge
        className="text-xs"
        style={{
          background: "oklch(0.52 0.12 160 / 0.2)",
          color: "oklch(0.52 0.12 160)",
          border: "1px solid oklch(0.52 0.12 160 / 0.4)",
        }}
      >
        Confirmé
      </Badge>
    );
  if (status === "failed")
    return (
      <Badge
        className="text-xs"
        style={{
          background: "oklch(0.55 0.22 27 / 0.2)",
          color: "oklch(0.75 0.18 27)",
          border: "1px solid oklch(0.55 0.22 27 / 0.4)",
        }}
      >
        Échoué
      </Badge>
    );
  return (
    <Badge
      className="text-xs"
      style={{
        background: "oklch(0.77 0.13 85 / 0.2)",
        color: "oklch(0.77 0.13 85)",
        border: "1px solid oklch(0.77 0.13 85 / 0.4)",
      }}
    >
      En attente
    </Badge>
  );
}

function networkBadge(network: string) {
  const colors: Record<string, string> = {
    TRC20: "oklch(0.52 0.12 160)",
    BEP20: "oklch(0.77 0.13 85)",
    ERC20: "oklch(0.55 0.20 270)",
  };
  const color = colors[network] ?? "oklch(0.6 0.1 220)";
  return (
    <Badge
      className="text-xs"
      style={{
        background: `${color}33`,
        color,
        border: `1px solid ${color}66`,
      }}
    >
      {network}
    </Badge>
  );
}

interface TransferFormProps {
  onClose: () => void;
}

function TransferForm({ onClose }: TransferFormProps) {
  const [network, setNetwork] = useState("TRC20");
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: feesRaw = [] } = useNetworkFees();
  const submitMutation = useSubmitExternalTransfer();

  const feesMap = Object.fromEntries(feesRaw as Array<[string, number]>);
  const currentFee =
    feesMap[network] ?? (network === "TRC20" ? 1 : network === "BEP20" ? 2 : 5);

  const handleSubmit = async () => {
    if (!amount || !toAddress) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    try {
      await submitMutation.mutateAsync({
        asset,
        amount: Number.parseFloat(amount),
        toAddress,
        network,
      });
      setSubmitted(true);
      toast.success("Transfert soumis avec succès");
    } catch {
      toast.error("Erreur lors du transfert");
    }
  };

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center gap-4 py-6"
        data-ocid="transfer.success_state"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.52 0.12 160 / 0.15)" }}
        >
          <CheckCircle size={32} style={{ color: "oklch(0.52 0.12 160)" }} />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-lg text-white">Transfert soumis</h3>
          <p className="text-sm mt-1" style={{ color: "oklch(0.65 0.03 220)" }}>
            Statut :{" "}
            <strong style={{ color: "oklch(0.77 0.13 85)" }}>
              En attente de confirmation
            </strong>
          </p>
          <p className="text-xs mt-2" style={{ color: "oklch(0.55 0.03 220)" }}>
            Le réseau {network} traitera votre transaction prochainement.
          </p>
        </div>
        <Button
          onClick={onClose}
          style={{ background: "oklch(0.52 0.12 160)", color: "white" }}
          data-ocid="transfer.close_button"
        >
          Fermer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Network selector */}
      <div className="space-y-2">
        <Label className="text-white/70 text-sm">Réseau de transfert</Label>
        <div className="grid grid-cols-3 gap-2">
          {NETWORKS.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setNetwork(n.id)}
              data-ocid={`transfer.${n.id.toLowerCase()}.toggle`}
              className="rounded-xl p-3 text-left transition-all"
              style={{
                background:
                  network === n.id
                    ? "oklch(0.52 0.12 160 / 0.15)"
                    : "oklch(0.12 0.02 220)",
                border:
                  network === n.id
                    ? "1px solid oklch(0.52 0.12 160)"
                    : "1px solid oklch(0.25 0.04 220)",
              }}
            >
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-sm font-semibold text-white">{n.id}</span>
                {n.recommended && (
                  <Badge
                    className="text-[10px] px-1 py-0"
                    style={{
                      background: "oklch(0.77 0.13 85 / 0.2)",
                      color: "oklch(0.77 0.13 85)",
                      border: "1px solid oklch(0.77 0.13 85 / 0.4)",
                    }}
                  >
                    Recommandé
                  </Badge>
                )}
              </div>
              <p
                className="text-xs mt-0.5"
                style={{ color: "oklch(0.55 0.03 220)" }}
              >
                {n.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Warning banner */}
      <div
        className="rounded-xl p-3 flex items-start gap-2"
        style={{
          background: "oklch(0.55 0.22 27 / 0.12)",
          border: "1px solid oklch(0.55 0.22 27 / 0.5)",
        }}
        data-ocid="transfer.error_state"
      >
        <AlertTriangle
          size={16}
          className="shrink-0 mt-0.5"
          style={{ color: "oklch(0.75 0.18 27)" }}
        />
        <p className="text-xs" style={{ color: "oklch(0.80 0.08 40)" }}>
          <strong>Attention :</strong> Envoyer uniquement via le réseau{" "}
          <strong>{network}</strong>, sinon les fonds peuvent être perdus.
        </p>
      </div>

      {/* Network fee info */}
      <div
        className="rounded-lg px-3 py-2 text-xs"
        style={{
          background: "oklch(0.52 0.12 160 / 0.08)",
          border: "1px solid oklch(0.52 0.12 160 / 0.3)",
          color: "oklch(0.75 0.08 160)",
        }}
      >
        Frais réseau ({network}) : <strong>{currentFee} USDT</strong>
      </div>

      {/* Asset */}
      <div className="space-y-1.5">
        <Label className="text-white/70 text-sm">Actif</Label>
        <Select value={asset} onValueChange={setAsset}>
          <SelectTrigger
            className="text-sm"
            style={{
              background: "oklch(0.12 0.02 220)",
              border: "1px solid oklch(0.25 0.04 220)",
              color: "white",
            }}
            data-ocid="transfer.select"
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

      {/* Amount */}
      <div className="space-y-1.5">
        <Label className="text-white/70 text-sm">Montant</Label>
        <Input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-sm"
          style={{
            background: "oklch(0.12 0.02 220)",
            border: "1px solid oklch(0.25 0.04 220)",
            color: "white",
          }}
          data-ocid="transfer.input"
        />
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label className="text-white/70 text-sm">Adresse de destination</Label>
        <Input
          type="text"
          placeholder={
            network === "TRC20"
              ? "T..."
              : network === "BEP20"
                ? "0x..."
                : "0x..."
          }
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          className="text-sm font-mono"
          style={{
            background: "oklch(0.12 0.02 220)",
            border: "1px solid oklch(0.25 0.04 220)",
            color: "white",
          }}
          data-ocid="transfer.textarea"
        />
      </div>

      {/* Submit */}
      <Button
        className="w-full font-semibold"
        onClick={handleSubmit}
        disabled={submitMutation.isPending || !amount || !toAddress}
        style={{ background: "oklch(0.52 0.12 160)", color: "white" }}
        data-ocid="transfer.submit_button"
      >
        {submitMutation.isPending ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : (
          <ArrowUpRight size={16} className="mr-2" />
        )}
        Envoyer via {network}
      </Button>
    </div>
  );
}

export interface ExternalTransferTriggerProps {
  children: React.ReactNode;
}

export function ExternalTransferTrigger({
  children,
}: ExternalTransferTriggerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-w-md"
        style={{
          background: "oklch(0.13 0.025 220)",
          border: "1px solid oklch(0.25 0.04 220)",
          color: "white",
        }}
        data-ocid="transfer.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <ArrowUpRight size={18} style={{ color: "oklch(0.52 0.12 160)" }} />
            Transfert Externe
          </DialogTitle>
        </DialogHeader>
        <TransferForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export interface ExternalTransferHistoryProps {
  compact?: boolean;
}

export function ExternalTransferHistory({
  compact,
}: ExternalTransferHistoryProps) {
  const { data: transfers = [], isLoading } = useMyExternalTransfers();

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-4"
        data-ocid="transfer.loading_state"
      >
        <Loader2
          className="animate-spin"
          size={20}
          style={{ color: "oklch(0.52 0.12 160)" }}
        />
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div
        className="text-center py-6 text-sm"
        style={{ color: "oklch(0.50 0.03 220)" }}
        data-ocid="transfer.empty_state"
      >
        Aucun transfert externe pour l'instant.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transfers.slice(0, compact ? 5 : undefined).map((t, i) => (
        <div
          key={t.id.toString()}
          className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
          style={{
            background: "oklch(0.12 0.02 220)",
            border: "1px solid oklch(0.20 0.03 220)",
          }}
          data-ocid={`transfer.item.${i + 1}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {networkBadge(t.network)}
            <span className="text-white font-semibold text-sm">
              {t.amount} {t.asset}
            </span>
            <span
              className="text-xs font-mono truncate"
              style={{ color: "oklch(0.50 0.03 220)" }}
            >
              → {truncateAddr(t.toAddress)}
            </span>
          </div>
          <div className="shrink-0">{statusBadge(t.status)}</div>
        </div>
      ))}
    </div>
  );
}

export default function ExternalTransferModal() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2"
          style={{ background: "oklch(0.52 0.12 160)", color: "white" }}
          data-ocid="transfer.open_modal_button"
        >
          <ArrowUpRight size={16} />
          Envoyer vers une adresse externe
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-md"
        style={{
          background: "oklch(0.13 0.025 220)",
          border: "1px solid oklch(0.25 0.04 220)",
          color: "white",
        }}
        data-ocid="transfer.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <ArrowUpRight size={18} style={{ color: "oklch(0.52 0.12 160)" }} />
            Transfert Externe
          </DialogTitle>
        </DialogHeader>
        <TransferForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
