import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  RefreshCw,
  Repeat2,
  Send,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

import {
  useExchangeRates,
  usePortfolioValue,
  useProfile,
  useTransactions,
} from "../hooks/useQueries";
import OnboardingFlow from "./OnboardingFlow";
import { StatusBadge } from "./ui/StatusBadge";

function formatCDF(n: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n)} FC`;
}
function formatUSD(n: number) {
  return `$${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n)}`;
}

const TX_TYPE_LABELS: Record<string, string> = {
  buy: "Achat",
  sell: "Vente",
  deposit: "Dépôt",
  withdrawal: "Retrait",
  transfer: "Transfert",
  staking: "Staking",
  reward: "Récompense",
};

const TX_STATUS_MAP: Record<
  string,
  "success" | "pending" | "error" | "info" | "cancelled"
> = {
  completed: "success",
  confirmed: "success",
  pending: "pending",
  failed: "error",
  cancelled: "cancelled",
};

const MOCK_ACTIVITY = [
  {
    id: "m1",
    icon: "↓",
    iconBg: "bg-emerald-900/40",
    iconColor: "text-emerald-400",
    title: "Dépôt Airtel Money",
    subtitle: "28 Mar 2026",
    amount: "+50 000 CDF",
    positive: true,
    status: "success" as const,
    statusLabel: "Confirmé",
  },
  {
    id: "m2",
    icon: "₿",
    iconBg: "bg-amber-900/40",
    iconColor: "text-amber-400",
    title: "Achat BTC",
    subtitle: "27 Mar 2026",
    amount: "-120 000 CDF",
    positive: false,
    status: "success" as const,
    statusLabel: "Confirmé",
  },
  {
    id: "m3",
    icon: "₮",
    iconBg: "bg-blue-900/40",
    iconColor: "text-blue-400",
    title: "Trade P2P USDT",
    subtitle: "26 Mar 2026",
    amount: "+85 000 CDF",
    positive: true,
    status: "success" as const,
    statusLabel: "Confirmé",
  },
  {
    id: "m4",
    icon: "↑",
    iconBg: "bg-rose-900/40",
    iconColor: "text-rose-400",
    title: "Retrait M-Pesa",
    subtitle: "25 Mar 2026",
    amount: "-30 000 CDF",
    positive: false,
    status: "pending" as const,
    statusLabel: "En attente",
  },
  {
    id: "m5",
    icon: "🏨",
    iconBg: "bg-purple-900/40",
    iconColor: "text-purple-400",
    title: "Réservation Hôtel Okapi",
    subtitle: "24 Mar 2026",
    amount: "-45 000 CDF",
    positive: false,
    status: "success" as const,
    statusLabel: "Confirmé",
  },
];

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
}

export default function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { identity } = useInternetIdentity();

  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioValue();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: profile } = useProfile();

  const { data: rates } = useExchangeRates();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem("kk_onboarding_dismissed") === "1",
  );

  const totalCDF = portfolio?.totalCDF ?? 0;
  const totalUSD = portfolio?.totalUSD ?? 0;

  const recentTx = (transactions ?? []).slice(0, 5);

  const handleDismissOnboarding = () => {
    localStorage.setItem("kk_onboarding_dismissed", "1");
    setOnboardingDismissed(true);
  };

  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 8)}...`
    : "";

  const quickActions = [
    {
      icon: ArrowDownLeft,
      label: "Déposer",
      tab: "wallet",
      gradient: "from-emerald-600 to-emerald-700",
      shadow: "shadow-emerald-900/40",
    },
    {
      icon: Send,
      label: "Envoyer",
      tab: "wallet",
      gradient: "from-blue-600 to-blue-700",
      shadow: "shadow-blue-900/40",
    },
    {
      icon: ArrowUpRight,
      label: "Recevoir",
      tab: "wallet",
      gradient: "from-teal-600 to-teal-700",
      shadow: "shadow-teal-900/40",
    },
    {
      icon: Repeat2,
      label: "Échanger",
      tab: "wallet",
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-900/40",
    },
  ];

  const rateMap: Record<string, number> = {};
  for (const r of rates ?? []) {
    const [base] = r.pair.split("/");
    rateMap[base.toLowerCase()] = r.buyRate;
  }

  const marketRates = [
    {
      symbol: "BTC",
      icon: "₿",
      price: rateMap.btc ? Math.round(rateMap.btc) : 162_000_000,
      change: "+1.8%",
      up: true,
    },
    {
      symbol: "USDT",
      icon: "₮",
      price: rateMap.usdt ? Math.round(rateMap.usdt) : 2850,
      change: "+0.2%",
      up: true,
    },
    {
      symbol: "ETH",
      icon: "⟠",
      price: rateMap.eth ? Math.round(rateMap.eth) : 8_400_000,
      change: "-0.5%",
      up: false,
    },
    {
      symbol: "OKP",
      icon: "🦌",
      price: rateMap.okp ? Math.round(rateMap.okp) : 85,
      change: "+5.2%",
      up: true,
    },
    {
      symbol: "ICP",
      icon: "∞",
      price: rateMap.icp ? Math.round(rateMap.icp) : 42_000,
      change: "+3.1%",
      up: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Welcome bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display font-bold text-2xl text-white">
            Bonjour, {profile?.displayName || principalShort || "Bienvenue"} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            KongoKash · Tableau de bord
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.reload()}
          className="text-slate-400 hover:text-white"
          data-ocid="dashboard.secondary_button"
        >
          <RefreshCw size={14} className="mr-1.5" /> Actualiser
        </Button>
      </motion.div>

      {/* Onboarding flow */}
      {!onboardingDismissed && (
        <OnboardingFlow
          onNavigateWallet={() => onNavigate("wallet")}
          onNavigateP2P={() => onNavigate("p2p")}
          onDismiss={handleDismissOnboarding}
        />
      )}

      {/* Hero balance card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card
          className="border-0 overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.30 0.10 195) 0%, oklch(0.22 0.08 185) 50%, oklch(0.18 0.06 220) 100%)",
            boxShadow: "0 8px 32px oklch(0.30 0.10 195 / 0.4)",
          }}
        >
          {/* Decorative circle */}
          <div
            className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10"
            style={{ background: "oklch(0.85 0.15 75)" }}
          />
          <div
            className="absolute -right-4 top-8 w-24 h-24 rounded-full opacity-5"
            style={{ background: "oklch(0.85 0.15 75)" }}
          />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-teal-200/70 text-sm font-medium">
                    Solde Total Estimé
                  </p>
                  <button
                    type="button"
                    onClick={() => setBalanceVisible((v) => !v)}
                    className="text-teal-200/50 hover:text-teal-200 transition-colors"
                    data-ocid="dashboard.toggle"
                  >
                    {balanceVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                {portfolioLoading ? (
                  <Skeleton className="h-10 w-52 bg-white/10" />
                ) : (
                  <p className="font-display font-bold text-4xl text-white tracking-tight">
                    {balanceVisible ? formatCDF(totalCDF) : "••••••• FC"}
                  </p>
                )}
                {portfolioLoading ? (
                  <Skeleton className="h-4 w-28 mt-2 bg-white/10" />
                ) : (
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-teal-100/60 text-sm">
                      {formatUSD(totalUSD)}
                    </p>
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300">
                      <TrendingUp size={10} />
                      +2.4% aujourd'hui
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 4 Quick Action buttons */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate(action.tab)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gradient-to-b ${action.gradient} shadow-lg ${action.shadow} hover:brightness-110 transition-all`}
                  data-ocid={`dashboard.primary_button.${i + 1}`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <action.icon size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Market mini-widget */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Marché en direct
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("p2p")}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
            data-ocid="dashboard.link"
          >
            Trader →
          </button>
        </div>
        <ScrollArea>
          <div className="flex gap-3 pb-2">
            {marketRates.map((r) => (
              <button
                key={r.symbol}
                type="button"
                onClick={() => onNavigate("wallet")}
                className="flex-shrink-0 flex flex-col gap-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:border-slate-600 hover:bg-slate-800 transition-all w-32"
                data-ocid="dashboard.secondary_button"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{r.icon}</span>
                  <span
                    className={`text-xs font-semibold ${
                      r.up ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {r.change}
                  </span>
                </div>
                <p className="text-xs font-bold text-white">{r.symbol}</p>
                <p className="text-xs text-slate-400 font-mono">
                  {r.price.toLocaleString("fr-FR")} FC
                </p>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Activité Récente
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("transactions")}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
            data-ocid="dashboard.link"
          >
            Voir tout →
          </button>
        </div>
        <Card className="border-slate-700/60 bg-slate-900">
          <CardContent className="p-0">
            {txLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recentTx.length > 0 ? (
              <div
                className="divide-y divide-slate-800"
                data-ocid="dashboard.list"
              >
                {recentTx.map((tx, i) => (
                  <div
                    key={tx.id.toString()}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/50 transition-colors"
                    data-ocid={`dashboard.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${
                          tx.txType === "buy" || tx.txType === "deposit"
                            ? "bg-emerald-900/40 text-emerald-400"
                            : "bg-rose-900/40 text-rose-400"
                        }`}
                      >
                        {tx.txType === "buy" || tx.txType === "deposit"
                          ? "↓"
                          : "↑"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {TX_TYPE_LABELS[tx.txType] ?? tx.txType}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(
                            Number(tx.timestamp) / 1_000_000,
                          ).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          tx.txType === "buy" || tx.txType === "deposit"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {tx.txType === "buy" || tx.txType === "deposit"
                          ? "+"
                          : "-"}
                        {tx.fiatAmount.toLocaleString("fr-FR")}{" "}
                        {tx.fiatCurrency}
                      </p>
                      <StatusBadge
                        status={TX_STATUS_MAP[tx.status] ?? "info"}
                        label={
                          tx.status === "completed"
                            ? "Confirmé"
                            : tx.status === "pending"
                              ? "En attente"
                              : tx.status
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="divide-y divide-slate-800"
                data-ocid="dashboard.list"
              >
                {MOCK_ACTIVITY.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/50 transition-colors"
                    data-ocid={`dashboard.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${item.iconBg} ${item.iconColor}`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p
                        className={`text-sm font-bold ${
                          item.positive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {item.amount}
                      </p>
                      <StatusBadge
                        status={item.status}
                        label={item.statusLabel}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
