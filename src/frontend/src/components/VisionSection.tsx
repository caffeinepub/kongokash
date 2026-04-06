import { motion } from "motion/react";

const pillars = [
  {
    icon: "🏦",
    title: "Partenaires maîtres de leurs fonds",
    description:
      "Chaque partenaire possède son propre wallet non-custodial. KongoKash ne détient jamais vos fonds.",
  },
  {
    icon: "🛡️",
    title: "Clients toujours protégés",
    description:
      "Chaque paiement est sécurisé dans un smart contract escrow. Les fonds sont libérés uniquement après confirmation du service.",
  },
  {
    icon: "⚖️",
    title: "Infrastructure neutre & sécurisée",
    description:
      "KongoKash est un protocole décentralisé, pas une banque. Vos fonds restent sous votre contrôle, toujours.",
  },
];

const trustBadges = [
  "Smart contract vérifié ✓",
  "Non-custodial ✓",
  "Hébergé sur ICP ✓",
];

export default function VisionSection() {
  return (
    <section
      id="vision"
      className="relative overflow-hidden py-20 px-6"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.14 0.06 195) 0%, oklch(0.18 0.07 190) 60%, oklch(0.16 0.06 200) 100%)",
      }}
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 geo-pattern opacity-30" />

      <div className="relative max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{
              background: "oklch(0.77 0.13 85 / 0.15)",
              color: "oklch(0.77 0.13 85)",
              border: "1px solid oklch(0.77 0.13 85 / 0.3)",
            }}
          >
            Philosophie KongoKash
          </span>
          <h2
            className="font-display font-bold text-white"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
          >
            Pourquoi KongoKash est{" "}
            <span style={{ color: "oklch(0.77 0.13 85)" }}>différent</span>
          </h2>
          <p
            className="mt-3 text-lg max-w-xl mx-auto"
            style={{ color: "oklch(0.70 0.05 195)" }}
          >
            Ni une banque, ni un exchange centralisé. Un réseau P2P africain.
          </p>
        </motion.div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="rounded-2xl p-7 flex flex-col gap-4"
              style={{
                background: "oklch(0.20 0.07 195 / 0.6)",
                border: "1.5px solid oklch(0.77 0.13 85 / 0.35)",
                backdropFilter: "blur(12px)",
              }}
              data-ocid={`vision.pillar.item.${i + 1}`}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{
                  background: "oklch(0.77 0.13 85 / 0.12)",
                  border: "1px solid oklch(0.77 0.13 85 / 0.25)",
                }}
              >
                {pillar.icon}
              </div>
              <h3
                className="font-display font-bold text-lg leading-snug"
                style={{ color: "oklch(0.77 0.13 85)" }}
              >
                {pillar.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.72 0.05 195)" }}
              >
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
          data-ocid="vision.trust.panel"
        >
          {trustBadges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold"
              style={{
                background: "oklch(0.52 0.12 160 / 0.15)",
                color: "oklch(0.75 0.14 160)",
                border: "1px solid oklch(0.52 0.12 160 / 0.35)",
              }}
            >
              {badge}
            </span>
          ))}
        </motion.div>

        {/* Guarantee callout */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="max-w-3xl mx-auto rounded-2xl px-8 py-5 text-center"
          style={{
            background: "oklch(0.52 0.12 160 / 0.08)",
            border: "1.5px solid oklch(0.52 0.12 160 / 0.35)",
          }}
          data-ocid="vision.panel"
        >
          <p
            className="text-base font-semibold leading-relaxed"
            style={{ color: "oklch(0.85 0.08 160)" }}
          >
            💬 Aucune personne, aucune entreprise ne peut bloquer vos fonds.{" "}
            <span style={{ color: "oklch(0.78 0.14 160)" }}>
              C'est garanti par le code.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
