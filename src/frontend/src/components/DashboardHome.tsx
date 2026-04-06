import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Repeat2,
  Send,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useNonCustodialWallet } from "../hooks/useNonCustodialWallet";
import { useProfile } from "../hooks/useQueries";
import { useWalletContext } from "../hooks/useWalletContext";
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
  deposit: "Depot",
  withdrawal: "Retrait",
  transfer: "Transfert",
  staking: "Staking",
  reward: "Recompense",
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

function AddressQRVisual({ address }: { address: string }) {
  const size = 7;
  const cells: Array<{ id: string; filled: boolean }> = [];
  for (let i = 0; i < size * size; i++) {
    const charCode = address.charCodeAt(i % address.length);
    cells.push({ id: `c${i}`, filled: (charCode + i * 7) % 3 !== 0 });
  }
  return (
    <div
      className="inline-grid gap-0.5 p-3 rounded-xl bg-white mx-auto"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {cells.map((cell) => (
        <div
          key={cell.id}
          className="w-5 h-5 rounded-sm"
          style={{ background: cell.filled ? "#0f172a" : "#fff" }}
        />
      ))}
    </div>
  );
}

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
}

export default function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { identity } = useInternetIdentity();
  const { totalCDF, totalUSD, transactions, rates, isLoading, refresh } =
    useWalletContext();
  const { data: profile } = useProfile();
  const { walletAddress } = useNonCustodialWallet();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem("kk_onboarding_dismissed") === "1",
  );
  const [welcomeBannerDismissed, setWelcomeBannerDismissed] = useState(
    () => localStorage.getItem("kk_welcome_banner_dismissed") === "1",
  );
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const hasWallet = !!walletAddress;
  const recentTx = (transactions ?? []).slice(0, 5);

  const handleDismissOnboarding = () => {
    localStorage.setItem("kk_onboarding_dismissed", "1");
    setOnboardingDismissed(true);
  };

  const handleDismissWelcomeBanner = () => {
    localStorage.setItem("kk_welcome_banner_dismissed", "1");
    setWelcomeBannerDismissed(true);
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };

  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 8)}...`
    : "";

  const contextualSubtitle =
    !onboardingDismissed && totalCDF === 0
      ? "Commencez par creer votre porte-monnaie"
      : "KongoKash - Tableau de bord";

  const showWelcomeBanner =
    !welcomeBannerDismissed && totalCDF === 0 && !hasWallet;

  const quickActions = [
    {
      icon: ArrowDownLeft,
      label: "Recevoir",
      sublabel: "Mobile Money",
      gradient: "from-emerald-600 to-emerald-700",
      shadow: "shadow-emerald-900/40",
      onClick: () => onNavigate("wallet:deposit"),
    },
    {
      icon: Send,
      label: "Envoyer",
      sublabel: "Transfert",
      gradient: "from-blue-600 to-blue-700",
      shadow: "shadow-blue-900/40",
      onClick: () => onNavigate("wallet:external"),
    },
    {
      icon: ArrowUpRight,
      label: "Mon adresse",
      sublabel: "Partager QR",
      gradient: "from-teal-600 to-teal-700",
      shadow: "shadow-teal-900/40",
      onClick: () => setReceiveOpen(true),
    },
    {
      icon: Repeat2,
      label: "Acheter",
      sublabel: "Instantane",
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-900/40",
      onClick: () => onNavigate("p2p:direct"),
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
      icon: "\u20bf",
      price: rateMap.btc ? Math.round(rateMap.btc) : 162_000_000,
      change: "+1.8%",
      up: true,
    },
    {
      symbol: "USDT",
      icon: "\u20ae",
      price: rateMap.usdt ? Math.round(rateMap.usdt) : 2850,
      change: "+0.2%",
      up: true,
    },
    {
      symbol: "ETH",
      icon: "\u27a0",
      price: rateMap.eth ? Math.round(rateMap.eth) : 8_400_000,
      change: "-0.5%",
      up: false,
    },
    {
      symbol: "OKP",
      icon: "\ud83e\udead",
      price: rateMap.okp ? Math.round(rateMap.okp) : 85,
      change: "+5.2%",
      up: true,
    },
    {
      symbol: "ICP",
      icon: "\u221e",
      price: rateMap.icp ? Math.round(rateMap.icp) : 42_000,
      change: "+3.1%",
      up: true,
    },
  ];

  const displayAddress =
    walletAddress ?? identity?.getPrincipal().toString() ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display font-bold text-2xl text-white">
            Bonjour, {profile?.displayName || principalShort || "Bienvenue"}{" "}
            &#x1F44B;
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{contextualSubtitle}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          className="text-slate-400 hover:text-white"
          data-ocid="dashboard.secondary_button"
        >
          <RefreshCw size={14} className="mr-1.5" /> Actualiser
        </Button>
      </motion.div>

      {/* Welcome Banner */}
      <AnimatePresence>
        {showWelcomeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-2xl overflow-hidden p-7"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.68 0.14 75) 0%, oklch(0.77 0.13 85) 50%, oklch(0.72 0.16 65) 100%)",
              boxShadow: "0 8px 32px oklch(0.77 0.13 85 / 0.35)",
            }}
            data-ocid="dashboard.panel"
          >
            <button
              type="button"
              onClick={handleDismissWelcomeBanner}
              className="absolute top-3 right-3 p-1.5 rounded-full transition-colors hover:bg-black/15"
              style={{ color: "oklch(0.25 0.05 80)" }}
              data-ocid="dashboard.close_button"
            >
              <X size={16} />
            </button>
            <div className="max-w-lg">
              <h2
                className="font-display font-bold text-2xl mb-2 leading-tight"
                style={{ color: "oklch(0.18 0.04 80)" }}
              >
                Bienvenue sur KongoKash &#x1F30D;
              </h2>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "oklch(0.28 0.06 80)" }}
              >
                Reseau de paiement P2P africain - envoyez de l&apos;argent entre
                pays africains sans banque, protege par smart contract.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate("wallet")}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110 shadow-lg"
                  style={{ background: "oklch(0.18 0.04 210)", color: "white" }}
                  data-ocid="dashboard.primary_button"
                >
                  Creer mon porte-monnaie
                  <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleDismissWelcomeBanner}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all hover:bg-black/10"
                  style={{ color: "oklch(0.28 0.06 80)" }}
                  data-ocid="dashboard.secondary_button"
                >
                  Explorer d&apos;abord
                </button>
              </div>
              <p
                className="mt-4 text-xs font-medium"
                style={{ color: "oklch(0.32 0.06 80)" }}
              >
                &#x1F512; Vos fonds sous votre controle - KongoKash n&apos;y a
                jamais acces
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding */}
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
                    Solde Total Estime
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
                {isLoading ? (
                  <Skeleton className="h-10 w-52 bg-white/10" />
                ) : (
                  <p className="font-display font-bold text-4xl text-white tracking-tight">
                    {balanceVisible ? formatCDF(totalCDF) : "******* FC"}
                  </p>
                )}
                {isLoading ? (
                  <Skeleton className="h-4 w-28 mt-2 bg-white/10" />
                ) : (
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-teal-100/60 text-sm">
                      {formatUSD(totalUSD)}
                    </p>
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300">
                      <TrendingUp size={10} />
                      +2.4% aujourd&apos;hui
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={action.onClick}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gradient-to-b ${action.gradient} shadow-lg ${action.shadow} hover:brightness-110 transition-all`}
                  data-ocid={`dashboard.primary_button.${i + 1}`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <action.icon size={16} className="text-white" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-semibold text-white block leading-tight">
                      {action.label}
                    </span>
                    <span className="text-[10px] text-white/60 block leading-tight mt-0.5">
                      {action.sublabel}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="flex justify-center mt-3">
              <button
                type="button"
                onClick={() => onNavigate("p2p:p2p")}
                className="text-xs text-teal-400/70 hover:text-teal-300 transition-colors flex items-center gap-1"
                data-ocid="dashboard.link"
              >
                Echanger entre personnes &rarr;
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Market widget */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Marche en direct
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("p2p")}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
            data-ocid="dashboard.link"
          >
            Trader &rarr;
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
                    className={`text-xs font-semibold ${r.up ? "text-emerald-400" : "text-rose-400"}`}
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
            Activite Recente
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("transactions")}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
            data-ocid="dashboard.link"
          >
            Voir tout &rarr;
          </button>
        </div>
        <Card className="border-slate-700/60 bg-slate-900">
          <CardContent className="p-0">
            {isLoading ? (
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
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${tx.txType === "buy" || tx.txType === "deposit" ? "bg-emerald-900/40 text-emerald-400" : "bg-rose-900/40 text-rose-400"}`}
                      >
                        {tx.txType === "buy" || tx.txType === "deposit"
                          ? "\u2193"
                          : "\u2191"}
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
                        className={`text-sm font-bold ${tx.txType === "buy" || tx.txType === "deposit" ? "text-emerald-400" : "text-rose-400"}`}
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
                            ? "Confirme"
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
                className="flex flex-col items-center py-10 text-slate-500 gap-2"
                data-ocid="dashboard.empty_state"
              >
                <span className="text-3xl">&#x1F4ED;</span>
                <p className="text-sm">
                  Aucune transaction pour l&apos;instant
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate("wallet:deposit")}
                  className="text-teal-400 text-xs hover:underline"
                  data-ocid="dashboard.link"
                >
                  Faire un premier depot &rarr;
                </button>
              </div>
            )}
            {recentTx.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onNavigate("transactions")}
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                  data-ocid="dashboard.link"
                >
                  Voir toutes les transactions &rarr;
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Receive dialog */}
      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent
          className="bg-slate-900 border-slate-700 text-white max-w-sm"
          data-ocid="dashboard.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowUpRight size={18} className="text-teal-400" />
              Recevoir des fonds
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {displayAddress ? (
              <>
                <div className="flex justify-center">
                  <AddressQRVisual address={displayAddress} />
                </div>
                <p className="text-center text-xs text-slate-400">
                  Partagez cette adresse pour recevoir des fonds
                </p>
                <div className="rounded-xl bg-slate-800 border border-slate-700 p-3 space-y-2">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Votre adresse
                  </p>
                  <p className="font-mono text-xs text-teal-300 break-all leading-relaxed">
                    {displayAddress}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all text-white"
                  style={{
                    background: addressCopied
                      ? "oklch(0.45 0.14 145)"
                      : "oklch(0.42 0.13 195)",
                  }}
                  data-ocid="dashboard.primary_button"
                >
                  {addressCopied ? (
                    <>
                      <Check size={16} /> Adresse copiee !
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Copier l&apos;adresse
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-slate-400 text-sm">
                  Creez d&apos;abord votre porte-monnaie pour obtenir une
                  adresse.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setReceiveOpen(false);
                    onNavigate("wallet");
                  }}
                  className="px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                  style={{ background: "oklch(0.42 0.13 195)" }}
                  data-ocid="dashboard.secondary_button"
                >
                  Creer mon porte-monnaie &rarr;
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
