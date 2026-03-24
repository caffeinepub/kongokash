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
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Loader2,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDepositFiat,
  useExchangeRates,
  useTransactions,
  useWallet,
} from "../hooks/useQueries";

function formatCDF(n: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n)} FC`;
}
function formatUSD(n: number) {
  return `$${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n)}`;
}
function formatCrypto(n: number, asset: string) {
  return `${n.toFixed(8)} ${asset.toUpperCase()}`;
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
                      { pair: "ETH/CDF", buyRate: 4200000, sellRate: 4116000 },
                      { pair: "USDT/CDF", buyRate: 2850, sellRate: 2793 },
                      { pair: "BTC/USD", buyRate: 25400, sellRate: 24892 },
                      { pair: "ETH/USD", buyRate: 1480, sellRate: 1450.4 },
                    ]
                ).map((r) => (
                  <div key={r.pair} className="flex justify-between text-xs">
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
                  <Wallet size={16} style={{ color: "oklch(0.67 0.15 55)" }} />
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
                        },
                        {
                          label: "USD",
                          icon: "$",
                          value: formatUSD(wallet?.usd ?? 175),
                        },
                        {
                          label: "BTC",
                          icon: "₿",
                          value: formatCrypto(wallet?.btc ?? 0.0021, "BTC"),
                        },
                        {
                          label: "ETH",
                          icon: "⟠",
                          value: formatCrypto(wallet?.eth ?? 0.045, "ETH"),
                        },
                        {
                          label: "USDT",
                          icon: "₮",
                          value: formatCrypto(wallet?.usdt ?? 50, "USDT"),
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
                                background: "oklch(0.27 0.07 195 / 0.1)",
                                color: "oklch(0.27 0.07 195)",
                              }}
                            >
                              {item.icon}
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
                          <Loader2 size={12} className="animate-spin mr-1" />
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

          {/* Transaction History Card */}
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
                            {tx.txType === "buy" ? "Achat" : "Vente"} {tx.asset}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tx.cryptoAmount.toFixed(6)} {tx.asset}
                          </div>
                        </div>
                        <Badge
                          variant={
                            tx.status === "completed" ? "default" : "secondary"
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
                    <History size={32} className="mx-auto mb-2 opacity-30" />
                    Aucune transaction pour l'instant
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
