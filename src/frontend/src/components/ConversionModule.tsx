import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftRight, CheckCircle, Globe, Star, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type AfricanCurrency,
  type AgentOffer,
  CURRENCY_FLAGS,
  CURRENCY_LABELS,
  convertAmount,
  getAgentOffers,
} from "../utils/africaCurrencies";

const CURRENCIES: AfricanCurrency[] = [
  "CDF",
  "XAF",
  "XOF",
  "NGN",
  "KES",
  "GHS",
  "ZAR",
  "USD",
];

type ConversionTab = "instant" | "agents";

const STAR_POSITIONS = [1, 2, 3, 4, 5] as const;

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {STAR_POSITIONS.map((pos) => (
        <Star
          key={pos}
          size={10}
          className={
            pos <= rounded ? "fill-amber-400 text-amber-400" : "text-slate-600"
          }
        />
      ))}
      <span className="ml-1 text-xs text-slate-400">{rating.toFixed(1)}</span>
    </span>
  );
}

function AgentCard({
  agent,
  amount,
}: {
  agent: AgentOffer;
  amount: number;
}) {
  const estimatedReceive = amount > 0 ? amount * agent.rate * (1 - 0.008) : 0;

  function handleContact() {
    toast.success(
      `Demande envoyée à ${agent.agentName} via ${agent.paymentMethod}`,
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <Card
        className="border-slate-700/60 overflow-hidden transition-all hover:border-slate-600"
        style={{ background: "oklch(0.13 0.015 220)" }}
        data-ocid="conversion.agent.card"
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "oklch(0.45 0.18 280)" }}
                >
                  {agent.agentName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {agent.agentName}
                  </p>
                  <StarRating rating={agent.rating} />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge
                  className="text-xs px-1.5 py-0"
                  style={{
                    background: "oklch(0.45 0.18 280 / 0.2)",
                    color: "oklch(0.78 0.12 280)",
                    border: "1px solid oklch(0.45 0.18 280 / 0.3)",
                  }}
                >
                  {agent.paymentMethod}
                </Badge>
                <Badge
                  className="text-xs px-1.5 py-0"
                  style={
                    agent.available
                      ? {
                          background: "oklch(0.35 0.12 145 / 0.2)",
                          color: "oklch(0.72 0.15 145)",
                          border: "1px solid oklch(0.35 0.12 145 / 0.3)",
                        }
                      : {
                          background: "oklch(0.25 0.02 220 / 0.4)",
                          color: "oklch(0.55 0.02 220)",
                          border: "1px solid oklch(0.35 0.02 220 / 0.3)",
                        }
                  }
                >
                  {agent.available ? "● Disponible" : "○ Hors ligne"}
                </Badge>
                <span className="text-xs text-slate-500">
                  ⏱ {agent.responseTime}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <span>
                  Min : {agent.minAmount.toLocaleString("fr-FR")} {agent.from}
                </span>
                <span>
                  Max : {agent.maxAmount.toLocaleString("fr-FR")} {agent.from}
                </span>
                <span>{agent.completedTrades} trades complétés</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-0.5">Taux</p>
                <p
                  className="text-base font-bold"
                  style={{ color: "oklch(0.78 0.12 280)" }}
                >
                  {agent.rate < 1
                    ? agent.rate.toFixed(4)
                    : agent.rate.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">
                  {agent.from}/{agent.to}
                </p>
              </div>
              {amount > 0 && estimatedReceive > 0 && (
                <p className="text-xs text-emerald-400 text-right">
                  ≈{" "}
                  {estimatedReceive < 1
                    ? estimatedReceive.toFixed(4)
                    : estimatedReceive.toLocaleString("fr-FR", {
                        maximumFractionDigits: 2,
                      })}{" "}
                  {agent.to}
                </p>
              )}
              <Button
                size="sm"
                disabled={!agent.available}
                onClick={handleContact}
                className="text-xs h-7 px-2 font-semibold"
                style={
                  agent.available
                    ? {
                        background: "oklch(0.45 0.18 280)",
                        color: "white",
                        border: "none",
                      }
                    : {}
                }
                data-ocid="conversion.agent.button"
              >
                {agent.available ? "Contacter" : "Indisponible"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ConversionModule() {
  const [activeTab, setActiveTab] = useState<ConversionTab>("instant");
  const [fromCurrency, setFromCurrency] = useState<AfricanCurrency>("CDF");
  const [toCurrency, setToCurrency] = useState<AfricanCurrency>("XAF");
  const [rawAmount, setRawAmount] = useState("10000");
  const [converting, setConverting] = useState(false);

  const amount = Number.parseFloat(rawAmount.replace(/[^0-9.]/g, "")) || 0;

  const conversion = useMemo(() => {
    if (amount <= 0) return null;
    return convertAmount(amount, fromCurrency, toCurrency);
  }, [amount, fromCurrency, toCurrency]);

  const agents = useMemo(
    () => getAgentOffers(fromCurrency, toCurrency),
    [fromCurrency, toCurrency],
  );

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  async function handleInstantConvert() {
    if (!conversion || amount <= 0) return;
    setConverting(true);
    await new Promise((r) => setTimeout(r, 1800));
    setConverting(false);
    toast.success(
      `Conversion effectuée : ${amount.toLocaleString("fr-FR")} ${fromCurrency} → ${conversion.result.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} ${toCurrency}`,
    );
    setRawAmount("");
  }

  const availableAgents = agents.filter((a) => a.available);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe size={16} style={{ color: "oklch(0.78 0.12 280)" }} />
            <h2 className="font-bold text-white text-base">
              Conversion Africaine
            </h2>
          </div>
          <p className="text-slate-400 text-xs">
            Échangez vos devises sans banques internationales
          </p>
        </div>
        <Badge
          className="text-xs font-semibold flex-shrink-0"
          style={{
            background: "oklch(0.45 0.18 280 / 0.2)",
            color: "oklch(0.78 0.12 280)",
            border: "1px solid oklch(0.45 0.18 280 / 0.3)",
          }}
          data-ocid="conversion.panel"
        >
          🌍 Sans banques int.
        </Badge>
      </div>

      {/* Mode tabs */}
      <div className="flex rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900">
        <button
          type="button"
          onClick={() => setActiveTab("instant")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition-all"
          style={
            activeTab === "instant"
              ? { background: "oklch(0.45 0.18 280)", color: "white" }
              : { color: "oklch(0.55 0.04 220)" }
          }
          data-ocid="conversion.tab"
        >
          <Zap size={13} />⚡ Instantané
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("agents")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition-all"
          style={
            activeTab === "agents"
              ? { background: "oklch(0.45 0.18 280)", color: "white" }
              : { color: "oklch(0.55 0.04 220)" }
          }
          data-ocid="conversion.tab"
        >
          👥 Via Agents
          {availableAgents.length > 0 && (
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background:
                  activeTab === "agents"
                    ? "oklch(0.20 0.04 220 / 0.6)"
                    : "oklch(0.45 0.18 280 / 0.25)",
                color:
                  activeTab === "agents" ? "white" : "oklch(0.78 0.12 280)",
              }}
            >
              {availableAgents.length}
            </span>
          )}
        </button>
      </div>

      {/* Conversion form — shared */}
      <Card
        className="border-slate-700/50"
        style={{ background: "oklch(0.13 0.015 220)" }}
        data-ocid="conversion.panel"
      >
        <CardContent className="p-4 space-y-3">
          {/* From currency + amount */}
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Vous envoyez</p>
            <div className="flex gap-2">
              <Select
                value={fromCurrency}
                onValueChange={(v) => setFromCurrency(v as AfricanCurrency)}
              >
                <SelectTrigger
                  className="w-[160px] border-slate-700 bg-slate-800 text-white flex-shrink-0"
                  data-ocid="conversion.select"
                >
                  <SelectValue>
                    <span className="flex items-center gap-1.5">
                      <span>{CURRENCY_FLAGS[fromCurrency]}</span>
                      <span className="font-semibold">{fromCurrency}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {CURRENCIES.map((c) => (
                    <SelectItem
                      key={c}
                      value={c}
                      className="text-slate-200 focus:bg-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <span>{CURRENCY_FLAGS[c]}</span>
                        <span className="font-medium">{c}</span>
                        <span className="text-slate-400 text-xs">
                          {CURRENCY_LABELS[c]}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                placeholder="Montant"
                className="flex-1 border-slate-700 bg-slate-800 text-white text-right font-semibold"
                data-ocid="conversion.input"
              />
            </div>
          </div>

          {/* Swap button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-700 hover:border-slate-500 transition-colors"
              style={{
                background: "oklch(0.45 0.18 280 / 0.12)",
                color: "oklch(0.78 0.12 280)",
              }}
              data-ocid="conversion.toggle"
            >
              <ArrowLeftRight size={12} />
              Inverser
            </button>
          </div>

          {/* To currency */}
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Vous recevez</p>
            <div className="flex gap-2 items-center">
              <Select
                value={toCurrency}
                onValueChange={(v) => setToCurrency(v as AfricanCurrency)}
              >
                <SelectTrigger
                  className="w-[160px] border-slate-700 bg-slate-800 text-white flex-shrink-0"
                  data-ocid="conversion.select"
                >
                  <SelectValue>
                    <span className="flex items-center gap-1.5">
                      <span>{CURRENCY_FLAGS[toCurrency]}</span>
                      <span className="font-semibold">{toCurrency}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {CURRENCIES.map((c) => (
                    <SelectItem
                      key={c}
                      value={c}
                      className="text-slate-200 focus:bg-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <span>{CURRENCY_FLAGS[c]}</span>
                        <span className="font-medium">{c}</span>
                        <span className="text-slate-400 text-xs">
                          {CURRENCY_LABELS[c]}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Result */}
              <div className="flex-1 text-right">
                <AnimatePresence mode="wait">
                  {conversion ? (
                    <motion.div
                      key={conversion.result.toFixed(2)}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <p
                        className="text-2xl font-bold leading-none"
                        style={{ color: "oklch(0.78 0.12 280)" }}
                      >
                        {conversion.result < 1
                          ? conversion.result.toFixed(4)
                          : conversion.result.toLocaleString("fr-FR", {
                              maximumFractionDigits: 2,
                            })}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {toCurrency}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="empty"
                      className="text-2xl font-bold text-slate-700"
                    >
                      —
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Rate + fee details */}
          {conversion && amount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2.5 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Taux</span>
                <span className="text-slate-200 font-medium">
                  {conversion.rateDisplay}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Via USDT (pivot)</span>
                <span className="text-slate-400">
                  ≈ {conversion.usdtIntermediate.toFixed(4)} USDT
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-700/50 pt-1.5">
                <span className="text-slate-400">Frais 0.8%</span>
                <span className="text-amber-400/80">
                  −{" "}
                  {conversion.feeAmount < 1
                    ? conversion.feeAmount.toFixed(4)
                    : conversion.feeAmount.toLocaleString("fr-FR", {
                        maximumFractionDigits: 2,
                      })}{" "}
                  {toCurrency}
                </span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Mode-specific content */}
      <AnimatePresence mode="wait">
        {activeTab === "instant" ? (
          <motion.div
            key="instant"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <Card
              className="border-slate-700/50"
              style={{ background: "oklch(0.13 0.015 220)" }}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Liquidité disponible
                  </span>
                  <span className="text-xs text-slate-500 ml-auto">
                    ⏱ Délai estimé : ~2 min
                  </span>
                </div>

                <div className="rounded-xl bg-slate-800/50 border border-slate-700/40 px-3 py-2.5">
                  <p className="text-xs text-slate-400 mb-2 font-medium">
                    Comment ça fonctionne
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="font-semibold text-slate-200">
                      {CURRENCY_FLAGS[fromCurrency]} {fromCurrency}
                    </span>
                    <span className="text-slate-600">→</span>
                    <span className="font-semibold text-slate-400">
                      💵 USDT
                    </span>
                    <span className="text-slate-600">→</span>
                    <span className="font-semibold text-slate-200">
                      {CURRENCY_FLAGS[toCurrency]} {toCurrency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Vos fonds transitent via USDT comme devise pivot, sans
                    besoin de correspondant bancaire.
                  </p>
                </div>

                <Button
                  disabled={!conversion || amount <= 0 || converting}
                  onClick={handleInstantConvert}
                  className="w-full font-bold h-11 text-sm"
                  style={{
                    background:
                      conversion && amount > 0
                        ? "linear-gradient(135deg, oklch(0.45 0.18 280), oklch(0.38 0.16 260))"
                        : "oklch(0.22 0.03 220)",
                    color: "white",
                    border: "none",
                  }}
                  data-ocid="conversion.submit_button"
                >
                  {converting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Conversion en cours…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap size={14} />
                      Convertir maintenant
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="agents"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-slate-200">
                  {availableAgents.length} agents disponibles
                </span>
                {" · "}triés par meilleur taux
              </p>
              <div className="flex items-center gap-1">
                <CheckCircle size={11} className="text-emerald-400" />
                <span className="text-xs text-emerald-400">
                  Escrow sécurisé
                </span>
              </div>
            </div>

            <div className="space-y-2" data-ocid="conversion.list">
              <AnimatePresence>
                {agents.map((agent, index) => (
                  <div
                    key={agent.id}
                    data-ocid={`conversion.agent.item.${index + 1}`}
                  >
                    <AgentCard agent={agent} amount={amount} />
                  </div>
                ))}
              </AnimatePresence>
            </div>

            {agents.length === 0 && (
              <div
                className="text-center py-8 rounded-xl border border-slate-700/50"
                style={{ background: "oklch(0.13 0.015 220)" }}
                data-ocid="conversion.empty_state"
              >
                <Globe
                  size={28}
                  className="mx-auto mb-2"
                  style={{ color: "oklch(0.45 0.18 280 / 0.4)" }}
                />
                <p className="text-sm text-slate-400">
                  Aucun agent pour cette paire
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Essayez l'option Instantané
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info strip */}
      <div
        className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-slate-700/40 text-xs text-slate-400"
        style={{ background: "oklch(0.45 0.18 280 / 0.06)" }}
      >
        <Globe
          size={13}
          className="flex-shrink-0 mt-0.5"
          style={{ color: "oklch(0.65 0.12 280)" }}
        />
        <span>
          KongoKash route vos fonds via{" "}
          <span className="text-slate-300 font-medium">
            USDT comme devise pivot
          </span>
          , éliminant le besoin de correspondants bancaires internationaux.
          Échangez entre toutes les devises africaines directement.
        </span>
      </div>
    </motion.div>
  );
}
