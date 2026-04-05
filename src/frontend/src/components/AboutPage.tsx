import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  ShieldCheck,
  X,
} from "lucide-react";
import { motion } from "motion/react";

interface AboutPageProps {
  onGetStarted?: () => void;
  onViewWhitepaper?: () => void;
}

// ── Section: Ce que c'est / Ce que ce n'est pas ─────────────────────────────
const WHAT_IT_IS = [
  {
    icon: "🤝",
    title: "Un réseau P2P",
    desc: "KongoKash met en contact des acheteurs et des vendeurs directement — sans intermédiaire. Vous échangez entre personnes, pas avec une institution.",
  },
  {
    icon: "🔒",
    title: "Un protocole escrow",
    desc: "Chaque transaction est protégée par un contrat intelligent. Les fonds sont bloqués et libérés automatiquement — personne ne peut les détourner.",
  },
  {
    icon: "📱",
    title: "Un accès Mobile Money",
    desc: "Airtel Money, M-Pesa, Orange, Vodacom. Vous n'avez pas besoin d'un compte bancaire. Votre téléphone suffit.",
  },
];

const WHAT_IT_IS_NOT = [
  {
    label: "Une banque",
    reason:
      "KongoKash ne détient pas votre argent. Vos fonds restent sous votre contrôle.",
  },
  {
    label: "Un exchange centralisé",
    reason:
      "Aucun serveur central, aucune entreprise ne peut geler vos fonds ou fermer votre compte.",
  },
  {
    label: "Un wallet custodial",
    reason:
      "Ni KongoKash ni personne d'autre n'a accès à vos clés privées. Jamais.",
  },
];

// ── Section: Sécurité expliquée simplement ──────────────────────────────────
const SECURITY_SIMPLE = [
  {
    icon: "🏦",
    title: "L'escrow : le coffre-fort neutre",
    analogy:
      "Imaginez un coffre-fort posé entre vous et l'acheteur. Vous verrouillez votre crypto dedans. L'acheteur paie en Mobile Money. Le coffre s'ouvre automatiquement une fois le paiement confirmé. Ni vous, ni l'acheteur, ni KongoKash ne peut forcer l'ouverture.",
    badge: "Smart Contract",
    badgeColor: "oklch(0.72 0.12 160)",
  },
  {
    icon: "🔑",
    title: "Wallet non-custodial : votre argent, vos clés",
    analogy:
      "Votre wallet, c'est comme un coffre dont vous seul avez la combinaison (votre phrase secrète de 12 mots). KongoKash n'a pas de double. Si vous perdez votre téléphone, vous récupérez tout avec votre phrase. Personne d'autre ne peut accéder à vos fonds.",
    badge: "Non-Custodial",
    badgeColor: "oklch(0.77 0.13 85)",
  },
  {
    icon: "🏛️",
    title: "ICP : aucun serveur central",
    analogy:
      "L'application tourne sur l'Internet Computer — une blockchain décentralisée. Il n'y a aucun serveur que quelqu'un peut éteindre, pirater ou saisir. Votre accès est permanent.",
    badge: "Décentralisé",
    badgeColor: "oklch(0.60 0.18 240)",
  },
  {
    icon: "🔒",
    title: "Chiffrement militaire",
    analogy:
      "Vos clés privées sont chiffrées avec scrypt + AES-256-GCM — les mêmes standards utilisés par les armées et les banques mondiales. Même si quelqu'un volait votre téléphone, il ne pourrait pas déchiffrer vos données sans votre mot de passe.",
    badge: "AES-256-GCM",
    badgeColor: "oklch(0.55 0.15 270)",
  },
];

// ── Comparison ────────────────────────────────────────────────────────────────
const comparisonRows = [
  {
    feature: "Contrôle des fonds",
    bank: { value: "La banque", positive: false },
    exchange: { value: "L'exchange", positive: false },
    kk: { value: "Vous", positive: true },
  },
  {
    feature: "Frais",
    bank: { value: "Élevés", positive: false },
    exchange: { value: "Variables", positive: null },
    kk: { value: "< 1%", positive: true },
  },
  {
    feature: "Mobile Money",
    bank: { value: "Non", positive: false },
    exchange: { value: "Non", positive: false },
    kk: { value: "Airtel, M-Pesa…", positive: true },
  },
  {
    feature: "Décentralisé",
    bank: { value: "Non", positive: false },
    exchange: { value: "Non", positive: false },
    kk: { value: "ICP", positive: true },
  },
  {
    feature: "Sans frontières",
    bank: { value: "Limité", positive: null },
    exchange: { value: "Limité", positive: null },
    kk: { value: "Oui", positive: true },
  },
];

function CellIcon({ positive }: { positive: boolean | null }) {
  if (positive === true) return <span className="text-base">✅</span>;
  if (positive === false) return <span className="text-base">❌</span>;
  return <span className="text-base">⚠️</span>;
}

export default function AboutPage({
  onGetStarted,
  onViewWhitepaper,
}: AboutPageProps) {
  return (
    <div className="text-white">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-20 px-6"
        style={{
          background:
            "linear-gradient(150deg, oklch(0.14 0.06 195) 0%, oklch(0.18 0.08 190) 55%, oklch(0.16 0.05 200) 100%)",
        }}
      >
        <div className="absolute inset-0 geo-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
              style={{
                background: "oklch(0.77 0.13 85 / 0.15)",
                color: "oklch(0.77 0.13 85)",
                border: "1px solid oklch(0.77 0.13 85 / 0.3)",
              }}
            >
              À propos de KongoKash
            </span>

            <h1
              className="font-display font-bold mb-4"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                lineHeight: 1.2,
              }}
            >
              KongoKash, c'est quoi exactement ?
            </h1>

            <p
              className="text-xl font-semibold mb-3"
              style={{ color: "oklch(0.77 0.13 85)" }}
            >
              Un réseau de paiement P2P africain.
            </p>

            <p
              className="text-base max-w-2xl mx-auto leading-relaxed"
              style={{ color: "oklch(0.72 0.05 195)" }}
            >
              Vous échangez directement avec d'autres personnes — sans banque,
              sans intermédiaire. Chaque transaction est protégée par un smart
              contract. Vos fonds vous appartiennent à 100%.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Ce que c'est / Ce que ce n'est pas ── */}
      <section
        className="py-16 px-6"
        style={{ background: "oklch(0.12 0.05 195)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Ce que c'est */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className="font-display font-bold text-xl mb-6"
                style={{ color: "oklch(0.72 0.12 160)" }}
              >
                ✅ KongoKash, c'est :
              </h2>
              <div className="space-y-4">
                {WHAT_IT_IS.map((item, i) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 p-4 rounded-2xl"
                    style={{
                      background: "oklch(0.18 0.07 195 / 0.7)",
                      border: "1.5px solid oklch(0.72 0.12 160 / 0.25)",
                    }}
                    data-ocid={`about.mission.item.${i + 1}`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">
                      {item.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-sm mb-1">
                        {item.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "oklch(0.68 0.06 195)" }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Ce que ce n'est pas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <h2
                className="font-display font-bold text-xl mb-6"
                style={{ color: "oklch(0.68 0.16 25)" }}
              >
                ❌ KongoKash n'est PAS :
              </h2>
              <div className="space-y-4">
                {WHAT_IT_IS_NOT.map((item, i) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 p-4 rounded-2xl"
                    style={{
                      background: "oklch(0.16 0.05 195 / 0.6)",
                      border: "1.5px solid oklch(0.60 0.18 30 / 0.2)",
                    }}
                    data-ocid={`about.values.item.${i + 1}`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "oklch(0.60 0.18 30 / 0.15)" }}
                    >
                      <X size={14} style={{ color: "oklch(0.68 0.16 25)" }} />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-sm mb-1"
                        style={{ color: "oklch(0.80 0.10 30)" }}
                      >
                        {item.label}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "oklch(0.65 0.06 195)" }}
                      >
                        {item.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Sécurité expliquée simplement ── */}
      <section
        className="py-20 px-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.14 0.07 200) 0%, oklch(0.16 0.06 190) 100%)",
        }}
      >
        <div className="absolute inset-0 geo-pattern opacity-15" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{
                background: "oklch(0.52 0.12 160 / 0.15)",
                color: "oklch(0.75 0.14 160)",
                border: "1px solid oklch(0.52 0.12 160 / 0.35)",
              }}
            >
              Sécurité expliquée simplement
            </span>
            <h2
              className="font-display font-bold mb-3"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
            >
              Comment vos fonds sont-ils{" "}
              <span style={{ color: "oklch(0.75 0.14 160)" }}>protégés ?</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Pas de jargon technique. Juste ce que vous devez savoir avant de
              déposer de l'argent.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {SECURITY_SIMPLE.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-7 flex flex-col gap-4"
                style={{
                  background: "oklch(0.16 0.07 195 / 0.8)",
                  border: `1.5px solid ${item.badgeColor}28`,
                  backdropFilter: "blur(12px)",
                }}
                data-ocid={`about.security.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: `${item.badgeColor}18` }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0"
                    style={{
                      background: `${item.badgeColor}18`,
                      color: item.badgeColor,
                      border: `1px solid ${item.badgeColor}30`,
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-display font-bold text-white text-base leading-snug">
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed italic"
                  style={{ color: "oklch(0.72 0.06 195)" }}
                >
                  {item.analogy}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Audit banner */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5"
            style={{
              background: "oklch(0.52 0.12 160 / 0.08)",
              border: "1px solid oklch(0.52 0.12 160 / 0.3)",
            }}
            data-ocid="about.security.panel"
          >
            <ShieldCheck
              size={36}
              style={{ color: "oklch(0.75 0.14 160)" }}
              className="shrink-0"
            />
            <div>
              <p className="font-semibold text-white mb-1">
                Audit de sécurité indépendant prévu pour 2026
              </p>
              <p className="text-sm" style={{ color: "oklch(0.68 0.06 195)" }}>
                Avant le lancement public, tous les smart contracts seront
                audités par un cabinet indépendant. Toutes les vulnérabilités
                seront corrigées avant la mise en production.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section
        className="py-20 px-6"
        style={{ background: "oklch(0.11 0.05 195)" }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="font-display font-bold mb-3"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
            >
              Pourquoi{" "}
              <span style={{ color: "oklch(0.77 0.13 85)" }}>KongoKash ?</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Une comparaison honnête avec les alternatives existantes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="overflow-x-auto rounded-2xl"
            style={{ border: "1px solid oklch(0.77 0.13 85 / 0.2)" }}
            data-ocid="about.comparison.table"
          >
            <table className="w-full min-w-[480px]">
              <thead>
                <tr
                  style={{
                    background: "oklch(0.18 0.07 195)",
                    borderBottom: "1px solid oklch(0.77 0.13 85 / 0.25)",
                  }}
                >
                  <th className="text-left px-6 py-4 text-sm font-semibold text-white/60">
                    Critère
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-white/60 text-center">
                    Banque classique
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-white/60 text-center">
                    Exchange centralisé
                  </th>
                  <th
                    className="px-6 py-4 text-sm font-semibold text-center"
                    style={{ color: "oklch(0.77 0.13 85)" }}
                  >
                    KongoKash ✓
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    style={{
                      background:
                        i % 2 === 0
                          ? "oklch(0.14 0.06 195)"
                          : "oklch(0.16 0.06 195)",
                      borderBottom: "1px solid oklch(1 0 0 / 0.05)",
                    }}
                    data-ocid={`about.comparison.row.${i + 1}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white/80">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <CellIcon positive={row.bank.positive} />
                        <span className="text-xs text-white/50">
                          {row.bank.value}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <CellIcon positive={row.exchange.positive} />
                        <span className="text-xs text-white/50">
                          {row.exchange.value}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <CellIcon positive={row.kk.positive} />
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "oklch(0.75 0.14 160)" }}
                        >
                          {row.kk.value}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-20 px-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(150deg, oklch(0.16 0.08 195) 0%, oklch(0.14 0.06 200) 100%)",
        }}
      >
        <div className="absolute inset-0 geo-pattern opacity-15" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-2xl mx-auto text-center space-y-6"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-2"
            style={{
              background: "oklch(0.52 0.12 160 / 0.15)",
              color: "oklch(0.78 0.14 160)",
              border: "1px solid oklch(0.52 0.12 160 / 0.35)",
            }}
          >
            <CheckCircle2 size={14} />
            Prêt à commencer ?
          </div>

          <h2
            className="font-display font-bold"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
          >
            Rejoignez la communauté{" "}
            <span style={{ color: "oklch(0.77 0.13 85)" }}>KongoKash</span>
          </h2>
          <p className="text-white/60 leading-relaxed">
            Créez votre wallet non-custodial en moins de 2 minutes. Vos fonds
            restent sous votre contrôle — toujours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="font-semibold text-base px-8 py-3 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: "oklch(0.52 0.12 160)" }}
              data-ocid="about.primary_button"
            >
              Rejoindre KongoKash
              <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onViewWhitepaper}
              className="font-semibold text-base px-8 py-3 rounded-xl border-2 transition-all hover:opacity-90"
              style={{
                borderColor: "oklch(0.77 0.13 85 / 0.6)",
                color: "oklch(0.77 0.13 85)",
                background: "oklch(0.77 0.13 85 / 0.08)",
              }}
              data-ocid="about.secondary_button"
            >
              <BookOpen size={16} className="mr-2" />
              Lire le Livre Blanc
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
