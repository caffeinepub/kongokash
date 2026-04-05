import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Hash,
  HelpCircle,
  Lock,
  PartyPopper,
  Scale,
  Shield,
  Star,
  Timer,
  TrendingUp,
  UserCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ─── Escrow Steps ─────────────────────────────────────────────────────────────
const ESCROW_STEPS = [
  {
    step: 1,
    icon: Wallet,
    iconColor: "oklch(0.80 0.14 75)",
    iconBg: "oklch(0.65 0.16 75 / 0.15)",
    title: "Vendeur dépose crypto",
    desc: "Le vendeur publie une offre. Ses fonds crypto sont automatiquement verrouillés dans un smart contract — impossible de les retirer pendant la transaction.",
    accentColor: "oklch(0.65 0.16 75)",
  },
  {
    step: 2,
    icon: Lock,
    iconColor: "oklch(0.72 0.12 160)",
    iconBg: "oklch(0.42 0.13 160 / 0.15)",
    title: "Fonds bloqués (Escrow)",
    desc: "Les fonds sont sécurisés dans un contrat intelligent sur la blockchain ICP. Ni le vendeur, ni KongoKash ne peut y accéder — seul le protocole peut les libérer.",
    accentColor: "oklch(0.42 0.13 160)",
  },
  {
    step: 3,
    icon: Zap,
    iconColor: "oklch(0.78 0.12 280)",
    iconBg: "oklch(0.45 0.18 280 / 0.15)",
    title: "Acheteur envoie le paiement fiat",
    desc: "L'acheteur envoie l'argent via Airtel Money, M-Pesa, Orange ou virement bancaire, puis soumet sa preuve de paiement avec capture d'écran et ID de transaction.",
    accentColor: "oklch(0.45 0.18 280)",
  },
  {
    step: 4,
    icon: CheckCircle2,
    iconColor: "oklch(0.72 0.12 160)",
    iconBg: "oklch(0.42 0.13 160 / 0.15)",
    title: "Libération automatique",
    desc: "Si la preuve est validée automatiquement (score ≥ 85), les fonds crypto sont libérés instantanément. Sinon, 30 minutes après soumission avec preuve cohérente.",
    accentColor: "oklch(0.72 0.12 160)",
  },
  {
    step: 5,
    icon: PartyPopper,
    iconColor: "oklch(0.77 0.13 85)",
    iconBg: "oklch(0.65 0.16 75 / 0.15)",
    title: "Transaction terminée",
    desc: "Les deux parties reçoivent une confirmation. Le score de confiance est mis à jour. La transaction est enregistrée de façon immuable sur la blockchain.",
    accentColor: "oklch(0.77 0.13 85)",
  },
];

// ─── Dispute Steps ────────────────────────────────────────────────────────────
const DISPUTE_STEPS = [
  {
    icon: AlertTriangle,
    iconColor: "oklch(0.75 0.15 60)",
    title: "Litige déclenché automatiquement",
    desc: "Si le vendeur ne confirme pas la réception dans les 30 minutes, ou si une incohérence est détectée, un litige est ouvert automatiquement par le système.",
  },
  {
    icon: FileText,
    iconColor: "oklch(0.72 0.12 160)",
    title: "Soumission des preuves",
    desc: "Les deux parties soumettent leurs preuves (captures d'écran, SMS de confirmation, ID de transaction). Chaque fichier reçoit un hash SHA-256 anti-falsification.",
  },
  {
    icon: Bot,
    iconColor: "oklch(0.78 0.12 280)",
    title: "Analyse automatique",
    desc: "Le système analyse : matching du montant, métadonnées de l'image, détection de duplicata, cohérence horodatage. Un score de vérification est calculé.",
  },
  {
    icon: Scale,
    iconColor: "oklch(0.75 0.15 60)",
    title: "Arbitrage humain si nécessaire",
    desc: "Si le score est insuffisant, un arbitre humain (admin ou futur DAO) examine les preuves et rend une décision. Le motif est obligatoire pour garantir la transparence.",
  },
  {
    icon: Hash,
    iconColor: "oklch(0.72 0.12 160)",
    title: "Décision immuable enregistrée",
    desc: "Toute décision est enregistrée dans un log append-only avec hash chaîné — impossible à modifier ou falsifier. Visible par les deux parties.",
  },
];

// ─── Trust Score Factors ──────────────────────────────────────────────────────
const TRUST_FACTORS = [
  {
    icon: CheckCircle2,
    label: "Trades complétés",
    desc: "Plus vous complétez de trades avec succès, plus votre score augmente.",
    color: "oklch(0.72 0.12 160)",
  },
  {
    icon: AlertTriangle,
    label: "Taux de litiges",
    desc: "Un faible taux de litiges récompense les traders de bonne foi.",
    color: "oklch(0.75 0.15 60)",
  },
  {
    icon: Timer,
    label: "Réactivité",
    desc: "Répondre rapidement améliore votre score et votre classement.",
    color: "oklch(0.78 0.12 280)",
  },
  {
    icon: TrendingUp,
    label: "Volume total échangé",
    desc: "Plus votre volume historique est élevé, plus vous êtes crédible.",
    color: "oklch(0.77 0.13 85)",
  },
];

export default function P2PHowItWorks() {
  const [isVisible, setIsVisible] = useState(true);
  const [disputeOpen, setDisputeOpen] = useState(false);

  return (
    <div className="space-y-0">
      {/* Toggle header — uses button for proper semantics */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-colors text-left"
        style={{
          background: "oklch(0.15 0.04 175 / 0.5)",
          border: "1px solid oklch(0.42 0.13 160 / 0.25)",
        }}
        onClick={() => setIsVisible((v) => !v)}
        data-ocid="p2p.toggle"
        aria-expanded={isVisible}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.42 0.13 160 / 0.3)" }}
          >
            <HelpCircle size={14} style={{ color: "oklch(0.72 0.12 160)" }} />
          </div>
          <span
            className="font-semibold text-sm"
            style={{ color: "oklch(0.85 0.06 180)" }}
          >
            Comment ça marche — P2P Escrow
          </span>
          <Badge
            className="text-xs"
            style={{
              background: "oklch(0.42 0.13 160 / 0.2)",
              color: "oklch(0.72 0.12 160)",
              border: "1px solid oklch(0.42 0.13 160 / 0.4)",
            }}
          >
            Guide
          </Badge>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "oklch(0.60 0.08 195)" }}
        >
          {isVisible ? (
            <>
              <span>Masquer</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span>Voir comment ça marche ↓</span>
              <ChevronDown size={14} />
            </>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="rounded-b-2xl p-5 space-y-7"
              style={{
                background:
                  "linear-gradient(180deg, oklch(0.13 0.03 195 / 0.9), oklch(0.11 0.02 220 / 0.95))",
                border: "1px solid oklch(0.42 0.13 160 / 0.2)",
                borderTop: "none",
              }}
            >
              {/* ── Part A: Escrow Flow ────────────────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield size={15} style={{ color: "oklch(0.72 0.12 160)" }} />
                  <h3
                    className="font-bold text-sm uppercase tracking-wider"
                    style={{ color: "oklch(0.72 0.12 160)" }}
                  >
                    Les 5 étapes du paiement sécurisé
                  </h3>
                </div>

                {/* Stepper */}
                <div className="relative">
                  {/* Vertical connector line */}
                  <div
                    className="absolute left-5 top-8 bottom-8 w-0.5 hidden sm:block"
                    style={{
                      background:
                        "linear-gradient(to bottom, oklch(0.65 0.16 75 / 0.4), oklch(0.42 0.13 160 / 0.3), oklch(0.45 0.18 280 / 0.3), oklch(0.42 0.13 160 / 0.3), oklch(0.65 0.16 75 / 0.4))",
                    }}
                  />
                  <div className="space-y-3">
                    {ESCROW_STEPS.map((step, i) => (
                      <motion.div
                        key={step.step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.3 }}
                        className="flex items-start gap-3 sm:gap-4"
                        data-ocid={`p2p.item.${i + 1}`}
                      >
                        {/* Step icon */}
                        <div
                          className="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border"
                          style={{
                            background: step.iconBg,
                            borderColor: `${step.accentColor}40`,
                          }}
                        >
                          <step.icon
                            size={16}
                            style={{ color: step.iconColor }}
                          />
                          <span
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold"
                            style={{
                              background: "oklch(0.15 0.04 195)",
                              color: step.accentColor,
                              border: `1px solid ${step.accentColor}50`,
                              fontSize: "9px",
                            }}
                          >
                            {step.step}
                          </span>
                        </div>
                        {/* Content */}
                        <div className="flex-1 pt-1 pb-2">
                          <p
                            className="font-semibold text-sm mb-1"
                            style={{ color: "oklch(0.92 0.03 195)" }}
                          >
                            {step.title}
                          </p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div
                className="h-px"
                style={{
                  background:
                    "linear-gradient(to right, transparent, oklch(0.42 0.13 160 / 0.3), transparent)",
                }}
              />

              {/* ── Part B: Dispute Management ────────────────────── */}
              <Collapsible open={disputeOpen} onOpenChange={setDisputeOpen}>
                <CollapsibleTrigger
                  className="flex items-center justify-between w-full text-left group"
                  data-ocid="p2p.panel"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "oklch(0.60 0.18 30 / 0.2)" }}
                    >
                      <AlertTriangle
                        size={12}
                        style={{ color: "oklch(0.75 0.15 60)" }}
                      />
                    </div>
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "oklch(0.85 0.06 60)" }}
                    >
                      En cas de problème — Gestion des litiges
                    </span>
                  </div>
                  <span
                    className="text-xs transition-colors"
                    style={{ color: "oklch(0.60 0.08 195)" }}
                  >
                    {disputeOpen ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </span>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 space-y-3"
                    >
                      {DISPUTE_STEPS.map((ds, i) => (
                        <div
                          key={ds.title}
                          className="flex items-start gap-3 p-3 rounded-xl"
                          style={{
                            background: "oklch(0.14 0.04 195 / 0.6)",
                            border: "1px solid oklch(0.60 0.18 30 / 0.15)",
                          }}
                          data-ocid={`p2p.row.${i + 1}`}
                        >
                          <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              background: "oklch(0.60 0.18 30 / 0.12)",
                            }}
                          >
                            <ds.icon
                              size={14}
                              style={{ color: ds.iconColor }}
                            />
                          </div>
                          <div>
                            <p
                              className="text-sm font-semibold mb-0.5"
                              style={{ color: "oklch(0.90 0.04 180)" }}
                            >
                              {ds.title}
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {ds.desc}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* DAO teaser */}
                      <div
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs"
                        style={{
                          background: "oklch(0.45 0.18 280 / 0.08)",
                          border: "1px solid oklch(0.45 0.18 280 / 0.2)",
                        }}
                      >
                        <UserCheck
                          size={13}
                          style={{ color: "oklch(0.78 0.12 280)" }}
                        />
                        <span style={{ color: "oklch(0.75 0.08 280)" }}>
                          <strong style={{ color: "oklch(0.78 0.12 280)" }}>
                            Futur DAO :
                          </strong>{" "}
                          L'arbitrage sera progressivement confié à la
                          communauté via vote OKP — plus transparent, plus
                          décentralisé.
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </CollapsibleContent>
              </Collapsible>

              {/* Divider */}
              <div
                className="h-px"
                style={{
                  background:
                    "linear-gradient(to right, transparent, oklch(0.77 0.13 85 / 0.25), transparent)",
                }}
              />

              {/* ── Part C: Trust Score ───────────────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star
                    size={15}
                    style={{ color: "oklch(0.77 0.13 85)" }}
                    fill="oklch(0.77 0.13 85)"
                  />
                  <h3
                    className="font-bold text-sm uppercase tracking-wider"
                    style={{ color: "oklch(0.77 0.13 85)" }}
                  >
                    Score de confiance (0–100)
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {TRUST_FACTORS.map((tf, i) => (
                    <div
                      key={tf.label}
                      className="flex items-start gap-2.5 p-3 rounded-xl"
                      style={{
                        background: "oklch(0.15 0.03 195 / 0.5)",
                        border: `1px solid ${tf.color}25`,
                      }}
                      data-ocid={`p2p.card.${i + 1}`}
                    >
                      <tf.icon
                        size={14}
                        style={{ color: tf.color }}
                        className="flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: tf.color }}
                        >
                          {tf.label}
                        </p>
                        <p className="text-xs text-slate-500 leading-snug mt-0.5">
                          {tf.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Highlight */}
                <div
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.16 75 / 0.1), oklch(0.77 0.13 85 / 0.06))",
                    border: "1px solid oklch(0.77 0.13 85 / 0.25)",
                  }}
                >
                  <Star
                    size={13}
                    style={{ color: "oklch(0.77 0.13 85)" }}
                    fill="oklch(0.77 0.13 85)"
                  />
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.82 0.08 85)" }}
                  >
                    Les vendeurs avec un{" "}
                    <strong style={{ color: "oklch(0.77 0.13 85)" }}>
                      score élevé
                    </strong>{" "}
                    ont leur offre mise en avant dans le marché P2P.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
