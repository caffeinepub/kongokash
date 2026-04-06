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
          className="text-center max-w-4xl mx-auto space-y-5 mb-4"
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
        </motion.div>

        {/* ── Trust strip — BEFORE CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {TRUST_POINTS.map((pt) => (
            <span
              key={pt.label}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{
                color: "oklch(0.78 0.10 165)",
                background: "oklch(0.52 0.12 160 / 0.12)",
                border: "1px solid oklch(0.52 0.12 160 / 0.30)",
              }}
            >
              {pt.icon}
              {pt.label}
            </span>
          ))}
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="flex flex-col items-center gap-3 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="rounded-full px-12 py-6 font-bold text-lg shadow-gold hover:brightness-110 transition-all"
              style={{
                background: "oklch(0.77 0.13 85)",
                color: "oklch(0.20 0.01 250)",
                boxShadow:
                  "0 6px 30px oklch(0.77 0.13 85 / 0.45), 0 2px 8px oklch(0.77 0.13 85 / 0.30)",
              }}
              data-ocid="hero.primary_button"
            >
              Créer mon wallet
              <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button
              onClick={onViewMarkets}
              size="lg"
              variant="outline"
              className="rounded-full px-10 border-white/30 text-white hover:bg-white/10 bg-transparent font-medium"
              data-ocid="hero.secondary_button"
            >
              Commencer gratuitement
            </Button>
          </div>
          {/* Reassurance line */}
          <p
            className="text-xs font-medium"
            style={{ color: "oklch(0.70 0.08 165)" }}
          >
            🔐 Vos fonds sont protégés dès le premier dépôt
          </p>
          {/* Beginner hint */}
          <p
            className="text-xs text-center max-w-md"
            style={{ color: "oklch(0.65 0.06 195)" }}
          >
            💡 Crypto = un intermédiaire neutre qui sécurise vos échanges — sans
            banque.
          </p>
        </motion.div>

        {/* ── 3 étapes ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-12"
        >
          <p
            className="text-center text-xs uppercase tracking-widest font-semibold mb-4"
            style={{ color: "oklch(0.60 0.08 195)" }}
          >
            Démarrez en 3 étapes
          </p>
          <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {THREE_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.45 }}
                className="rounded-xl p-4 flex flex-col gap-2"
                style={{
                  background: "oklch(0.18 0.05 195 / 0.8)",
                  border: `1.5px solid ${step.color}25`,
                  backdropFilter: "blur(12px)",
                }}
                data-ocid={`hero.item.${i + 1}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="font-display font-bold text-base"
                    style={{ color: step.color }}
                  >
                    {step.num}
                  </span>
                  <span className="text-xl">{step.icon}</span>
                </div>
                <p className="font-bold text-white text-xs">{step.title}</p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "oklch(0.62 0.06 195)" }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Simplified bottom bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-x-10 gap-y-3 pt-8"
          style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          {[
            { icon: "💸", text: "Dépôt Mobile Money · 0% de frais" },
            { icon: "🔐", text: "Fonds protégés par smart contract escrow" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "oklch(0.72 0.08 165)" }}
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
