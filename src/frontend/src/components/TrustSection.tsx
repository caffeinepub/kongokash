import { motion } from "motion/react";

interface TrustSectionProps {
  onLearnMore?: () => void;
}

const TRUST_CARDS = [
  {
    emoji: "🔑",
    badge: "Non-Custodial",
    badgeColor: "oklch(0.72 0.12 160)",
    badgeBg: "oklch(0.72 0.12 160 / 0.12)",
    badgeBorder: "oklch(0.72 0.12 160 / 0.35)",
    title: "Vos fonds, vos clés",
    description:
      "Personne d'autre ne peut accéder à votre argent. Pas même KongoKash. Votre phrase secrète de 12 mots est votre seule clé — et elle ne quitte jamais votre appareil.",
    accentColor: "oklch(0.72 0.12 160)",
    borderColor: "oklch(0.72 0.12 160 / 0.25)",
  },
  {
    emoji: "🏦",
    badge: "Smart Contract Escrow",
    badgeColor: "oklch(0.77 0.13 85)",
    badgeBg: "oklch(0.77 0.13 85 / 0.12)",
    badgeBorder: "oklch(0.77 0.13 85 / 0.35)",
    title: "Un coffre-fort automatique",
    description:
      "Quand vous payez, l'argent est verrouillé dans un contrat automatique. Il se libère seulement quand le service est confirmé. Personne — ni vendeur, ni KongoKash — ne peut forcer l'ouverture.",
    accentColor: "oklch(0.77 0.13 85)",
    borderColor: "oklch(0.77 0.13 85 / 0.25)",
  },
  {
    emoji: "🌐",
    badge: "Hébergé sur ICP",
    badgeColor: "oklch(0.76 0.12 290)",
    badgeBg: "oklch(0.76 0.12 290 / 0.12)",
    badgeBorder: "oklch(0.76 0.12 290 / 0.35)",
    title: "Aucun serveur à éteindre",
    description:
      "L'application tourne sur Internet Computer (ICP), une blockchain décentralisée. Il n'y a aucun serveur central que quelqu'un peut fermer. KongoKash ne peut pas disparaître du jour au lendemain.",
    accentColor: "oklch(0.76 0.12 290)",
    borderColor: "oklch(0.76 0.12 290 / 0.25)",
  },
];

export default function TrustSection({ onLearnMore }: TrustSectionProps) {
  return (
    <section
      id="trust"
      className="relative overflow-hidden py-20 px-6"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.16 0.06 195) 0%, oklch(0.13 0.04 200) 100%)",
      }}
    >
      <div className="absolute inset-0 geo-pattern opacity-20" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{
              background: "oklch(0.52 0.12 160 / 0.15)",
              color: "oklch(0.75 0.14 160)",
              border: "1px solid oklch(0.52 0.12 160 / 0.3)",
            }}
          >
            Sécurité & Confiance
          </span>
          <h2
            className="font-display font-bold text-white"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
          >
            Pourquoi faire confiance à{" "}
            <span style={{ color: "oklch(0.77 0.13 85)" }}>KongoKash ?</span>
          </h2>
          <p
            className="mt-3 text-base max-w-2xl mx-auto leading-relaxed"
            style={{ color: "oklch(0.68 0.06 195)" }}
          >
            Trois garanties techniques qui rendent impossible le vol ou le
            blocage de vos fonds.
          </p>
        </motion.div>

        {/* ═══ TRUST STATEMENT HERO BLOCK ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="rounded-2xl p-7 md:p-9 mb-10"
          style={{
            background: "oklch(0.72 0.12 160 / 0.08)",
            border: "2px solid oklch(0.72 0.12 160 / 0.40)",
          }}
          data-ocid="trust.panel"
        >
          {/* Lock icon row */}
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{
                background: "oklch(0.72 0.12 160 / 0.15)",
                border: "1.5px solid oklch(0.72 0.12 160 / 0.35)",
              }}
            >
              🔐
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight mb-2">
                Vos fonds sont 100% sous votre contrôle
              </h3>
              <p className="text-base leading-relaxed">
                <span style={{ color: "oklch(0.75 0.14 160)" }}>
                  KongoKash ne peut{" "}
                </span>
                <strong
                  style={{ color: "oklch(0.72 0.19 30)", fontWeight: 800 }}
                >
                  PAS
                </strong>
                <span style={{ color: "oklch(0.75 0.14 160)" }}>
                  {" "}
                  accéder à votre argent
                </span>
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: "oklch(0.72 0.17 145 / 0.15)",
                color: "oklch(0.78 0.17 145)",
                border: "1px solid oklch(0.72 0.17 145 / 0.40)",
              }}
            >
              ✓ Non-Custodial
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: "oklch(0.72 0.12 160 / 0.15)",
                color: "oklch(0.78 0.14 160)",
                border: "1px solid oklch(0.72 0.12 160 / 0.40)",
              }}
            >
              ✓ Vérifiable on-chain
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: "oklch(0.70 0.16 55 / 0.15)",
                color: "oklch(0.82 0.14 65)",
                border: "1px solid oklch(0.70 0.16 55 / 0.40)",
              }}
            >
              ⚖️ Arbitrage en cas de litige
            </span>
          </div>

          {/* Arbitrage note */}
          <div
            className="rounded-xl px-5 py-3 mb-4"
            style={{
              background: "oklch(0.70 0.16 55 / 0.08)",
              border: "1px solid oklch(0.70 0.16 55 / 0.25)",
            }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{ color: "oklch(0.82 0.10 65)" }}
            >
              ⚖️ <strong>En cas de litige</strong> → un arbitre neutre intervient
              et sa décision est enregistrée de façon permanente et traçable
              on-chain.
            </p>
          </div>

          {/* Beginner note */}
          <p
            className="text-xs leading-relaxed italic"
            style={{ color: "oklch(0.62 0.07 195)" }}
          >
            🤔{" "}
            <strong style={{ color: "oklch(0.72 0.08 195)" }}>
              C'est quoi non-custodial ?
            </strong>{" "}
            Cela signifie que votre argent est dans votre propre coffre — pas
            dans celui de KongoKash.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {TRUST_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.13 }}
              className="relative rounded-2xl p-7 flex flex-col gap-4 group hover:translate-y-[-2px] transition-transform duration-300"
              style={{
                background: "oklch(0.19 0.07 195 / 0.7)",
                border: `1.5px solid ${card.borderColor}`,
                backdropFilter: "blur(16px)",
              }}
              data-ocid={`trust.item.${i + 1}`}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  boxShadow: `0 0 40px ${card.accentColor}20`,
                }}
              />

              {/* Icon + Badge row */}
              <div className="flex items-start justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    background: `${card.accentColor}15`,
                    border: `1px solid ${card.accentColor}30`,
                  }}
                >
                  {card.emoji}
                </div>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mt-1"
                  style={{
                    background: card.badgeBg,
                    color: card.badgeColor,
                    border: `1px solid ${card.badgeBorder}`,
                  }}
                >
                  {card.badge}
                </span>
              </div>

              {/* Text */}
              <h3
                className="font-display font-bold text-lg leading-snug"
                style={{ color: "oklch(0.95 0.02 200)" }}
              >
                {card.title}
              </h3>
              <p
                className="text-sm leading-relaxed flex-1"
                style={{ color: "oklch(0.68 0.06 195)" }}
              >
                {card.description}
              </p>

              {/* Accent line */}
              <div
                className="h-0.5 rounded-full w-12 mt-2"
                style={{ background: card.accentColor }}
              />
            </motion.div>
          ))}
        </div>

        {/* Guarantee bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative rounded-2xl px-8 py-5 text-center flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{
            background: "oklch(0.52 0.12 160 / 0.10)",
            border: "1.5px solid oklch(0.52 0.12 160 / 0.30)",
          }}
          data-ocid="trust.secondary_button"
        >
          <p
            className="font-semibold text-sm sm:text-base"
            style={{ color: "oklch(0.88 0.08 160)" }}
          >
            🔐 Aucune personne, aucune entreprise ne peut bloquer vos fonds —
            c'est garanti par le code
          </p>
          {onLearnMore && (
            <button
              type="button"
              onClick={onLearnMore}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all hover:brightness-110"
              style={{
                background: "oklch(0.52 0.12 160 / 0.25)",
                color: "oklch(0.82 0.10 160)",
                border: "1px solid oklch(0.52 0.12 160 / 0.45)",
              }}
            >
              En savoir plus →
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
