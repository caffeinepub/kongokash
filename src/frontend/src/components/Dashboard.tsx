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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Gift,
  Headphones,
  History,
  Loader2,
  PieChart,
  RefreshCw,
  ShieldCheck,
  Ticket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOkpBalance } from "../hooks/useOkpQueries";
import {
  useDepositFiat,
  useExchangeRates,
  usePortfolioValue,
  useProfile,
  useTransactions,
  useWallet,
} from "../hooks/useQueries";
import { DigitalTicket, type TicketData } from "./DigitalTicket";
import { EscrowPaymentInfo } from "./EscrowPaymentInfo";
import ExternalTransferModal, {
  ExternalTransferHistory,
} from "./ExternalTransferModal";
import { HistoriqueTab } from "./HistoriqueTab";
import NonCustodialWallet from "./NonCustodialWallet";
import PartnerDashboard from "./PartnerDashboard";
import ReferralSection, { ApplyReferralCard } from "./ReferralSection";
import SupportSection from "./SupportSection";
import TransactionHistory from "./TransactionHistory";

function formatCDF(n: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n)} FC`;
}
function formatUSD(n: number) {
  return `$${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n)}`;
}
function formatCrypto(n: number, asset: string) {
  return `${n.toFixed(8)} ${asset.toUpperCase()}`;
}
function addOpacity(color: string, opacity: string) {
  return color.endsWith(")") ? `${color.slice(0, -1)} / ${opacity})` : color;
}

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const {
    data: wallet,
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useWallet();
  const { data: rates } = useExchangeRates();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioValue();
  const { data: okpBalance = 0 } = useOkpBalance();
  const { data: profile } = useProfile();
  const depositFiat = useDepositFiat();

  const [converterFiat, setConverterFiat] = useState("");
  const [converterCurrency, setConverterCurrency] = useState("CDF");
  const [converterAsset, setConverterAsset] = useState("BTC");

  const handleDeposit = async (currency: string, amount: number) => {
    try {
      await depositFiat.mutateAsync({ currency, amount });
      toast.success(
        `Dépôt de ${amount.toLocaleString()} ${currency} effectué!`,
      );
    } catch {
      toast.error("Erreur lors du dépôt");
    }
  };

  const getConvertedAmount = (): string => {
    const fiatVal = Number.parseFloat(converterFiat);
    if (Number.isNaN(fiatVal) || fiatVal <= 0) return "0";
    const pair = `${converterAsset}/${converterCurrency}`;
    const rate = rates?.find((r) => r.pair === pair);
    if (!rate) {
      const fallback: Record<string, number> = {
        "BTC/CDF": 72500000,
        "ETH/CDF": 4200000,
        "USDT/CDF": 2850,
        "BTC/USD": 25400,
        "ETH/USD": 1480,
        "USDT/USD": 1.001,
      };
      const fb = fallback[pair];
      if (fb) return (fiatVal / fb).toFixed(8);
      return "0";
    }
    return (fiatVal / rate.buyRate).toFixed(8);
  };

  const getRate = (pair: string) =>
    rates?.find((r) => r.pair === pair)?.buyRate ?? 0;

  const assets = [
    {
      symbol: "BTC",
      icon: "₿",
      amount: wallet?.btc ?? 0,
      valueCDF: (wallet?.btc ?? 0) * getRate("BTC/CDF"),
      color: "oklch(0.77 0.13 85)",
    },
    {
      symbol: "ETH",
      icon: "⟠",
      amount: wallet?.eth ?? 0,
      valueCDF: (wallet?.eth ?? 0) * getRate("ETH/CDF"),
      color: "oklch(0.52 0.12 160)",
    },
    {
      symbol: "USDT",
      icon: "₮",
      amount: wallet?.usdt ?? 0,
      valueCDF: (wallet?.usdt ?? 0) * getRate("USDT/CDF"),
      color: "oklch(0.67 0.15 55)",
    },
    {
      symbol: "CDF",
      icon: "FC",
      amount: wallet?.cdf ?? 0,
      valueCDF: wallet?.cdf ?? 0,
      color: "oklch(0.27 0.07 195)",
    },
    {
      symbol: "USD",
      icon: "$",
      amount: wallet?.usd ?? 0,
      valueCDF: (wallet?.usd ?? 0) * getRate("USDT/CDF"),
      color: "oklch(0.35 0.09 195)",
    },
    {
      symbol: "OKP",
      icon: "OKP_IMG",
      amount: wallet?.okp ?? okpBalance,
      valueCDF: 0,
      color: "oklch(0.65 0.18 35)",
    },
  ];

  // Check if user has been referred (has referredBy)
  const hasReferredBy =
    profile && (profile as { referredBy?: unknown }).referredBy != null;

  if (!identity) {
    return (
      <section id="dashboard" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl mb-4">
            Votre Tableau de Bord
          </h2>
          <p className="text-muted-foreground mb-8">
            Connectez-vous pour accéder à votre portefeuille et votre historique
            de transactions.
          </p>
          <div className="grid md:grid-cols-4 gap-6 opacity-40 pointer-events-none select-none">
            {[
              "Taux d'échange",
              "Convertisseur rapide",
              "Votre Portefeuille",
              "Historique",
            ].map((t) => (
              <Card key={t} className="h-48">
                <CardHeader>
                  <CardTitle className="text-base">{t}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const totalCDF = portfolio?.totalCDF ?? 0;
  const totalUSD = portfolio?.totalUSD ?? 0;

  return (
    <section
      id="dashboard"
      className="py-16"
      style={{ background: "oklch(0.97 0.005 220)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl">
            Votre Tableau de Bord
          </h2>
          <p className="text-muted-foreground mt-2">
            Gérez vos actifs, convertissez et suivez vos transactions.
          </p>
        </div>

        {/* Apply referral code banner (shown only if user has no referredBy yet) */}
        {profile && !hasReferredBy && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ApplyReferralCard />
          </motion.div>
        )}

        <Tabs defaultValue="portfolio" data-ocid="dashboard.tab">
          <TabsList className="mb-8 w-full sm:w-auto">
            <TabsTrigger
              value="portfolio"
              className="flex items-center gap-2"
              data-ocid="dashboard.tab"
            >
              <Wallet size={14} /> Portefeuille
            </TabsTrigger>
            <TabsTrigger
              value="secure-wallet"
              className="flex items-center gap-2"
              data-ocid="dashboard.tab"
            >
              <ShieldCheck size={14} /> Wallet Sécurisé 🔐
            </TabsTrigger>
            <TabsTrigger
              value="reservations"
              className="flex items-center gap-2"
              data-ocid="dashboard.tab"
            >
              <Ticket size={14} /> Mes Tickets 🎫
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="flex items-center gap-2"
              data-ocid="dashboard.tab"
            >
              <Headphones size={14} /> Support 🎧
            </TabsTrigger>
            <TabsTrigger
              value="partner"
              className="flex items-center gap-2"
              data-ocid="dashboard.tab"
            >
              <Building2 size={14} /> Espace Partenaire 🏢
            </TabsTrigger>
            <TabsTrigger
              value="historique"
              className="flex items-center gap-2"
              data-ocid="dashboard.tab"
            >
              <History size={14} /> Historique 📋
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Portfolio ─── */}
          <TabsContent value="portfolio">
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Exchange Rates Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
              >
                <Card
                  className="card-hover h-full shadow-card"
                  data-ocid="dashboard.card"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <TrendingUp
                        size={16}
                        style={{ color: "oklch(0.52 0.12 160)" }}
                      />
                      Taux d'échange
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(rates && rates.length > 0
                      ? rates.slice(0, 5)
                      : [
                          {
                            pair: "BTC/CDF",
                            buyRate: 72500000,
                            sellRate: 71050000,
                          },
                          {
                            pair: "ETH/CDF",
                            buyRate: 4200000,
                            sellRate: 4116000,
                          },
                          { pair: "USDT/CDF", buyRate: 2850, sellRate: 2793 },
                          { pair: "BTC/USD", buyRate: 25400, sellRate: 24892 },
                          { pair: "ETH/USD", buyRate: 1480, sellRate: 1450.4 },
                        ]
                    ).map((r) => (
                      <div
                        key={r.pair}
                        className="flex justify-between text-xs"
                      >
                        <span className="font-semibold text-foreground">
                          {r.pair}
                        </span>
                        <div className="text-right">
                          <div style={{ color: "oklch(0.52 0.12 160)" }}>
                            A:{" "}
                            {r.buyRate >= 1000
                              ? `${(r.buyRate / 1000).toFixed(0)}k`
                              : r.buyRate.toFixed(2)}
                          </div>
                          <div className="text-muted-foreground">
                            V:{" "}
                            {r.sellRate >= 1000
                              ? `${(r.sellRate / 1000).toFixed(0)}k`
                              : r.sellRate.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Converter Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Card
                  className="card-hover h-full shadow-card"
                  data-ocid="converter.card"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <RefreshCw
                        size={16}
                        style={{ color: "oklch(0.77 0.13 85)" }}
                      />
                      Convertisseur rapide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label
                        htmlFor="converter-fiat"
                        className="text-xs text-muted-foreground"
                      >
                        Montant en fiat
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="converter-fiat"
                          type="number"
                          placeholder="Ex: 50000"
                          value={converterFiat}
                          onChange={(e) => setConverterFiat(e.target.value)}
                          className="text-sm"
                          data-ocid="converter.input"
                        />
                        <Select
                          value={converterCurrency}
                          onValueChange={setConverterCurrency}
                        >
                          <SelectTrigger
                            className="w-24 text-xs"
                            data-ocid="converter.select"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CDF">CDF</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="converter-asset"
                        className="text-xs text-muted-foreground"
                      >
                        Crypto cible
                      </Label>
                      <Select
                        value={converterAsset}
                        onValueChange={setConverterAsset}
                      >
                        <SelectTrigger
                          id="converter-asset"
                          className="mt-1 text-sm"
                          data-ocid="converter.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="USDT">Tether (USDT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div
                      className="p-3 rounded-lg text-center"
                      style={{ background: "oklch(0.52 0.12 160 / 0.1)" }}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        Vous recevrez environ
                      </div>
                      <div
                        className="font-display font-bold text-lg"
                        style={{ color: "oklch(0.27 0.07 195)" }}
                      >
                        {getConvertedAmount()} {converterAsset}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        style={{ background: "oklch(0.52 0.12 160)" }}
                        data-ocid="converter.primary_button"
                      >
                        Acheter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        data-ocid="converter.secondary_button"
                      >
                        Vendre
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Wallet Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Card
                  className="card-hover h-full shadow-card"
                  data-ocid="wallet.card"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Wallet
                        size={16}
                        style={{ color: "oklch(0.67 0.15 55)" }}
                      />
                      Votre Portefeuille
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto p-1 h-auto"
                        onClick={() => refetchWallet()}
                        data-ocid="wallet.button"
                      >
                        <RefreshCw size={12} />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {walletLoading ? (
                      <div
                        className="flex justify-center py-4"
                        data-ocid="wallet.loading_state"
                      >
                        <Loader2
                          className="animate-spin"
                          style={{ color: "oklch(0.52 0.12 160)" }}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {[
                            {
                              label: "CDF",
                              icon: "FC",
                              value: formatCDF(wallet?.cdf ?? 500000),
                              color: "oklch(0.27 0.07 195)",
                            },
                            {
                              label: "USD",
                              icon: "$",
                              value: formatUSD(wallet?.usd ?? 175),
                              color: "oklch(0.35 0.09 195)",
                            },
                            {
                              label: "BTC",
                              icon: "₿",
                              value: formatCrypto(wallet?.btc ?? 0.0021, "BTC"),
                              color: "oklch(0.77 0.13 85)",
                            },
                            {
                              label: "ETH",
                              icon: "⟠",
                              value: formatCrypto(wallet?.eth ?? 0.045, "ETH"),
                              color: "oklch(0.52 0.12 160)",
                            },
                            {
                              label: "USDT",
                              icon: "₮",
                              value: formatCrypto(wallet?.usdt ?? 50, "USDT"),
                              color: "oklch(0.67 0.15 55)",
                            },
                            {
                              label: "OKP",
                              icon: "OKP_IMG",
                              value: `${(wallet?.okp ?? okpBalance).toFixed(4)} OKP`,
                              color: "oklch(0.65 0.18 35)",
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                  style={{
                                    background: `${item.color} / 0.1`,
                                    color: item.color,
                                  }}
                                >
                                  {item.icon === "OKP_IMG" ? (
                                    <img
                                      src="/assets/generated/okapi-token-logo-transparent.dim_400x400.png"
                                      className="w-5 h-5"
                                      alt="OKP"
                                    />
                                  ) : (
                                    item.icon
                                  )}
                                </span>
                                <span className="text-sm font-medium">
                                  {item.label}
                                </span>
                              </div>
                              <span className="text-sm text-right text-muted-foreground font-mono">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            style={{
                              background: "oklch(0.77 0.13 85)",
                              color: "oklch(0.20 0.01 250)",
                            }}
                            onClick={() => handleDeposit("CDF", 100000)}
                            disabled={depositFiat.isPending}
                            data-ocid="wallet.primary_button"
                          >
                            {depositFiat.isPending ? (
                              <Loader2
                                size={12}
                                className="animate-spin mr-1"
                              />
                            ) : null}
                            + Dépôt CDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => handleDeposit("USD", 50)}
                            disabled={depositFiat.isPending}
                            data-ocid="wallet.secondary_button"
                          >
                            + Dépôt USD
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Mini Transaction History Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Card
                  className="card-hover h-full shadow-card"
                  data-ocid="transactions.card"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <History
                        size={16}
                        style={{ color: "oklch(0.52 0.12 160)" }}
                      />
                      Historique
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {txLoading ? (
                      <div
                        className="flex justify-center py-4"
                        data-ocid="transactions.loading_state"
                      >
                        <Loader2
                          className="animate-spin"
                          style={{ color: "oklch(0.52 0.12 160)" }}
                        />
                      </div>
                    ) : transactions && transactions.length > 0 ? (
                      <div className="space-y-3">
                        {transactions.slice(0, 5).map((tx, i) => (
                          <div
                            key={tx.id.toString()}
                            className="flex items-center gap-2"
                            data-ocid={`transactions.item.${i + 1}`}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background:
                                  tx.txType === "buy"
                                    ? "oklch(0.52 0.12 160 / 0.15)"
                                    : "oklch(0.67 0.15 55 / 0.15)",
                              }}
                            >
                              {tx.txType === "buy" ? (
                                <ArrowDownLeft
                                  size={14}
                                  style={{ color: "oklch(0.52 0.12 160)" }}
                                />
                              ) : (
                                <ArrowUpRight
                                  size={14}
                                  style={{ color: "oklch(0.67 0.15 55)" }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold truncate">
                                {tx.txType === "buy" ? "Achat" : "Vente"}{" "}
                                {tx.asset}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {tx.cryptoAmount.toFixed(6)} {tx.asset}
                              </div>
                            </div>
                            <Badge
                              variant={
                                tx.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs flex-shrink-0"
                              style={
                                tx.status === "completed"
                                  ? { background: "oklch(0.52 0.12 160)" }
                                  : {}
                              }
                            >
                              {tx.status === "completed" ? "OK" : "En attente"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="text-center py-6 text-muted-foreground text-sm"
                        data-ocid="transactions.empty_state"
                      >
                        <History
                          size={32}
                          className="mx-auto mb-2 opacity-30"
                        />
                        Aucune transaction pour l'instant
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Portfolio Summary */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-8"
            >
              <div className="mb-6">
                <h3 className="font-display font-bold text-xl">
                  Mon Portfolio
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Valeur totale de vos actifs en temps réel
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Total en CDF */}
                <Card
                  className="shadow-card"
                  style={{ background: "oklch(0.27 0.07 195)", color: "white" }}
                  data-ocid="portfolio.card"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white/70">
                      Valeur totale en CDF
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {portfolioLoading ? (
                      <div data-ocid="portfolio.loading_state">
                        <Loader2 className="animate-spin" />
                      </div>
                    ) : (
                      <div className="font-display font-bold text-2xl">
                        {`${new Intl.NumberFormat("fr-FR").format(totalCDF)} FC`}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Total en USD */}
                <Card
                  className="shadow-card"
                  style={{ background: "oklch(0.52 0.12 160)", color: "white" }}
                  data-ocid="portfolio.card"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white/70">
                      Valeur totale en USD
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {portfolioLoading ? (
                      <div data-ocid="portfolio.loading_state">
                        <Loader2 className="animate-spin" />
                      </div>
                    ) : (
                      <div className="font-display font-bold text-2xl">
                        {`$${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(totalUSD)}`}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actifs */}
                <Card
                  className="shadow-card"
                  style={{
                    background: "oklch(0.77 0.13 85)",
                    color: "oklch(0.20 0.01 250)",
                  }}
                  data-ocid="portfolio.card"
                >
                  <CardHeader className="pb-2">
                    <CardTitle
                      className="text-sm font-medium"
                      style={{ color: "oklch(0.20 0.01 250 / 0.7)" }}
                    >
                      Actifs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-display font-bold text-2xl">
                      6 actifs
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "oklch(0.20 0.01 250 / 0.7)" }}
                    >
                      CDF, USD, BTC, ETH, USDT, OKP
                    </div>
                  </CardContent>
                </Card>

                {/* Répartition */}
                <div className="md:col-span-3">
                  <Card className="shadow-card" data-ocid="portfolio.card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart size={18} />
                        Répartition des actifs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-6 gap-4">
                        {assets.map((asset, i) => (
                          <div
                            key={asset.symbol}
                            className="text-center p-4 rounded-xl"
                            style={{
                              background: addOpacity(asset.color, "0.08"),
                            }}
                            data-ocid={`portfolio.item.${i + 1}`}
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2"
                              style={{
                                background: asset.color,
                                color: "white",
                              }}
                            >
                              {asset.icon === "OKP_IMG" ? (
                                <img
                                  src="/assets/generated/okapi-token-logo-transparent.dim_400x400.png"
                                  className="w-7 h-7"
                                  alt="OKP"
                                />
                              ) : (
                                asset.icon
                              )}
                            </div>
                            <div className="font-semibold text-sm">
                              {asset.symbol}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                              {asset.amount < 1
                                ? asset.amount.toFixed(6)
                                : new Intl.NumberFormat("fr-FR", {
                                    maximumFractionDigits: 2,
                                  }).format(asset.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>

            {/* External Transfers Section */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05, duration: 0.5 }}
              className="mt-8"
            >
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "oklch(0.13 0.025 220)",
                  border: "1px solid oklch(0.25 0.04 220)",
                }}
              >
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">
                      Transferts Externes
                    </h3>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "oklch(0.55 0.03 220)" }}
                    >
                      Envoyez vos cryptos vers des adresses externes (TRC20,
                      BEP20, ERC20)
                    </p>
                  </div>
                  <ExternalTransferModal />
                </div>
                <ExternalTransferHistory compact />
              </div>
            </motion.div>

            {/* Full Transaction History */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mt-8"
            >
              <div className="mb-6">
                <h3 className="font-display font-bold text-xl">
                  Historique des Transactions
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Toutes vos opérations — achats, ventes, dépôts, retraits,
                  staking et récompenses.
                </p>
              </div>
              <TransactionHistory />
            </motion.div>

            {/* Parrainage Section */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mt-8"
            >
              <div
                className="p-[1px] rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.52 0.12 160), oklch(0.77 0.13 85))",
                }}
              >
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "oklch(0.97 0.005 220)" }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "oklch(0.77 0.13 85)" }}
                    >
                      <Gift size={18} style={{ color: "white" }} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl">
                        Parrainage
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Gagnez des OKP en invitant vos amis sur KongoKash
                      </p>
                    </div>
                  </div>
                  <ReferralSection />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ─── Tab 2: Wallet Sécurisé ─── */}
          <TabsContent value="secure-wallet">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Info banner */}
              <div
                className="rounded-2xl p-5 mb-6 flex items-start gap-4"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.18 0.05 220), oklch(0.22 0.07 195))",
                  border: "1px solid oklch(0.30 0.08 195)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "oklch(0.52 0.12 160 / 0.2)" }}
                >
                  <ShieldCheck
                    size={20}
                    style={{ color: "oklch(0.52 0.12 160)" }}
                  />
                </div>
                <div>
                  <h3
                    className="font-display font-bold text-base mb-1"
                    style={{ color: "oklch(0.92 0.04 80)" }}
                  >
                    Wallet Non-Custodial — Sécurité Maximale
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "oklch(0.65 0.03 220)" }}
                  >
                    Vos clés privées sont générées et stockées{" "}
                    <strong style={{ color: "oklch(0.77 0.13 85)" }}>
                      uniquement sur votre appareil
                    </strong>
                    , chiffrées avec AES-256-GCM. Aucun accès admin. Rien n'est
                    envoyé sur un serveur. Récupérez votre wallet sur n'importe
                    quel appareil grâce à votre seed phrase.
                  </p>
                </div>
              </div>

              <NonCustodialWallet />
            </motion.div>
          </TabsContent>

          {/* ─── Tab 3: Mes Réservations ─── */}
          <TabsContent value="reservations">
            <MesReservationsTab />
          </TabsContent>

          {/* ─── Tab 4: Support ─── */}
          <TabsContent value="support">
            <SupportSection />
          </TabsContent>
          <TabsContent value="partner">
            <PartnerDashboard />
          </TabsContent>
          <TabsContent value="historique">
            <HistoriqueTab />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

// ─── Mes Réservations Tab ────────────────────────────────────────────────────

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

type ReservationFilter = "all" | "pending" | "confirmed" | "cancelled";

function MesReservationsTab() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [activeTicket, setActiveTicket] = useState<TicketData | null>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [filter, setFilter] = useState<ReservationFilter>("all");

  const { data: reservations = [], isLoading } = useQuery<ReservationLocal[]>({
    queryKey: ["myReservations"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await (actor as any).getMyReservations()) as ReservationLocal[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const cancelReservation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor non disponible");
      return (actor as any).cancelReservation(id) as Promise<{
        success: boolean;
        message: string;
      }>;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["myReservations"] });
      }
    },
  });

  function statusBadge(status: string) {
    switch (status) {
      case "confirmed":
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: "oklch(0.30 0.10 145 / 0.3)",
              color: "oklch(0.70 0.15 145)",
            }}
          >
            ✓ Confirmée
          </span>
        );
      case "cancelled":
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: "oklch(0.30 0.10 20 / 0.3)",
              color: "oklch(0.65 0.15 20)",
            }}
          >
            ✕ Annulée
          </span>
        );
      case "refunded":
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: "oklch(0.28 0.10 250 / 0.3)",
              color: "oklch(0.65 0.15 250)",
            }}
          >
            ↩ Remboursée
          </span>
        );
      default:
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: "oklch(0.30 0.10 85 / 0.3)",
              color: "oklch(0.77 0.13 85)",
            }}
          >
            ⏳ En attente
          </span>
        );
    }
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="reservation.loading_state"
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: "oklch(0.60 0.15 195)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  const filtered =
    filter === "all"
      ? reservations
      : reservations.filter((r) => {
          if (filter === "pending")
            return r.status === "pending" || r.status === "pending_payment";
          return r.status === filter;
        });

  const filterLabels: { key: ReservationFilter; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "pending", label: "En attente" },
    { key: "confirmed", label: "Confirmées" },
    { key: "cancelled", label: "Annulées" },
  ];

  return (
    <>
      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-4">
        {filterLabels.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background:
                filter === key
                  ? "oklch(0.52 0.12 160)"
                  : "oklch(0.18 0.04 220)",
              color: filter === key ? "white" : "oklch(0.60 0.04 220)",
              border: `1px solid ${filter === key ? "oklch(0.52 0.12 160)" : "oklch(0.28 0.05 220)"}`,
            }}
            data-ocid="reservation.tab"
          >
            {label}
            {key === "all" ? ` (${reservations.length})` : ""}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16" data-ocid="reservation.empty_state">
          <div className="text-5xl mb-4">🎫</div>
          <p
            className="text-lg font-medium"
            style={{ color: "oklch(0.65 0.04 220)" }}
          >
            {reservations.length === 0
              ? "Aucune réservation pour l'instant"
              : "Aucune réservation dans ce filtre"}
          </p>
          <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.03 220)" }}>
            Explorez les hôtels et parcs disponibles dans la section
            Réservations
          </p>
        </div>
      ) : null}

      <div className="space-y-4" data-ocid="reservation.list">
        {filtered.map((r, idx) => (
          <div
            key={String(r.id)}
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{
              background: "oklch(0.16 0.04 220)",
              border: "1px solid oklch(0.25 0.05 220)",
            }}
            data-ocid={`reservation.item.${idx + 1}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: "oklch(0.77 0.13 85)" }}
                  >
                    #{r.bookingCode}
                  </span>
                  {statusBadge(r.status)}
                </div>
                <p
                  className="font-semibold truncate"
                  style={{ color: "oklch(0.90 0.04 80)" }}
                >
                  {r.structureName}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.55 0.04 220)" }}
                >
                  {r.checkIn} → {r.checkOut} · {Number(r.guests)} pers. ·{" "}
                  {r.totalAmount.toLocaleString("fr-FR")}{" "}
                  {r.paymentMethod.toUpperCase()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTicket({
                      type: r.structureName.toLowerCase().includes("vol")
                        ? "VOL"
                        : "HÔTEL",
                      serviceName: r.structureName,
                      passenger: "Voyageur KongoKash",
                      date: r.checkIn,
                      bookingCode: r.bookingCode,
                      details: `${Number(r.guests)} pers. · ${r.checkIn} → ${r.checkOut}`,
                      price: `${r.totalAmount.toLocaleString("fr-FR")} ${r.paymentMethod.toUpperCase()}`,
                    });
                    setShowTicket(true);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: "oklch(0.25 0.10 195 / 0.3)",
                    color: "oklch(0.60 0.15 195)",
                    border: "1px solid oklch(0.40 0.12 195 / 0.4)",
                  }}
                  data-ocid={`reservation.secondary_button.${idx + 1}`}
                >
                  🎫 Voir Ticket
                </button>
                {r.status === "confirmed" && (
                  <button
                    type="button"
                    onClick={() => cancelReservation.mutate(r.id)}
                    disabled={cancelReservation.isPending}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: "oklch(0.25 0.08 20 / 0.4)",
                      color: "oklch(0.65 0.15 20)",
                      border: "1px solid oklch(0.40 0.10 20 / 0.4)",
                    }}
                    data-ocid={`reservation.delete_button.${idx + 1}`}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
            <EscrowPaymentInfo
              reservationId={Number(r.id)}
              bookingCode={r.bookingCode}
            />
          </div>
        ))}
      </div>
      <DigitalTicket
        ticket={activeTicket}
        open={showTicket}
        onClose={() => setShowTicket(false)}
      />
    </>
  );
}
