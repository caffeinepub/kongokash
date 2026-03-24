import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PieChart } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useExchangeRates,
  usePortfolioValue,
  useWallet,
} from "../hooks/useQueries";

function addOpacity(color: string, opacity: string) {
  return color.endsWith(")") ? `${color.slice(0, -1)} / ${opacity})` : color;
}

export default function PortfolioSection() {
  const { identity } = useInternetIdentity();
  const { data: portfolio, isLoading } = usePortfolioValue();
  const { data: wallet } = useWallet();
  const { data: rates } = useExchangeRates();

  if (!identity) return null;

  const totalCDF = portfolio?.totalCDF ?? 0;
  const totalUSD = portfolio?.totalUSD ?? 0;

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
  ];

  return (
    <section id="portfolio" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl">Mon Portfolio</h2>
            <p className="text-muted-foreground mt-2">
              Valeur totale de vos actifs en temps réel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
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
                {isLoading ? (
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
                {isLoading ? (
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
                <div className="font-display font-bold text-2xl">5 actifs</div>
                <div
                  className="text-sm"
                  style={{ color: "oklch(0.20 0.01 250 / 0.7)" }}
                >
                  CDF, USD, BTC, ETH, USDT
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-3">
              <Card className="shadow-card" data-ocid="portfolio.card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart size={18} />
                    Répartition des actifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-5 gap-4">
                    {assets.map((asset, i) => (
                      <div
                        key={asset.symbol}
                        className="text-center p-4 rounded-xl"
                        style={{ background: addOpacity(asset.color, "0.08") }}
                        data-ocid={`portfolio.item.${i + 1}`}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2"
                          style={{ background: asset.color, color: "white" }}
                        >
                          {asset.icon}
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
      </div>
    </section>
  );
}
