import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Loader2, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function formatAmount(amount: number, asset: string): string {
  if (asset === "BTC" || asset === "ETH") {
    return amount.toFixed(6);
  }
  if (asset === "OKP" || asset === "ICP" || asset === "USDT") {
    return amount.toFixed(2);
  }
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(
    amount,
  );
}

const ASSET_COLORS: Record<string, string> = {
  CDF: "oklch(0.7 0.15 60)", // gold
  USD: "oklch(0.7 0.15 145)", // green
  OKP: "oklch(0.7 0.18 185)", // teal
  BTC: "oklch(0.7 0.18 50)", // orange
  ETH: "oklch(0.65 0.18 280)", // purple
  USDT: "oklch(0.7 0.18 160)", // green
  ICP: "oklch(0.65 0.2 310)", // violet
};

export function TreasuryTab() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [withdrawAsset, setWithdrawAsset] = useState("CDF");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ["treasuryBalance"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTreasuryBalance();
    },
    enabled: !!actor,
    refetchInterval: 30000,
  });

  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ["treasuryLedger"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTreasuryLedger();
    },
    enabled: !!actor,
    refetchInterval: 30000,
  });

  const withdrawMutation = useMutation({
    mutationFn: async ({
      asset,
      amount,
      note,
    }: { asset: string; amount: number; note: string }) => {
      if (!actor) throw new Error("Non connecté");
      return actor.withdrawFromTreasury(asset, amount, note);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["treasuryBalance"] });
        queryClient.invalidateQueries({ queryKey: ["treasuryLedger"] });
        setWithdrawAmount("");
        setWithdrawNote("");
      } else {
        toast.error(result.message);
      }
    },
    onError: () => toast.error("Erreur lors du retrait"),
  });

  const handleWithdraw = () => {
    const amount = Number.parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Montant invalide");
      return;
    }
    if (!withdrawNote.trim()) {
      toast.error("Veuillez ajouter une note de destination");
      return;
    }
    withdrawMutation.mutate({
      asset: withdrawAsset,
      amount,
      note: withdrawNote,
    });
  };

  const balanceEntries = balance
    ? [
        { asset: "CDF", amount: balance.cdf, label: "Franc Congolais" },
        { asset: "USD", amount: balance.usd, label: "Dollar US" },
        { asset: "OKP", amount: balance.okp, label: "Okapi Token" },
        { asset: "BTC", amount: balance.btc, label: "Bitcoin" },
        { asset: "ETH", amount: balance.eth, label: "Ethereum" },
        { asset: "USDT", amount: balance.usdt, label: "Tether" },
        { asset: "ICP", amount: balance.icp, label: "Internet Computer" },
      ]
    : [];

  return (
    <div className="space-y-6" data-ocid="admin.treasury">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ background: "oklch(0.2 0.06 185)" }}
        >
          <Wallet size={20} style={{ color: "oklch(0.7 0.18 185)" }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            Trésorerie de la Plateforme
          </h2>
          <p className="text-white/50 text-sm">
            Frais collectés sur les transactions de trading (1%)
          </p>
        </div>
      </div>

      {/* ── Soldes par actif ── */}
      {balanceLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-teal-400" size={28} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {balanceEntries.map(({ asset, amount, label }) => (
            <Card
              key={asset}
              style={{
                background: "oklch(0.15 0.03 220)",
                border: `1px solid ${ASSET_COLORS[asset] ?? "oklch(0.25 0.04 220)"}33`,
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50 uppercase tracking-wide">
                    {asset}
                  </span>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: `${ASSET_COLORS[asset] ?? "oklch(0.7 0.18 185)"}22`,
                      color: ASSET_COLORS[asset] ?? "oklch(0.7 0.18 185)",
                    }}
                  >
                    {label}
                  </span>
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{
                    color: ASSET_COLORS[asset] ?? "oklch(0.7 0.18 185)",
                  }}
                >
                  {formatAmount(amount, asset)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Retrait ── */}
      <Card
        style={{
          background: "oklch(0.15 0.03 220)",
          border: "1px solid oklch(0.25 0.04 220)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ArrowUpRight size={18} style={{ color: "oklch(0.7 0.15 60)" }} />
            Retrait de Trésorerie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Actif</Label>
              <Select value={withdrawAsset} onValueChange={setWithdrawAsset}>
                <SelectTrigger
                  style={{
                    background: "oklch(0.12 0.02 220)",
                    border: "1px solid oklch(0.3 0.05 220)",
                    color: "white",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["CDF", "USD", "OKP", "BTC", "ETH", "USDT", "ICP"].map(
                    (a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Montant</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                style={{
                  background: "oklch(0.12 0.02 220)",
                  border: "1px solid oklch(0.3 0.05 220)",
                  color: "white",
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Note de destination</Label>
              <Input
                placeholder="Ex: Frais opérationnels mars 2026"
                value={withdrawNote}
                onChange={(e) => setWithdrawNote(e.target.value)}
                style={{
                  background: "oklch(0.12 0.02 220)",
                  border: "1px solid oklch(0.3 0.05 220)",
                  color: "white",
                }}
              />
            </div>
          </div>
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              background: "oklch(0.18 0.06 50)",
              border: "1px solid oklch(0.35 0.12 50)",
            }}
          >
            <span style={{ color: "oklch(0.8 0.15 50)" }}>⚠️ Attention :</span>
            <span className="text-white/70 ml-2">
              Les retraits sont enregistrés on-chain et traçables. Toute action
              est visible dans l'historique ci-dessous.
            </span>
          </div>
          <Button
            onClick={handleWithdraw}
            disabled={withdrawMutation.isPending}
            className="w-full md:w-auto"
            style={{
              background: "oklch(0.55 0.18 185)",
              color: "white",
            }}
          >
            {withdrawMutation.isPending ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <ArrowUpRight size={16} className="mr-2" />
            )}
            Confirmer le Retrait
          </Button>
        </CardContent>
      </Card>

      {/* ── Historique ── */}
      <Card
        style={{
          background: "oklch(0.15 0.03 220)",
          border: "1px solid oklch(0.25 0.04 220)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ArrowDownLeft size={18} style={{ color: "oklch(0.7 0.18 185)" }} />
            Historique Trésorerie
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ledgerLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-teal-400" size={24} />
            </div>
          ) : !ledger || ledger.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <Wallet size={32} className="mx-auto mb-3 opacity-40" />
              <p>Aucune entrée pour l'instant.</p>
              <p className="text-sm mt-1">
                Les frais de trading apparaîtront ici après les premières
                transactions.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader style={{ background: "oklch(0.12 0.02 220)" }}>
                <TableRow style={{ borderColor: "oklch(0.25 0.04 220)" }}>
                  <TableHead className="text-white/60">#</TableHead>
                  <TableHead className="text-white/60">Type</TableHead>
                  <TableHead className="text-white/60">Actif</TableHead>
                  <TableHead className="text-white/60 text-right">
                    Montant
                  </TableHead>
                  <TableHead className="text-white/60">Note</TableHead>
                  <TableHead className="text-white/60">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((entry) => (
                  <TableRow
                    key={String(entry.id)}
                    style={{ borderColor: "oklch(0.2 0.03 220)" }}
                  >
                    <TableCell className="text-white/40 text-sm">
                      #{String(entry.id)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          background:
                            entry.entryType === "fee"
                              ? "oklch(0.25 0.12 145)"
                              : "oklch(0.25 0.12 50)",
                          color:
                            entry.entryType === "fee"
                              ? "oklch(0.75 0.18 145)"
                              : "oklch(0.75 0.15 50)",
                          border: "none",
                        }}
                      >
                        {entry.entryType === "fee" ? (
                          <>
                            <ArrowDownLeft size={11} className="mr-1" />
                            Frais
                          </>
                        ) : (
                          <>
                            <ArrowUpRight size={11} className="mr-1" />
                            Retrait
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className="font-bold text-sm"
                        style={{
                          color:
                            ASSET_COLORS[entry.asset] ?? "oklch(0.7 0.18 185)",
                        }}
                      >
                        {entry.asset}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-white">
                      {entry.entryType === "withdrawal" ? "-" : "+"}
                      {formatAmount(entry.amount, entry.asset)}
                    </TableCell>
                    <TableCell className="text-white/60 text-sm max-w-[200px] truncate">
                      {entry.note}
                    </TableCell>
                    <TableCell className="text-white/50 text-sm">
                      {formatDate(entry.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
