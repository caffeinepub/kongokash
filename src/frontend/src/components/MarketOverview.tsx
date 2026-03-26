import { TrendingDown, TrendingUp } from "lucide-react";
import { useExchangeRates } from "../hooks/useQueries";

const FALLBACK_RATES = [
  { pair: "BTC/CDF", buyRate: 72500000, change: 2.4 },
  { pair: "ETH/CDF", buyRate: 4200000, change: 1.8 },
  { pair: "USDT/CDF", buyRate: 2850, change: 0.2 },
  { pair: "ICP/CDF", buyRate: 11500, change: 3.2 },
  { pair: "OKAPI/CDF", buyRate: 50, change: 1.5 },
  { pair: "BTC/USD", buyRate: 25400, change: -0.5 },
  { pair: "ETH/USD", buyRate: 1480, change: 1.1 },
  { pair: "USDT/USD", buyRate: 1.001, change: 0.01 },
];

function formatRate(rate: number, pair: string): string {
  if (pair.includes("/USD")) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(rate);
  }
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(rate)} FC`;
}

const cryptoIcons: Record<string, string> = {
  BTC: "₿",
  ETH: "⟠",
  USDT: "₮",
  ICP: "∞",
  OKP: "🦌",
  OKAPI: "🦌",
};

export default function MarketOverview() {
  const { data: rates } = useExchangeRates();

  const displayRates =
    rates && rates.length > 0
      ? rates.map((r, i) => ({
          ...r,
          change: FALLBACK_RATES[i % FALLBACK_RATES.length]?.change ?? 0,
        }))
      : FALLBACK_RATES.map((r) => ({
          pair: r.pair,
          buyRate: r.buyRate,
          sellRate: r.buyRate * 0.98,
          change: r.change,
        }));

  const doubled = [...displayRates, ...displayRates];

  return (
    <section
      id="market"
      className="py-8"
      style={{ background: "oklch(0.27 0.07 195)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <h2 className="font-display font-bold text-white text-xl">
            Aperçu du Marché
          </h2>
        </div>
        <div className="overflow-hidden">
          <div className="ticker-track flex gap-4 w-max">
            {doubled.map((rate, i) => {
              const [crypto] = rate.pair.split("/");
              const isUp = rate.change >= 0;
              return (
                <div
                  key={`${rate.pair}-${i}`}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl flex-shrink-0"
                  style={{
                    background: "oklch(1 0 0 / 0.07)",
                    border: "1px solid oklch(1 0 0 / 0.12)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{
                      background: "oklch(0.77 0.13 85 / 0.2)",
                      color: "oklch(0.77 0.13 85)",
                    }}
                  >
                    {cryptoIcons[crypto] || crypto[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {rate.pair}
                    </div>
                    <div className="text-white/60 text-xs">
                      {formatRate(rate.buyRate, rate.pair)}
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      isUp ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {isUp ? "+" : ""}
                    {rate.change.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
