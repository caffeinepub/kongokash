import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, CheckCircle2, Clock, Lock, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWalletContext } from "../hooks/useWalletContext";
import {
  ASSET_ICONS,
  ASSET_LABELS,
  type Asset,
  BASE_PRICES_CDF,
  type P2PPriceResult,
  compareChannels,
  formatPriceCDF,
  getDirectPrice,
  getP2PBestPrice,
} from "../utils/priceEngine";

const ASSETS: Asset[] = ["USDT", "BTC", "ETH", "ICP", "OKP"];

const PAYMENT_METHODS = [
  {
    id: "airtel",
    label: "Airtel Money",
    color: "text-red-300",
    bg: "bg-red-900/30 border-red-700/40",
    activeBg: "bg-red-800/50 border-red-500",
    icon: "📱",
  },
  {
    id: "mpesa",
    label: "M-Pesa",
    color: "text-green-300",
    bg: "bg-green-900/30 border-green-700/40",
    activeBg: "bg-green-800/50 border-green-500",
    icon: "📲",
  },
  {
    id: "virement",
    label: "Virement Bancaire",
    color: "text-blue-300",
    bg: "bg-blue-900/30 border-blue-700/40",
    activeBg: "bg-blue-800/50 border-blue-500",
    icon: "🏦",
  },
];

interface KongoKashDirectProps {
  defaultTab?: "buy" | "sell";
  onSwitchToP2P?: () => void;
}

export default function KongoKashDirect({
  defaultTab = "buy",
  onSwitchToP2P,
}: KongoKashDirectProps) {
  const { refresh } = useWalletContext();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">(defaultTab);
  const [selectedAsset, setSelectedAsset] = useState<Asset>("USDT");
  const [amountCDF, setAmountCDF] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("airtel");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const action = activeTab;
  const directPrice = getDirectPrice(selectedAsset, action);
  const p2pPrice: P2PPriceResult = getP2PBestPrice(selectedAsset, action);
  const amountNum = Number.parseFloat(amountCDF.replace(/\s/g, "")) || 0;
  const comparison =
    amountNum > 0 ? compareChannels(selectedAsset, amountNum, action) : null;

  // Crypto equivalent
  const cryptoAmount = amountNum > 0 ? amountNum / directPrice.price : 0;
  const marketPrice = BASE_PRICES_CDF[selectedAsset];

  const handleSubmit = async () => {
    if (!amountNum || amountNum < 500) {
      toast.error("Montant minimum: 500 FC");
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsProcessing(false);
    setSuccess(true);
    toast.success(
      action === "buy"
        ? `✅ Achat de ${cryptoAmount.toFixed(6)} ${selectedAsset} confirmé !`
        : `✅ Vente de ${cryptoAmount.toFixed(6)} ${selectedAsset} confirmée — retrait en cours`,
    );
    refresh();
    setTimeout(() => {
      setSuccess(false);
      setAmountCDF("");
    }, 3000);
  };

  const formatCDFInput = (val: string) => {
    const digits = val.replace(/[^\d]/g, "");
    if (!digits) return "";
    return new Intl.NumberFormat("fr-FR").format(Number(digits));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Direct Header */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-amber-600/30 bg-amber-950/20">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.16 75), oklch(0.55 0.18 50))",
          }}
        >
          <Zap size={18} className="text-slate-950" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-amber-300 text-sm">
              KongoKash Direct
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Disponible maintenant · 24h/7j
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Prix fixe garanti · Traitement instantané · Toujours disponible
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "buy" | "sell")}
      >
        <TabsList className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-1">
          <TabsTrigger
            value="buy"
            className="flex-1 rounded-lg text-sm data-[state=active]:text-slate-950 data-[state=active]:font-bold"
            style={
              {
                "--active-bg": "oklch(0.65 0.16 75)",
              } as React.CSSProperties
            }
            data-ocid="direct.tab"
          >
            💰 Acheter
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="flex-1 rounded-lg text-sm data-[state=active]:text-slate-950 data-[state=active]:font-bold"
            data-ocid="direct.tab"
          >
            📤 Vendre / Retirer
          </TabsTrigger>
        </TabsList>

        {(["buy", "sell"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
            {/* Asset selector */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Crypto-actif
              </p>
              <div className="flex gap-2 flex-wrap">
                {ASSETS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setSelectedAsset(a)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      selectedAsset === a
                        ? "border-amber-500/70 text-amber-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                    style={
                      selectedAsset === a
                        ? { background: "oklch(0.65 0.16 75 / 0.15)" }
                        : { background: "transparent" }
                    }
                    data-ocid="direct.toggle"
                  >
                    <span className="text-base">{ASSET_ICONS[a]}</span>
                    <span>{a}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price display card */}
            <Card className="border-amber-600/20 bg-slate-900/80">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Lock
                        size={12}
                        className="text-amber-400 flex-shrink-0"
                      />
                      <span className="text-xs text-slate-400">
                        Prix garanti
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {formatPriceCDF(directPrice.price)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      par 1 {selectedAsset} · {ASSET_LABELS[selectedAsset]}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge
                      className="text-xs font-semibold"
                      style={{
                        background: "oklch(0.65 0.16 75 / 0.2)",
                        color: "oklch(0.75 0.15 75)",
                        border: "1px solid oklch(0.65 0.16 75 / 0.4)",
                      }}
                    >
                      Direct
                    </Badge>
                    <p className="text-xs text-slate-500">
                      Spread +{(directPrice.spread * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Fee breakdown */}
                <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Détail des frais
                  </p>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Prix marché</span>
                    <span className="text-slate-300">
                      {formatPriceCDF(marketPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">
                      Spread KongoKash ({tab === "buy" ? "+" : "-"}
                      {(directPrice.spread * 100).toFixed(1)}%)
                    </span>
                    <span
                      className={
                        tab === "buy" ? "text-amber-400" : "text-rose-400"
                      }
                    >
                      {tab === "buy" ? "+" : "-"}
                      {formatPriceCDF(directPrice.spreadAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Frais réseau</span>
                    <span className="text-emerald-400">Gratuit</span>
                  </div>
                  <div className="border-t border-slate-700 pt-1.5 flex justify-between text-xs font-bold">
                    <span className="text-white">Prix total</span>
                    <span className="text-amber-300">
                      {formatPriceCDF(directPrice.price)}
                    </span>
                  </div>
                </div>

                {/* Stable/Guaranteed subtitle */}
                <div className="flex items-center gap-3 justify-center">
                  {["Stable", "Garanti", "Instantané"].map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs text-slate-400"
                    >
                      <CheckCircle2 size={10} className="text-amber-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* P2P comparison */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-700/60 bg-slate-800/30">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Meilleur prix P2P :
                </span>
                <span
                  className={`text-xs font-semibold ${
                    p2pPrice.savings > 0 ? "text-emerald-400" : "text-slate-400"
                  }`}
                >
                  {formatPriceCDF(p2pPrice.price)}
                  {p2pPrice.savings > 0 && (
                    <span className="ml-1 text-emerald-400">
                      (−{formatPriceCDF(p2pPrice.savings)})
                    </span>
                  )}
                </span>
              </div>
              {onSwitchToP2P && (
                <button
                  type="button"
                  onClick={onSwitchToP2P}
                  className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors font-medium"
                  data-ocid="direct.link"
                >
                  Voir offres P2P <ArrowRight size={11} />
                </button>
              )}
            </div>

            {/* Amount input */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Montant (FC)
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={amountCDF}
                  onChange={(e) => setAmountCDF(formatCDFInput(e.target.value))}
                  placeholder="Ex: 50 000 FC"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-500 text-base font-semibold focus:outline-none focus:border-amber-500/50 transition-colors"
                  data-ocid="direct.input"
                />
                {amountNum > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-right">
                    <p className="text-xs font-bold text-amber-300">
                      {cryptoAmount < 0.001
                        ? cryptoAmount.toFixed(8)
                        : cryptoAmount.toFixed(4)}{" "}
                      {selectedAsset}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendation banner */}
            <AnimatePresence>
              {comparison && (
                <motion.div
                  key={comparison.recommended}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs ${
                    comparison.recommended === "p2p"
                      ? "border-teal-700/40 bg-teal-950/30 text-teal-300"
                      : "border-amber-700/30 bg-amber-950/20 text-amber-300"
                  }`}
                >
                  <span className="text-base leading-none mt-0.5">💡</span>
                  <span>{comparison.reason}</span>
                  {comparison.recommended === "p2p" && onSwitchToP2P && (
                    <button
                      type="button"
                      onClick={onSwitchToP2P}
                      className="ml-auto flex-shrink-0 underline text-teal-400 hover:text-teal-200 transition-colors"
                      data-ocid="direct.link"
                    >
                      Voir P2P
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Payment method */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Méthode de paiement
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      selectedMethod === m.id ? m.activeBg : m.bg
                    } ${m.color}`}
                    data-ocid="direct.radio"
                  >
                    <span className="text-base">{m.icon}</span>
                    <span className="text-center leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Processing time */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock size={12} className="text-amber-400" />
              Traitement : ~2 minutes · Disponible 24h/7j
            </div>

            {/* CTA */}
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-emerald-400 border border-emerald-600/40 bg-emerald-900/20"
                  data-ocid="direct.success_state"
                >
                  <CheckCircle2 size={18} />
                  Transaction confirmée !
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={isProcessing || !amountNum || amountNum < 500}
                    className="w-full py-4 rounded-2xl text-sm font-bold text-slate-950 transition-all hover:brightness-110 disabled:opacity-40"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.65 0.16 75), oklch(0.58 0.18 55))",
                      boxShadow: "0 4px 20px oklch(0.65 0.16 75 / 0.35)",
                    }}
                    data-ocid="direct.submit_button"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />
                        Traitement en cours...
                      </span>
                    ) : tab === "buy" ? (
                      "💰 Acheter maintenant"
                    ) : (
                      "📤 Retirer maintenant"
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
}
