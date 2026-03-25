import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight, Clock, History } from "lucide-react";
import { useState } from "react";
import type { Transaction } from "../backend";
import { useTransactions } from "../hooks/useQueries";

const TX_LABELS: Record<string, string> = {
  buy: "Achat",
  sell: "Vente",
  deposit: "Dépôt",
  withdrawal: "Retrait",
  transfer: "Transfert",
  staking: "Staking",
  reward: "Récompense",
};

const FILTER_TABS = [
  { value: "all", label: "Tous" },
  { value: "buy", label: "Achat" },
  { value: "sell", label: "Vente" },
  { value: "deposit", label: "Dépôt" },
  { value: "withdrawal", label: "Retrait" },
  { value: "transfer", label: "Transfert" },
  { value: "staking", label: "Staking" },
  { value: "reward", label: "Récompense" },
];

function txIcon(txType: string) {
  if (["buy", "deposit", "reward"].includes(txType)) {
    return (
      <ArrowDownLeft size={15} style={{ color: "oklch(0.52 0.12 160)" }} />
    );
  }
  if (["sell", "withdrawal", "transfer"].includes(txType)) {
    return <ArrowUpRight size={15} style={{ color: "oklch(0.67 0.15 55)" }} />;
  }
  return <Clock size={15} style={{ color: "oklch(0.77 0.13 85)" }} />;
}

function txIconBg(txType: string): string {
  if (["buy", "deposit", "reward"].includes(txType))
    return "oklch(0.52 0.12 160 / 0.12)";
  if (["sell", "withdrawal", "transfer"].includes(txType))
    return "oklch(0.67 0.15 55 / 0.12)";
  return "oklch(0.77 0.13 85 / 0.12)";
}

function statusBadge(status: string) {
  if (status === "completed")
    return (
      <Badge
        className="text-xs px-2 py-0.5"
        style={{ background: "oklch(0.52 0.12 160)", color: "white" }}
      >
        Complété
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge
        className="text-xs px-2 py-0.5"
        style={{
          background: "oklch(0.77 0.13 85)",
          color: "oklch(0.20 0.01 250)",
        }}
      >
        En attente
      </Badge>
    );
  return (
    <Badge
      className="text-xs px-2 py-0.5"
      style={{ background: "oklch(0.55 0.22 27)", color: "white" }}
    >
      Échoué
    </Badge>
  );
}

function formatTimestamp(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function TxRow({ tx, index }: { tx: Transaction; index: number }) {
  return (
    <div
      className="flex items-center gap-3 py-3 px-4 rounded-xl transition-colors hover:bg-muted/40"
      data-ocid={`transactions.item.${index}`}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: txIconBg(tx.txType) }}
      >
        {txIcon(tx.txType)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {TX_LABELS[tx.txType] ?? tx.txType} {tx.asset}
          </span>
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {tx.paymentMethod && <span className="mr-2">{tx.paymentMethod}</span>}
          {formatTimestamp(tx.timestamp)}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        {tx.cryptoAmount > 0 && (
          <div className="text-sm font-mono font-medium">
            {tx.cryptoAmount.toFixed(6)} {tx.asset}
          </div>
        )}
        {tx.fiatAmount > 0 && (
          <div className="text-xs text-muted-foreground font-mono">
            {new Intl.NumberFormat("fr-FR", {
              maximumFractionDigits: 2,
            }).format(tx.fiatAmount)}{" "}
            {tx.fiatCurrency}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 ml-2">{statusBadge(tx.status)}</div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <Skeleton className="w-9 h-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

export default function TransactionHistory() {
  const { data: transactions, isLoading } = useTransactions();
  const [filter, setFilter] = useState("all");

  const filtered = (transactions ?? [])
    .filter((tx) => filter === "all" || tx.txType === filter)
    .slice(0, 50);

  return (
    <Card className="shadow-card" data-ocid="transactions.card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History size={18} style={{ color: "oklch(0.52 0.12 160)" }} />
          Historique des Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Filter tabs */}
        <div className="px-6 pb-3 overflow-x-auto">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList
              className="flex gap-1 h-auto p-1 flex-wrap bg-muted/50"
              data-ocid="transactions.tab"
            >
              {FILTER_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs px-3 py-1.5 data-[state=active]:text-white"
                  style={{
                    ...(filter === tab.value
                      ? { background: "oklch(0.52 0.12 160)" }
                      : {}),
                  }}
                  data-ocid="transactions.tab"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="divide-y divide-border/50">
          {isLoading ? (
            <div data-ocid="transactions.loading_state">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-muted-foreground"
              data-ocid="transactions.empty_state"
            >
              <History size={40} className="mb-3 opacity-25" />
              <p className="text-sm font-medium">
                Aucune transaction pour le moment
              </p>
              <p className="text-xs mt-1 opacity-70">
                Vos transactions apparaîtront ici
              </p>
            </div>
          ) : (
            filtered.map((tx, i) => (
              <TxRow key={tx.id.toString()} tx={tx} index={i + 1} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
