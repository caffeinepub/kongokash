import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, CheckCircle2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface AboutPageProps {
  onGetStarted?: () => void;
  onViewWhitepaper?: () => void;
}

const missionCards = [
  {
    icon: "🌍",
    title: "Inclusion financière",
    description:
      "Donner accès à la finance décentralisée à chaque Congolais, même sans compte bancaire traditionnel. KongoKash est pour tous.",
  },
  {
    icon: "💱",
    title: "Paiement africain",
    description:
      "Échangez des cryptomonnaies contre des Francs Congolais (CDF) directement via Airtel Money, M-Pesa, Vodacom et Orange — sans intermédiaire coûteux.",
  },
  {
    icon: "🏗️",
    title: "Infrastructure neutre",
    description:
      "KongoKash est un protocole, pas une banque. Vos fonds vous appartiennent toujours. Nous ne contrôlons rien — et c'est voulu.",
  },
];

const securityItems = [
  {
    icon: "🔑",
    title: "Wallet Non-Custodial",
    description:
      "KongoKash ne détient jamais vos clés privées. Vous contrôlez vos fonds à 100% grâce à votre phrase secrète (seed phrase de 12 ou 24 mots). Ni KongoKash ni personne d'autre ne peut accéder à votre wallet.",
    badge: "Contrôle total",
    badgeColor: "oklch(0.52 0.12 160)",
  },
  {
    icon: "🔒",
    title: "Chiffrement Avancé (scrypt + AES-256-GCM)",
    description:
      "Vos clés sont chiffrées localement avec scrypt (résistant aux attaques GPU/ASIC modernes) et AES-256-GCM — le même standard que les institutions bancaires et militaires mondiales.",
    badge: "Standard militaire",
    badgeColor: "oklch(0.55 0.15 270)",
  },
  {
    icon: "🛡️",
    title: "Escrow Smart Contract",
    description:
      "Chaque paiement de réservation est automatiquement verrouillé dans un smart contract immuable. Les fonds ne sont libérés qu'après confirmation du service — jamais avant, jamais sans votre accord.",
    badge: "Protection escrow",
    badgeColor: "oklch(0.65 0.14 85)",
  },
  {
    icon: "🏛️",
    title: "Hébergé sur ICP (Internet Computer)",
    description:
      "100% décentralisé sur l'Internet Computer Protocol. Aucun serveur central ne peut être saisi, censuré ou mis hors ligne. Ni KongoKash ni personne d'autre ne peut bloquer votre accès à vos fonds.",
    badge: "100% Décentralisé",
    badgeColor: "oklch(0.60 0.18 240)",
  },
  {
    icon: "📋",
    title: "KYC & Anti-Fraude Actif",
    description:
      "Vérification d'identité pour la sécurité de tous les utilisateurs. Système anti-fraude avancé : device fingerprinting, détection de multi-comptes, IPs suspectes et sanctions automatiques.",
    badge: "Protection communauté",
    badgeColor: "oklch(0.55 0.14 30)",
  },
];

const trustBadges = [
  { label: "Wallet Non-Custodial", icon: "🔑" },
  { label: "Chiffrement scrypt + AES-256-GCM", icon: "🔒" },
  { label: "Smart Contract Escrow", icon: "🛡️" },
  { label: "100% Décentralisé (ICP)", icon: "🏛️" },
  { label: "Audit Prévu 2026", icon: "✅" },
];

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

const values = [
  {
    icon: "🔍",
    title: "Transparence",
    description:
      "Tous nos smart contracts sont publics et vérifiables. Les frais, le flux des revenus et la trésorerie sont visibles on-chain par tous.",
  },
  {
    icon: "🔐",
    title: "Sécurité",
    description:
      "Chiffrement de niveau bancaire, wallet non-custodial, escrow automatique. Votre sécurité n'est jamais un compromis chez KongoKash.",
  },
  {
    icon: "🤝",
    title: "Accessibilité",
    description:
      "Conçu pour les Congolais, les touristes, et tous les Africains. Une interface simple, en français, accessible même avec une connexion lente.",
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
        className="relative overflow-hidden py-24 px-6"
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
              className="font-display font-bold mb-5"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                lineHeight: 1.15,
              }}
            >
              La plateforme décentralisée pour
              <br />
              <span style={{ color: "oklch(0.77 0.13 85)" }}>
                l'inclusion financière en Afrique
              </span>
            </h1>
            <p
              className="text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: "oklch(0.72 0.05 195)" }}
            >
              KongoKash permet aux Congolais — locaux et touristes — d'acheter,
              vendre et utiliser des cryptomonnaies avec des Francs Congolais
              (CDF) ou des dollars (USD), sans intermédiaire centralisé,
              directement depuis leur téléphone.
            </p>
          </motion.div>

          {/* Trust badges strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap justify-center gap-3 mt-10"
          >
            {trustBadges.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: "oklch(0.52 0.12 160 / 0.15)",
                  color: "oklch(0.78 0.14 160)",
                  border: "1px solid oklch(0.52 0.12 160 / 0.35)",
                }}
                data-ocid="about.trust.panel"
              >
                {badge.icon} {badge.label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section
        className="py-20 px-6"
        style={{ background: "oklch(0.12 0.05 195)" }}
      >
        <div className="max-w-7xl mx-auto">
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
              Notre{" "}
              <span style={{ color: "oklch(0.77 0.13 85)" }}>Mission</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Construire une infrastructure financière décentralisée au service
              du peuple congolais.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {missionCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="rounded-2xl p-7 flex flex-col gap-4"
                style={{
                  background: "oklch(0.18 0.07 195 / 0.7)",
                  border: "1.5px solid oklch(0.77 0.13 85 / 0.25)",
                }}
                data-ocid={`about.mission.item.${i + 1}`}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  style={{
                    background: "oklch(0.77 0.13 85 / 0.12)",
                    border: "1px solid oklch(0.77 0.13 85 / 0.25)",
                  }}
                >
                  {card.icon}
                </div>
                <h3
                  className="font-display font-bold text-lg"
                  style={{ color: "oklch(0.77 0.13 85)" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.72 0.05 195)" }}
                >
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section
        className="py-20 px-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.14 0.07 200) 0%, oklch(0.16 0.06 190) 100%)",
        }}
      >
        <div className="absolute inset-0 geo-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto">
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
                background: "oklch(0.52 0.12 160 / 0.15)",
                color: "oklch(0.75 0.14 160)",
                border: "1px solid oklch(0.52 0.12 160 / 0.35)",
              }}
            >
              Sécurité & Confiance
            </span>
            <h2
              className="font-display font-bold mb-3"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
            >
              🔐 Votre sécurité,{" "}
              <span style={{ color: "oklch(0.75 0.14 160)" }}>
                notre priorité absolue
              </span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              KongoKash a été conçu dès le départ avec la sécurité comme
              principe fondamental — pas comme une fonctionnalité ajoutée.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  background: "oklch(0.16 0.07 195 / 0.8)",
                  border: "1.5px solid oklch(0.52 0.12 160 / 0.25)",
                  backdropFilter: "blur(12px)",
                }}
                data-ocid={`about.security.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{
                      background: "oklch(0.52 0.12 160 / 0.15)",
                      border: "1px solid oklch(0.52 0.12 160 / 0.3)",
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                    style={{
                      background: `${item.badgeColor} / 0.15`,
                      color: item.badgeColor,
                      border: `1px solid ${item.badgeColor} / 0.3`,
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-display font-bold text-white text-base leading-snug">
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.70 0.05 195)" }}
                >
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Security assurance bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
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
                Avant le lancement public, KongoKash fera l'objet d'un audit
                complet par un cabinet de sécurité indépendant. Toutes les
                vulnérabilités identifiées seront corrigées avant la mise en
                production. La sécurité de vos fonds ne sera jamais compromise.
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

      {/* ── Values ── */}
      <section
        className="py-20 px-6"
        style={{ background: "oklch(0.14 0.06 195)" }}
      >
        <div className="max-w-7xl mx-auto">
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
              Nos <span style={{ color: "oklch(0.77 0.13 85)" }}>Valeurs</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="rounded-2xl p-7 text-center flex flex-col items-center gap-4"
                style={{
                  background: "oklch(0.18 0.07 195 / 0.6)",
                  border: "1.5px solid oklch(1 0 0 / 0.08)",
                }}
                data-ocid={`about.values.item.${i + 1}`}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                  style={{
                    background: "oklch(0.77 0.13 85 / 0.1)",
                    border: "1px solid oklch(0.77 0.13 85 / 0.25)",
                  }}
                >
                  {val.icon}
                </div>
                <h3
                  className="font-display font-bold text-lg"
                  style={{ color: "oklch(0.77 0.13 85)" }}
                >
                  {val.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.68 0.05 195)" }}
                >
                  {val.description}
                </p>
              </motion.div>
            ))}
          </div>
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
            Plus de 10 000 Congolais font déjà confiance à KongoKash pour leurs
            transactions crypto. Créez votre wallet non-custodial en moins de 2
            minutes.
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
