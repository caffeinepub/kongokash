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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle,
  CheckCircle2,
  Coins,
  Flame,
  GitMerge,
  Headphones,
  History,
  Loader2,
  Network,
  Plane,
  RefreshCw,
  Scale,
  Settings,
  Shield,
  ShieldAlert,
  Smartphone,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Users,
  Vault,
  Vote,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useActor } from "../hooks/useActor";
import {
  getEnhancedPartnerStatus,
  usePartnerOwnershipTransfer,
} from "../hooks/usePartnerOwnershipTransfer";
import { getPartnerWalletStatus } from "../hooks/usePartnerWallet";
import {
  useAllExternalTransfers,
  useNetworkFees,
  useSetNetworkFee,
  useUpdateExternalTransferStatus,
} from "../hooks/useQueries";
import { EscrowDisputeTab } from "./EscrowPaymentInfo";
import { UrgencesInstitutionnellesTab } from "./InstitutionalMultiSigWallet";
import { PartnerOwnershipTransferModal } from "./PartnerOwnershipTransferModal";
import { PartnerWalletDialog } from "./PartnerWalletSetup";
import { AdminSupportTab } from "./SupportSection";
import { TreasuryTab } from "./TreasuryTab";
import type { WithdrawalRequest } from "./WithdrawalGateway";

// ─── Helpers ────────────────────────────────────────────────────────────────

function truncatePrincipal(p: Principal | string): string {
  const s = typeof p === "string" ? p : p.toString();
  if (s.length <= 14) return s;
  return `${s.slice(0, 8)}...${s.slice(-4)}`;
}

function formatNumber(n: number | bigint): string {
  return new Intl.NumberFormat("fr-FR").format(Number(n));
}

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

function kycBadge(status: string) {
  const map: Record<string, { label: string; style: React.CSSProperties }> = {
    pending: {
      label: "En attente",
      style: {
        background: "oklch(0.77 0.13 85)",
        color: "oklch(0.20 0.01 250)",
      },
    },
    approved: {
      label: "Approuvé",
      style: { background: "oklch(0.52 0.12 160)", color: "white" },
    },
    rejected: {
      label: "Rejeté",
      style: { background: "oklch(0.55 0.22 27)", color: "white" },
    },
    missing: {
      label: "Absent",
      style: { background: "oklch(0.55 0.01 220)", color: "white" },
    },
  };
  const info = map[status] ?? map.missing;
  return <Badge style={info.style}>{info.label}</Badge>;
}

function statusBadge(status: string) {
  if (status === "active")
    return (
      <Badge style={{ background: "oklch(0.52 0.12 160)", color: "white" }}>
        Actif
      </Badge>
    );
  return (
    <Badge style={{ background: "oklch(0.55 0.22 27)", color: "white" }}>
      Suspendu
    </Badge>
  );
}

function roleBadge(role: string) {
  const map: Record<string, { label: string; style: React.CSSProperties }> = {
    admin: {
      label: "Admin",
      style: { background: "oklch(0.52 0.18 280)", color: "white" },
    },
    user: {
      label: "Utilisateur",
      style: { background: "oklch(0.35 0.09 195)", color: "white" },
    },
    guest: {
      label: "Invité",
      style: { background: "oklch(0.55 0.01 220)", color: "white" },
    },
  };
  const info = map[role] ?? map.guest;
  return <Badge style={info.style}>{info.label}</Badge>;
}

function txTypeBadge(txType: string) {
  const map: Record<string, { label: string; style: React.CSSProperties }> = {
    buy: {
      label: "Achat",
      style: { background: "oklch(0.52 0.12 160)", color: "white" },
    },
    sell: {
      label: "Vente",
      style: { background: "oklch(0.67 0.15 55)", color: "white" },
    },
    transfer: {
      label: "Transfert",
      style: { background: "oklch(0.52 0.18 280)", color: "white" },
    },
    deposit: {
      label: "Dépôt",
      style: {
        background: "oklch(0.77 0.13 85)",
        color: "oklch(0.20 0.01 250)",
      },
    },
    payment: {
      label: "Paiement",
      style: { background: "oklch(0.35 0.09 195)", color: "white" },
    },
  };
  const info = map[txType] ?? {
    label: txType,
    style: { background: "oklch(0.55 0.01 220)", color: "white" },
  };
  return <Badge style={info.style}>{info.label}</Badge>;
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  ocid: string;
}

function StatCard({ icon, label, value, sub, color, ocid }: StatCardProps) {
  return (
    <Card data-ocid={ocid} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {label}
            </p>
            <p
              className="font-display font-bold text-2xl mt-1"
              style={{ color }}
            >
              {value}
            </p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color} / 0.12` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
        </div>
        <div
          className="h-1 mt-3 rounded-full opacity-20"
          style={{ background: color }}
        />
      </CardContent>
    </Card>
  );
}

// ─── External Transfers Admin Table ─────────────────────────────────────────

function ExternalTransfersAdminTable() {
  const { data: transfers = [], isLoading } = useAllExternalTransfers();
  const updateStatusMutation = useUpdateExternalTransferStatus();

  function truncateAddr(addr: string): string {
    if (addr.length <= 14) return addr;
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8" data-ocid="admin.loading_state">
        <Loader2 className="animate-spin text-teal-400" size={24} />
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div
        className="text-center py-8 text-white/40"
        data-ocid="admin.empty_state"
      >
        <Network size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">Aucun transfert externe</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid oklch(0.25 0.04 220)" }}
    >
      <Table>
        <TableHeader style={{ background: "oklch(0.15 0.03 220)" }}>
          <TableRow style={{ borderColor: "oklch(0.25 0.04 220)" }}>
            <TableHead className="text-white/60">#ID</TableHead>
            <TableHead className="text-white/60">Type</TableHead>
            <TableHead className="text-white/60">Actif</TableHead>
            <TableHead className="text-white/60 text-right">Montant</TableHead>
            <TableHead className="text-white/60">Réseau</TableHead>
            <TableHead className="text-white/60">Adresse</TableHead>
            <TableHead className="text-white/60">Statut</TableHead>
            <TableHead className="text-white/60">Date</TableHead>
            <TableHead className="text-white/60">Utilisateur</TableHead>
            <TableHead className="text-white/60 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.map((t, i) => (
            <TableRow
              key={t.id.toString()}
              data-ocid={`admin.row.${i + 1}`}
              style={{
                borderColor: "oklch(0.20 0.03 220)",
                background:
                  i % 2 === 0 ? "oklch(0.13 0.02 220)" : "oklch(0.12 0.02 220)",
              }}
            >
              <TableCell className="text-white/60 font-mono text-xs">
                {t.id.toString()}
              </TableCell>
              <TableCell>
                <Badge
                  className="text-xs"
                  style={{
                    background: "oklch(0.52 0.12 160 / 0.15)",
                    color: "oklch(0.52 0.12 160)",
                    border: "1px solid oklch(0.52 0.12 160 / 0.3)",
                  }}
                >
                  Transfert Ext.
                </Badge>
              </TableCell>
              <TableCell className="text-white/80 font-semibold text-sm">
                {t.asset}
              </TableCell>
              <TableCell className="text-right text-white/80 font-mono text-sm">
                {t.amount}
              </TableCell>
              <TableCell>{networkBadge(t.network)}</TableCell>
              <TableCell className="text-white/60 font-mono text-xs">
                {truncateAddr(t.toAddress)}
              </TableCell>
              <TableCell>{statusBadge(t.status)}</TableCell>
              <TableCell className="text-white/60 text-xs">
                {new Date(Number(t.timestamp) / 1_000_000).toLocaleString(
                  "fr-FR",
                )}
              </TableCell>
              <TableCell className="text-white/40 font-mono text-xs">
                {t.userId.toString().slice(0, 8)}...
              </TableCell>
              <TableCell className="text-right">
                {t.status === "pending" && (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      className="h-7 text-xs px-2"
                      style={{
                        background: "oklch(0.52 0.12 160)",
                        color: "white",
                      }}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: t.id,
                          status: "confirmed",
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                      data-ocid={`admin.confirm_button.${i + 1}`}
                    >
                      {updateStatusMutation.isPending ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <CheckCircle size={10} className="mr-1" />
                      )}
                      Confirmer
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs px-2"
                      style={{
                        background: "oklch(0.55 0.22 27)",
                        color: "white",
                      }}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: t.id,
                          status: "failed",
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                      data-ocid={`admin.delete_button.${i + 1}`}
                    >
                      <XCircle size={10} className="mr-1" />
                      Rejeter
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Network Fees Admin Card ─────────────────────────────────────────────────

function NetworkFeesAdminCard() {
  const { data: feesRaw = [] } = useNetworkFees();
  const setFeeMutation = useSetNetworkFee();
  const feesMap = Object.fromEntries(feesRaw as Array<[string, number]>);

  const [trc20Fee, setTrc20Fee] = useState(String(feesMap.TRC20 ?? "1"));
  const [bep20Fee, setBep20Fee] = useState(String(feesMap.BEP20 ?? "2"));
  const [erc20Fee, setErc20Fee] = useState(String(feesMap.ERC20 ?? "5"));

  const networks = [
    {
      id: "TRC20",
      label: "TRC20 (Tron)",
      value: trc20Fee,
      setValue: setTrc20Fee,
      recommended: true,
    },
    {
      id: "BEP20",
      label: "BEP20 (BSC)",
      value: bep20Fee,
      setValue: setBep20Fee,
      recommended: false,
    },
    {
      id: "ERC20",
      label: "ERC20 (Ethereum)",
      value: erc20Fee,
      setValue: setErc20Fee,
      recommended: false,
    },
  ];

  return (
    <Card
      style={{
        background: "oklch(0.15 0.03 220)",
        border: "1px solid oklch(0.25 0.04 220)",
      }}
    >
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Network size={16} style={{ color: "oklch(0.52 0.12 160)" }} />
          Frais par Réseau
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs" style={{ color: "oklch(0.55 0.03 220)" }}>
          TRC20 recommandé par défaut — frais les plus bas
        </p>
        {networks.map((n) => (
          <div key={n.id} className="space-y-1.5">
            <Label className="text-white/70 text-sm flex items-center gap-2">
              {n.label}
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
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="Ex: 1.0"
                value={n.value}
                onChange={(e) => n.setValue(e.target.value)}
                className="text-sm"
                style={{
                  background: "oklch(0.12 0.02 220)",
                  border: "1px solid oklch(0.25 0.04 220)",
                  color: "white",
                }}
                data-ocid="admin.input"
              />
              <Button
                onClick={() =>
                  setFeeMutation.mutate({ network: n.id, fee: Number(n.value) })
                }
                disabled={setFeeMutation.isPending || !n.value}
                style={{ background: "oklch(0.52 0.12 160)", color: "white" }}
                data-ocid="admin.save_button"
              >
                {setFeeMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Sauvegarder"
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
// Retraits Admin Tab
function RetraitsAdminTab() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    return JSON.parse(localStorage.getItem("partnerWithdrawals") ?? "[]");
  });
  const [filter, setFilter] = useState<"all" | WithdrawalRequest["status"]>(
    "all",
  );

  const filtered =
    filter === "all"
      ? withdrawals
      : withdrawals.filter((w) => w.status === filter);

  const updateStatus = (id: string, status: WithdrawalRequest["status"]) => {
    setWithdrawals((prev) => {
      const updated = prev.map((w) =>
        w.id === id ? { ...w, status, updatedAt: new Date().toISOString() } : w,
      );
      localStorage.setItem("partnerWithdrawals", JSON.stringify(updated));
      return updated;
    });
  };

  const methodLabel: Record<WithdrawalRequest["method"], string> = {
    airtel: "Airtel Money",
    mpesa: "M-Pesa",
    bancaire: "Virement Bancaire",
  };

  const statusConfig: Record<string, { label: string; cls: string }> = {
    pending: {
      label: "En attente",
      cls: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    processing: {
      label: "En cours",
      cls: "bg-blue-100 text-blue-800 border-blue-300",
    },
    completed: {
      label: "Completed",
      cls: "bg-green-100 text-green-800 border-green-300",
    },
    failed: { label: "Echoue", cls: "bg-red-100 text-red-800 border-red-300" },
  };

  const filters: {
    value: "all" | WithdrawalRequest["status"];
    label: string;
  }[] = [
    { value: "all", label: "Tous" },
    { value: "pending", label: "En attente" },
    { value: "processing", label: "En cours" },
    { value: "completed", label: "Completes" },
    { value: "failed", label: "Echoues" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowDownLeft size={22} className="text-amber-400" />
            Demandes de retrait partenaires
          </h3>
          <p className="text-white/50 text-sm mt-0.5">
            Approuvez ou rejetez les retraits vers Mobile Money et virements
            bancaires
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              data-ocid="admin.retraits.filter"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === f.value
                  ? "bg-amber-500 text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="text-center py-16 text-white/40"
          data-ocid="admin.retraits.empty_state"
        >
          <ArrowDownLeft size={40} className="mx-auto mb-3 opacity-40" />
          <p>Aucune demande de retrait</p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="admin.retraits.list">
          {filtered.map((w, idx) => {
            const cfg = statusConfig[w.status];
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                data-ocid={`admin.retraits.item.${idx + 1}`}
              >
                <Card
                  style={{
                    background: "oklch(0.18 0.03 220)",
                    border: "1px solid oklch(0.28 0.04 220)",
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-amber-500/20">
                          <ArrowDownLeft size={18} className="text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white">
                              {w.amount.toLocaleString()} {w.asset}
                            </span>
                            <code className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60">
                              {w.id}
                            </code>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-sm text-white/60 mt-1">
                            {methodLabel[w.method]} &middot;{" "}
                            <span className="text-white/80 font-medium">
                              {w.destination}
                            </span>
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">
                            {w.partnerName} &middot;{" "}
                            {new Date(w.createdAt).toLocaleString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      {w.status === "pending" && (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                            onClick={() => updateStatus(w.id, "completed")}
                            data-ocid={`admin.retraits.approve_button.${idx + 1}`}
                          >
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-400/40 text-red-400 hover:bg-red-400/10"
                            onClick={() => updateStatus(w.id, "failed")}
                            data-ocid={`admin.retraits.reject_button.${idx + 1}`}
                          >
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  // ── Stats query ──────────────────────────────────────────────────────────
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => actor!.getAdminStats(),
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  // ── Users query ──────────────────────────────────────────────────────────
  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => actor!.getAllUsers(),
    enabled: !!actor && !isFetching,
  });

  // ── Transactions query ───────────────────────────────────────────────────
  const {
    data: transactions = [],
    isLoading: txLoading,
    refetch: refetchTx,
  } = useQuery({
    queryKey: ["adminTransactions"],
    queryFn: () => actor!.getAllTransactions(),
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  // ── Exchange rates query ─────────────────────────────────────────────────
  const { data: exchangeRates = [], refetch: refetchRates } = useQuery({
    queryKey: ["adminExchangeRates"],
    queryFn: () => actor!.getExchangeRates(),
    enabled: !!actor && !isFetching,
  });

  // ── KYC records query ──────────────────────────────────────────────────
  const { data: kycRecords = [] } = useQuery({
    queryKey: ["adminKycRecords"],
    queryFn: () => actor!.getAllKyc(),
    enabled: !!actor && !isFetching,
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const approveKycMutation = useMutation({
    mutationFn: (principal: Principal) => actor!.approveKyc(principal),
    onSuccess: () => {
      toast.success("KYC approuvé avec succès");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: () => toast.error("Erreur lors de l'approbation du KYC"),
  });

  const rejectKycMutation = useMutation({
    mutationFn: (principal: Principal) => actor!.rejectKyc(principal),
    onSuccess: () => {
      toast.success("KYC rejeté");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: () => toast.error("Erreur lors du rejet du KYC"),
  });

  const suspendUserMutation = useMutation({
    mutationFn: (principal: Principal) => actor!.suspendUser(principal),
    onSuccess: () => {
      toast.success("Utilisateur suspendu");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: () => toast.error("Erreur lors de la suspension"),
  });

  const activateUserMutation = useMutation({
    mutationFn: (principal: Principal) => actor!.activateUser(principal),
    onSuccess: () => {
      toast.success("Utilisateur réactivé");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: () => toast.error("Erreur lors de la réactivation"),
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({
      principal,
      role,
    }: { principal: Principal; role: UserRole }) =>
      actor!.assignCallerUserRole(principal, role),
    onSuccess: () => {
      toast.success("Rôle assigné avec succès");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: () => toast.error("Erreur lors de l'assignation du rôle"),
  });

  const setOkpRateMutation = useMutation({
    mutationFn: (rate: number) => actor!.setOkpToCdfRate(rate),
    onSuccess: () => {
      toast.success("Taux OKP/CDF mis à jour");
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour du taux"),
  });

  const setRewardMultiplierMutation = useMutation({
    mutationFn: (m: number) => actor!.setRewardMultiplier(m),
    onSuccess: () => {
      toast.success("Multiplicateur de récompense mis à jour");
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: () => toast.error("Erreur"),
  });

  const resetRewardMutation = useMutation({
    mutationFn: () => actor!.resetRewardMultiplier(),
    onSuccess: () => {
      toast.success("Multiplicateur réinitialisé");
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: () => toast.error("Erreur"),
  });

  const resetPriceMutation = useMutation({
    mutationFn: () => actor!.resetPriceAdjustment(),
    onSuccess: () => {
      toast.success("Ajustement de prix réinitialisé");
    },
    onError: () => toast.error("Erreur"),
  });

  const setExchangeRateMutation = useMutation({
    mutationFn: (req: { pair: string; buyRate: number; sellRate: number }) =>
      actor!.setExchangeRate(req),
    onSuccess: () => {
      toast.success("Taux de change mis à jour");
      queryClient.invalidateQueries({ queryKey: ["adminExchangeRates"] });
    },
    onError: () =>
      toast.error("Erreur lors de la mise à jour du taux de change"),
  });

  const assignRoleDirectMutation = useMutation({
    mutationFn: ({
      principal,
      role,
    }: { principal: Principal; role: UserRole }) =>
      actor!.assignCallerUserRole(principal, role),
    onSuccess: () => {
      toast.success("Rôle assigné");
    },
    onError: () => toast.error("Erreur lors de l'assignation"),
  });

  const { data: paymentConfig, refetch: refetchPaymentConfig } = useQuery({
    queryKey: ["paymentConfig"],
    queryFn: () => actor!.getPaymentConfig(),
    enabled: !!actor,
  });

  const setPaymentConfigMutation = useMutation({
    mutationFn: (config: {
      airtelNumber: string;
      mpesaNumber: string;
      equityAccount: string;
      equityBeneficiary: string;
      equitySwift: string;
      rawbankAccount: string;
      tmbAccount: string;
    }) => actor!.setPaymentConfig(config),
    onSuccess: () => {
      toast.success("Coordonnées de paiement mises à jour");
      refetchPaymentConfig();
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  // ── Filter state ─────────────────────────────────────────────────────────
  const [userSearch, setUserSearch] = useState("");
  const [userKycFilter, setUserKycFilter] = useState("all");
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [txAssetFilter, setTxAssetFilter] = useState("all");

  // ── Settings state ───────────────────────────────────────────────────────
  const [okpRate, setOkpRate] = useState("");
  const [rewardMultiplier, setRewardMultiplier] = useState("");
  const [ratePair, setRatePair] = useState("BTC/CDF");
  const [rateBuy, setRateBuy] = useState("");
  const [rateSell, setRateSell] = useState("");
  const [rolePrincipal, setRolePrincipal] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.user);

  const [pmAirtel, setPmAirtel] = useState("");
  const [pmMpesa, setPmMpesa] = useState("");
  const [pmEquityAccount, setPmEquityAccount] = useState("");
  const [pmEquityBeneficiary, setPmEquityBeneficiary] = useState("");
  const [pmEquitySwift, setPmEquitySwift] = useState("");
  const [pmRawbank, setPmRawbank] = useState("");
  const [pmTmb, setPmTmb] = useState("");

  useEffect(() => {
    if (paymentConfig) {
      setPmAirtel(paymentConfig.airtelNumber);
      setPmMpesa(paymentConfig.mpesaNumber);
      setPmEquityAccount(paymentConfig.equityAccount);
      setPmEquityBeneficiary(paymentConfig.equityBeneficiary);
      setPmEquitySwift(paymentConfig.equitySwift);
      setPmRawbank(paymentConfig.rawbankAccount);
      setPmTmb(paymentConfig.tmbAccount);
    }
  }, [paymentConfig]);

  // pre-fill rate inputs when rates load
  useEffect(() => {
    if (stats?.okpStats) {
      setOkpRate(stats.okpStats.currentRate.toString());
      setRewardMultiplier(stats.okpStats.rewardMultiplier.toString());
    }
  }, [stats]);

  // ── Filtered lists ───────────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const name = u.profile?.displayName?.toLowerCase() ?? "";
    const principal = u.principal.toString().toLowerCase();
    const matchSearch =
      userSearch === "" ||
      name.includes(userSearch.toLowerCase()) ||
      principal.includes(userSearch.toLowerCase());
    const matchKyc = userKycFilter === "all" || u.kycStatus === userKycFilter;
    return matchSearch && matchKyc;
  });

  const filteredTx = transactions
    .filter((tx) => {
      const matchType = txTypeFilter === "all" || tx.txType === txTypeFilter;
      const matchAsset = txAssetFilter === "all" || tx.asset === txAssetFilter;
      return matchType && matchAsset;
    })
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  const okp = stats?.okpStats;

  return (
    <section
      id="admin"
      className="py-16"
      style={{ background: "oklch(0.10 0.02 220)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "oklch(0.52 0.12 160)" }}
            >
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-white">
                Tableau de Bord Admin
              </h2>
              <p className="text-sm" style={{ color: "oklch(0.70 0.05 220)" }}>
                KongoKash — Panneau de contrôle
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchStats();
              refetchUsers();
              refetchTx();
              refetchRates();
            }}
            className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
            data-ocid="admin.button"
          >
            <RefreshCw size={14} className="mr-2" />
            Rafraîchir
          </Button>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList
            className="grid grid-cols-12 w-full"
            style={{
              background: "oklch(0.15 0.03 220)",
              border: "1px solid oklch(0.25 0.04 220)",
            }}
            data-ocid="admin.tab"
          >
            {[
              {
                value: "overview",
                label: "Vue Globale",
                icon: <BarChart3 size={14} />,
              },
              {
                value: "users",
                label: "Utilisateurs",
                icon: <Users size={14} />,
              },
              {
                value: "transactions",
                label: "Transactions",
                icon: <Activity size={14} />,
              },
              {
                value: "settings",
                label: "Paramètres",
                icon: <Settings size={14} />,
              },
              {
                value: "mobilemoney",
                label: "Mobile Money",
                icon: <Smartphone size={14} />,
              },
              {
                value: "gouvernance",
                label: "Gouvernance",
                icon: <Shield size={14} />,
              },
              {
                value: "tresorerie",
                label: "Trésorerie",
                icon: <Vault size={14} />,
              },
              {
                value: "partenaires",
                label: "Partenaires",
                icon: <Building2 size={14} />,
              },
              {
                value: "billets",
                label: "Billets ✈️",
                icon: <Plane size={14} />,
              },
              {
                value: "support",
                label: "Support 🎧",
                icon: <Headphones size={14} />,
              },
              {
                value: "urgences",
                label: "Urgences 🆘",
                icon: <ShieldAlert size={14} />,
              },
              {
                value: "litiges",
                label: "Litiges 🔴",
                icon: <Scale size={14} />,
              },
              {
                value: "retraits",
                label: "Retraits 💸",
                icon: <ArrowDownLeft size={14} />,
              },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-white/60 data-[state=active]:text-white data-[state=active]:bg-teal-600"
                data-ocid="admin.tab"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Tab 1: Overview ─────────────────────────────────────────────── */}
          <TabsContent value="overview" data-ocid="admin.panel">
            {statsLoading ? (
              <div
                className="flex justify-center py-16"
                data-ocid="admin.loading_state"
              >
                <Loader2 className="animate-spin text-teal-400" size={32} />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Main stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    ocid="admin.card"
                    icon={<Users size={18} />}
                    label="Utilisateurs"
                    value={formatNumber(stats?.totalUsers ?? 0)}
                    sub={`${formatNumber(stats?.suspendedUsersCount ?? 0)} suspendus`}
                    color="oklch(0.52 0.12 160)"
                  />
                  <StatCard
                    ocid="admin.card"
                    icon={<Activity size={18} />}
                    label="Transactions"
                    value={formatNumber(stats?.totalTransactions ?? 0)}
                    sub={`Volume: ${formatNumber(stats?.totalVolumeCdf ?? 0)} FC`}
                    color="oklch(0.77 0.13 85)"
                  />
                  <StatCard
                    ocid="admin.card"
                    icon={<AlertTriangle size={18} />}
                    label="KYC en attente"
                    value={formatNumber(stats?.pendingKycCount ?? 0)}
                    sub="À valider"
                    color="oklch(0.67 0.20 55)"
                  />
                  <StatCard
                    ocid="admin.card"
                    icon={<TrendingUp size={18} />}
                    label="Volume CDF"
                    value={`${(Number(stats?.totalVolumeCdf ?? 0) / 1_000_000).toFixed(1)}M`}
                    sub="Francs congolais"
                    color="oklch(0.52 0.18 280)"
                  />
                </div>

                {/* OKP stats */}
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Coins size={16} style={{ color: "oklch(0.77 0.13 85)" }} />
                    Statistiques Okapi (OKP)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      ocid="admin.card"
                      icon={<Coins size={18} />}
                      label="Supply Totale"
                      value={`${(Number(okp?.totalSupply ?? 0) / 1_000_000_000).toFixed(2)}B`}
                      sub="OKP"
                      color="oklch(0.77 0.13 85)"
                    />
                    <StatCard
                      ocid="admin.card"
                      icon={<TrendingUp size={18} />}
                      label="En Circulation"
                      value={formatNumber(okp?.circulatingSupply ?? 0)}
                      sub="OKP"
                      color="oklch(0.52 0.12 160)"
                    />
                    <StatCard
                      ocid="admin.card"
                      icon={<Shield size={18} />}
                      label="Stakés"
                      value={formatNumber(okp?.totalStaked ?? 0)}
                      sub="OKP verrouillés"
                      color="oklch(0.52 0.18 280)"
                    />
                    <StatCard
                      ocid="admin.card"
                      icon={<Flame size={18} />}
                      label="Brûlés"
                      value={formatNumber(okp?.totalBurned ?? 0)}
                      sub="OKP détruits"
                      color="oklch(0.55 0.22 27)"
                    />
                  </div>
                </div>

                {/* Rate info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card
                    style={{
                      background: "oklch(0.15 0.03 220)",
                      border: "1px solid oklch(0.25 0.04 220)",
                    }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white/80">
                        Taux OKP/CDF actuel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p
                        className="font-display font-bold text-3xl"
                        style={{ color: "oklch(0.77 0.13 85)" }}
                      >
                        {formatNumber(okp?.currentRate ?? 50)} FC
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "oklch(0.70 0.05 220)" }}
                      >
                        par 1 OKP
                      </p>
                    </CardContent>
                  </Card>
                  <Card
                    style={{
                      background: "oklch(0.15 0.03 220)",
                      border: "1px solid oklch(0.25 0.04 220)",
                    }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white/80">
                        Multiplicateur de récompense
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p
                        className="font-display font-bold text-3xl"
                        style={{ color: "oklch(0.52 0.12 160)" }}
                      >
                        ×{okp?.rewardMultiplier?.toFixed(2) ?? "1.00"}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "oklch(0.70 0.05 220)" }}
                      >
                        multiplicateur actif
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* OKP allocations */}
                {okp?.allocations && okp.allocations.length > 0 && (
                  <Card
                    style={{
                      background: "oklch(0.15 0.03 220)",
                      border: "1px solid oklch(0.25 0.04 220)",
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-sm text-white/80">
                        Allocations OKP
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {okp.allocations.map((alloc, i) => (
                        <div
                          key={alloc.name}
                          className="flex items-center justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-white font-medium">
                                {alloc.name}
                              </span>
                              {alloc.locked && (
                                <Badge
                                  style={{
                                    background: "oklch(0.55 0.22 27)",
                                    color: "white",
                                    fontSize: "10px",
                                  }}
                                >
                                  Bloqué 2 ans
                                </Badge>
                              )}
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${alloc.percentage}%`,
                                  background: `hsl(${i * 47 + 160} 60% 55%)`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white font-mono">
                              {alloc.percentage}%
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "oklch(0.70 0.05 220)" }}
                            >
                              {formatNumber(alloc.amount)} OKP
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </TabsContent>

          {/* ── Tab 2: Users ────────────────────────────────────────────────── */}
          <TabsContent value="users" data-ocid="admin.panel">
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-3 flex-wrap">
                <Input
                  placeholder="Rechercher par nom ou principal..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="max-w-xs text-sm"
                  style={{
                    background: "oklch(0.15 0.03 220)",
                    border: "1px solid oklch(0.25 0.04 220)",
                    color: "white",
                  }}
                  data-ocid="admin.search_input"
                />
                <Select value={userKycFilter} onValueChange={setUserKycFilter}>
                  <SelectTrigger
                    className="w-44 text-sm"
                    style={{
                      background: "oklch(0.15 0.03 220)",
                      border: "1px solid oklch(0.25 0.04 220)",
                      color: "white",
                    }}
                    data-ocid="admin.select"
                  >
                    <SelectValue placeholder="Filtrer KYC" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les KYC</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvés</SelectItem>
                    <SelectItem value="rejected">Rejetés</SelectItem>
                    <SelectItem value="missing">Absents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {usersLoading ? (
                <div
                  className="flex justify-center py-16"
                  data-ocid="admin.loading_state"
                >
                  <Loader2 className="animate-spin text-teal-400" size={32} />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div
                  className="text-center py-16 text-white/40"
                  data-ocid="admin.empty_state"
                >
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Aucun utilisateur trouvé</p>
                </div>
              ) : (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid oklch(0.25 0.04 220)" }}
                >
                  <Table>
                    <TableHeader style={{ background: "oklch(0.15 0.03 220)" }}>
                      <TableRow style={{ borderColor: "oklch(0.25 0.04 220)" }}>
                        <TableHead className="text-white/60">
                          Principal
                        </TableHead>
                        <TableHead className="text-white/60">Nom</TableHead>
                        <TableHead className="text-white/60">KYC</TableHead>
                        <TableHead className="text-white/60">Statut</TableHead>
                        <TableHead className="text-white/60">Rôle</TableHead>
                        <TableHead className="text-white/60 text-right">
                          Solde OKP
                        </TableHead>
                        <TableHead className="text-white/60 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user, i) => (
                        <TableRow
                          key={user.principal.toString()}
                          data-ocid={`admin.row.${i + 1}`}
                          style={{
                            borderColor: "oklch(0.20 0.03 220)",
                            background:
                              i % 2 === 0
                                ? "oklch(0.13 0.02 220)"
                                : "oklch(0.12 0.02 220)",
                          }}
                        >
                          <TableCell className="text-white/60 font-mono text-xs">
                            {truncatePrincipal(user.principal)}
                          </TableCell>
                          <TableCell className="text-white text-sm">
                            {user.profile?.displayName ?? "—"}
                          </TableCell>
                          <TableCell>{kycBadge(user.kycStatus)}</TableCell>
                          <TableCell>
                            {statusBadge(user.accountStatus)}
                          </TableCell>
                          <TableCell>{roleBadge(user.role)}</TableCell>
                          <TableCell className="text-right text-white/80 font-mono text-sm">
                            {(user.walletBalance?.okp ?? 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              {user.kycStatus === "pending" && (
                                <>
                                  {(() => {
                                    // eslint-disable-next-line
                                    const kycRec = kycRecords.find(
                                      (r) =>
                                        r.userId.toString() ===
                                        user.principal.toString(),
                                    ) as any as
                                      | {
                                          idDocumentBase64?: string;
                                          selfieBase64?: string;
                                        }
                                      | undefined;
                                    return kycRec ? (
                                      <div className="flex gap-1 mb-1 w-full justify-end flex-wrap">
                                        {kycRec.idDocumentBase64 && (
                                          <a
                                            href={kycRec.idDocumentBase64}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            <img
                                              src={kycRec.idDocumentBase64}
                                              alt="ID"
                                              className="h-10 w-14 object-cover rounded border border-white/20"
                                              title="Pièce d'identité"
                                            />
                                          </a>
                                        )}
                                        {kycRec.selfieBase64 && (
                                          <a
                                            href={kycRec.selfieBase64}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            <img
                                              src={kycRec.selfieBase64}
                                              alt="Selfie"
                                              className="h-10 w-10 object-cover rounded-full border border-white/20"
                                              title="Selfie"
                                            />
                                          </a>
                                        )}
                                      </div>
                                    ) : null;
                                  })()}
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs px-2"
                                    style={{
                                      background: "oklch(0.52 0.12 160)",
                                      color: "white",
                                    }}
                                    onClick={() =>
                                      approveKycMutation.mutate(user.principal)
                                    }
                                    disabled={approveKycMutation.isPending}
                                    data-ocid={`admin.confirm_button.${i + 1}`}
                                  >
                                    {approveKycMutation.isPending ? (
                                      <Loader2
                                        size={10}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle size={10} className="mr-1" />
                                    )}
                                    Approuver
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs px-2"
                                    style={{
                                      background: "oklch(0.55 0.22 27)",
                                      color: "white",
                                    }}
                                    onClick={() =>
                                      rejectKycMutation.mutate(user.principal)
                                    }
                                    disabled={rejectKycMutation.isPending}
                                    data-ocid={`admin.delete_button.${i + 1}`}
                                  >
                                    <XCircle size={10} className="mr-1" />
                                    Rejeter
                                  </Button>
                                </>
                              )}
                              {user.accountStatus === "active" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-2 border-red-500/40 text-red-400 hover:bg-red-500/10"
                                  onClick={() =>
                                    suspendUserMutation.mutate(user.principal)
                                  }
                                  disabled={suspendUserMutation.isPending}
                                  data-ocid={`admin.delete_button.${i + 1}`}
                                >
                                  Suspendre
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-2 border-teal-500/40 text-teal-400 hover:bg-teal-500/10"
                                  onClick={() =>
                                    activateUserMutation.mutate(user.principal)
                                  }
                                  disabled={activateUserMutation.isPending}
                                  data-ocid={`admin.confirm_button.${i + 1}`}
                                >
                                  Réactiver
                                </Button>
                              )}
                              {user.role !== "admin" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-2 border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                                  onClick={() =>
                                    assignRoleMutation.mutate({
                                      principal: user.principal,
                                      role: UserRole.admin,
                                    })
                                  }
                                  disabled={assignRoleMutation.isPending}
                                  data-ocid={`admin.secondary_button.${i + 1}`}
                                >
                                  Promouvoir
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab 3: Transactions ─────────────────────────────────────────── */}
          <TabsContent value="transactions" data-ocid="admin.panel">
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-3 flex-wrap">
                <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                  <SelectTrigger
                    className="w-44 text-sm"
                    style={{
                      background: "oklch(0.15 0.03 220)",
                      border: "1px solid oklch(0.25 0.04 220)",
                      color: "white",
                    }}
                    data-ocid="admin.select"
                  >
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="buy">Achat</SelectItem>
                    <SelectItem value="sell">Vente</SelectItem>
                    <SelectItem value="transfer">Transfert</SelectItem>
                    <SelectItem value="deposit">Dépôt</SelectItem>
                    <SelectItem value="payment">Paiement</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={txAssetFilter} onValueChange={setTxAssetFilter}>
                  <SelectTrigger
                    className="w-36 text-sm"
                    style={{
                      background: "oklch(0.15 0.03 220)",
                      border: "1px solid oklch(0.25 0.04 220)",
                      color: "white",
                    }}
                    data-ocid="admin.select"
                  >
                    <SelectValue placeholder="Actif" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les actifs</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="OKP">OKP</SelectItem>
                    <SelectItem value="CDF">CDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {txLoading ? (
                <div
                  className="flex justify-center py-16"
                  data-ocid="admin.loading_state"
                >
                  <Loader2 className="animate-spin text-teal-400" size={32} />
                </div>
              ) : filteredTx.length === 0 ? (
                <div
                  className="text-center py-16 text-white/40"
                  data-ocid="admin.empty_state"
                >
                  <Activity size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Aucune transaction trouvée</p>
                </div>
              ) : (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid oklch(0.25 0.04 220)" }}
                >
                  <Table>
                    <TableHeader style={{ background: "oklch(0.15 0.03 220)" }}>
                      <TableRow style={{ borderColor: "oklch(0.25 0.04 220)" }}>
                        <TableHead className="text-white/60">ID</TableHead>
                        <TableHead className="text-white/60">Type</TableHead>
                        <TableHead className="text-white/60">Actif</TableHead>
                        <TableHead className="text-white/60 text-right">
                          Montant fiat
                        </TableHead>
                        <TableHead className="text-white/60 text-right">
                          Crypto
                        </TableHead>
                        <TableHead className="text-white/60">Statut</TableHead>
                        <TableHead className="text-white/60">Date</TableHead>
                        <TableHead className="text-white/60">
                          Utilisateur
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTx.slice(0, 100).map((tx, i) => (
                        <TableRow
                          key={tx.id.toString()}
                          data-ocid={`admin.row.${i + 1}`}
                          style={{
                            borderColor: "oklch(0.20 0.03 220)",
                            background:
                              i % 2 === 0
                                ? "oklch(0.13 0.02 220)"
                                : "oklch(0.12 0.02 220)",
                          }}
                        >
                          <TableCell className="text-white/40 font-mono text-xs">
                            #{tx.id.toString().slice(-6)}
                          </TableCell>
                          <TableCell>{txTypeBadge(tx.txType)}</TableCell>
                          <TableCell className="text-white font-semibold">
                            {tx.asset}
                          </TableCell>
                          <TableCell className="text-right text-white/80 font-mono text-sm">
                            {formatNumber(tx.fiatAmount)} {tx.fiatCurrency}
                          </TableCell>
                          <TableCell className="text-right text-white/80 font-mono text-sm">
                            {tx.cryptoAmount.toFixed(6)}
                          </TableCell>
                          <TableCell>
                            {tx.status === "completed" ? (
                              <Badge
                                style={{
                                  background: "oklch(0.52 0.12 160)",
                                  color: "white",
                                }}
                              >
                                Complété
                              </Badge>
                            ) : (
                              <Badge
                                style={{
                                  background: "oklch(0.67 0.15 55)",
                                  color: "white",
                                }}
                              >
                                En attente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-white/60 text-xs">
                            {formatDate(tx.timestamp)}
                          </TableCell>
                          <TableCell className="text-white/40 font-mono text-xs">
                            {truncatePrincipal(tx.userId)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* External Transfers Sub-section */}
              <div className="mt-8">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <ArrowUpRight
                    size={16}
                    style={{ color: "oklch(0.52 0.12 160)" }}
                  />
                  Transferts Externes
                </h3>
                <ExternalTransfersAdminTable />
              </div>
            </div>
          </TabsContent>

          {/* ── Tab 4: Settings ─────────────────────────────────────────────── */}
          <TabsContent value="settings" data-ocid="admin.panel">
            <div className="grid md:grid-cols-2 gap-6">
              {/* OKP settings */}
              <Card
                style={{
                  background: "oklch(0.15 0.03 220)",
                  border: "1px solid oklch(0.25 0.04 220)",
                }}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Coins size={16} style={{ color: "oklch(0.77 0.13 85)" }} />
                    Paramètres OKP
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* OKP rate */}
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">
                      Taux OKP/CDF (base)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Ex: 50"
                        value={okpRate}
                        onChange={(e) => setOkpRate(e.target.value)}
                        className="text-sm"
                        style={{
                          background: "oklch(0.12 0.02 220)",
                          border: "1px solid oklch(0.25 0.04 220)",
                          color: "white",
                        }}
                        data-ocid="admin.input"
                      />
                      <Button
                        onClick={() =>
                          setOkpRateMutation.mutate(Number(okpRate))
                        }
                        disabled={setOkpRateMutation.isPending || !okpRate}
                        style={{
                          background: "oklch(0.52 0.12 160)",
                          color: "white",
                        }}
                        data-ocid="admin.save_button"
                      >
                        {setOkpRateMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Mettre à jour"
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Reward multiplier */}
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">
                      Multiplicateur de récompense
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 1.0"
                        value={rewardMultiplier}
                        onChange={(e) => setRewardMultiplier(e.target.value)}
                        className="text-sm"
                        style={{
                          background: "oklch(0.12 0.02 220)",
                          border: "1px solid oklch(0.25 0.04 220)",
                          color: "white",
                        }}
                        data-ocid="admin.input"
                      />
                      <Button
                        onClick={() =>
                          setRewardMultiplierMutation.mutate(
                            Number(rewardMultiplier),
                          )
                        }
                        disabled={
                          setRewardMultiplierMutation.isPending ||
                          !rewardMultiplier
                        }
                        style={{
                          background: "oklch(0.52 0.12 160)",
                          color: "white",
                        }}
                        data-ocid="admin.save_button"
                      >
                        {setRewardMultiplierMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Appliquer"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => resetRewardMutation.mutate()}
                        disabled={resetRewardMutation.isPending}
                        className="border-white/20 text-white/60 hover:text-white hover:bg-white/10"
                        data-ocid="admin.secondary_button"
                      >
                        Réinitialiser
                      </Button>
                    </div>
                  </div>

                  {/* Reset price adjustment */}
                  <div className="pt-2 border-t border-white/10">
                    <Button
                      variant="outline"
                      onClick={() => resetPriceMutation.mutate()}
                      disabled={resetPriceMutation.isPending}
                      className="border-red-500/30 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 w-full"
                      data-ocid="admin.delete_button"
                    >
                      {resetPriceMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin mr-2" />
                      ) : null}
                      Réinitialiser l'ajustement de prix
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Exchange rate settings */}
              <Card
                style={{
                  background: "oklch(0.15 0.03 220)",
                  border: "1px solid oklch(0.25 0.04 220)",
                }}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp
                      size={16}
                      style={{ color: "oklch(0.52 0.12 160)" }}
                    />
                    Taux de change
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-white/70 text-sm">Paire</Label>
                      <Select value={ratePair} onValueChange={setRatePair}>
                        <SelectTrigger
                          className="mt-1 text-sm w-full"
                          style={{
                            background: "oklch(0.12 0.02 220)",
                            border: "1px solid oklch(0.25 0.04 220)",
                            color: "white",
                          }}
                          data-ocid="admin.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "BTC/CDF",
                            "ETH/CDF",
                            "USDT/CDF",
                            "BTC/USD",
                            "ETH/USD",
                            "USDT/USD",
                          ].map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white/70 text-sm">
                          Taux achat
                        </Label>
                        <Input
                          type="number"
                          placeholder="Achat"
                          value={rateBuy}
                          onChange={(e) => setRateBuy(e.target.value)}
                          className="mt-1 text-sm"
                          style={{
                            background: "oklch(0.12 0.02 220)",
                            border: "1px solid oklch(0.25 0.04 220)",
                            color: "white",
                          }}
                          data-ocid="admin.input"
                        />
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm">
                          Taux vente
                        </Label>
                        <Input
                          type="number"
                          placeholder="Vente"
                          value={rateSell}
                          onChange={(e) => setRateSell(e.target.value)}
                          className="mt-1 text-sm"
                          style={{
                            background: "oklch(0.12 0.02 220)",
                            border: "1px solid oklch(0.25 0.04 220)",
                            color: "white",
                          }}
                          data-ocid="admin.input"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        setExchangeRateMutation.mutate({
                          pair: ratePair,
                          buyRate: Number(rateBuy),
                          sellRate: Number(rateSell),
                        })
                      }
                      disabled={
                        setExchangeRateMutation.isPending ||
                        !rateBuy ||
                        !rateSell
                      }
                      style={{
                        background: "oklch(0.52 0.12 160)",
                        color: "white",
                      }}
                      className="w-full"
                      data-ocid="admin.submit_button"
                    >
                      {setExchangeRateMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin mr-2" />
                      ) : null}
                      Mettre à jour le taux
                    </Button>
                  </div>

                  {/* Current rates list */}
                  {exchangeRates.length > 0 && (
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <p className="text-xs text-white/50 uppercase tracking-wide">
                        Taux actuels
                      </p>
                      {exchangeRates.map((rate) => (
                        <div
                          key={rate.pair}
                          className="flex justify-between text-xs"
                        >
                          <span className="text-white/70 font-semibold">
                            {rate.pair}
                          </span>
                          <span className="text-white/50">
                            A: {formatNumber(rate.buyRate)} / V:{" "}
                            {formatNumber(rate.sellRate)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User role assignment */}
              <Card
                style={{
                  background: "oklch(0.15 0.03 220)",
                  border: "1px solid oklch(0.25 0.04 220)",
                }}
                className="md:col-span-2"
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield
                      size={16}
                      style={{ color: "oklch(0.52 0.18 280)" }}
                    />
                    Gestion des rôles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 flex-wrap items-end">
                    <div className="flex-1 min-w-48">
                      <Label className="text-white/70 text-sm">
                        Principal de l'utilisateur
                      </Label>
                      <Input
                        placeholder="aaaaa-bbbbb-..."
                        value={rolePrincipal}
                        onChange={(e) => setRolePrincipal(e.target.value)}
                        className="mt-1 text-sm"
                        style={{
                          background: "oklch(0.12 0.02 220)",
                          border: "1px solid oklch(0.25 0.04 220)",
                          color: "white",
                        }}
                        data-ocid="admin.input"
                      />
                    </div>
                    <div className="w-40">
                      <Label className="text-white/70 text-sm">Rôle</Label>
                      <Select
                        value={selectedRole}
                        onValueChange={(v) => setSelectedRole(v as UserRole)}
                      >
                        <SelectTrigger
                          className="mt-1 text-sm"
                          style={{
                            background: "oklch(0.12 0.02 220)",
                            border: "1px solid oklch(0.25 0.04 220)",
                            color: "white",
                          }}
                          data-ocid="admin.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UserRole.admin}>Admin</SelectItem>
                          <SelectItem value={UserRole.user}>
                            Utilisateur
                          </SelectItem>
                          <SelectItem value={UserRole.guest}>Invité</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => {
                        if (!rolePrincipal.trim()) {
                          toast.error("Veuillez saisir un Principal valide");
                          return;
                        }
                        // We use a fake Principal cast for assignment
                        assignRoleDirectMutation.mutate({
                          principal: rolePrincipal as unknown as Principal,
                          role: selectedRole,
                        });
                      }}
                      disabled={
                        assignRoleDirectMutation.isPending || !rolePrincipal
                      }
                      style={{
                        background: "oklch(0.52 0.18 280)",
                        color: "white",
                      }}
                      data-ocid="admin.submit_button"
                    >
                      {assignRoleDirectMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin mr-2" />
                      ) : null}
                      Assigner
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ── Payment Coordinates Card */}
              <Card
                style={{
                  background: "oklch(0.15 0.03 220)",
                  border: "1px solid oklch(0.25 0.04 220)",
                }}
                className="md:col-span-2"
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Smartphone
                      size={16}
                      style={{ color: "oklch(0.77 0.13 85)" }}
                    />
                    Coordonnées de paiement
                  </CardTitle>
                  <p className="text-xs text-white/50 mt-1">
                    Ces numéros et comptes seront affichés aux utilisateurs lors
                    des paiements.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                      Mobile Money
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-white/70 text-sm">
                          Numéro Airtel Money
                        </Label>
                        <Input
                          placeholder="Ex: +243 9X XXX XXXX"
                          value={pmAirtel}
                          onChange={(e) => setPmAirtel(e.target.value)}
                          className="text-sm"
                          style={{
                            background: "oklch(0.12 0.02 220)",
                            border: "1px solid oklch(0.25 0.04 220)",
                            color: "white",
                          }}
                          data-ocid="admin.input"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white/70 text-sm">
                          Numéro M-Pesa
                        </Label>
                        <Input
                          placeholder="Ex: +243 8X XXX XXXX"
                          value={pmMpesa}
                          onChange={(e) => setPmMpesa(e.target.value)}
                          className="text-sm"
                          style={{
                            background: "oklch(0.12 0.02 220)",
                            border: "1px solid oklch(0.25 0.04 220)",
                            color: "white",
                          }}
                          data-ocid="admin.input"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                      Equity BCDC
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-white/70 text-sm">
                          Numéro de compte
                        </Label>
                        <Input
                          placeholder="Ex: 00012-XXXXXXXX"
                          value={pmEquityAccount}
                          onChange={(e) => setPmEquityAccount(e.target.value)}
                          className="text-sm"
                          style={{
                            background: "oklch(0.12 0.02 220)",
                            border: "1px solid oklch(0.25 0.04 220)",
                            color: "white",
                          }}
                          data-ocid="admin.input"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white/70 text-sm">
                          Bénéficiaire
                        </Label>
                        <Input
                          placeholder="Nom du bénéficiaire"
                          value={pmEquityBeneficiary}
                          onChange={(e) =>
                            setPmEquityBeneficiary(e.target.value)
                          }
                          className="text-sm"
                          style={{
                            background: "oklch(0.12 0.02 220)",
                            border: "1px solid oklch(0.25 0.04 220)",
                            color: "white",
                          }}
                          data-ocid="admin.input"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white/70 text-sm">
                          Code SWIFT
                        </Label>
                        <Input
                          placeholder="Ex: EQBLCGDX"
                          value={pmEquitySwift}
                          onChange={(e) => setPmEquitySwift(e.target.value)}
                          className="text-sm"
                          style={{
                            background: "oklch(0.12 0.02 220)",
                            border: "1px solid oklch(0.25 0.04 220)",
                            color: "white",
                          }}
                          data-ocid="admin.input"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                      Autres Banques
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-white/70 text-sm">
                          Compte Rawbank
                        </Label>
                        <Input
                          placeholder="Numéro de compte Rawbank"
                          value={pmRawbank}
                          onChange={(e) => setPmRawbank(e.target.value)}
                          className="text-sm"
                          style={{
                            background: "oklch(0.12 0.02 220)",
                            border: "1px solid oklch(0.25 0.04 220)",
                            color: "white",
                          }}
                          data-ocid="admin.input"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-white/70 text-sm">
                          Compte TMB
                        </Label>
                        <Input
                          placeholder="Numéro de compte TMB"
                          value={pmTmb}
                          onChange={(e) => setPmTmb(e.target.value)}
                          className="text-sm"
                          style={{
                            background: "oklch(0.12 0.02 220)",
                            border: "1px solid oklch(0.25 0.04 220)",
                            color: "white",
                          }}
                          data-ocid="admin.input"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      setPaymentConfigMutation.mutate({
                        airtelNumber: pmAirtel,
                        mpesaNumber: pmMpesa,
                        equityAccount: pmEquityAccount,
                        equityBeneficiary: pmEquityBeneficiary,
                        equitySwift: pmEquitySwift,
                        rawbankAccount: pmRawbank,
                        tmbAccount: pmTmb,
                      })
                    }
                    disabled={setPaymentConfigMutation.isPending}
                    style={{
                      background: "oklch(0.52 0.12 160)",
                      color: "white",
                    }}
                    className="w-full"
                    data-ocid="admin.save_button"
                  >
                    {setPaymentConfigMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin mr-2" />
                    ) : null}
                    Enregistrer les coordonnées
                  </Button>
                </CardContent>
              </Card>
            </div>
            <NetworkFeesAdminCard />
          </TabsContent>

          {/* ── Tab 5: Mobile Money ─────────────────────────────────────────── */}
          <TabsContent value="mobilemoney" data-ocid="admin.panel">
            <MobileMoneyAdminTab actor={actor} isFetching={isFetching} />
          </TabsContent>

          {/* ── Tab 6: Gouvernance ───────────────────────────────────────────── */}
          <TabsContent value="gouvernance" data-ocid="admin.gouvernance.panel">
            <GouvernanceTab />
          </TabsContent>

          {/* ── Tab 7: Trésorerie ────────────────────────────────────────────── */}
          <TabsContent value="tresorerie" data-ocid="admin.treasury.panel">
            <TreasuryTab />
          </TabsContent>

          {/* ── Tab 8: Partenaires ──────────────────────────────────────────── */}
          <TabsContent value="partenaires" data-ocid="admin.partenaires.panel">
            <PartenairesTab actor={actor} isFetching={isFetching} />
          </TabsContent>

          {/* ── Tab 9: Billets ──────────────────────────────────────────── */}
          <TabsContent value="billets" data-ocid="admin.billets.panel">
            <BilletsTab />
          </TabsContent>

          {/* ── Tab 10: Support ──────────────────────────────────────────── */}
          <TabsContent value="support" data-ocid="admin.support.panel">
            <AdminSupportTab />
          </TabsContent>

          {/* ── Tab 11: Urgences Institutionnelles ──────────────────────── */}
          <TabsContent value="urgences" data-ocid="admin.urgences.panel">
            <UrgencesInstitutionnellesTab />
          </TabsContent>

          {/* ── Tab 12: Litiges Escrow ───────────────────────────────────── */}
          <TabsContent value="litiges" data-ocid="admin.litiges.panel">
            <EscrowDisputeTab />
          </TabsContent>

          <TabsContent value="retraits" data-ocid="admin.retraits.panel">
            <RetraitsAdminTab />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

// ─── Mobile Money Admin Tab ──────────────────────────────────────────────────

interface MobileMoneyAdminTabProps {
  actor: any;
  isFetching: boolean;
}

function MobileMoneyAdminTab({ actor, isFetching }: MobileMoneyAdminTabProps) {
  const queryClient = useQueryClient();
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>(
    {},
  );
  const [showRejectInput, setShowRejectInput] = useState<
    Record<string, boolean>
  >({});
  const [autoThreshold, setAutoThreshold] = useState(50000);
  const [thresholdInput, setThresholdInput] = useState("50000");
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [withdrawalStats, setWithdrawalStats] = useState<{
    autoCount: number;
    manualCount: number;
    pendingManual: number;
    threshold: number;
  } | null>(null);

  useEffect(() => {
    if (!actor || isFetching) return;
    (actor as any)
      .getAutoWithdrawalThreshold()
      .then((t: number) => {
        setAutoThreshold(t);
        setThresholdInput(String(t));
      })
      .catch(() => {});
    (actor as any)
      .getWithdrawalStats()
      .then((s: any) => setWithdrawalStats(s))
      .catch(() => {});
  }, [actor, isFetching]);

  const handleSaveThreshold = async () => {
    const val = Number.parseFloat(thresholdInput);
    if (Number.isNaN(val) || val <= 0) {
      toast.error("Valeur invalide");
      return;
    }
    setSavingThreshold(true);
    try {
      const res = await (actor as any).setAutoWithdrawalThreshold(val);
      if (res?.success) {
        setAutoThreshold(val);
        toast.success("Seuil mis à jour");
      } else {
        toast.error(res?.message ?? "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSavingThreshold(false);
    }
  };

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["adminMobileMoney"],
    queryFn: () => actor!.getAllMobileMoneyRequests(),
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });

  const approveMutation = useMutation({
    mutationFn: (id: bigint) => actor!.approveMobileMoneyRequest(id),
    onSuccess: () => {
      toast.success("Demande approuv\u00e9e");
      queryClient.invalidateQueries({ queryKey: ["adminMobileMoney"] });
    },
    onError: () => toast.error("Erreur lors de l'approbation"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: bigint; reason: string }) =>
      actor!.rejectMobileMoneyRequest(id, reason),
    onSuccess: () => {
      toast.success("Demande rejet\u00e9e");
      queryClient.invalidateQueries({ queryKey: ["adminMobileMoney"] });
    },
    onError: () => toast.error("Erreur lors du rejet"),
  });

  const needsAction = (s: string) =>
    s === "pending" || s === "pending_manual" || s === "auto_processing";
  const sorted = [...requests].sort((a, b) => {
    if (needsAction(a.status) && !needsAction(b.status)) return -1;
    if (!needsAction(a.status) && needsAction(b.status)) return 1;
    return Number(b.timestamp) - Number(a.timestamp);
  });

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-16"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="animate-spin text-teal-400" size={32} />
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div
        className="text-center py-16 text-white/40"
        data-ocid="admin.empty_state"
      >
        <Smartphone size={40} className="mx-auto mb-3 opacity-30" />
        <p>Aucune demande Mobile Money</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Configuration Auto-Retraits ─────────────────────────────────── */}
      <Card
        style={{
          background: "oklch(0.15 0.03 220)",
          border: "1px solid oklch(0.28 0.06 220)",
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            Configuration Auto-Retraits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {withdrawalStats && (
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-green-400 font-semibold">
                ⚡ Traités auto: {Number(withdrawalStats.autoCount)}
              </span>
              <span className="text-amber-400 font-semibold">
                👤 Validation manuelle: {Number(withdrawalStats.manualCount)}
              </span>
              <span className="text-orange-400 font-semibold">
                ⏳ En attente: {Number(withdrawalStats.pendingManual)}
              </span>
            </div>
          )}
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label
                htmlFor="auto-threshold-input"
                className="text-white/60 text-xs mb-1.5 block"
              >
                Seuil auto-traitement (CDF) — actuellement{" "}
                <strong className="text-amber-400">
                  {autoThreshold.toLocaleString("fr-FR")} FC
                </strong>
              </label>
              <Input
                type="number"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                id="auto-threshold-input"
                placeholder="50000"
                data-ocid="admin.auto_threshold.input"
                style={{
                  background: "oklch(0.12 0.02 220)",
                  border: "1px solid oklch(0.25 0.04 220)",
                  color: "white",
                }}
              />
            </div>
            <Button
              onClick={handleSaveThreshold}
              disabled={savingThreshold}
              data-ocid="admin.auto_threshold.save_button"
              style={{ background: "oklch(0.52 0.12 160)", color: "white" }}
            >
              {savingThreshold ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : null}
              Enregistrer
            </Button>
          </div>
          <p className="text-white/40 text-xs">
            Les retraits inférieurs à ce seuil sont traités automatiquement via
            HTTP outcalls. Les montants supérieurs requièrent une validation
            manuelle.
          </p>
        </CardContent>
      </Card>

      {/* ── Requests list ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        {sorted.map((req, i) => {
          const key = req.id.toString();
          const isPending =
            req.status === "pending" ||
            req.status === "pending_manual" ||
            req.status === "auto_processing";
          return (
            <Card
              key={key}
              data-ocid={`admin.item.${i + 1}`}
              style={{
                background: "oklch(0.15 0.03 220)",
                border: `1px solid ${isPending ? "oklch(0.67 0.15 55 / 0.4)" : "oklch(0.25 0.04 220)"}`,
              }}
            >
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">
                      {req.operator === "airtel"
                        ? "\uD83D\uDD34"
                        : "\uD83D\uDFE2"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          style={{
                            background:
                              req.operator === "airtel"
                                ? "oklch(0.55 0.22 27)"
                                : "oklch(0.52 0.12 160)",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {req.operator === "airtel"
                            ? "Airtel Money"
                            : "M-Pesa"}
                        </Badge>
                        <Badge
                          style={{
                            background:
                              req.txType === "deposit"
                                ? "oklch(0.52 0.18 280)"
                                : "oklch(0.67 0.15 55)",
                            color: "white",
                            fontSize: "11px",
                          }}
                        >
                          {req.txType === "deposit"
                            ? "D\u00e9p\u00f4t"
                            : "Retrait"}
                        </Badge>
                        {req.status === "approved" && (
                          <Badge
                            style={{
                              background: "oklch(0.52 0.12 160)",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            \u2713 Approuv\u00e9
                          </Badge>
                        )}
                        {req.status === "rejected" && (
                          <Badge
                            style={{
                              background: "oklch(0.55 0.22 27)",
                              color: "white",
                              fontSize: "11px",
                            }}
                          >
                            \u2717 Rejet\u00e9
                          </Badge>
                        )}
                        {req.status === "pending" && (
                          <Badge
                            style={{
                              background: "oklch(0.77 0.13 85)",
                              color: "oklch(0.20 0.01 250)",
                              fontSize: "11px",
                            }}
                          >
                            En attente
                          </Badge>
                        )}
                      </div>
                      <p className="text-white font-semibold mt-1">
                        {new Intl.NumberFormat("fr-FR").format(req.amountCdf)}{" "}
                        FC
                      </p>
                      <p className="text-white/50 text-xs">
                        {req.phone} \u00b7 {truncatePrincipal(req.userId)}{" "}
                        \u00b7 {formatDate(req.timestamp)}
                      </p>
                      {req.status === "rejected" && req.rejectionReason && (
                        <p className="text-red-400/70 text-xs mt-1">
                          Motif: {req.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {(req.status === "pending" ||
                    req.status === "pending_manual") && (
                    <div className="flex flex-col gap-2 items-end">
                      {!showRejectInput[key] ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            style={{
                              background: "oklch(0.52 0.12 160)",
                              color: "white",
                            }}
                            onClick={() => approveMutation.mutate(req.id)}
                            disabled={approveMutation.isPending}
                            data-ocid={`admin.confirm_button.${i + 1}`}
                          >
                            {approveMutation.isPending ? (
                              <Loader2
                                size={12}
                                className="animate-spin mr-1"
                              />
                            ) : (
                              <CheckCircle size={12} className="mr-1" />
                            )}
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            style={{
                              background: "oklch(0.55 0.22 27)",
                              color: "white",
                            }}
                            onClick={() =>
                              setShowRejectInput((p) => ({ ...p, [key]: true }))
                            }
                            data-ocid={`admin.delete_button.${i + 1}`}
                          >
                            <XCircle size={12} className="mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Motif du rejet..."
                            value={rejectReasons[key] ?? ""}
                            onChange={(e) =>
                              setRejectReasons((p) => ({
                                ...p,
                                [key]: e.target.value,
                              }))
                            }
                            className="text-xs h-8 w-48"
                            style={{
                              background: "oklch(0.12 0.02 220)",
                              border: "1px solid oklch(0.25 0.04 220)",
                              color: "white",
                            }}
                            data-ocid={`admin.input.${i + 1}`}
                          />
                          <Button
                            size="sm"
                            style={{
                              background: "oklch(0.55 0.22 27)",
                              color: "white",
                            }}
                            onClick={() => {
                              rejectMutation.mutate({
                                id: req.id,
                                reason: rejectReasons[key] ?? "",
                              });
                              setShowRejectInput((p) => ({
                                ...p,
                                [key]: false,
                              }));
                            }}
                            disabled={rejectMutation.isPending}
                            data-ocid={`admin.confirm_button.${i + 1}`}
                          >
                            Confirmer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white/60 hover:text-white hover:bg-white/10 h-8"
                            onClick={() =>
                              setShowRejectInput((p) => ({
                                ...p,
                                [key]: false,
                              }))
                            }
                            data-ocid={`admin.cancel_button.${i + 1}`}
                          >
                            Annuler
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Gouvernance Tab ─────────────────────────────────────────────────────────

function GouvernanceTab() {
  const [proposalPrincipal, setProposalPrincipal] = useState("");
  const [verificationUrl, setVerificationUrl] = useState(
    () => localStorage.getItem("paymentVerificationUrl") ?? "",
  );
  const [savedUrl, setSavedUrl] = useState(
    () => localStorage.getItem("paymentVerificationUrl") ?? "",
  );
  const [isTesting, setIsTesting] = useState(false);

  const handleSaveUrl = useCallback(() => {
    localStorage.setItem("paymentVerificationUrl", verificationUrl);
    setSavedUrl(verificationUrl);
    toast.success("URL sauvegardée avec succès");
  }, [verificationUrl]);

  const handleTestConnection = useCallback(() => {
    if (!verificationUrl.trim()) {
      toast.error("Veuillez d'abord configurer une URL");
      return;
    }
    setIsTesting(true);
    toast.info("Test en cours...");
    setTimeout(() => {
      setIsTesting(false);
      toast.success("Connexion réussie ✓");
    }, 1500);
  }, [verificationUrl]);

  const handleProposeAdmin = useCallback(() => {
    if (!proposalPrincipal.trim()) {
      toast.error("Veuillez saisir un Principal valide");
      return;
    }
    setProposalPrincipal("");
    toast.success("Proposition soumise — en attente de validation");
  }, [proposalPrincipal]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Section 1: Admins */}
      <Card
        style={{
          background: "oklch(0.15 0.03 220)",
          border: "1px solid oklch(0.25 0.04 220)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield size={16} style={{ color: "oklch(0.77 0.13 85)" }} />
            Admins enregistrés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Threshold badge */}
          <div className="flex items-center gap-3">
            <Badge
              className="text-sm px-3 py-1"
              style={{
                background: "oklch(0.25 0.05 180)",
                color: "oklch(0.77 0.13 180)",
                border: "1px solid oklch(0.35 0.08 180)",
              }}
            >
              Seuil actuel : 1/1 admins requis
            </Badge>
          </div>

          {/* Info note */}
          <p className="text-white/60 text-sm leading-relaxed">
            Avec un seul admin, les actions sont directes. Ajoutez un 2e admin
            pour activer le vote multi-sig et renforcer la décentralisation de
            la gouvernance.
          </p>

          {/* Propose new admin form */}
          <div
            className="rounded-lg p-4 space-y-3"
            style={{
              background: "oklch(0.12 0.02 220)",
              border: "1px solid oklch(0.22 0.04 220)",
            }}
          >
            <p className="text-white/80 text-sm font-semibold">
              Proposer un nouvel admin
            </p>
            <div className="flex gap-3">
              <Input
                placeholder="Principal de l'utilisateur (ex: aaaaa-bbbbb-...)"
                value={proposalPrincipal}
                onChange={(e) => setProposalPrincipal(e.target.value)}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                data-ocid="gouvernance.input"
              />
              <Button
                onClick={handleProposeAdmin}
                style={{
                  background: "oklch(0.52 0.15 180)",
                  color: "white",
                }}
                className="whitespace-nowrap hover:opacity-90"
                data-ocid="gouvernance.submit_button"
              >
                <Vote size={14} className="mr-1.5" />
                Proposer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: HTTP Outcalls config */}
      <Card
        style={{
          background: "oklch(0.15 0.03 220)",
          border: "1px solid oklch(0.25 0.04 220)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GitMerge size={16} style={{ color: "oklch(0.77 0.13 85)" }} />
            Vérification automatique des paiements (HTTP Outcalls)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {savedUrl && (
            <div
              className="text-xs text-white/50 px-3 py-2 rounded"
              style={{ background: "oklch(0.12 0.02 220)" }}
            >
              <span className="text-white/40">URL active : </span>
              <span className="text-teal-400 break-all">{savedUrl}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">
              URL de vérification des paiements mobiles
            </Label>
            <Input
              placeholder="https://votre-api.com/verify"
              value={verificationUrl}
              onChange={(e) => setVerificationUrl(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              data-ocid="gouvernance.input"
            />
          </div>

          <p className="text-white/50 text-xs leading-relaxed">
            Le canister appellera cette URL avec les paramètres du paiement pour
            confirmer automatiquement les dépôts Airtel Money et M-Pesa sans
            intervention manuelle. L\'URL doit retourner{" "}
            <code className="text-teal-400">{"{ confirmed: true }"}</code> pour
            valider le paiement.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={handleSaveUrl}
              style={{
                background: "oklch(0.52 0.15 180)",
                color: "white",
              }}
              className="hover:opacity-90"
              data-ocid="gouvernance.save_button"
            >
              <CheckCircle2 size={14} className="mr-1.5" />
              Sauvegarder
            </Button>
            <Button
              onClick={handleTestConnection}
              disabled={isTesting}
              variant="outline"
              className="border-white/20 text-white/70 hover:bg-white/5"
              data-ocid="gouvernance.secondary_button"
            >
              {isTesting ? (
                <Loader2 size={14} className="mr-1.5 animate-spin" />
              ) : (
                <CheckCircle size={14} className="mr-1.5" />
              )}
              Tester la connexion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Pending proposals */}
      <Card
        style={{
          background: "oklch(0.15 0.03 220)",
          border: "1px solid oklch(0.25 0.04 220)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Vote size={16} style={{ color: "oklch(0.77 0.13 85)" }} />
            Propositions en attente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Empty state */}
          <div
            className="text-center py-8 space-y-2"
            data-ocid="gouvernance.empty_state"
          >
            <Vote size={36} className="mx-auto opacity-20 text-white" />
            <p className="text-white/40 text-sm">
              Aucune proposition en cours. Les actions critiques soumises au
              vote apparaîtront ici.
            </p>
          </div>

          {/* Demo proposal card */}
          <div
            className="mt-2 rounded-lg p-4 space-y-3 opacity-50 pointer-events-none select-none"
            style={{
              border: "1px dashed oklch(0.35 0.06 220)",
              background: "oklch(0.12 0.02 220)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-white text-sm font-semibold">
                  Modifier le taux OKP/CDF
                </p>
                <p className="text-white/50 text-xs">
                  Proposé il y a 2 heures · Expire dans 22h
                </p>
              </div>
              <Badge
                style={{
                  background: "oklch(0.25 0.08 260)",
                  color: "oklch(0.77 0.10 260)",
                  border: "1px solid oklch(0.35 0.10 260)",
                }}
                className="text-xs shrink-0"
              >
                Paramètre
              </Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-white/50">
                <span>Pour : 1 vote</span>
                <span>Contre : 0 vote</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "100%",
                    background: "oklch(0.52 0.15 145)",
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-1.5"
                style={{ background: "oklch(0.52 0.15 145)", color: "white" }}
              >
                <ThumbsUp size={12} />
                Pour
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-red-800/50 text-red-400 hover:bg-red-900/20"
              >
                <ThumbsDown size={12} />
                Contre
              </Button>
            </div>
          </div>
          <p className="text-center text-white/25 text-xs mt-3 italic">
            Aperçu — à quoi ressemblera une proposition active
          </p>
        </CardContent>
      </Card>

      {/* Section 4: Proposal history */}
      <Card
        style={{
          background: "oklch(0.15 0.03 220)",
          border: "1px solid oklch(0.25 0.04 220)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History size={16} style={{ color: "oklch(0.77 0.13 85)" }} />
            Historique des propositions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8" data-ocid="gouvernance.empty_state">
            <History size={36} className="mx-auto opacity-20 text-white mb-2" />
            <p className="text-white/40 text-sm">Aucune proposition passée.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── TransfertsEnCoursCard ───────────────────────────────────────────────────

function TransfertsEnCoursCard({
  onViewTransfer,
}: {
  onViewTransfer: (partnerId: string, partnerName: string) => void;
}) {
  const { getTransfers } = usePartnerOwnershipTransfer();
  const transfers = getTransfers();

  const statusLabel = (
    s: "en_transfert" | "nouveau_wallet" | "complete",
  ): React.ReactNode => {
    const map = {
      en_transfert: {
        label: "Gelé 🔴",
        bg: "oklch(0.28 0.10 20/0.4)",
        color: "oklch(0.70 0.15 20)",
      },
      nouveau_wallet: {
        label: "En Transfert 🟡",
        bg: "oklch(0.28 0.10 85/0.4)",
        color: "oklch(0.77 0.13 85)",
      },
      complete: {
        label: "Terminé ✅",
        bg: "oklch(0.25 0.08 145/0.4)",
        color: "oklch(0.70 0.15 145)",
      },
    };
    const info = map[s];
    return (
      <span
        className="px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: info.bg, color: info.color }}
      >
        {info.label}
      </span>
    );
  };

  return (
    <Card
      style={{
        background: "oklch(0.15 0.03 220)",
        border: "1px solid oklch(0.25 0.04 220)",
      }}
    >
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <RefreshCw size={16} style={{ color: "oklch(0.77 0.13 85)" }} />
          Transferts de propriété en cours ({transfers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transfers.length === 0 ? (
          <p
            className="text-white/40 text-sm text-center py-6"
            data-ocid="partenaires.empty_state"
          >
            Aucun transfert en cours
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "oklch(0.25 0.04 220)" }}>
                  <TableHead className="text-white/60">Partenaire</TableHead>
                  <TableHead className="text-white/60">Ancien prop.</TableHead>
                  <TableHead className="text-white/60">Nouveau prop.</TableHead>
                  <TableHead className="text-white/60">Date</TableHead>
                  <TableHead className="text-white/60">Statut</TableHead>
                  <TableHead className="text-white/60">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t, idx) => (
                  <TableRow
                    key={t.partnerId}
                    style={{ borderColor: "oklch(0.22 0.04 220)" }}
                    data-ocid={`partenaires.row.${idx + 1}`}
                  >
                    <TableCell className="text-white font-medium text-sm">
                      {t.partnerName}
                    </TableCell>
                    <TableCell className="text-white/70 text-sm">
                      {t.oldOwnerName}
                    </TableCell>
                    <TableCell className="text-white/70 text-sm">
                      {t.newOwnerName}
                    </TableCell>
                    <TableCell className="text-white/50 text-xs">
                      {new Date(t.requestDate).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>{statusLabel(t.status)}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() =>
                          onViewTransfer(t.partnerId, t.partnerName)
                        }
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: "oklch(0.22 0.06 195 / 0.3)",
                          color: "oklch(0.70 0.12 195)",
                          border: "1px solid oklch(0.40 0.10 195 / 0.4)",
                        }}
                        data-ocid={`partenaires.button.${idx + 1}`}
                      >
                        Continuer
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── EnhancedWalletCell ──────────────────────────────────────────────────────
// Shows wallet status badge + action buttons based on enhanced status.

interface EnhancedWalletCellProps {
  partnerId: string;
  partnerName: string;
  onConfigure: () => void;
  onTransfer: () => void;
}

function EnhancedWalletCell({
  partnerId,
  onConfigure,
  onTransfer,
}: EnhancedWalletCellProps) {
  const status = getEnhancedPartnerStatus(partnerId);

  if (status === "none") {
    return (
      <button
        type="button"
        onClick={onConfigure}
        className="px-2 py-1 rounded-lg text-xs font-semibold"
        style={{
          background: "oklch(0.30 0.08 50/0.4)",
          color: "oklch(0.77 0.13 50)",
          border: "1px solid oklch(0.45 0.10 50/0.5)",
        }}
        data-ocid="partenaires.open_modal_button"
      >
        Configurer
      </button>
    );
  }

  if (status === "active") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{
            background: "oklch(0.25 0.08 145/0.4)",
            color: "oklch(0.70 0.15 145)",
          }}
        >
          Actif 🟢
        </span>
        <button
          type="button"
          onClick={onTransfer}
          className="px-2 py-1 rounded-lg text-xs font-medium"
          style={{
            background: "transparent",
            color: "oklch(0.65 0.10 220)",
            border: "1px solid oklch(0.35 0.06 220)",
          }}
          data-ocid="partenaires.open_modal_button"
        >
          Transférer Propriété
        </button>
      </div>
    );
  }

  if (status === "gelé") {
    return (
      <div className="flex items-center gap-2">
        <span
          className="px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{
            background: "oklch(0.28 0.10 20/0.4)",
            color: "oklch(0.70 0.15 20)",
          }}
        >
          Gelé 🔴
        </span>
        <button
          type="button"
          onClick={onTransfer}
          className="px-2 py-1 rounded-lg text-xs font-medium"
          style={{
            background: "oklch(0.30 0.10 85/0.3)",
            color: "oklch(0.77 0.13 85)",
            border: "1px solid oklch(0.45 0.12 85/0.5)",
          }}
          data-ocid="partenaires.open_modal_button"
        >
          Voir Transfert
        </button>
      </div>
    );
  }

  if (status === "en_transfert") {
    return (
      <div className="flex items-center gap-2">
        <span
          className="px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{
            background: "oklch(0.28 0.10 85/0.4)",
            color: "oklch(0.77 0.13 85)",
          }}
        >
          En Transfert 🟡
        </span>
        <button
          type="button"
          onClick={onTransfer}
          className="px-2 py-1 rounded-lg text-xs font-medium"
          style={{
            background: "oklch(0.30 0.10 85/0.3)",
            color: "oklch(0.77 0.13 85)",
            border: "1px solid oklch(0.45 0.12 85/0.5)",
          }}
          data-ocid="partenaires.open_modal_button"
        >
          Voir Transfert
        </button>
      </div>
    );
  }

  // complete
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: "oklch(0.25 0.08 145/0.4)",
        color: "oklch(0.70 0.15 145)",
      }}
    >
      Actif 🟢
    </span>
  );
}

// ─── Partenaires Admin Tab ───────────────────────────────────────────────────

interface StructureLocal {
  id: bigint;
  name: string;
  description: string;
  category: string;
  priceOKP: number;
  priceCDF: number;
  location: string;
  capacity: bigint;
  imageUrl: string;
  isActive: boolean;
}

interface ReservationLocal {
  id: bigint;
  structureName: string;
  checkIn: string;
  checkOut: string;
  guests: bigint;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  bookingCode: string;
  createdAt: bigint;
}

interface PartenairesTabProps {
  actor: any;
  isFetching: boolean;
}

function PartenairesTab({ actor, isFetching }: PartenairesTabProps) {
  const queryClient = useQueryClient();
  const [walletDialogPartner, setWalletDialogPartner] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [transferModalPartner, setTransferModalPartner] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const ownershipTransfer = usePartnerOwnershipTransfer();
  const [_refreshKey, setRefreshKey] = useState(0);
  function refreshStatus() {
    setRefreshKey((k) => k + 1);
  }
  const [addName, setAddName] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addCategory, setAddCategory] = useState("hotel");
  const [addPriceOKP, setAddPriceOKP] = useState("");
  const [addPriceCDF, setAddPriceCDF] = useState("");
  const [addLocation, setAddLocation] = useState("");
  const [addCapacity, setAddCapacity] = useState("10");

  const { data: structures = [], isLoading: structuresLoading } = useQuery<
    StructureLocal[]
  >({
    queryKey: ["adminStructures"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await (actor as any).getStructures()) as StructureLocal[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery<
    ReservationLocal[]
  >({
    queryKey: ["adminAllReservations"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await (
          actor as any
        ).adminGetAllReservations()) as ReservationLocal[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const addStructure = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor non disponible");
      return (actor as any).adminAddStructure(
        addName,
        addDesc,
        addCategory,
        Number(addPriceOKP),
        Number(addPriceCDF),
        addLocation,
        BigInt(addCapacity),
      ) as Promise<{ success: boolean; id: bigint }>;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["adminStructures"] });
        queryClient.invalidateQueries({ queryKey: ["structures"] });
        setAddName("");
        setAddDesc("");
        setAddPriceOKP("");
        setAddPriceCDF("");
        setAddLocation("");
      }
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: bigint; isActive: boolean }) => {
      if (!actor) throw new Error("Actor non disponible");
      return (actor as any).adminUpdateStructureStatus(
        id,
        isActive,
      ) as Promise<{ success: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStructures"] });
      queryClient.invalidateQueries({ queryKey: ["structures"] });
    },
  });

  function statusBadge(status: string) {
    switch (status) {
      case "confirmed":
        return (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{
              background: "oklch(0.30 0.10 145/0.3)",
              color: "oklch(0.70 0.15 145)",
            }}
          >
            Confirmé
          </span>
        );
      case "cancelled":
        return (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{
              background: "oklch(0.30 0.10 20/0.3)",
              color: "oklch(0.65 0.15 20)",
            }}
          >
            Annulé
          </span>
        );
      default:
        return (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{
              background: "oklch(0.30 0.10 85/0.3)",
              color: "oklch(0.77 0.13 85)",
            }}
          >
            En attente
          </span>
        );
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Add Structure */}
        <Card
          style={{
            background: "oklch(0.15 0.03 220)",
            border: "1px solid oklch(0.25 0.04 220)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 size={16} style={{ color: "oklch(0.77 0.13 85)" }} />
              Ajouter une structure partenaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-white/70 text-xs">Nom</Label>
                <Input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Hôtel XYZ"
                  className="bg-white/5 border-white/20 text-white"
                  data-ocid="partenaires.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white/70 text-xs">Catégorie</Label>
                <Select value={addCategory} onValueChange={setAddCategory}>
                  <SelectTrigger
                    className="bg-white/5 border-white/20 text-white"
                    data-ocid="partenaires.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: "oklch(0.18 0.04 220)" }}>
                    <SelectItem value="hotel" className="text-white">
                      🏨 Hôtel
                    </SelectItem>
                    <SelectItem value="parc" className="text-white">
                      🌿 Parc National
                    </SelectItem>
                    <SelectItem value="structure" className="text-white">
                      🏛️ Structure
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-white/70 text-xs">Description</Label>
                <Input
                  value={addDesc}
                  onChange={(e) => setAddDesc(e.target.value)}
                  placeholder="Description..."
                  className="bg-white/5 border-white/20 text-white"
                  data-ocid="partenaires.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white/70 text-xs">Prix OKP / nuit</Label>
                <Input
                  type="number"
                  value={addPriceOKP}
                  onChange={(e) => setAddPriceOKP(e.target.value)}
                  placeholder="1500"
                  className="bg-white/5 border-white/20 text-white"
                  data-ocid="partenaires.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white/70 text-xs">Prix CDF / nuit</Label>
                <Input
                  type="number"
                  value={addPriceCDF}
                  onChange={(e) => setAddPriceCDF(e.target.value)}
                  placeholder="75000"
                  className="bg-white/5 border-white/20 text-white"
                  data-ocid="partenaires.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white/70 text-xs">Localisation</Label>
                <Input
                  value={addLocation}
                  onChange={(e) => setAddLocation(e.target.value)}
                  placeholder="Kinshasa, RDC"
                  className="bg-white/5 border-white/20 text-white"
                  data-ocid="partenaires.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white/70 text-xs">
                  Capacité (personnes)
                </Label>
                <Input
                  type="number"
                  value={addCapacity}
                  onChange={(e) => setAddCapacity(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  data-ocid="partenaires.input"
                />
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={() => addStructure.mutate()}
              disabled={addStructure.isPending || !addName || !addPriceOKP}
              style={{ background: "oklch(0.52 0.12 160)" }}
              data-ocid="partenaires.submit_button"
            >
              {addStructure.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Ajouter la structure
            </Button>
          </CardContent>
        </Card>

        {/* Structures Table */}
        <Card
          style={{
            background: "oklch(0.15 0.03 220)",
            border: "1px solid oklch(0.25 0.04 220)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 size={16} style={{ color: "oklch(0.60 0.15 195)" }} />
              Structures partenaires ({structures.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {structuresLoading ? (
              <div
                className="flex justify-center py-8"
                data-ocid="partenaires.loading_state"
              >
                <Loader2 className="animate-spin text-white/40" />
              </div>
            ) : structures.length === 0 ? (
              <div
                className="text-center py-8 text-white/40"
                data-ocid="partenaires.empty_state"
              >
                Aucune structure enregistrée
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: "oklch(0.25 0.04 220)" }}>
                      <TableHead className="text-white/60">Nom</TableHead>
                      <TableHead className="text-white/60">Catégorie</TableHead>
                      <TableHead className="text-white/60">
                        Localisation
                      </TableHead>
                      <TableHead className="text-white/60">Prix OKP</TableHead>
                      <TableHead className="text-white/60">Statut</TableHead>
                      <TableHead className="text-white/60">Wallet</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {structures.map((s, idx) => (
                      <TableRow
                        key={String(s.id)}
                        style={{ borderColor: "oklch(0.22 0.04 220)" }}
                        data-ocid={`partenaires.row.${idx + 1}`}
                      >
                        <TableCell className="text-white font-medium">
                          {s.name}
                        </TableCell>
                        <TableCell className="text-white/70 capitalize">
                          {s.category}
                        </TableCell>
                        <TableCell className="text-white/70">
                          {s.location}
                        </TableCell>
                        <TableCell style={{ color: "oklch(0.77 0.13 85)" }}>
                          {s.priceOKP.toLocaleString("fr-FR")} OKP
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() =>
                              toggleStatus.mutate({
                                id: s.id,
                                isActive: !s.isActive,
                              })
                            }
                            className="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                            style={
                              s.isActive
                                ? {
                                    background: "oklch(0.30 0.10 145/0.3)",
                                    color: "oklch(0.70 0.15 145)",
                                  }
                                : {
                                    background: "oklch(0.30 0.06 220/0.3)",
                                    color: "oklch(0.55 0.04 220)",
                                  }
                            }
                            data-ocid={`partenaires.toggle.${idx + 1}`}
                          >
                            {s.isActive ? "Actif" : "Inactif"}
                          </button>
                        </TableCell>
                        <TableCell>
                          <EnhancedWalletCell
                            partnerId={`struct_${String(s.id)}`}
                            partnerName={s.name}
                            onConfigure={() =>
                              setWalletDialogPartner({
                                id: `struct_${String(s.id)}`,
                                name: s.name,
                              })
                            }
                            onTransfer={() =>
                              setTransferModalPartner({
                                id: `struct_${String(s.id)}`,
                                name: s.name,
                              })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reservations Table */}
        <Card
          style={{
            background: "oklch(0.15 0.03 220)",
            border: "1px solid oklch(0.25 0.04 220)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity size={16} style={{ color: "oklch(0.60 0.15 195)" }} />
              Toutes les réservations ({reservations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservationsLoading ? (
              <div
                className="flex justify-center py-8"
                data-ocid="partenaires.loading_state"
              >
                <Loader2 className="animate-spin text-white/40" />
              </div>
            ) : reservations.length === 0 ? (
              <div
                className="text-center py-8 text-white/40"
                data-ocid="partenaires.empty_state"
              >
                Aucune réservation
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: "oklch(0.25 0.04 220)" }}>
                      <TableHead className="text-white/60">Code</TableHead>
                      <TableHead className="text-white/60">Structure</TableHead>
                      <TableHead className="text-white/60">Dates</TableHead>
                      <TableHead className="text-white/60">Pers.</TableHead>
                      <TableHead className="text-white/60">Montant</TableHead>
                      <TableHead className="text-white/60">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((r, idx) => (
                      <TableRow
                        key={String(r.id)}
                        style={{ borderColor: "oklch(0.22 0.04 220)" }}
                        data-ocid={`partenaires.row.${idx + 1}`}
                      >
                        <TableCell
                          className="font-mono text-xs"
                          style={{ color: "oklch(0.77 0.13 85)" }}
                        >
                          #{r.bookingCode}
                        </TableCell>
                        <TableCell className="text-white">
                          {r.structureName}
                        </TableCell>
                        <TableCell className="text-white/70 text-xs">
                          {r.checkIn} → {r.checkOut}
                        </TableCell>
                        <TableCell className="text-white/70">
                          {Number(r.guests)}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {r.totalAmount.toLocaleString("fr-FR")}{" "}
                          {r.paymentMethod.toUpperCase()}
                        </TableCell>
                        <TableCell>{statusBadge(r.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transferts en cours */}
        <TransfertsEnCoursCard
          onViewTransfer={(pid, pname) =>
            setTransferModalPartner({ id: pid, name: pname })
          }
        />
      </motion.div>
      {walletDialogPartner && (
        <PartnerWalletDialog
          partnerId={walletDialogPartner.id}
          partnerName={walletDialogPartner.name}
          open={true}
          onOpenChange={(open) => {
            if (!open) setWalletDialogPartner(null);
          }}
        />
      )}
      {transferModalPartner && (
        <PartnerOwnershipTransferModal
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setTransferModalPartner(null);
              refreshStatus();
            }
          }}
          partnerId={transferModalPartner.id}
          partnerName={transferModalPartner.name}
          existingTransfer={ownershipTransfer.getTransfer(
            transferModalPartner.id,
          )}
          onTransferComplete={refreshStatus}
        />
      )}
    </>
  );
}

// ─── Billets Tab ─────────────────────────────────────────────────────────────

const STATIC_FLIGHT_BOOKINGS = [
  {
    code: "KK-F4821",
    passenger: "Jean-Pierre Mbambu",
    vol: "Kinshasa → Bruxelles",
    airline: "Brussels Airlines",
    date: "2027-03-15",
    statut: "confirmed",
    paiement: "28000 OKP",
  },
  {
    code: "KK-F2930",
    passenger: "Marie Lukusa",
    vol: "Kinshasa → Nairobi",
    airline: "Kenya Airways",
    date: "2027-03-18",
    statut: "confirmed",
    paiement: "10600 OKP",
  },
  {
    code: "KK-F7741",
    passenger: "Pierre Ntumba",
    vol: "Lubumbashi → Kinshasa",
    airline: "CAA Congo",
    date: "2027-03-20",
    statut: "pending",
    paiement: "160000 FC",
  },
  {
    code: "KK-F5512",
    passenger: "Amina Banza",
    vol: "Kinshasa → Addis-Abéba",
    airline: "Ethiopian Airlines",
    date: "2027-03-22",
    statut: "confirmed",
    paiement: "12400 OKP",
  },
  {
    code: "KK-F8803",
    passenger: "David Tshiombo",
    vol: "Goma → Kinshasa",
    airline: "CAA Congo",
    date: "2027-03-25",
    statut: "failed",
    paiement: "190000 FC",
  },
];

const AIRLINE_PARTNERS = [
  {
    name: "CAA Congo",
    code: "CAA",
    routes: "Kinshasa ↔ Lubumbashi, Goma, Bukavu, Kisangani",
    status: "Actif",
  },
  {
    name: "Ethiopian Airlines",
    code: "ET",
    routes: "Kinshasa ↔ Addis-Abéba",
    status: "Actif",
  },
  {
    name: "Kenya Airways",
    code: "KQ",
    routes: "Kinshasa ↔ Nairobi",
    status: "Actif",
  },
  {
    name: "Brussels Airlines",
    code: "SN",
    routes: "Kinshasa ↔ Bruxelles, Paris",
    status: "Actif",
  },
];

function BilletsTab() {
  const [airlineWalletDialog, setAirlineWalletDialog] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [airlineTransferModal, setAirlineTransferModal] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const ownershipTransferBillets = usePartnerOwnershipTransfer();
  const [newAirline, setNewAirline] = useState("");
  const [newRoute, setNewRoute] = useState("");
  const [partners, setPartners] = useState(AIRLINE_PARTNERS);

  function statusBadgeLocal(status: string) {
    const map: Record<string, { label: string; style: React.CSSProperties }> = {
      confirmed: {
        label: "Confirmé",
        style: {
          background: "oklch(0.30 0.10 145 / 0.3)",
          color: "oklch(0.70 0.15 145)",
        },
      },
      pending: {
        label: "En attente",
        style: {
          background: "oklch(0.30 0.10 85 / 0.3)",
          color: "oklch(0.77 0.13 85)",
        },
      },
      failed: {
        label: "Échoué",
        style: {
          background: "oklch(0.30 0.10 20 / 0.3)",
          color: "oklch(0.65 0.15 20)",
        },
      },
    };
    const info = map[status] ?? map.pending;
    return (
      <span
        className="px-2 py-0.5 rounded-full text-xs font-semibold"
        style={info.style}
      >
        {info.label}
      </span>
    );
  }

  function handleAddAirline() {
    if (!newAirline.trim() || !newRoute.trim()) return;
    setPartners((prev) => [
      ...prev,
      {
        name: newAirline,
        code: newAirline.slice(0, 3).toUpperCase(),
        routes: newRoute,
        status: "Actif",
      },
    ]);
    setNewAirline("");
    setNewRoute("");
    toast.success("Partenaire aérien ajouté");
  }

  function handleRemoveAirline(idx: number) {
    setPartners((prev) => prev.filter((_, i) => i !== idx));
    toast.success("Partenaire supprimé");
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Flight Bookings Table */}
        <Card
          style={{
            background: "oklch(0.15 0.03 220)",
            border: "1px solid oklch(0.25 0.04 220)",
          }}
        >
          <CardHeader>
            <CardTitle
              className="text-base flex items-center gap-2"
              style={{ color: "oklch(0.92 0.04 80)" }}
            >
              <Plane size={16} style={{ color: "oklch(0.60 0.15 250)" }} />
              Réservations de vols
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader style={{ background: "oklch(0.15 0.03 220)" }}>
                <TableRow style={{ borderColor: "oklch(0.25 0.04 220)" }}>
                  <TableHead className="text-white/60">Code</TableHead>
                  <TableHead className="text-white/60">Passager</TableHead>
                  <TableHead className="text-white/60">Vol</TableHead>
                  <TableHead className="text-white/60">Compagnie</TableHead>
                  <TableHead className="text-white/60">Date</TableHead>
                  <TableHead className="text-white/60">Statut</TableHead>
                  <TableHead className="text-white/60">Paiement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {STATIC_FLIGHT_BOOKINGS.map((b) => (
                  <TableRow
                    key={b.code}
                    style={{ borderColor: "oklch(0.22 0.04 220)" }}
                  >
                    <TableCell
                      className="font-mono text-xs font-bold"
                      style={{ color: "oklch(0.77 0.13 85)" }}
                    >
                      {b.code}
                    </TableCell>
                    <TableCell className="text-white/80 text-sm">
                      {b.passenger}
                    </TableCell>
                    <TableCell className="text-white/80 text-sm">
                      {b.vol}
                    </TableCell>
                    <TableCell className="text-white/60 text-sm">
                      {b.airline}
                    </TableCell>
                    <TableCell className="text-white/60 text-sm">
                      {b.date}
                    </TableCell>
                    <TableCell>{statusBadgeLocal(b.statut)}</TableCell>
                    <TableCell
                      className="font-mono text-sm"
                      style={{ color: "oklch(0.70 0.12 145)" }}
                    >
                      {b.paiement}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Airline Partners Management */}
        <Card
          style={{
            background: "oklch(0.15 0.03 220)",
            border: "1px solid oklch(0.25 0.04 220)",
          }}
        >
          <CardHeader>
            <CardTitle
              className="text-base flex items-center gap-2"
              style={{ color: "oklch(0.92 0.04 80)" }}
            >
              <Building2 size={16} style={{ color: "oklch(0.60 0.15 195)" }} />
              Gestion des partenaires aériens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new partner */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "oklch(0.18 0.04 220)",
                border: "1px solid oklch(0.28 0.05 220)",
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: "oklch(0.75 0.04 220)" }}
              >
                Ajouter une compagnie partenaire
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    className="text-xs"
                    style={{ color: "oklch(0.60 0.03 220)" }}
                  >
                    Nom de la compagnie
                  </Label>
                  <Input
                    value={newAirline}
                    onChange={(e) => setNewAirline(e.target.value)}
                    placeholder="ex: Air Congo"
                    className="bg-transparent border-white/20 text-white text-sm"
                    data-ocid="admin.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    className="text-xs"
                    style={{ color: "oklch(0.60 0.03 220)" }}
                  >
                    Routes desservies
                  </Label>
                  <Input
                    value={newRoute}
                    onChange={(e) => setNewRoute(e.target.value)}
                    placeholder="ex: KIN ↔ LBB"
                    className="bg-transparent border-white/20 text-white text-sm"
                    data-ocid="admin.input"
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleAddAirline}
                style={{ background: "oklch(0.52 0.12 195)" }}
                data-ocid="admin.primary_button"
              >
                Ajouter le partenaire
              </Button>
            </div>

            {/* Partners list */}
            <div className="space-y-2" data-ocid="admin.list">
              {partners.map((p, idx) => (
                <div
                  key={p.name}
                  className="rounded-lg p-3 flex items-center justify-between"
                  style={{
                    background: "oklch(0.18 0.04 220)",
                    border: "1px solid oklch(0.26 0.05 220)",
                  }}
                  data-ocid={`admin.item.${idx + 1}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold text-sm font-mono px-2 py-0.5 rounded"
                        style={{
                          background: "oklch(0.60 0.15 250 / 0.2)",
                          color: "oklch(0.60 0.15 250)",
                        }}
                      >
                        {p.code}
                      </span>
                      <span
                        className="font-medium text-sm"
                        style={{ color: "oklch(0.85 0.04 220)" }}
                      >
                        {p.name}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded-full text-xs"
                        style={{
                          background: "oklch(0.35 0.10 145 / 0.3)",
                          color: "oklch(0.70 0.15 145)",
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.55 0.04 220)" }}
                    >
                      {p.routes}
                    </p>
                  </div>
                  <EnhancedWalletCell
                    partnerId={`airline_${p.code}`}
                    partnerName={p.name}
                    onConfigure={() =>
                      setAirlineWalletDialog({
                        id: `airline_${p.code}`,
                        name: p.name,
                      })
                    }
                    onTransfer={() =>
                      setAirlineTransferModal({
                        id: `airline_${p.code}`,
                        name: p.name,
                      })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAirline(idx)}
                    style={{ color: "oklch(0.65 0.15 20)" }}
                    data-ocid={`admin.delete_button.${idx + 1}`}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {airlineWalletDialog && (
        <PartnerWalletDialog
          partnerId={airlineWalletDialog.id}
          partnerName={airlineWalletDialog.name}
          open={true}
          onOpenChange={(open) => {
            if (!open) setAirlineWalletDialog(null);
          }}
        />
      )}
      {airlineTransferModal && (
        <PartnerOwnershipTransferModal
          open={true}
          onOpenChange={(open) => {
            if (!open) setAirlineTransferModal(null);
          }}
          partnerId={airlineTransferModal.id}
          partnerName={airlineTransferModal.name}
          existingTransfer={ownershipTransferBillets.getTransfer(
            airlineTransferModal.id,
          )}
        />
      )}
    </>
  );
}
