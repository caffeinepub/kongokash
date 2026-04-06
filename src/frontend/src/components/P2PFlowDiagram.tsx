import { motion } from "motion/react";

const FLOW_STEPS = [
  {
    id: 1,
    actor: "vendeur",
    emoji: "📝",
    text: "Vendeur crée une offre",
    detail: "Il fixe le prix et la quantité de crypto",
    accent: "teal" as const,
  },
  {
    id: 2,
    actor: "escrow",
    emoji: "🔐",
    text: "Crypto verrouillée dans l'escrow",
    detail: "Automatique — personne ne peut y toucher",
    accent: "violet" as const,
  },
  {
    id: 3,
    actor: "acheteur",
    emoji: "👀",
    text: "Acheteur voit l'offre et accepte",
    detail: "Le trade démarre officiellement",
    accent: "gold" as const,
  },
  {
    id: 4,
    actor: "acheteur",
    emoji: "📱",
    text: "Acheteur envoie Mobile Money",
    detail: "Airtel, M-Pesa, Orange Cash...",
    accent: "gold" as const,
  },
  {
    id: 5,
    actor: "vendeur",
    emoji: "✅",
    text: "Vendeur confirme la réception",
    detail: "Il valide avoir reçu le paiement fiat",
    accent: "teal" as const,
  },
  {
    id: 6,
    actor: "escrow",
    emoji: "🚀",
    text: "Escrow libère la crypto à l'acheteur",
    detail: "Transaction complète en moins de 2 minutes",
    accent: "violet" as const,
  },
];

const ACCENT_STYLES = {
  teal: {
    color: "oklch(0.72 0.12 160)",
    bg: "oklch(0.72 0.12 160 / 0.10)",
    border: "oklch(0.72 0.12 160 / 0.35)",
    numBg: "oklch(0.72 0.12 160)",
    numColor: "oklch(0.15 0.05 200)",
  },
  gold: {
    color: "oklch(0.77 0.13 85)",
    bg: "oklch(0.77 0.13 85 / 0.10)",
    border: "oklch(0.77 0.13 85 / 0.35)",
    numBg: "oklch(0.77 0.13 85)",
    numColor: "oklch(0.15 0.05 200)",
  },
  violet: {
    color: "oklch(0.76 0.12 290)",
    bg: "oklch(0.76 0.12 290 / 0.10)",
    border: "oklch(0.76 0.12 290 / 0.35)",
    numBg: "oklch(0.76 0.12 290)",
    numColor: "oklch(0.15 0.05 200)",
  },
};

export default function P2PFlowDiagram() {
  return (
    <section
      id="p2p-flow"
      className="relative py-20 px-6 overflow-hidden"
      style={{
        background: "oklch(0.13 0.05 200)",
        borderTop: "1px solid oklch(0.72 0.12 160 / 0.15)",
        borderBottom: "1px solid oklch(0.72 0.12 160 / 0.15)",
      }}
    >
      <style>{`
        @keyframes kk-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes kk-flow-arrow {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(4px); }
        }
        .kk-pulse { animation: kk-pulse 2s ease-in-out infinite; }
        .kk-flow-arrow { animation: kk-flow-arrow 1.5s ease-in-out infinite; }
      `}</style>

      {/* Ambient glow blobs */}
      <div
        className="absolute top-10 left-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: "oklch(0.72 0.12 160 / 0.08)" }}
      />
      <div
        className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: "oklch(0.77 0.13 85 / 0.08)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: "oklch(0.76 0.12 290 / 0.06)" }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{
              background: "oklch(0.76 0.12 290 / 0.15)",
              color: "oklch(0.82 0.10 290)",
              border: "1px solid oklch(0.76 0.12 290 / 0.35)",
            }}
          >
            ✨ Visualisation du flux
          </span>
          <h2
            className="font-display font-bold text-white"
            style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.5rem)" }}
          >
            Le flux P2P KongoKash — De A à Z
          </h2>
          <p
            className="mt-3 text-base max-w-xl mx-auto"
            style={{ color: "oklch(0.65 0.06 195)" }}
          >
            Vendeur et acheteur protégés à chaque étape
          </p>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {[
            {
              emoji: "🤝",
              label: "Vendeur",
              color: "oklch(0.78 0.14 160)",
              border: "oklch(0.72 0.12 160 / 0.40)",
              bg: "oklch(0.72 0.12 160 / 0.12)",
            },
            {
              emoji: "🔐",
              label: "Escrow (coffre)",
              color: "oklch(0.82 0.10 290)",
              border: "oklch(0.76 0.12 290 / 0.40)",
              bg: "oklch(0.76 0.12 290 / 0.12)",
            },
            {
              emoji: "💰",
              label: "Acheteur",
              color: "oklch(0.82 0.11 85)",
              border: "oklch(0.77 0.13 85 / 0.40)",
              bg: "oklch(0.77 0.13 85 / 0.12)",
            },
          ].map((actor) => (
            <div
              key={actor.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
              style={{
                background: actor.bg,
                border: `1.5px solid ${actor.border}`,
                color: actor.color,
              }}
            >
              <span>{actor.emoji}</span>
              {actor.label}
            </div>
          ))}
        </motion.div>

        {/* Flow steps */}
        <div className="space-y-3 mb-10">
          {FLOW_STEPS.map((step, i) => {
            const styles = ACCENT_STYLES[step.accent];
            const isEscrow = step.actor === "escrow";
            const isVendeur = step.actor === "vendeur";

            return (
              <motion.div
                key={step.id}
                initial={{
                  opacity: 0,
                  x: isEscrow ? 0 : isVendeur ? -28 : 28,
                  y: isEscrow ? 16 : 0,
                }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.48, delay: i * 0.09 }}
                className={`flex ${
                  isEscrow
                    ? "justify-center"
                    : isVendeur
                      ? "justify-start"
                      : "justify-end"
                }`}
              >
                <div
                  className="flex items-center gap-3 rounded-2xl px-5 py-4"
                  style={{
                    background: styles.bg,
                    border: `1.5px solid ${styles.border}`,
                    maxWidth: isEscrow ? "360px" : "320px",
                    width: "100%",
                  }}
                >
                  {/* Step circle */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: styles.numBg,
                      color: styles.numColor,
                    }}
                  >
                    {step.id}
                  </div>

                  {/* Emoji */}
                  <span className="text-2xl shrink-0">{step.emoji}</span>

                  {/* Text */}
                  <div className="min-w-0">
                    <p
                      className="font-bold text-sm leading-tight"
                      style={{ color: styles.color }}
                    >
                      {step.text}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.62 0.06 195)" }}
                    >
                      {step.detail}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Escrow vault visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-10"
        >
          <div
            className="rounded-3xl px-8 py-7 flex flex-col items-center gap-3 max-w-xs w-full text-center"
            style={{
              background: "oklch(0.18 0.08 220 / 0.9)",
              border: "2px solid oklch(0.76 0.12 290 / 0.50)",
              boxShadow:
                "0 0 60px oklch(0.76 0.12 290 / 0.18), 0 0 20px oklch(0.76 0.12 290 / 0.10)",
            }}
          >
            <div className="text-5xl kk-pulse">🔐</div>
            <p
              className="font-display font-bold text-lg"
              style={{ color: "oklch(0.82 0.10 290)" }}
            >
              Escrow KongoKash
            </p>
            <p className="text-xs" style={{ color: "oklch(0.60 0.06 200)" }}>
              Smart contract neutre — ni vendeur ni acheteur ne contrôle ce
              coffre
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {["Solde vérifié", "Code public", "Immuable"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: "oklch(0.76 0.12 290 / 0.15)",
                    color: "oklch(0.80 0.08 290)",
                    border: "1px solid oklch(0.76 0.12 290 / 0.30)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-8"
        >
          {[
            {
              icon: "⚡",
              label: "Libération en <2 min",
              color: "oklch(0.82 0.11 85)",
              bg: "oklch(0.77 0.13 85 / 0.10)",
              border: "oklch(0.77 0.13 85 / 0.30)",
            },
            {
              icon: "🛡️",
              label: "Fonds protégés",
              color: "oklch(0.78 0.14 160)",
              bg: "oklch(0.72 0.12 160 / 0.10)",
              border: "oklch(0.72 0.12 160 / 0.30)",
            },
            {
              icon: "⚖️",
              label: "Arbitrage si litige",
              color: "oklch(0.82 0.10 290)",
              bg: "oklch(0.76 0.12 290 / 0.10)",
              border: "oklch(0.76 0.12 290 / 0.30)",
            },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold flex-1 sm:flex-none justify-center"
              style={{
                background: badge.bg,
                border: `1.5px solid ${badge.border}`,
              }}
            >
              <span className="text-xl">{badge.icon}</span>
              <span style={{ color: badge.color }}>{badge.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Beginner note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.5 }}
          className="text-center"
        >
          <p
            className="text-sm italic max-w-lg mx-auto"
            style={{ color: "oklch(0.60 0.06 195)" }}
          >
            En résumé : KongoKash est l'arbitre neutre entre vous et le vendeur.
            Ni l'un ni l'autre ne peut tricher.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
