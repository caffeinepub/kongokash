import { Button } from "@/components/ui/button";
import {
  ArrowLeftRight,
  CheckCircle2,
  ChevronRight,
  Coins,
  Vault,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useWallet } from "../hooks/useQueries";
import { secureGet } from "../lib/secureStorage";

interface OnboardingFlowProps {
  onNavigateWallet: () => void;
  onNavigateP2P: () => void;
  onDismiss: () => void;
}

type StepStatus = "done" | "active" | "upcoming";

interface Step {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  circleColor: string;
  borderColor: string;
  bgColor: string;
  num: number;
  title: string;
  desc: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  ctaLabel: string;
  onAction: () => void;
  status: StepStatus;
}

function StepCard({ step, isActive }: { step: Step; isActive: boolean }) {
  const statusConfig = {
    done: {
      statusLabel: "✅ Complété",
      statusBg: "bg-emerald-500/15",
      statusText: "text-emerald-400",
    },
    active: {
      statusLabel: "⏳ En cours",
      statusBg: "bg-teal-500/15",
      statusText: "text-teal-300",
    },
    upcoming: {
      statusLabel: "🔜 Bientôt",
      statusBg: "bg-slate-700/50",
      statusText: "text-slate-500",
    },
  }[step.status];

  const cardBorder =
    step.status === "done"
      ? "border-emerald-500/30"
      : step.status === "active"
        ? "border-teal-500/40 shadow-teal-900/30 shadow-lg"
        : "border-slate-700/40";

  const cardBg =
    step.status === "done"
      ? "bg-emerald-950/30"
      : step.status === "active"
        ? "bg-teal-950/40"
        : "bg-slate-800/20";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition-all ${
        cardBorder
      } ${cardBg}`}
    >
      {/* Step number + icon */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-base ${
            step.status === "done"
              ? "bg-emerald-500/20 text-emerald-400"
              : step.status === "active"
                ? step.circleColor
                : "bg-slate-700/50 text-slate-500"
          }`}
          style={
            isActive
              ? { boxShadow: "0 0 0 3px oklch(0.42 0.13 175 / 0.4)" }
              : {}
          }
        >
          {step.status === "done" ? (
            <CheckCircle2 size={20} className="text-emerald-400" />
          ) : (
            <span>{step.num}</span>
          )}
        </div>

        {/* Badge */}
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            step.status === "done"
              ? "bg-emerald-500/15 text-emerald-300"
              : step.status === "active"
                ? `${step.badgeBg} ${step.badgeText}`
                : "bg-slate-700/50 text-slate-500"
          }`}
        >
          {step.status === "done" ? "✅ Sécurisé" : step.badge}
        </span>
      </div>

      {/* Main icon */}
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
            step.status === "upcoming" ? "opacity-40" : ""
          } ${step.iconBg}`}
        >
          <step.icon
            size={28}
            className={
              step.status === "upcoming" ? "text-slate-500" : step.iconColor
            }
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`font-bold text-base leading-snug ${
              step.status === "upcoming" ? "text-slate-500" : "text-white"
            }`}
          >
            {step.title}
          </h4>
          <p
            className={`text-sm mt-1.5 leading-relaxed ${
              step.status === "upcoming" ? "text-slate-600" : "text-slate-400"
            }`}
          >
            {step.desc}
          </p>
        </div>
      </div>

      {/* Status + CTA */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-md ${
            statusConfig.statusBg
          } ${statusConfig.statusText}`}
        >
          {statusConfig.statusLabel}
        </span>

        {step.status !== "done" && (
          <Button
            size="sm"
            onClick={step.onAction}
            disabled={step.status === "upcoming"}
            className="h-8 px-4 text-sm font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background:
                step.status === "active"
                  ? "oklch(0.42 0.13 175)"
                  : "oklch(0.22 0.03 250)",
            }}
            data-ocid={`onboarding.primary_button.${step.num}`}
          >
            {step.ctaLabel}
            <ChevronRight size={14} className="ml-1" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

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

  const completedCount = [hasSecureWallet, hasFunds].filter(Boolean).length;
  const progress = Math.round((completedCount / 3) * 100);

  const getStatus = (index: number): StepStatus => {
    const statuses: StepStatus[] = [
      hasSecureWallet ? "done" : completedCount === 0 ? "active" : "upcoming",
      hasFunds ? "done" : hasSecureWallet ? "active" : "upcoming",
      completedCount === 2 ? "active" : "upcoming",
    ];
    return statuses[index];
  };

  const steps: Step[] = [
    {
      icon: Vault,
      iconBg: "bg-teal-500/15",
      iconColor: "text-teal-300",
      circleColor: "bg-teal-500/20 text-teal-300",
      borderColor: "border-teal-500/40",
      bgColor: "bg-teal-950/40",
      num: 1,
      title: "Créez votre porte-monnaie",
      desc: "Votre porte-monnaie est votre coffre-fort numérique. Vous seul y avez accès — même KongoKash ne peut pas y toucher.",
      badge: "🔒 100% sécurisé",
      badgeBg: "bg-teal-500/15",
      badgeText: "text-teal-300",
      ctaLabel: "Créer mon porte-monnaie",
      onAction: onNavigateWallet,
      status: getStatus(0),
    },
    {
      icon: Coins,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-300",
      circleColor: "bg-amber-500/20 text-amber-300",
      borderColor: "border-amber-500/40",
      bgColor: "bg-amber-950/30",
      num: 2,
      title: "Achetez votre première crypto",
      desc: "Utilisez Airtel Money, M-Pesa ou votre banque pour acheter des cryptos en quelques minutes.",
      badge: "⚡ Via Mobile Money",
      badgeBg: "bg-amber-500/15",
      badgeText: "text-amber-300",
      ctaLabel: "Acheter maintenant",
      onAction: onNavigateWallet,
      status: getStatus(1),
    },
    {
      icon: ArrowLeftRight,
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-300",
      circleColor: "bg-violet-500/20 text-violet-300",
      borderColor: "border-violet-500/40",
      bgColor: "bg-violet-950/30",
      num: 3,
      title: "Échangez directement",
      desc: "Vendez ou achetez des cryptos directement avec d'autres utilisateurs. Les fonds sont protégés jusqu'à la fin de l'échange.",
      badge: "🛡️ Paiement sécurisé",
      badgeBg: "bg-violet-500/15",
      badgeText: "text-violet-300",
      ctaLabel: "Voir les offres",
      onAction: onNavigateP2P,
      status: getStatus(2),
    },
  ];

  if (!identity) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="rounded-2xl border border-teal-800/30 overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.16 0.04 195) 0%, oklch(0.12 0.03 220) 100%)",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-white leading-tight">
                🚀 Premiers pas sur KongoKash
              </h3>
              <p className="text-teal-300/50 text-sm mt-0.5">
                {completedCount} sur 3 étapes complétées
              </p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-700/50"
              data-ocid="onboarding.close_button"
              aria-label="Ignorer l'onboarding"
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "oklch(0.62 0.14 175)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Step indicators mini */}
          <div className="flex items-center gap-2 mt-3">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step.status === "done"
                      ? "bg-emerald-500/30 text-emerald-400"
                      : step.status === "active"
                        ? "bg-teal-500/30 text-teal-300"
                        : "bg-slate-700/50 text-slate-600"
                  }`}
                >
                  {step.status === "done" ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    step.num
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="h-0.5 w-8 rounded-full"
                    style={{
                      background:
                        step.status === "done"
                          ? "oklch(0.55 0.16 145)"
                          : "oklch(0.25 0.03 250)",
                    }}
                  />
                )}
              </div>
            ))}
            <span className="text-xs text-slate-500 ml-1">
              {progress}% complété
            </span>
          </div>
        </div>

        {/* Step cards */}
        <div className="grid sm:grid-cols-3 gap-3 px-5 pb-5">
          {steps.map((step) => (
            <StepCard
              key={step.num}
              step={step}
              isActive={step.status === "active"}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
