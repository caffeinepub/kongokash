import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onGetStarted: () => void;
  onViewMarkets: () => void;
}

const THREE_STEPS = [
  {
    num: "01",
    title: "Crée ton compte",
    desc: "Connexion via Internet Identity — sans mot de passe, sans email.",
    icon: "👤",
    color: "oklch(0.72 0.12 160)",
  },
  {
    num: "02",
    title: "Dépose en Mobile Money",
    desc: "Airtel Money, M-Pesa, Orange — ton argent arrive en minutes.",
    icon: "📱",
    color: "oklch(0.77 0.13 85)",
  },
  {
    num: "03",
    title: "Échange avec qui tu veux",
    desc: "RDC → Côte d'Ivoire, Cameroun et plus — sans banque intermédiaire.",
    icon: "🌍",
    color: "oklch(0.78 0.12 280)",
  },
];

const TRUST_POINTS = [
  { icon: <ShieldCheck size={14} />, label: "Escrow automatique" },
  { icon: <Lock size={14} />, label: "Wallet non-custodial" },
  { icon: <Zap size={14} />, label: "Hébergé sur ICP" },
];

export default function HeroSection({
  onGetStarted,
  onViewMarkets,
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.22 0.07 195) 0%, oklch(0.30 0.08 195) 50%, oklch(0.35 0.09 185) 100%)",
        minHeight: "90vh",
      }}
    >
      {/* Geometric overlay */}
      <div className="absolute inset-0 geo-pattern" />
      {/* Decorative circles */}
      <div
        className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-8"
        style={{ background: "oklch(0.52 0.12 160)" }}
      />
      <div
        className="absolute bottom-10 left-20 w-64 h-64 rounded-full opacity-5"
        style={{ background: "oklch(0.77 0.13 85)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* ── Positioning badge ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border"
            style={{
              background: "oklch(0.77 0.13 85 / 0.12)",
              color: "oklch(0.77 0.13 85)",
              borderColor: "oklch(0.77 0.13 85 / 0.35)",
            }}
          >
            <span>🌍</span>
            Réseau de paiement P2P pour l'Afrique
          </span>
        </motion.div>

        {/* ── Main headline ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto space-y-5 mb-10"
        >
          <h1
            className="font-display font-bold text-white leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Envoyez et échangez de l'argent{" "}
            <span style={{ color: "oklch(0.77 0.13 85)" }}>
              entre pays africains
            </span>
            , sans banque.
          </h1>

          <p
            className="text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: "oklch(0.78 0.10 165)" }}
          >
            CDF, FCFA, Naira et plus — directement via Airtel Money, M-Pesa et
            Orange. Vos fonds sont protégés par un smart contract escrow.
          </p>

          {/* Trust strip */}
          <div className="flex flex-wrap justify-center gap-4">
            {TRUST_POINTS.map((pt) => (
              <span
                key={pt.label}
                className="inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: "oklch(0.72 0.12 160)" }}
              >
                {pt.icon}
                {pt.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="rounded-full px-10 font-bold text-base shadow-gold"
            style={{
              background: "oklch(0.77 0.13 85)",
              color: "oklch(0.20 0.01 250)",
            }}
            data-ocid="hero.primary_button"
          >
            Commencer maintenant
            <ArrowRight size={16} className="ml-2" />
          </Button>
          <Button
            onClick={onViewMarkets}
            size="lg"
            variant="outline"
            className="rounded-full px-10 border-white/30 text-white hover:bg-white/10 bg-transparent font-medium"
            data-ocid="hero.secondary_button"
          >
            Comment ça marche
          </Button>
        </motion.div>

        {/* ── 3 étapes ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <p
            className="text-center text-xs uppercase tracking-widest font-semibold mb-6"
            style={{ color: "oklch(0.60 0.08 195)" }}
          >
            Comment ça marche — en 3 étapes
          </p>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {THREE_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.1, duration: 0.5 }}
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{
                  background: "oklch(0.18 0.05 195 / 0.8)",
                  border: `1.5px solid ${step.color}30`,
                  backdropFilter: "blur(12px)",
                }}
                data-ocid={`hero.item.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-display font-bold text-lg"
                    style={{ color: step.color }}
                  >
                    {step.num}
                  </span>
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <p className="font-bold text-white text-sm">{step.title}</p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "oklch(0.68 0.06 195)" }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="flex flex-wrap justify-center gap-8 mt-14 pt-10"
          style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          {[
            { value: "2 500+", label: "Utilisateurs actifs" },
            { value: "$1.2M+", label: "Volume échangé", gold: true },
            { value: "0%", label: "Dépôt Mobile Money" },
            { value: "ICP", label: "Hébergement on-chain", gold: true },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="font-display font-bold text-2xl"
                style={{
                  color: stat.gold ? "oklch(0.77 0.13 85)" : "white",
                }}
              >
                {stat.value}
              </div>
              <div className="text-white/50 text-sm mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
