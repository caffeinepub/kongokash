import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Clock,
  List,
  RefreshCw,
  Repeat2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useTransactions } from "../hooks/useQueries";
import { HistoriqueTab } from "./HistoriqueTab";

const TYPE_FILTERS = [
  { key: "all", label: "Tous", icon: List },
  { key: "deposit", label: "Dépôts", icon: ArrowDownLeft },
  { key: "withdrawal", label: "Retraits", icon: ArrowUpRight },
  { key: "buy", label: "Échanges", icon: Repeat2 },
  { key: "transfer", label: "P2P", icon: Users },
  { key: "staking", label: "Réservations", icon: BookOpen },
];

const STATUS_FILTERS = [
  { key: "all", label: "Tous" },
  { key: "completed", label: "Confirmé" },
  { key: "pending", label: "En attente" },
  { key: "failed", label: "Échoué" },
];

const TX_LABELS: Record<string, string> = {
  buy: "Achat",
  sell: "Vente",
  deposit: "Dépôt",
  withdrawal: "Retrait",
  transfer: "Transfert P2P",
  staking: "Staking / Réservation",
  reward: "Récompense",
};

const TX_SUBTITLES: Record<string, string> = {
  buy: "Échange crypto",
  sell: "Vente crypto",
  deposit: "Mobile Money / Banque",
  withdrawal: "Retrait Mobile Money",
  transfer: "Trade P2P escrow",
  staking: "OKP bloqués",
  reward: "Récompense communauté",
};

function txIcon(txType: string) {
  const cls = "text-white";
  if (["buy", "deposit", "reward"].includes(txType))
    return {
      el: <ArrowDownLeft size={15} className={cls} />,
      bg: "oklch(0.42 0.13 160)",
    };
  if (txType === "withdrawal")
    return {
      el: <ArrowUpRight size={15} className={cls} />,
      bg: "oklch(0.45 0.18 27)",
    };
  if (txType === "buy" || txType === "sell")
    return {
      el: <Repeat2 size={15} className={cls} />,
      bg: "oklch(0.45 0.15 250)",
    };
  if (txType === "transfer")
    return {
      el: <Users size={15} className={cls} />,
      bg: "oklch(0.45 0.14 310)",
    };
  return {
    el: <Clock size={15} className={cls} />,
    bg: "oklch(0.55 0.14 75)",
  };
}

function statusBadge(status: string) {
  if (status === "completed" || status === "confirmed")
    return (
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={{
          background: "oklch(0.42 0.13 160 / 0.2)",
          color: "oklch(0.72 0.13 160)",
        }}
      >
        Confirmé
      </span>
    );
  if (status === "pending")
    return (
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={{
          background: "oklch(0.65 0.16 75 / 0.2)",
          color: "oklch(0.75 0.14 75)",
        }}
      >
        En attente
      </span>
    );
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{
        background: "oklch(0.45 0.18 27 / 0.2)",
        color: "oklch(0.70 0.16 27)",
      }}
    >
      Échoué
    </span>
  );
}

function formatDate(ts: bigint) {
  const d = new Date(Number(ts) / 1_000_000);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const MOCK_TXS = [
  {
    id: "t1",
    txType: "deposit",
    status: "completed",
    fiatAmount: 50000,
    fiatCurrency: "CDF",
    asset: "CDF",
    timestamp: BigInt(Date.now() * 1_000_000 - 86400000 * 1_000_000),
  },
  {
    id: "t2",
    txType: "buy",
    status: "completed",
    fiatAmount: 120000,
    fiatCurrency: "CDF",
    asset: "BTC",
    timestamp: BigInt(Date.now() * 1_000_000 - 2 * 86400000 * 1_000_000),
  },
  {
    id: "t3",
    txType: "transfer",
    status: "completed",
    fiatAmount: 85000,
    fiatCurrency: "CDF",
    asset: "USDT",
    timestamp: BigInt(Date.now() * 1_000_000 - 3 * 86400000 * 1_000_000),
  },
  {
    id: "t4",
    txType: "withdrawal",
    status: "pending",
    fiatAmount: 30000,
    fiatCurrency: "CDF",
    asset: "CDF",
    timestamp: BigInt(Date.now() * 1_000_000 - 4 * 86400000 * 1_000_000),
  },
  {
    id: "t5",
    txType: "staking",
    status: "completed",
    fiatAmount: 45000,
    fiatCurrency: "CDF",
    asset: "OKP",
    timestamp: BigInt(Date.now() * 1_000_000 - 5 * 86400000 * 1_000_000),
  },
  {
    id: "t6",
    txType: "buy",
    status: "completed",
    fiatAmount: 200000,
    fiatCurrency: "CDF",
    asset: "ETH",
    timestamp: BigInt(Date.now() * 1_000_000 - 6 * 86400000 * 1_000_000),
  },
];

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: transactions, isLoading } = useTransactions();

  const allTxs = useMemo(() => {
    const real = (transactions ?? []).map((tx) => ({
      id: tx.id.toString(),
      txType: tx.txType,
      status: tx.status,
      fiatAmount: tx.fiatAmount,
      fiatCurrency: tx.fiatCurrency,
      asset: tx.asset,
      timestamp: tx.timestamp,
    }));
    return real.length > 0 ? real : MOCK_TXS;
  }, [transactions]);

  const filtered = useMemo(() => {
    return allTxs.filter((tx) => {
      const typeMatch =
        typeFilter === "all" ||
        tx.txType === typeFilter ||
        (typeFilter === "buy" && tx.txType === "sell");
      const statusMatch =
        statusFilter === "all" ||
        tx.status === statusFilter ||
        (statusFilter === "completed" && tx.status === "confirmed");
      return typeMatch && statusMatch;
    });
  }, [allTxs, typeFilter, statusFilter]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">
            Transactions
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Historique complet de toutes vos opérations financières.
          </p>
        </div>
        <button
          type="button"
          className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          data-ocid="transactions.secondary_button"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <Tabs defaultValue="all" data-ocid="transactions.tab">
        <TabsList className="mb-0 bg-slate-800 border border-slate-700">
          <TabsTrigger
            value="all"
            className="flex items-center gap-1.5 data-[state=active]:bg-slate-700"
            data-ocid="transactions.tab"
          >
            <List size={13} /> Toutes
          </TabsTrigger>
          <TabsTrigger
            value="reservations"
            className="flex items-center gap-1.5 data-[state=active]:bg-slate-700"
            data-ocid="transactions.tab"
          >
            <BookOpen size={13} /> Réservations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          {/* Sticky filter bars */}
          <div
            className="space-y-2 sticky top-0 z-10 py-2"
            style={{ background: "oklch(0.12 0.02 250)" }}
          >
            {/* Type filter pills */}
            <div className="flex gap-2 flex-wrap">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setTypeFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    typeFilter === f.key
                      ? "text-white"
                      : "border border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                  style={
                    typeFilter === f.key
                      ? {
                          background: "oklch(0.42 0.13 160)",
                          boxShadow: "0 2px 8px oklch(0.42 0.13 160 / 0.3)",
                        }
                      : {}
                  }
                  data-ocid="transactions.tab"
                >
                  <f.icon size={12} />
                  {f.label}
                </button>
              ))}
            </div>
            {/* Status filter pills */}
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    statusFilter === f.key
                      ? "text-white"
                      : "border border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                  style={
                    statusFilter === f.key
                      ? {
                          background:
                            f.key === "completed"
                              ? "oklch(0.42 0.13 160)"
                              : f.key === "pending"
                                ? "oklch(0.55 0.14 75)"
                                : f.key === "failed"
                                  ? "oklch(0.45 0.18 27)"
                                  : "oklch(0.42 0.13 160)",
                          boxShadow: "0 2px 8px oklch(0.42 0.13 160 / 0.2)",
                        }
                      : {}
                  }
                  data-ocid="transactions.tab"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction list */}
          <Card className="border-slate-700/60 bg-slate-900">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div
                  className="py-16 text-center"
                  data-ocid="transactions.empty_state"
                >
                  <p className="text-slate-500 text-sm">
                    Aucune transaction pour ces filtres.
                  </p>
                </div>
              ) : (
                <div
                  className="divide-y divide-slate-800"
                  data-ocid="transactions.list"
                >
                  {filtered.map((tx, i) => {
                    const icon = txIcon(tx.txType);
                    const isPositive = [
                      "buy",
                      "deposit",
                      "reward",
                      "transfer",
                    ].includes(tx.txType);
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-800/50 transition-colors"
                        data-ocid={`transactions.item.${i + 1}`}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: icon.bg }}
                        >
                          {icon.el}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {TX_LABELS[tx.txType] ?? tx.txType}
                          </p>
                          <p className="text-xs text-slate-500">
                            {TX_SUBTITLES[tx.txType] ?? ""}
                            {" · "}
                            {formatDate(tx.timestamp)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className={`text-sm font-bold ${
                              isPositive ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isPositive ? "+" : "-"}
                            {tx.fiatAmount.toLocaleString("fr-FR")}{" "}
                            {tx.fiatCurrency}
                          </p>
                          <div className="mt-0.5">{statusBadge(tx.status)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations" className="mt-4">
          <HistoriqueTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
