import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Coins, Lock, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useWallet } from "../hooks/useQueries";
import { secureGet } from "../lib/secureStorage";

interface OnboardingFlowProps {
  onNavigateWallet: () => void;
  onNavigateP2P: () => void;
  onDismiss: () => void;
}

const STEP_LABELS = ["Créer wallet", "Sauvegarder", "Utiliser"];

export default function OnboardingFlow({
  onNavigateWallet,
  onNavigateP2P,
  onDismiss,
}: OnboardingFlowProps) {
  const { identity } = useInternetIdentity();
  const { data: wallet } = useWallet();
  const [hasSecureWallet, setHasSecureWallet] = useState(false);

  useEffect(() => {
    secureGet("kk_wallet_address").then((addr) => {
      setHasSecureWallet(!!addr);
    });
  }, []);

  const hasFunds =
    !!wallet &&
    (wallet.cdf > 0 ||
      wallet.usd > 0 ||
      wallet.btc > 0 ||
      wallet.eth > 0 ||
      wallet.usdt > 0);

  const steps = [
    {
      icon: Lock,
      title: "Créer votre wallet sécurisé",
      desc: "Générez votre seed phrase et sécurisez vos actifs localement.",
      done: hasSecureWallet,
      action: () => onNavigateWallet(),
      actionLabel: "Créer mon wallet",
    },
    {
      icon: Coins,
      title: "Déposer des fonds",
      desc: "Déposez des CDF ou USD via Mobile Money ou virement bancaire.",
      done: hasFunds,
      action: () => onNavigateWallet(),
      actionLabel: "Déposer maintenant",
    },
    {
      icon: Zap,
      title: "Commencer à utiliser",
      desc: "Échangez, envoyez et recevez des cryptos facilement.",
      done: false,
      action: () => onNavigateP2P(),
      actionLabel: "Explorer le P2P",
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  if (!identity) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-teal-800/40 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.17 0.04 195) 0%, oklch(0.13 0.03 220) 100%)",
      }}
    >
      {/* Top bar */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              🚀 Premiers pas sur KongoKash
            </h3>
            <p className="text-teal-300/60 text-sm mt-0.5">
              Étape {completedCount + 1} sur {steps.length} · {progress}%
              complété
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors mt-1"
            data-ocid="onboarding.close_button"
          >
            Ignorer
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-700/50 rounded-full mt-3 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "oklch(0.62 0.14 175)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center mt-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="flex items-center flex-1 last:flex-none"
            >
              {/* Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step.done
                      ? "text-white"
                      : i === completedCount
                        ? "text-white"
                        : "border-2 border-slate-600 text-slate-500"
                  }`}
                  style={{
                    background: step.done
                      ? "oklch(0.55 0.16 145)"
                      : i === completedCount
                        ? "oklch(0.42 0.13 175)"
                        : "transparent",
                    borderWidth: step.done || i === completedCount ? 0 : 2,
                    borderColor: "oklch(0.35 0.05 250)",
                  }}
                >
                  {step.done ? (
                    <CheckCircle2 size={16} className="text-white" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </motion.div>
                <span
                  className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                    step.done
                      ? "text-emerald-400"
                      : i === completedCount
                        ? "text-teal-300"
                        : "text-slate-600"
                  }`}
                >
                  {STEP_LABELS[i]}
                </span>
              </div>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2 mb-5 rounded-full"
                  style={{
                    background: step.done
                      ? "oklch(0.55 0.16 145)"
                      : "oklch(0.25 0.03 250)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step cards */}
      <div className="grid sm:grid-cols-3 gap-3 px-5 pb-5">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className={`rounded-xl border p-4 transition-all ${
              step.done
                ? "border-emerald-500/25 bg-emerald-900/10"
                : i === completedCount
                  ? "border-teal-500/30 bg-teal-900/10"
                  : "border-slate-700/50 bg-slate-800/30"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  step.done
                    ? "bg-emerald-500/20"
                    : i === completedCount
                      ? "bg-teal-500/20"
                      : "bg-slate-700/50"
                }`}
              >
                {step.done ? (
                  <CheckCircle2 size={15} className="text-emerald-400" />
                ) : (
                  <step.icon
                    size={15}
                    className={
                      i === completedCount ? "text-teal-300" : "text-slate-500"
                    }
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      step.done
                        ? "bg-emerald-500/15 text-emerald-400"
                        : i === completedCount
                          ? "bg-teal-500/15 text-teal-400"
                          : "bg-slate-700/50 text-slate-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <p
                    className={`text-sm font-semibold ${
                      step.done
                        ? "text-emerald-300"
                        : i === completedCount
                          ? "text-white"
                          : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>

            {!step.done && (
              <Button
                size="sm"
                onClick={step.action}
                className={`mt-3 w-full h-9 text-sm font-semibold text-white transition-all ${
                  i === completedCount ? "" : "opacity-50 cursor-not-allowed"
                }`}
                disabled={i !== completedCount}
                style={{
                  background:
                    i === completedCount
                      ? "oklch(0.42 0.13 175)"
                      : "oklch(0.25 0.03 250)",
                }}
                data-ocid={`onboarding.primary_button.${i + 1}`}
              >
                {step.actionLabel}
                <ChevronRight size={14} className="ml-1" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
