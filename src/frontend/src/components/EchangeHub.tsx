import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, TrendingUp, Users, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  type Asset,
  BASE_PRICES_CDF,
  compareChannels,
  formatPriceCDF,
  getDirectPrice,
  getP2PBestPrice,
} from "../utils/priceEngine";
import KongoKashDirect from "./KongoKashDirect";
import P2PPage from "./P2PPage";

type HubMode = "direct" | "p2p";

interface EchangeHubProps {
  defaultView?: string | null;
}

export default function EchangeHub({ defaultView }: EchangeHubProps) {
  const [activeMode, setActiveMode] = useState<HubMode>(() => {
    if (defaultView === "direct" || defaultView === "buy") return "direct";
    return "p2p";
  });
  const [directSubTab, setDirectSubTab] = useState<"buy" | "sell">("buy");
  const [selectedAsset] = useState<Asset>("USDT");

  useEffect(() => {
    if (defaultView === "direct" || defaultView === "buy") {
      setActiveMode("direct");
      setDirectSubTab("buy");
    } else if (defaultView === "sell") {
      setActiveMode("direct");
      setDirectSubTab("sell");
    } else if (defaultView === "p2p") {
      setActiveMode("p2p");
    }
  }, [defaultView]);

  // Price context for the channel cards
  const directBuyPrice = getDirectPrice(selectedAsset, "buy");
  const p2pBuyPrice = getP2PBestPrice(selectedAsset, "buy");
  // Recommendation banner (for 100k CDF)
  const sampleComparison = compareChannels(selectedAsset, 100_000, "buy");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5"
    >
      {/* Page header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Échange</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Choisissez votre méthode d'achat ou de retrait.
        </p>
      </div>

      {/* Mode selector — two large cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* KongoKash Direct card */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveMode("direct")}
          className={`relative text-left p-4 rounded-2xl border transition-all ${
            activeMode === "direct"
              ? "border-amber-500/60 shadow-lg"
              : "border-slate-700 hover:border-amber-700/50"
          }`}
          style={{
            background:
              activeMode === "direct"
                ? "linear-gradient(135deg, oklch(0.22 0.07 75 / 0.8), oklch(0.18 0.05 60 / 0.6))"
                : "oklch(0.15 0.02 220)",
            boxShadow:
              activeMode === "direct"
                ? "0 4px 24px oklch(0.65 0.16 75 / 0.15)"
                : "none",
          }}
          data-ocid="exchange.tab"
        >
          {activeMode === "direct" && (
            <div
              className="absolute inset-0 rounded-2xl opacity-20"
              style={{
                background:
                  "radial-gradient(ellipse at top right, oklch(0.65 0.16 75), transparent 70%)",
              }}
            />
          )}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.16 75), oklch(0.55 0.18 50))",
                }}
              >
                <Zap size={16} className="text-slate-950" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  className="text-xs font-bold"
                  style={{
                    background:
                      activeMode === "direct"
                        ? "oklch(0.65 0.16 75 / 0.3)"
                        : "oklch(0.65 0.16 75 / 0.15)",
                    color: "oklch(0.80 0.14 75)",
                    border: "1px solid oklch(0.65 0.16 75 / 0.4)",
                  }}
                >
                  Direct
                </Badge>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Disponible
                </span>
              </div>
            </div>
            <h2 className="font-bold text-white text-base mb-0.5">
              KongoKash Direct
            </h2>
            <p className="text-slate-400 text-xs mb-3">
              Prix fixe · Instantané · 24h/7j
            </p>
            <div className="rounded-xl bg-slate-900/60 border border-amber-700/20 px-3 py-2">
              <p className="text-xs text-slate-500 mb-0.5">1 USDT</p>
              <p
                className="text-lg font-bold"
                style={{ color: "oklch(0.80 0.14 75)" }}
              >
                {formatPriceCDF(directBuyPrice.price)}
              </p>
            </div>
          </div>
        </motion.button>

        {/* P2P Market card */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveMode("p2p")}
          className={`relative text-left p-4 rounded-2xl border transition-all ${
            activeMode === "p2p"
              ? "border-teal-500/60 shadow-lg"
              : "border-slate-700 hover:border-teal-700/50"
          }`}
          style={{
            background:
              activeMode === "p2p"
                ? "linear-gradient(135deg, oklch(0.18 0.06 175 / 0.8), oklch(0.15 0.04 165 / 0.6))"
                : "oklch(0.15 0.02 220)",
            boxShadow:
              activeMode === "p2p"
                ? "0 4px 24px oklch(0.42 0.13 160 / 0.15)"
                : "none",
          }}
          data-ocid="exchange.tab"
        >
          {activeMode === "p2p" && (
            <div
              className="absolute inset-0 rounded-2xl opacity-20"
              style={{
                background:
                  "radial-gradient(ellipse at top right, oklch(0.42 0.13 160), transparent 70%)",
              }}
            />
          )}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.42 0.13 160)" }}
              >
                <Users size={16} className="text-white" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  className="text-xs font-bold"
                  style={{
                    background:
                      activeMode === "p2p"
                        ? "oklch(0.42 0.13 160 / 0.3)"
                        : "oklch(0.42 0.13 160 / 0.15)",
                    color: "oklch(0.72 0.12 160)",
                    border: "1px solid oklch(0.42 0.13 160 / 0.4)",
                  }}
                >
                  P2P
                </Badge>
                <span className="text-xs text-slate-400">
                  {p2pBuyPrice.offersCount} offres
                </span>
              </div>
            </div>
            <h2 className="font-bold text-white text-base mb-0.5">
              Marché P2P
            </h2>
            <p className="text-slate-400 text-xs mb-3">
              Prix variable · Entre utilisateurs · Économies possibles
            </p>
            <div className="rounded-xl bg-slate-900/60 border border-teal-700/20 px-3 py-2">
              <p className="text-xs text-slate-500 mb-0.5">Meilleur USDT</p>
              <p
                className="text-lg font-bold"
                style={{ color: "oklch(0.72 0.12 160)" }}
              >
                {formatPriceCDF(p2pBuyPrice.price)}
                {p2pBuyPrice.savings > 0 && (
                  <span className="ml-1.5 text-xs font-medium text-emerald-400">
                    −{formatPriceCDF(p2pBuyPrice.savings)}
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Contextual recommendation banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sampleComparison.recommended}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm ${
            sampleComparison.recommended === "p2p"
              ? "border-teal-700/30 bg-teal-950/20"
              : "border-amber-700/20 bg-amber-950/10"
          }`}
          data-ocid="exchange.panel"
        >
          <span className="text-lg leading-none flex-shrink-0">💡</span>
          <span
            className={
              sampleComparison.recommended === "p2p"
                ? "text-teal-300"
                : "text-amber-300/90"
            }
          >
            {sampleComparison.reason}
          </span>
          {sampleComparison.recommended !== activeMode && (
            <button
              type="button"
              onClick={() => setActiveMode(sampleComparison.recommended)}
              className={`ml-auto flex-shrink-0 flex items-center gap-1 text-xs font-semibold transition-colors ${
                sampleComparison.recommended === "p2p"
                  ? "text-teal-400 hover:text-teal-200"
                  : "text-amber-400 hover:text-amber-200"
              }`}
              data-ocid="exchange.link"
            >
              Essayer{" "}
              {sampleComparison.recommended === "p2p" ? "P2P" : "Direct"}
              <ArrowRight size={12} />
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Comparison legend for non-technical users */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-amber-700/20 bg-amber-950/10">
          <CardContent className="p-3 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-300">Direct</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1">
              <li className="flex items-center gap-1">
                <span className="text-emerald-400">✓</span> Prix stable et
                prévisible
              </li>
              <li className="flex items-center gap-1">
                <span className="text-emerald-400">✓</span> Disponible
                immédiatement
              </li>
              <li className="flex items-center gap-1">
                <span className="text-emerald-400">✓</span> Idéal pour petits
                montants
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-teal-700/20 bg-teal-950/10">
          <CardContent className="p-3 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} style={{ color: "oklch(0.72 0.12 160)" }} />
              <span
                className="text-xs font-bold"
                style={{ color: "oklch(0.72 0.12 160)" }}
              >
                P2P
              </span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1">
              <li className="flex items-center gap-1">
                <span className="text-emerald-400">✓</span> Prix potentiellement
                meilleur
              </li>
              <li className="flex items-center gap-1">
                <span className="text-emerald-400">✓</span> Escrow sécurisé
              </li>
              <li className="flex items-center gap-1">
                <span className="text-amber-400">~</span> Nécessite offre
                disponible
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Active mode content */}
      <div className="mt-2">
        {/* Mode header strip */}
        <div
          className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl"
          style={{
            background:
              activeMode === "direct"
                ? "oklch(0.65 0.16 75 / 0.08)"
                : "oklch(0.42 0.13 160 / 0.08)",
            border:
              activeMode === "direct"
                ? "1px solid oklch(0.65 0.16 75 / 0.2)"
                : "1px solid oklch(0.42 0.13 160 / 0.2)",
          }}
        >
          {activeMode === "direct" ? (
            <Zap size={14} className="text-amber-400" />
          ) : (
            <Shield size={14} style={{ color: "oklch(0.72 0.12 160)" }} />
          )}
          <span
            className="text-sm font-bold"
            style={{
              color:
                activeMode === "direct"
                  ? "oklch(0.80 0.14 75)"
                  : "oklch(0.72 0.12 160)",
            }}
          >
            {activeMode === "direct"
              ? "KongoKash Direct — Service instantané"
              : "Marché P2P — Échange entre utilisateurs"}
          </span>
          <button
            type="button"
            onClick={() =>
              setActiveMode(activeMode === "direct" ? "p2p" : "direct")
            }
            className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
            data-ocid="exchange.secondary_button"
          >
            Changer <ArrowRight size={10} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeMode === "direct" ? (
            <motion.div
              key="direct"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
            >
              <KongoKashDirect
                defaultTab={directSubTab}
                onSwitchToP2P={() => setActiveMode("p2p")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="p2p"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <P2PPage
                defaultView={defaultView === "p2p" ? defaultView : null}
                onSwitchToDirect={() => {
                  setActiveMode("direct");
                }}
                embedded
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
