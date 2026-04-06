import { motion } from "motion/react";

const STEPS = [
  {
    emoji: "⬇️",
    label: "Dépôt",
    title: "Dépôt",
    description: "Le vendeur dépose sa crypto dans le coffre sécurisé",
    color: "oklch(0.77 0.13 85)",
    bg: "oklch(0.77 0.13 85 / 0.10)",
    border: "oklch(0.77 0.13 85 / 0.30)",
    circleBg: "oklch(0.77 0.13 85 / 0.20)",
    step: 1,
  },
  {
    emoji: "🔒",
    label: "Blocage",
    title: "Blocage",
    description: "Les fonds sont verrouillés. Personne ne peut y toucher",
    color: "oklch(0.72 0.12 160)",
    bg: "oklch(0.72 0.12 160 / 0.10)",
    border: "oklch(0.72 0.12 160 / 0.30)",
    circleBg: "oklch(0.72 0.12 160 / 0.20)",
    step: 2,
  },
  {
    emoji: "💸",
    label: "Paiement",
    title: "Paiement",
    description:
      "L'acheteur envoie l'argent par Mobile Money (Airtel, M-Pesa...)",
    color: "oklch(0.72 0.17 145)",
    bg: "oklch(0.72 0.17 145 / 0.10)",
    border: "oklch(0.72 0.17 145 / 0.30)",
    circleBg: "oklch(0.72 0.17 145 / 0.20)",
    step: 3,
  },
  {
    emoji: "✅",
    label: "Libération",
    title: "Libération",
    description:
      "Les fonds arrivent automatiquement au vendeur après confirmation",
    color: "oklch(0.76 0.12 290)",
    bg: "oklch(0.76 0.12 290 / 0.10)",
    border: "oklch(0.76 0.12 290 / 0.30)",
    circleBg: "oklch(0.76 0.12 290 / 0.20)",
    step: 4,
  },
];

export default function EscrowExplainer() {
  return (
    <section
      id="escrow-explainer"
      className="relative py-20 px-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.13 0.04 200) 0%, oklch(0.17 0.07 190) 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{
              background: "oklch(0.72 0.12 160 / 0.15)",
              color: "oklch(0.75 0.14 160)",
              border: "1px solid oklch(0.72 0.12 160 / 0.3)",
            }}
          >
            Protection automatique
          </span>
          <h2
            className="font-display font-bold text-white"
            style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.5rem)" }}
          >
            Comment vos transactions sont protégées
          </h2>
          <p
            className="mt-3 text-base max-w-2xl mx-auto leading-relaxed"
            style={{ color: "oklch(0.68 0.06 195)" }}
          >
            Chaque paiement passe par 4 étapes automatiques — impossible de
            tricher
          </p>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-2 mb-10">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="flex md:flex-col md:flex-1 items-center md:items-stretch gap-3 md:gap-0"
            >
              {/* Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="flex md:flex-col items-center md:items-start gap-4 rounded-2xl p-6 flex-1"
                style={{
                  background: step.bg,
                  border: `1.5px solid ${step.border}`,
                }}
                data-ocid={`escrow.step.item.${i + 1}`}
              >
                {/* Circle icon */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-4xl shrink-0"
                  style={{
                    background: step.circleBg,
                    border: `2px solid ${step.border}`,
                  }}
                >
                  {step.emoji}
                </div>
                <div className="md:mt-4">
                  {/* Step number */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
                      style={{
                        background: step.color,
                        color: "oklch(0.15 0.05 200)",
                      }}
                    >
                      {step.step}
                    </span>
                    <p
                      className="font-display font-bold text-base leading-tight"
                      style={{ color: step.color }}
                    >
                      {step.title}
                    </p>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "oklch(0.72 0.06 195)" }}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {/* Arrow connector */}
              {i < STEPS.length - 1 && (
                <div className="flex items-center justify-center shrink-0">
                  <span
                    className="md:hidden text-2xl"
                    style={{ color: "oklch(0.50 0.06 200)" }}
                  >
                    ↓
                  </span>
                  <span
                    className="hidden md:block text-2xl"
                    style={{ color: "oklch(0.50 0.06 200)", marginTop: "40px" }}
                  >
                    →
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Beginner note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.35 }}
          className="rounded-xl px-6 py-4 mb-4 max-w-2xl mx-auto"
          style={{
            background: "oklch(0.76 0.12 290 / 0.07)",
            border: "1px solid oklch(0.76 0.12 290 / 0.25)",
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: "oklch(0.75 0.08 250)" }}
          >
            🤔{" "}
            <strong style={{ color: "oklch(0.85 0.08 250)" }}>
              C'est quoi un smart contract ?
            </strong>{" "}
            C'est un programme automatique qui exécute les règles sans
            intervention humaine.
          </p>
        </motion.div>

        {/* Problem callout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="rounded-xl px-6 py-4 flex items-center gap-4 max-w-2xl mx-auto text-center sm:text-left sm:flex-row flex-col"
          style={{
            background: "oklch(0.55 0.18 50 / 0.10)",
            border: "1.5px solid oklch(0.55 0.18 50 / 0.30)",
          }}
          data-ocid="escrow.panel"
        >
          <span className="text-2xl shrink-0">⚖️</span>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "oklch(0.82 0.10 70)" }}
          >
            <strong>En cas de problème</strong> — Remboursement complet
            disponible. Un arbitre neutre intervient et sa décision est
            enregistrée de façon permanente sur la blockchain.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
