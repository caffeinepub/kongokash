import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Principal } from "@icp-sdk/core/principal";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Coins,
  Flame,
  Gift,
  Landmark,
  Loader2,
  Lock,
  Send,
  Shield,
  ShoppingBag,
  TrendingUp,
  Unlock,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useClaimDailyReward,
  useClaimTeamVesting,
  useInitTeamVesting,
  useOkpAdminStats,
  useOkpBalance,
  useOkpToCdfRate,
  usePayMerchantOkp,
  useStakeOkp,
  useStakes,
  useTeamVestingStatus,
  useTransferOkp,
  useUnstakeOkp,
} from "../hooks/useOkpQueries";
import { GovernanceSection } from "./GovernanceSection";

const OKP_COLOR = "oklch(0.65 0.18 35)";
const OKP_BG = "oklch(0.65 0.18 35 / 0.1)";

const OKAPI_ALLOCATIONS = [
  {
    name: "Communauté",
    percentage: 30,
    amount: 300_000_000,
    description: "Récompenses, staking et engagement de la communauté",
    locked: false,
    color: "oklch(0.55 0.18 200)",
  },
  {
    name: "Équipe",
    percentage: 20,
    amount: 200_000_000,
    description: "Fondateurs et contributeurs principaux — vesting 2 ans",
    locked: true,
    color: "oklch(0.55 0.18 290)",
  },
  {
    name: "Liquidité",
    percentage: 15,
    amount: 150_000_000,
    description: "Pools de liquidité et partenariats stratégiques",
    locked: false,
    color: "oklch(0.55 0.18 160)",
  },
  {
    name: "Investisseurs",
    percentage: 10,
    amount: 100_000_000,
    description: "Tour de financement initial et investisseurs seed",
    locked: false,
    color: "oklch(0.60 0.18 45)",
  },
  {
    name: "Marketing",
    percentage: 10,
    amount: 100_000_000,
    description: "Croissance, adoption et campagnes de notoriété",
    locked: false,
    color: "oklch(0.55 0.18 25)",
  },
  {
    name: "Réserve",
    percentage: 5,
    amount: 50_000_000,
    description: "Développement futur, audits et fonds d'urgence",
    locked: false,
    color: "oklch(0.55 0.10 240)",
  },
  {
    name: "Fonds pour l'Innovation Numérique en RDC",
    percentage: 10,
    amount: 100_000_000,
    description:
      "Allocation dédiée à soutenir l'écosystème numérique congolais — vesting 5 ans, multisig 3 signataires",
    locked: true,
    color: "oklch(0.55 0.18 265)",
  },
];

function formatOkp(n: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 4 }).format(n)} OKP`;
}

function formatOkpLarge(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);
}

function formatCDF(n: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n)} FC`;
}

function stakeMatured(startTime: bigint, durationDays: bigint): boolean {
  const startMs = Number(startTime) / 1_000_000;
  const durationMs = Number(durationDays) * 24 * 60 * 60 * 1000;
  return Date.now() >= startMs + durationMs;
}

function formatDate(nanoTs: bigint): string {
  const ms = Number(nanoTs) / 1_000_000;
  return new Date(ms).toLocaleDateString("fr-FR");
}

function rewardRateLabel(days: number): string {
  if (days >= 180) return "20%";
  if (days >= 90) return "15%";
  return "10%";
}

function WhitepaperTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  const faqs = [
    {
      q: "Qu'est-ce que le token OKP ?",
      a: "OKP (Okapi) est le token utilitaire natif de KongoKash, déployé sur Internet Computer Protocol (ICP). Il permet de réduire les frais, de recevoir des récompenses, de staker et de réaliser des paiements P2P ou marchands.",
    },
    {
      q: "Comment gagner des OKP ?",
      a: "Vous gagnez des OKP en utilisant la plateforme : +25 OKP à chaque achat de crypto, +10 OKP pour les ventes et dépôts, +5 OKP pour les transferts P2P, +50 OKP via la récompense quotidienne, et via le parrainage d'autres utilisateurs.",
    },
    {
      q: "Les OKP ont-ils une valeur réelle ?",
      a: "Oui. Le prix OKP/CDF est dynamique et évolue avec l'usage de la plateforme. Un mécanisme de burn (1,5% par transaction) réduit l'offre en circulation, limitant l'inflation et soutenant la valeur du token sur le long terme.",
    },
    {
      q: "Qu'est-ce que le staking ?",
      a: "Le staking consiste à bloquer vos OKP pendant une période définie pour recevoir des récompenses : 10% APY sur 30 jours, 15% APY sur 90 jours, et 20% APY sur 180 jours. Vos tokens sont libérés automatiquement à maturité.",
    },
    {
      q: "Comment KongoKash sécurise mes données ?",
      a: "KongoKash utilise Internet Identity, un système d'authentification décentralisé sur ICP. Aucun mot de passe n'est stocké. Le KYC est minimal (nom + téléphone) et les données sensibles (coordonnées bancaires) ne sont accessibles qu'aux utilisateurs vérifiés.",
    },
    {
      q: "Quand sera disponible le paiement mobile ?",
      a: "M-Pesa et Airtel Money seront activés après la stabilisation complète des virements bancaires Equity BCDC. Ces intégrations sont en phase de test et seront annoncées dès qu'elles sont prêtes.",
    },
  ];

  const userFlowSteps = [
    {
      icon: <Users size={20} />,
      label: "Inscription",
      sub: "Internet Identity",
    },
    {
      icon: <CheckCircle size={20} />,
      label: "KYC léger",
      sub: "Nom + Téléphone",
    },
    {
      icon: <Coins size={20} />,
      label: "Dépôt fiat",
      sub: "CDF/USD via Equity BCDC",
    },
    {
      icon: <TrendingUp size={20} />,
      label: "Achat crypto",
      sub: "BTC/ETH/USDT + gain OKP",
    },
    { icon: <Lock size={20} />, label: "Staking OKP", sub: "10–20% APY" },
    {
      icon: <Gift size={20} />,
      label: "Récompenses",
      sub: "& Paiements marchands",
    },
  ];

  const vestingData = [
    { month: 0, unlocked: 0, label: "Démarrage" },
    { month: 6, unlocked: 0, label: "Cliff — aucun déblocage" },
    { month: 12, unlocked: 0, label: "Fin du cliff" },
    { month: 18, unlocked: 50, label: "Déblocage partiel" },
    { month: 24, unlocked: 100, label: "Déblocage total" },
  ];

  const mechanismes = [
    {
      icon: <Flame size={18} />,
      title: "Burn",
      value: "1,5%",
      desc: "Destruction automatique sur chaque transaction OKP pour réduire l'offre",
      color: "oklch(0.60 0.20 25)",
    },
    {
      icon: <TrendingUp size={18} />,
      title: "Halvening",
      value: "÷2 / 50M",
      desc: "Les récompenses sont divisées par 2 tous les 50M OKP émis",
      color: "oklch(0.55 0.18 200)",
    },
    {
      icon: <Lock size={18} />,
      title: "Staking APY",
      value: "10–20%",
      desc: "Rendements progressifs : 30j=10%, 90j=15%, 180j=20%",
      color: "oklch(0.55 0.18 290)",
    },
    {
      icon: <Gift size={18} />,
      title: "Récompenses",
      value: "+5 à +50 OKP",
      desc: "Achat crypto, dépôt, P2P, parrainage, récompense quotidienne",
      color: "oklch(0.60 0.18 45)",
    },
    {
      icon: <Zap size={18} />,
      title: "Prix dynamique",
      value: "Variable",
      desc: "Base configurable par admin, évolue automatiquement avec l'usage",
      color: "oklch(0.55 0.18 160)",
    },
  ];

  const roadmap = [
    {
      phase: "Q1 2025",
      title: "Pré-lancement",
      items: [
        "KYC léger (nom + téléphone)",
        "Intégration Equity BCDC",
        "Token OKP + staking",
        "Récompenses automatiques",
      ],
      done: true,
    },
    {
      phase: "Q2 2025",
      title: "Lancement",
      items: [
        "Paiements mobiles (M-Pesa, Airtel Money)",
        "Réseau de marchands partenaires",
        "Application mobile",
      ],
      done: false,
    },
    {
      phase: "Q3 2025",
      title: "Expansion",
      items: [
        "Intégration DEX",
        "Gouvernance OKP (vote)",
        "Nouvelles banques partenaires",
      ],
      done: false,
    },
    {
      phase: "Q4 2025+",
      title: "Croissance régionale",
      items: [
        "Multi-pays : Congo-Brazzaville, Cameroun",
        "Échange fiat-to-OKP direct",
        "Listing sur exchanges",
      ],
      done: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10 max-w-4xl mx-auto pb-16"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: OKP_COLOR }}>
            <img
              src="/assets/generated/okapi-token-logo-transparent.dim_400x400.png"
              className="w-8 h-8 inline-block mr-2"
              alt="OKP"
            />{" "}
            Livre Blanc Okapi (OKP)
          </h2>
          <p className="text-muted-foreground mt-1">Version 1.0 — Mars 2025</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          data-ocid="whitepaper.primary_button"
          className="flex items-center gap-2"
          style={{ borderColor: OKP_COLOR, color: OKP_COLOR }}
        >
          <BookOpen size={16} />
          Télécharger / Imprimer
        </Button>
      </div>

      {/* Section 1 — Résumé Exécutif */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: OKP_COLOR }}>1. Résumé Exécutif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            <strong>KongoKash</strong> est une plateforme DeFi conçue pour les
            utilisateurs congolais, permettant l'achat et la vente de
            cryptomonnaies (BTC, ETH, USDT) avec des francs congolais (CDF) ou
            des dollars américains (USD), via des virements bancaires sécurisés.
            La plateforme s'appuie sur l'infrastructure décentralisée d'
            <strong>Internet Computer Protocol (ICP)</strong>.
          </p>
          <p>
            <strong>Okapi (OKP)</strong> est le token utilitaire natif de
            KongoKash. Il constitue l'épine dorsale économique de l'écosystème :
            réduction des frais de transaction, système de récompenses basé sur
            l'activité, staking avec rendements progressifs, paiements P2P et
            marchands, et conversion automatique en CDF côté commerçant.
          </p>
          <p>
            L'objectif de KongoKash est de démocratiser l'accès à la finance
            décentralisée pour les populations congolaises et africaines en
            général, en proposant une interface entièrement en français,
            culturellement adaptée, sécurisée et à faibles coûts. Le lancement
            est prévu en 2025, avec une expansion régionale vers le
            Congo-Brazzaville et le Cameroun dès 2026.
          </p>
        </CardContent>
      </Card>

      {/* Section 2 — Vision & Problème */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: OKP_COLOR }}>
            2. Vision & Problème
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <h4 className="font-semibold text-destructive mb-2">
                ❌ Problèmes actuels
              </h4>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Accès limité aux cryptomonnaies en RDC</li>
                <li>Frais bancaires élevés et virements lents</li>
                <li>Absence d'infrastructure P2P fiable en CDF</li>
                <li>Interfaces non localisées, complexes à utiliser</li>
                <li>Aucun token d'incitation à l'usage</li>
              </ul>
            </div>
            <div
              className="p-4 rounded-lg border"
              style={{ background: OKP_BG, borderColor: `${OKP_COLOR}44` }}
            >
              <h4 className="font-semibold mb-2" style={{ color: OKP_COLOR }}>
                ✅ Solution KongoKash
              </h4>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Intégration directe Equity BCDC (virement sécurisé)</li>
                <li>Frais réduits via le token OKP</li>
                <li>Interface 100% en français, culturellement adaptée</li>
                <li>Récompenses OKP pour chaque action sur la plateforme</li>
                <li>Paiements marchands avec conversion automatique CDF</li>
              </ul>
            </div>
          </div>
          <p className="text-muted-foreground">
            <strong>Cibles :</strong> Particuliers congolais, commerçants
            locaux, diaspora congolaise et utilisateurs souhaitant accéder à la
            crypto depuis l'Afrique centrale.
          </p>
        </CardContent>
      </Card>

      {/* Section 3 — Tokenomics */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: OKP_COLOR }}>
            3. Tokenomics — Distribution des OKP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <span className="text-4xl font-bold" style={{ color: OKP_COLOR }}>
              1 000 000 000
            </span>
            <p className="text-muted-foreground text-sm mt-1">
              Supply totale — OKP (fixe, non modifiable)
            </p>
          </div>
          {/* Visual bar */}
          <div className="flex h-8 rounded-full overflow-hidden w-full">
            {OKAPI_ALLOCATIONS.map((a) => (
              <div
                key={a.name}
                title={`${a.name} — ${a.percentage}%`}
                style={{ width: `${a.percentage}%`, background: a.color }}
                className="transition-all duration-300"
              />
            ))}
          </div>
          {/* Legend */}
          <div className="grid sm:grid-cols-2 gap-3">
            {OKAPI_ALLOCATIONS.map((a) => (
              <div
                key={a.name}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                <div
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ background: a.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{a.name}</span>
                    <Badge
                      variant="outline"
                      style={{ borderColor: a.color, color: a.color }}
                      className="text-xs"
                    >
                      {a.percentage}%
                    </Badge>
                    {a.locked && (
                      <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                        <Lock size={10} className="mr-1" /> Bloqué 2 ans
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.description}
                  </p>
                  <p
                    className="text-xs font-mono mt-0.5"
                    style={{ color: a.color }}
                  >
                    {new Intl.NumberFormat("fr-FR").format(a.amount)} OKP
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 4 — Mécanismes Clés */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: OKP_COLOR }}>4. Mécanismes Clés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mechanismes.map((m) => (
              <div
                key={m.title}
                className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                style={{ borderColor: `${m.color}44` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ background: m.color }}
                  >
                    {m.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{m.title}</div>
                    <div
                      className="text-xs font-mono font-bold"
                      style={{ color: m.color }}
                    >
                      {m.value}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 5 — Vesting Équipe */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: OKP_COLOR }}>
            5. Calendrier de Vesting — Équipe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
            <Lock size={16} />
            <div className="text-sm">
              <strong>200 000 000 OKP</strong> (20% de la supply totale) bloqués
              pour les fondateurs et contributeurs principaux. Cliff de 12 mois,
              puis déblocage linéaire sur 12 mois supplémentaires.
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Mois</th>
                  <th className="text-left py-2 font-semibold">Statut</th>
                  <th className="text-left py-2 font-semibold">% Débloqué</th>
                  <th className="text-left py-2 font-semibold">
                    OKP disponibles
                  </th>
                </tr>
              </thead>
              <tbody>
                {vestingData.map((row) => (
                  <tr key={row.month} className="border-b last:border-0">
                    <td className="py-2 font-mono">M{row.month}</td>
                    <td className="py-2 text-muted-foreground text-xs">
                      {row.label}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Progress value={row.unlocked} className="w-20 h-2" />
                        <span
                          className={
                            row.unlocked === 0
                              ? "text-muted-foreground"
                              : "font-semibold"
                          }
                          style={row.unlocked > 0 ? { color: OKP_COLOR } : {}}
                        >
                          {row.unlocked}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2 font-mono text-xs">
                      {new Intl.NumberFormat("fr-FR").format(
                        (row.unlocked / 100) * 200_000_000,
                      )}{" "}
                      OKP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            * Entre M12 et M24, le déblocage est linéaire : ~8,33% par mois,
            soit ~16 666 667 OKP/mois.
          </p>
        </CardContent>
      </Card>

      {/* Section 6 — Flux Utilisateur */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: OKP_COLOR }}>
            6. Flux Utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap">
            {userFlowSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white mb-2"
                    style={{ background: OKP_COLOR }}
                  >
                    {step.icon}
                  </div>
                  <div className="font-semibold text-xs">{step.label}</div>
                  <div className="text-xs text-muted-foreground max-w-[80px]">
                    {step.sub}
                  </div>
                </div>
                {i < userFlowSteps.length - 1 && (
                  <ArrowRight
                    size={16}
                    className="text-muted-foreground mx-1 hidden md:block flex-shrink-0"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 7 — Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: OKP_COLOR }}>7. Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {roadmap.map((phase) => (
              <div
                key={phase.phase}
                className="p-4 rounded-xl border"
                style={
                  phase.done
                    ? { borderColor: OKP_COLOR, background: OKP_BG }
                    : {}
                }
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className="text-xs"
                    style={
                      phase.done
                        ? { background: OKP_COLOR, color: "white" }
                        : {}
                    }
                    variant={phase.done ? "default" : "outline"}
                  >
                    {phase.phase}
                  </Badge>
                  {phase.done && (
                    <CheckCircle size={14} style={{ color: OKP_COLOR }} />
                  )}
                </div>
                <h4 className="font-semibold text-sm mb-2">{phase.title}</h4>
                <ul className="space-y-1">
                  {phase.items.map((item) => (
                    <li
                      key={item}
                      className="text-xs text-muted-foreground flex items-start gap-1.5"
                    >
                      <span
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: OKP_COLOR }}
                      >
                        •
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 8 — FAQ */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: OKP_COLOR }}>8. FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {faqs.map((faq, faqIndex) => (
            <div key={faq.q} className="border rounded-lg overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => toggleFaq(faqIndex)}
                data-ocid="whitepaper.toggle"
              >
                <span className="font-medium text-sm">{faq.q}</span>
                {openFaq === faqIndex ? (
                  <ChevronUp
                    size={16}
                    className="flex-shrink-0 ml-2"
                    style={{ color: OKP_COLOR }}
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    className="flex-shrink-0 ml-2 text-muted-foreground"
                  />
                )}
              </button>
              {openFaq === faqIndex && (
                <div className="px-4 pb-4 text-sm text-muted-foreground border-t bg-muted/20">
                  <p className="pt-3">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatOkpAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.floor(amount));
}

function nanosToDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ── Mode Simulation Vesting ──────────────────────────────────────────────────
const TOTAL_OKP = 200_000_000;
const CLIFF_MONTHS = 12;
const VESTING_MONTHS = 36; // after cliff
const MONTHLY_RELEASE = Math.floor(TOTAL_OKP / VESTING_MONTHS); // 5 555 555

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function fmtShortDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

interface SimRow {
  month: number; // 1-based index after cliff
  releaseDate: Date;
  cumulativeOkp: number;
  monthlyOkp: number;
  pct: number;
}

function buildSimRows(startDate: Date): SimRow[] {
  const rows: SimRow[] = [];
  for (let i = 1; i <= VESTING_MONTHS; i++) {
    const releaseDate = addMonths(startDate, CLIFF_MONTHS + i);
    const cumulativeOkp = Math.min(i * MONTHLY_RELEASE, TOTAL_OKP);
    rows.push({
      month: i,
      releaseDate,
      cumulativeOkp,
      monthlyOkp:
        i === VESTING_MONTHS
          ? TOTAL_OKP - (VESTING_MONTHS - 1) * MONTHLY_RELEASE
          : MONTHLY_RELEASE,
      pct: (cumulativeOkp / TOTAL_OKP) * 100,
    });
  }
  return rows;
}

function VestingSimulationPanel() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const [startDateStr, setStartDateStr] = useState(todayStr);
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const startDate = new Date(`${startDateStr}T00:00:00`);
  const cliffEndDate = addMonths(startDate, CLIFF_MONTHS);
  const vestingEndDate = addMonths(startDate, CLIFF_MONTHS + VESTING_MONTHS);
  const simRows = buildSimRows(startDate);

  const displayedRows = showFullCalendar ? simRows : simRows.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Simulation notice */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl border"
        style={{
          background: "oklch(0.98 0.04 85 / 0.5)",
          borderColor: "oklch(0.75 0.18 85 / 0.4)",
        }}
      >
        <div className="text-lg">🔬</div>
        <div>
          <p
            className="font-semibold text-sm"
            style={{ color: "oklch(0.55 0.18 85)" }}
          >
            Mode Simulation — Aucune donnée n'est écrite on-chain
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tous les calculs sont locaux. Modifie la date de départ pour
            explorer différents scénarios.
          </p>
        </div>
      </div>

      {/* Date picker */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-5">
          <Label className="text-sm font-semibold mb-2 block">
            📅 Date de début simulée (date d'initialisation)
          </Label>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStartDateStr(todayStr)}
            >
              Aujourd'hui
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key dates summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Début du vesting",
            value: fmtDate(startDate),
            icon: "🚀",
            color: "oklch(0.55 0.18 200)",
            note: "Initialisation du contrat",
          },
          {
            label: "Fin du cliff",
            value: fmtDate(cliffEndDate),
            icon: "⏳",
            color: "oklch(0.65 0.15 35)",
            note: "Aucun token avant cette date",
          },
          {
            label: "Fin du vesting",
            value: fmtDate(vestingEndDate),
            icon: "🏁",
            color: "oklch(0.55 0.18 160)",
            note: "200 000 000 OKP libérés",
          },
        ].map(({ label, value, icon, color, note }) => (
          <Card key={label} className="border-0 shadow-md">
            <CardContent className="pt-5 pb-4">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {label}
              </p>
              <p className="font-bold text-base mt-1" style={{ color }}>
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total verrouillé",
            value: "200 000 000 OKP",
            sub: "100 % de l'allocation équipe",
          },
          {
            label: "Cliff",
            value: "12 mois",
            sub: "0 OKP libéré pendant cette période",
          },
          {
            label: "Durée de libération",
            value: "36 mois",
            sub: "Mois 13 à 48",
          },
          {
            label: "Libération mensuelle",
            value: `~${new Intl.NumberFormat("fr-FR").format(MONTHLY_RELEASE)} OKP`,
            sub: "Par mois après le cliff",
          },
        ].map(({ label, value, sub }) => (
          <Card key={label} className="border-0 shadow-md">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                {label}
              </p>
              <p
                className="font-bold text-sm"
                style={{ color: "oklch(0.55 0.18 200)" }}
              >
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress timeline — visual */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Progression complète sur 4 ans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline bar */}
            <div
              className="w-full h-8 rounded-full overflow-hidden flex"
              style={{ background: "oklch(0.95 0.01 200)" }}
            >
              {/* Cliff zone */}
              <div
                className="h-full flex items-center justify-center text-xs font-medium text-white"
                style={{
                  width: `${(CLIFF_MONTHS / (CLIFF_MONTHS + VESTING_MONTHS)) * 100}%`,
                  background: "oklch(0.65 0.12 35)",
                }}
              >
                Cliff 12 mois
              </div>
              {/* Release zone */}
              <div
                className="h-full flex items-center justify-center text-xs font-medium text-white flex-1"
                style={{ background: "oklch(0.55 0.18 200)" }}
              >
                Libération progressive 36 mois
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{fmtShortDate(startDate)}</span>
              <span className="text-amber-600 font-medium">
                Cliff → {fmtShortDate(cliffEndDate)}
              </span>
              <span>{fmtShortDate(vestingEndDate)}</span>
            </div>
          </div>

          {/* Progress milestones */}
          <div className="mt-6 space-y-2">
            {[
              { label: "Après 12 mois (fin cliff)", pct: 0, okp: 0 },
              {
                label: "Après 18 mois",
                pct: ((6 * MONTHLY_RELEASE) / TOTAL_OKP) * 100,
                okp: 6 * MONTHLY_RELEASE,
              },
              {
                label: "Après 24 mois",
                pct: ((12 * MONTHLY_RELEASE) / TOTAL_OKP) * 100,
                okp: 12 * MONTHLY_RELEASE,
              },
              {
                label: "Après 36 mois",
                pct: ((24 * MONTHLY_RELEASE) / TOTAL_OKP) * 100,
                okp: 24 * MONTHLY_RELEASE,
              },
              { label: "Après 48 mois (fin)", pct: 100, okp: TOTAL_OKP },
            ].map(({ label, pct, okp }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-44 shrink-0">
                  {label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background:
                        pct === 100
                          ? "oklch(0.55 0.18 160)"
                          : "oklch(0.55 0.18 200)",
                    }}
                  />
                </div>
                <span
                  className="text-xs font-mono font-semibold w-28 text-right shrink-0"
                  style={{ color: "oklch(0.55 0.18 200)" }}
                >
                  {new Intl.NumberFormat("fr-FR").format(Math.floor(okp))} OKP
                </span>
                <span className="text-xs text-muted-foreground w-12 text-right shrink-0">
                  {pct.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly calendar */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" />
              Calendrier de libération mensuelle
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Mois 13 → 48
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-xs text-muted-foreground font-medium">
                    Mois
                  </th>
                  <th className="text-left py-2 px-2 text-xs text-muted-foreground font-medium">
                    Date de libération
                  </th>
                  <th className="text-right py-2 px-2 text-xs text-muted-foreground font-medium">
                    OKP libérés ce mois
                  </th>
                  <th className="text-right py-2 px-2 text-xs text-muted-foreground font-medium">
                    Total cumulé
                  </th>
                  <th className="text-right py-2 px-2 text-xs text-muted-foreground font-medium">
                    Progression
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row) => (
                  <tr
                    key={row.month}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2 px-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        M+{row.month + CLIFF_MONTHS}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-sm">
                      {fmtDate(row.releaseDate)}
                    </td>
                    <td
                      className="py-2 px-2 text-right font-mono text-sm font-semibold"
                      style={{ color: "oklch(0.55 0.18 200)" }}
                    >
                      +{new Intl.NumberFormat("fr-FR").format(row.monthlyOkp)}{" "}
                      OKP
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-xs text-muted-foreground">
                      {new Intl.NumberFormat("fr-FR").format(row.cumulativeOkp)}{" "}
                      OKP
                    </td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.pct}%`,
                              background: "oklch(0.55 0.18 200)",
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono w-10 text-right">
                          {row.pct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullCalendar(!showFullCalendar)}
              className="gap-2"
            >
              {showFullCalendar ? (
                <>
                  <ChevronUp size={14} /> Masquer les mois suivants
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> Afficher les 30 mois restants (
                  {VESTING_MONTHS - 6} mois)
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            💡 Le dernier mois peut varier légèrement en raison de l'arrondi
            (total exact : 200 000 000 OKP)
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function VestingEquipeTab() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { data: vestingStatus, isLoading } = useTeamVestingStatus();
  const claimMutation = useClaimTeamVesting();
  const initMutation = useInitTeamVesting();
  const [beneficiaryInput, setBeneficiaryInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [vestingMode, setVestingMode] = useState<"simulation" | "live">(
    "simulation",
  );

  // Check admin status when actor is available
  useState(() => {
    if (actor) {
      actor
        .isCallerAdmin()
        .then(setIsAdmin)
        .catch(() => setIsAdmin(false));
    }
  });

  const isBeneficiary =
    identity &&
    vestingStatus?.beneficiary &&
    identity.getPrincipal().toString() === vestingStatus.beneficiary.toString();

  async function handleInit() {
    if (!beneficiaryInput.trim()) return;
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      const principal = Principal.fromText(beneficiaryInput.trim());
      await initMutation.mutateAsync(principal);
      toast.success("Vesting initialisé avec succès !");
    } catch {
      toast.error("Erreur : principal invalide ou non autorisé");
    }
  }

  async function handleClaim() {
    try {
      const result = await claimMutation.mutateAsync();
      toast.success(
        `${formatOkpAmount(result.claimedAmount - (vestingStatus?.claimedAmount ?? 0))} OKP réclamés !`,
      );
    } catch {
      toast.error("Erreur lors de la réclamation");
    }
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="vesting.loading_state"
      >
        <Loader2 className="animate-spin mr-3 text-primary" size={28} />
        <span className="text-muted-foreground">Chargement du vesting…</span>
      </div>
    );
  }

  const total = vestingStatus?.totalAmount ?? 200_000_000;
  const claimed = vestingStatus?.claimedAmount ?? 0;
  const available = vestingStatus?.availableToClaim ?? 0;
  const locked = vestingStatus?.lockedAmount ?? total;
  const claimedPct = (claimed / total) * 100;
  const availablePct = (available / total) * 100;

  const now = BigInt(Date.now()) * 1_000_000n;
  const cliffPassed =
    vestingStatus?.initialized && vestingStatus.cliffEndTime < now;
  const monthsToCliff =
    vestingStatus?.initialized && !cliffPassed
      ? Math.max(
          0,
          Math.ceil(
            Number(vestingStatus.cliffEndTime - now) /
              1_000_000 /
              1000 /
              60 /
              60 /
              24 /
              30,
          ),
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Mode switcher */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-muted w-fit mx-auto">
        <button
          type="button"
          onClick={() => setVestingMode("simulation")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            vestingMode === "simulation"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          🔬 Mode Simulation
        </button>
        <button
          type="button"
          onClick={() => setVestingMode("live")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            vestingMode === "live"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          🔗 Contrat On-Chain
        </button>
      </div>

      {vestingMode === "simulation" ? (
        <VestingSimulationPanel />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Header */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-primary via-[oklch(0.75_0.18_85)] to-muted" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ background: "oklch(0.55 0.18 200 / 0.12)" }}
                >
                  <Lock className="text-primary" size={22} />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Vesting Allocation Équipe
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    200 000 000 OKP — Cliff 12 mois · Libération sur 4 ans
                  </p>
                </div>
                <div className="ml-auto">
                  {!vestingStatus?.initialized ? (
                    <Badge variant="secondary" data-ocid="vesting.status.badge">
                      Non initialisé
                    </Badge>
                  ) : !cliffPassed ? (
                    <Badge
                      className="bg-amber-100 text-amber-800 border-amber-200"
                      data-ocid="vesting.status.badge"
                    >
                      Période de cliff · {monthsToCliff} mois restants
                    </Badge>
                  ) : (
                    <Badge
                      className="bg-emerald-100 text-emerald-800 border-emerald-200"
                      data-ocid="vesting.status.badge"
                    >
                      En cours de libération ·{" "}
                      {vestingStatus.monthsElapsedSinceCliff.toString()} mois
                      écoulés
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Multi-segment progress bar */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Réclamé : {claimedPct.toFixed(1)}%</span>
                  <span>Disponible : {availablePct.toFixed(1)}%</span>
                  <span>
                    Verrouillé : {(100 - claimedPct - availablePct).toFixed(1)}%
                  </span>
                </div>
                <div
                  className="h-4 rounded-full overflow-hidden flex bg-muted"
                  data-ocid="vesting.progress_bar"
                >
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${claimedPct}%`,
                      background: "oklch(0.55 0.18 200)",
                    }}
                    title={`Réclamé : ${formatOkpAmount(claimed)} OKP`}
                  />
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${availablePct}%`,
                      background: "oklch(0.75 0.18 85)",
                    }}
                    title={`Disponible : ${formatOkpAmount(available)} OKP`}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ background: "oklch(0.55 0.18 200)" }}
                    />
                    Réclamé
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ background: "oklch(0.75 0.18 85)" }}
                    />
                    Disponible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full inline-block bg-muted-foreground/30" />
                    Verrouillé
                  </span>
                </div>
              </div>

              {/* Stats grid */}
              <div
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
                data-ocid="vesting.stats.panel"
              >
                {[
                  {
                    label: "Total bloqué",
                    value: `${formatOkpAmount(total)} OKP`,
                    icon: Lock,
                    color: "oklch(0.55 0.18 290)",
                  },
                  {
                    label: "Déjà réclamé",
                    value: `${formatOkpAmount(claimed)} OKP`,
                    icon: CheckCircle,
                    color: "oklch(0.55 0.18 200)",
                  },
                  {
                    label: "Disponible",
                    value: `${formatOkpAmount(available)} OKP`,
                    icon: Unlock,
                    color: "oklch(0.65 0.18 85)",
                  },
                  {
                    label: "Encore verrouillé",
                    value: `${formatOkpAmount(locked)} OKP`,
                    icon: Shield,
                    color: "oklch(0.55 0.18 25)",
                  },
                  {
                    label: "Libération mensuelle",
                    value: `~${formatOkpAmount(vestingStatus?.monthlyRelease ?? 5_555_556)} OKP/mois`,
                    icon: TrendingUp,
                    color: "oklch(0.55 0.18 160)",
                  },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div
                    key={label}
                    className="rounded-xl p-4 border bg-card/50 flex items-start gap-3"
                  >
                    <div
                      className="rounded-lg p-1.5 mt-0.5"
                      style={{ background: `${color}20` }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dates */}
              {vestingStatus?.initialized && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs mb-1">
                      Fin du cliff
                    </p>
                    <p className="font-medium">
                      {nanosToDate(vestingStatus.cliffEndTime)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs mb-1">
                      Fin du vesting
                    </p>
                    <p className="font-medium">
                      {nanosToDate(vestingStatus.vestingEndTime)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Claim button — beneficiary only */}
          {isBeneficiary && available > 0 && (
            <Card
              className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20"
              data-ocid="vesting.claim.card"
            >
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                    Tokens disponibles à la réclamation
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                    {formatOkpAmount(available)} OKP
                  </p>
                </div>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleClaim}
                  disabled={claimMutation.isPending}
                  data-ocid="vesting.claim.button"
                >
                  {claimMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : (
                    <Unlock size={16} className="mr-2" />
                  )}
                  Réclamer {formatOkpAmount(available)} OKP
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin controls */}
          {isAdmin && (
            <Card className="border-dashed" data-ocid="vesting.admin.panel">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield size={16} className="text-primary" />
                  Contrôles administrateur
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!vestingStatus?.initialized ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Le vesting n'est pas encore initialisé. Entrez le
                      principal du bénéficiaire pour démarrer.
                    </p>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Principal du bénéficiaire (ex: aaaaa-aa...)"
                        value={beneficiaryInput}
                        onChange={(e) => setBeneficiaryInput(e.target.value)}
                        className="font-mono text-xs"
                        data-ocid="vesting.admin.beneficiary_input"
                      />
                      <Button
                        onClick={handleInit}
                        disabled={
                          initMutation.isPending || !beneficiaryInput.trim()
                        }
                        data-ocid="vesting.admin.init_button"
                      >
                        {initMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin mr-1" />
                        ) : null}
                        Initialiser
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                    <CheckCircle size={16} />
                    Vesting initialisé le {nanosToDate(vestingStatus.startTime)}
                    {vestingStatus.beneficiary && (
                      <span className="text-muted-foreground font-mono text-xs ml-2">
                        · {vestingStatus.beneficiary.toString().slice(0, 20)}…
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function OkapiSection() {
  const { identity } = useInternetIdentity();

  const { data: okpBalance = 0, isLoading: balanceLoading } = useOkpBalance();
  const { data: okpRate = 0 } = useOkpToCdfRate();
  const { data: stakes = [], isLoading: stakesLoading } = useStakes();
  const { data: adminStats, isLoading: statsLoading } = useOkpAdminStats();

  const claimReward = useClaimDailyReward();
  const stakeOkp = useStakeOkp();
  const unstakeOkp = useUnstakeOkp();
  const transferOkp = useTransferOkp();
  const payMerchant = usePayMerchantOkp();

  // Staking form
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakeDuration, setStakeDuration] = useState("30");

  // Transfer form
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // Merchant form
  const [merchantPrincipal, setMerchantPrincipal] = useState("");
  const [merchantAmount, setMerchantAmount] = useState("");
  const [convertToCdf, setConvertToCdf] = useState(false);

  if (!identity) return null;

  const handleClaimReward = async () => {
    try {
      const result = await claimReward.mutateAsync();
      if (result.success) {
        toast.success(`🦏 ${result.amount} OKP reçus ! ${result.message}`);
      } else {
        toast.info(result.message);
      }
    } catch {
      toast.error("Erreur lors de la réclamation");
    }
  };

  const handleStake = async () => {
    const amount = Number.parseFloat(stakeAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Montant invalide");
      return;
    }
    try {
      const result = await stakeOkp.mutateAsync({
        amount,
        durationDays: BigInt(stakeDuration),
      });
      if (result.success) {
        toast.success(
          `✅ ${amount} OKP verrouillés pour ${stakeDuration} jours !`,
        );
        setStakeAmount("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erreur lors du staking");
    }
  };

  const handleUnstake = async (stakeId: bigint) => {
    try {
      const result = await unstakeOkp.mutateAsync(stakeId);
      if (result.success) {
        toast.success("✅ OKP débloqués avec succès !");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erreur lors du déblocage");
    }
  };

  const handleTransfer = async () => {
    const amount = Number.parseFloat(transferAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Montant invalide");
      return;
    }
    if (!transferTo.trim()) {
      toast.error("Adresse destinataire manquante");
      return;
    }
    try {
      const principal = Principal.fromText(transferTo.trim());
      const result = await transferOkp.mutateAsync({ to: principal, amount });
      if (result.success) {
        toast.success(`✅ ${amount} OKP envoyés !`);
        setTransferTo("");
        setTransferAmount("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Adresse destinataire invalide");
    }
  };

  const handlePayMerchant = async () => {
    const amount = Number.parseFloat(merchantAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Montant invalide");
      return;
    }
    if (!merchantPrincipal.trim()) {
      toast.error("Adresse marchand manquante");
      return;
    }
    try {
      const principal = Principal.fromText(merchantPrincipal.trim());
      const result = await payMerchant.mutateAsync({
        merchant: principal,
        okpAmount: amount,
        convertToCdf,
      });
      if (result.success) {
        const msg = convertToCdf
          ? `✅ Paiement de ${amount} OKP effectué (converti en CDF pour le marchand)`
          : `✅ Paiement de ${amount} OKP effectué`;
        toast.success(msg);
        setMerchantPrincipal("");
        setMerchantAmount("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Adresse marchand invalide");
    }
  };

  return (
    <section
      id="okapi"
      className="py-16"
      style={{ background: "oklch(0.98 0.01 35)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <img
              src="/assets/generated/okapi-token-logo-transparent.dim_400x400.png"
              className="w-16 h-16"
              alt="OKP"
            />
            <h2 className="font-display font-bold text-3xl">
              Token <span style={{ color: OKP_COLOR }}>Okapi</span> (OKP)
            </h2>
          </div>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Le token natif de KongoKash. Gagnez, stakez et payez avec OKP pour
            bénéficier de frais réduits et de récompenses exclusives.
          </p>
          {/* Balance hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 inline-flex flex-col items-center gap-1 px-8 py-5 rounded-2xl"
            style={{ background: OKP_BG, border: `1.5px solid ${OKP_COLOR}` }}
          >
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Votre solde OKP
            </div>
            {balanceLoading ? (
              <Loader2
                className="animate-spin mt-1"
                style={{ color: OKP_COLOR }}
                data-ocid="okapi.loading_state"
              />
            ) : (
              <div
                className="font-display font-bold text-4xl"
                style={{ color: OKP_COLOR }}
              >
                {new Intl.NumberFormat("fr-FR", {
                  maximumFractionDigits: 4,
                }).format(okpBalance)}
                <span className="text-xl ml-2">OKP</span>
              </div>
            )}
            {okpRate > 0 && (
              <div className="text-sm text-muted-foreground">
                ≈ {formatCDF(okpBalance * okpRate)}
                <span className="mx-2">·</span>
                Taux : 1 OKP = {okpRate.toFixed(2)} FC
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList
            className="grid grid-cols-8 w-full max-w-4xl mx-auto mb-8"
            data-ocid="okapi.tab"
          >
            <TabsTrigger value="overview" data-ocid="okapi.tab">
              <Zap size={14} className="mr-1" /> Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="staking" data-ocid="okapi.tab">
              <Lock size={14} className="mr-1" /> Staking
            </TabsTrigger>
            <TabsTrigger value="transfer" data-ocid="okapi.tab">
              <Send size={14} className="mr-1" /> Transfert
            </TabsTrigger>
            <TabsTrigger value="merchant" data-ocid="okapi.tab">
              <ShoppingBag size={14} className="mr-1" /> Marchand
            </TabsTrigger>
            <TabsTrigger value="admin" data-ocid="okapi.tab">
              <BarChart3 size={14} className="mr-1" /> Statistiques
            </TabsTrigger>
            <TabsTrigger value="whitepaper" data-ocid="okapi.tab">
              <BookOpen size={14} className="mr-1" /> Livre Blanc
            </TabsTrigger>
            <TabsTrigger value="governance" data-ocid="okapi.tab">
              <Landmark size={14} className="mr-1" /> Gouvernance
            </TabsTrigger>
            <TabsTrigger value="vesting" data-ocid="okapi.vesting.tab">
              <Shield size={14} className="mr-1" /> Vesting Équipe
            </TabsTrigger>
          </TabsList>

          {/* ── Onglet 1 : Vue d'ensemble ── */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Daily Reward */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Card className="shadow-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift size={18} style={{ color: OKP_COLOR }} />
                      Récompense quotidienne
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Réclamez jusqu'à <strong>50 OKP par jour</strong>{" "}
                      simplement en restant actif sur KongoKash.
                    </p>
                    <Button
                      className="w-full font-semibold"
                      onClick={handleClaimReward}
                      disabled={claimReward.isPending}
                      style={{ background: OKP_COLOR, color: "white" }}
                      data-ocid="okapi.primary_button"
                    >
                      {claimReward.isPending ? (
                        <Loader2 size={14} className="animate-spin mr-2" />
                      ) : (
                        <Gift size={14} className="mr-2" />
                      )}
                      Réclamer ma récompense du jour
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Earn guide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap size={18} style={{ color: "oklch(0.77 0.13 85)" }} />
                      Comment gagner des OKP ?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          action: "Achat de crypto",
                          amount: "+25 OKP",
                          color: "oklch(0.52 0.12 160)",
                        },
                        {
                          action: "Vente de crypto",
                          amount: "+10 OKP",
                          color: "oklch(0.52 0.12 160)",
                        },
                        {
                          action: "Dépôt fiat",
                          amount: "+10 OKP",
                          color: "oklch(0.52 0.12 160)",
                        },
                        {
                          action: "Envoi P2P",
                          amount: "+5 OKP",
                          color: "oklch(0.52 0.12 160)",
                        },
                        {
                          action: "Récompense quotidienne",
                          amount: "+50 OKP",
                          color: OKP_COLOR,
                        },
                      ].map((item) => (
                        <div
                          key={item.action}
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <span className="text-sm text-foreground">
                            {item.action}
                          </span>
                          <Badge
                            className="font-mono font-bold"
                            style={{ background: item.color, color: "white" }}
                          >
                            {item.amount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      💡 Les récompenses OKP seront créditées automatiquement
                      lors de chaque activité sur la plateforme.
                    </p>
                    <p
                      className="text-xs mt-3 px-3 py-2 rounded-lg font-medium"
                      style={{
                        background: "oklch(0.65 0.18 35 / 0.08)",
                        color: OKP_COLOR,
                      }}
                    >
                      ⚡ Les récompenses diminuent progressivement (halvening)
                      pour protéger la valeur de l'OKP.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Fee discount info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="md:col-span-2"
              >
                <Card
                  className="shadow-card"
                  style={{
                    background: "oklch(0.65 0.18 35 / 0.06)",
                    borderColor: OKP_COLOR,
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: OKP_BG }}
                      >
                        <img
                          src="/assets/generated/okapi-token-logo-transparent.dim_400x400.png"
                          className="w-8 h-8"
                          alt="OKP"
                        />
                      </div>
                      <div className="flex-1">
                        <h4
                          className="font-display font-bold text-base mb-1"
                          style={{ color: OKP_COLOR }}
                        >
                          Payez vos frais en OKP — économisez jusqu'à 50%
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          En utilisant OKP pour régler vos frais de transaction,
                          vous bénéficiez d'une réduction automatique. Plus vous
                          détenez d'OKP, plus les frais diminuent.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div
                          className="text-center px-4 py-2 rounded-xl"
                          style={{ background: OKP_BG }}
                        >
                          <div
                            className="font-bold text-lg"
                            style={{ color: OKP_COLOR }}
                          >
                            –25%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            100+ OKP
                          </div>
                        </div>
                        <div
                          className="text-center px-4 py-2 rounded-xl"
                          style={{ background: OKP_BG }}
                        >
                          <div
                            className="font-bold text-lg"
                            style={{ color: OKP_COLOR }}
                          >
                            –35%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            500+ OKP
                          </div>
                        </div>
                        <div
                          className="text-center px-4 py-2 rounded-xl"
                          style={{ background: OKP_BG }}
                        >
                          <div
                            className="font-bold text-lg"
                            style={{ color: OKP_COLOR }}
                          >
                            –50%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            1 000+ OKP
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* ── Onglet 2 : Staking ── */}
          <TabsContent value="staking">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Stake form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock size={18} style={{ color: OKP_COLOR }} />
                      Verrouiller des OKP
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label
                        htmlFor="stake-amount"
                        className="text-xs text-muted-foreground"
                      >
                        Montant OKP à staker
                      </Label>
                      <Input
                        id="stake-amount"
                        type="number"
                        placeholder="Ex: 100"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="mt-1"
                        data-ocid="okapi.input"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Disponible : {formatOkp(okpBalance)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Durée de staking
                      </Label>
                      <Select
                        value={stakeDuration}
                        onValueChange={setStakeDuration}
                      >
                        <SelectTrigger
                          className="mt-1"
                          data-ocid="okapi.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">
                            30 jours — 10% de récompense
                          </SelectItem>
                          <SelectItem value="90">
                            90 jours — 15% de récompense
                          </SelectItem>
                          <SelectItem value="180">
                            180 jours — 20% de récompense
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {stakeAmount && Number(stakeAmount) > 0 && (
                      <div
                        className="p-3 rounded-xl text-sm"
                        style={{ background: OKP_BG }}
                      >
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Montant verrouillé
                          </span>
                          <span className="font-semibold">
                            {stakeAmount} OKP
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-muted-foreground">
                            Taux de récompense
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: OKP_COLOR }}
                          >
                            {rewardRateLabel(Number(stakeDuration))}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-muted-foreground">
                            Récompense estimée
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: OKP_COLOR }}
                          >
                            +
                            {(
                              (Number(stakeAmount) *
                                Number.parseFloat(
                                  rewardRateLabel(
                                    Number(stakeDuration),
                                  ).replace("%", ""),
                                )) /
                              100
                            ).toFixed(2)}{" "}
                            OKP
                          </span>
                        </div>
                      </div>
                    )}
                    <Button
                      className="w-full font-semibold"
                      onClick={handleStake}
                      disabled={stakeOkp.isPending}
                      style={{ background: OKP_COLOR, color: "white" }}
                      data-ocid="okapi.submit_button"
                    >
                      {stakeOkp.isPending ? (
                        <Loader2 size={14} className="animate-spin mr-2" />
                      ) : (
                        <Lock size={14} className="mr-2" />
                      )}
                      Verrouiller
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Active stakes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Unlock
                        size={18}
                        style={{ color: "oklch(0.52 0.12 160)" }}
                      />
                      Stakes actifs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stakesLoading ? (
                      <div
                        className="flex justify-center py-6"
                        data-ocid="okapi.loading_state"
                      >
                        <Loader2
                          className="animate-spin"
                          style={{ color: OKP_COLOR }}
                        />
                      </div>
                    ) : stakes.length === 0 ? (
                      <div
                        className="text-center py-8 text-muted-foreground text-sm"
                        data-ocid="okapi.empty_state"
                      >
                        <Lock size={32} className="mx-auto mb-2 opacity-30" />
                        Aucun stake actif.
                        <br />
                        Verrouillez vos OKP pour gagner des récompenses.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stakes.map((stake, i) => {
                          const matured = stakeMatured(
                            stake.startTime,
                            stake.durationDays,
                          );
                          return (
                            <div
                              key={stake.id.toString()}
                              className="p-3 rounded-xl border border-border"
                              data-ocid={`okapi.item.${i + 1}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">
                                      {stake.amount.toFixed(4)} OKP
                                    </span>
                                    <Badge
                                      className="text-xs"
                                      style={{
                                        background: matured
                                          ? "oklch(0.52 0.12 160)"
                                          : OKP_COLOR,
                                        color: "white",
                                      }}
                                    >
                                      {matured
                                        ? "Disponible"
                                        : `${Number(stake.durationDays)}j`}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Taux : {(stake.rewardRate * 100).toFixed(0)}
                                    % · Début : {formatDate(stake.startTime)}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant={matured ? "default" : "outline"}
                                  disabled={!matured || unstakeOkp.isPending}
                                  onClick={() => handleUnstake(stake.id)}
                                  style={
                                    matured
                                      ? {
                                          background: OKP_COLOR,
                                          color: "white",
                                        }
                                      : {}
                                  }
                                  data-ocid={`okapi.secondary_button.${i + 1}`}
                                >
                                  {unstakeOkp.isPending ? (
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Unlock size={12} className="mr-1" />
                                  )}
                                  Débloquer
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* ── Onglet 3 : Transfert P2P ── */}
          <TabsContent value="transfer">
            <div className="max-w-lg mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send size={18} style={{ color: OKP_COLOR }} />
                      Envoyer des OKP
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label
                        htmlFor="transfer-to"
                        className="text-xs text-muted-foreground"
                      >
                        Principal du destinataire
                      </Label>
                      <Input
                        id="transfer-to"
                        type="text"
                        placeholder="aaaaa-aa... (identifiant ICP)"
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                        className="mt-1 font-mono text-sm"
                        data-ocid="okapi.input"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="transfer-amount"
                        className="text-xs text-muted-foreground"
                      >
                        Montant OKP
                      </Label>
                      <Input
                        id="transfer-amount"
                        type="number"
                        placeholder="Ex: 50"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="mt-1"
                        data-ocid="okapi.input"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Disponible : {formatOkp(okpBalance)}
                      </div>
                    </div>
                    {transferAmount && transferTo && (
                      <div
                        className="p-3 rounded-xl text-sm space-y-1"
                        style={{ background: OKP_BG }}
                      >
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Montant envoyé
                          </span>
                          <span className="font-semibold">
                            {transferAmount} OKP
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Burn (1.5%)
                          </span>
                          <span className="font-semibold text-orange-500">
                            {(Number(transferAmount) * 0.015).toFixed(4)} OKP 🔥
                          </span>
                        </div>
                        <div
                          className="flex justify-between pt-1 border-t"
                          style={{ borderColor: OKP_COLOR }}
                        >
                          <span className="text-muted-foreground font-medium">
                            Total déduit
                          </span>
                          <span
                            className="font-bold"
                            style={{ color: OKP_COLOR }}
                          >
                            {(Number(transferAmount) * 1.015).toFixed(4)} OKP
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Frais réseau
                          </span>
                          <span
                            className="font-semibold text-xs"
                            style={{ color: OKP_COLOR }}
                          >
                            Réduits grâce à OKP
                          </span>
                        </div>
                      </div>
                    )}
                    <Button
                      className="w-full font-semibold"
                      onClick={handleTransfer}
                      disabled={transferOkp.isPending}
                      style={{ background: OKP_COLOR, color: "white" }}
                      data-ocid="okapi.submit_button"
                    >
                      {transferOkp.isPending ? (
                        <Loader2 size={14} className="animate-spin mr-2" />
                      ) : (
                        <Send size={14} className="mr-2" />
                      )}
                      Envoyer OKP
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      💡 Les envois P2P en OKP vous rapportent +5 OKP de
                      récompense.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* ── Onglet 4 : Paiement marchand ── */}
          <TabsContent value="merchant">
            <div className="max-w-lg mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag size={18} style={{ color: OKP_COLOR }} />
                      Payer un marchand
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label
                        htmlFor="merchant-principal"
                        className="text-xs text-muted-foreground"
                      >
                        Principal du marchand
                      </Label>
                      <Input
                        id="merchant-principal"
                        type="text"
                        placeholder="aaaaa-aa... (identifiant ICP du marchand)"
                        value={merchantPrincipal}
                        onChange={(e) => setMerchantPrincipal(e.target.value)}
                        className="mt-1 font-mono text-sm"
                        data-ocid="okapi.input"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="merchant-amount"
                        className="text-xs text-muted-foreground"
                      >
                        Montant OKP
                      </Label>
                      <Input
                        id="merchant-amount"
                        type="number"
                        placeholder="Ex: 200"
                        value={merchantAmount}
                        onChange={(e) => setMerchantAmount(e.target.value)}
                        className="mt-1"
                        data-ocid="okapi.input"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Disponible : {formatOkp(okpBalance)}
                        {okpRate > 0 && merchantAmount && (
                          <span className="ml-2">
                            ≈ {formatCDF(Number(merchantAmount) * okpRate)}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Conversion switch */}
                    <div
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: "oklch(0.52 0.12 160 / 0.07)" }}
                    >
                      <div>
                        <div className="text-sm font-medium">
                          Conversion automatique en CDF
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Le marchand reçoit des CDF (Francs congolais)
                        </div>
                      </div>
                      <Switch
                        checked={convertToCdf}
                        onCheckedChange={setConvertToCdf}
                        data-ocid="okapi.switch"
                      />
                    </div>
                    {merchantAmount && merchantPrincipal && (
                      <div
                        className="p-3 rounded-xl text-sm space-y-1"
                        style={{ background: OKP_BG }}
                      >
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Vous payez
                          </span>
                          <span className="font-semibold">
                            {merchantAmount} OKP
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Burn (1.5%)
                          </span>
                          <span className="font-semibold text-orange-500">
                            {(Number(merchantAmount) * 0.015).toFixed(4)} OKP 🔥
                          </span>
                        </div>
                        <div
                          className="flex justify-between pt-1 border-t"
                          style={{ borderColor: OKP_COLOR }}
                        >
                          <span className="text-muted-foreground font-medium">
                            Total déduit
                          </span>
                          <span
                            className="font-bold"
                            style={{ color: OKP_COLOR }}
                          >
                            {(Number(merchantAmount) * 1.015).toFixed(4)} OKP
                          </span>
                        </div>
                        {convertToCdf && okpRate > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Marchand reçoit
                            </span>
                            <span className="font-semibold">
                              {formatCDF(Number(merchantAmount) * okpRate)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <Button
                      className="w-full font-semibold"
                      onClick={handlePayMerchant}
                      disabled={payMerchant.isPending}
                      style={{ background: OKP_COLOR, color: "white" }}
                      data-ocid="okapi.submit_button"
                    >
                      {payMerchant.isPending ? (
                        <Loader2 size={14} className="animate-spin mr-2" />
                      ) : (
                        <ShoppingBag size={14} className="mr-2" />
                      )}
                      Payer
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      🔒 Paiements sécurisés sur la blockchain ICP.
                      {convertToCdf
                        ? " Le marchand recevra automatiquement des CDF."
                        : " Le marchand recevra des OKP."}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* ── Onglet 5 : Statistiques Admin ── */}
          <TabsContent value="admin">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="mb-6 text-center">
                <h3
                  className="font-display font-bold text-xl flex items-center justify-center gap-2"
                  style={{ color: OKP_COLOR }}
                >
                  <BarChart3 size={20} />
                  Tableau de bord OKP
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Statistiques publiques en temps réel du token Okapi
                </p>
              </div>

              {statsLoading || !adminStats ? (
                <div
                  className="flex justify-center py-12"
                  data-ocid="okapi.loading_state"
                >
                  <Loader2
                    className="animate-spin"
                    style={{ color: OKP_COLOR }}
                    size={32}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 2×2 metric grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Supply totale */}
                    <Card
                      className="shadow-card"
                      style={{ borderColor: OKP_COLOR }}
                      data-ocid="okapi.card"
                    >
                      <CardContent className="pt-5 pb-4">
                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                          Supply totale
                        </div>
                        <div
                          className="font-display font-bold text-2xl"
                          style={{ color: OKP_COLOR }}
                        >
                          {formatOkpLarge(adminStats.totalSupply)}
                        </div>
                        <div
                          className="text-xs font-medium mt-0.5"
                          style={{ color: OKP_COLOR }}
                        >
                          OKP
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Cap maximum
                        </div>
                      </CardContent>
                    </Card>

                    {/* OKP émis */}
                    <Card className="shadow-card" data-ocid="okapi.card">
                      <CardContent className="pt-5 pb-4">
                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                          OKP émis
                        </div>
                        <div
                          className="font-display font-bold text-2xl"
                          style={{ color: OKP_COLOR }}
                        >
                          {formatOkpLarge(adminStats.totalIssued)}
                        </div>
                        <div
                          className="text-xs font-medium mt-0.5"
                          style={{ color: OKP_COLOR }}
                        >
                          OKP
                        </div>
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progression</span>
                            <span>
                              {adminStats.totalSupply > 0
                                ? (
                                    (adminStats.totalIssued /
                                      adminStats.totalSupply) *
                                    100
                                  ).toFixed(2)
                                : "0"}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              adminStats.totalSupply > 0
                                ? (adminStats.totalIssued /
                                    adminStats.totalSupply) *
                                  100
                                : 0
                            }
                            className="h-1.5"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* OKP en circulation */}
                    <Card className="shadow-card" data-ocid="okapi.card">
                      <CardContent className="pt-5 pb-4">
                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                          En circulation
                        </div>
                        <div
                          className="font-display font-bold text-2xl"
                          style={{ color: OKP_COLOR }}
                        >
                          {formatOkpLarge(adminStats.circulatingSupply)}
                        </div>
                        <div
                          className="text-xs font-medium mt-0.5"
                          style={{ color: OKP_COLOR }}
                        >
                          OKP
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Tokens actifs non stakés
                        </div>
                      </CardContent>
                    </Card>

                    {/* OKP stakés */}
                    <Card className="shadow-card" data-ocid="okapi.card">
                      <CardContent className="pt-5 pb-4">
                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                          OKP stakés
                        </div>
                        <div
                          className="font-display font-bold text-2xl"
                          style={{ color: "oklch(0.52 0.12 160)" }}
                        >
                          {formatOkpLarge(adminStats.totalStaked)}
                        </div>
                        <div
                          className="text-xs font-medium mt-0.5"
                          style={{ color: "oklch(0.52 0.12 160)" }}
                        >
                          OKP
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Verrouillés en staking
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Burn highlight card */}
                  <Card
                    className="shadow-card"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.15 0.05 35 / 0.04), oklch(0.65 0.18 35 / 0.08))",
                      borderColor: "oklch(0.65 0.15 45)",
                    }}
                    data-ocid="okapi.card"
                  >
                    <CardContent className="pt-6 pb-5">
                      <div className="flex flex-wrap items-center gap-6">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                          style={{ background: "oklch(0.65 0.18 35 / 0.12)" }}
                        >
                          🔥
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                            OKP brûlés (burn total)
                          </div>
                          <div
                            className="font-display font-bold text-4xl"
                            style={{ color: "oklch(0.6 0.2 40)" }}
                          >
                            {formatOkpLarge(adminStats.totalBurned)}
                            <span className="text-xl ml-2">OKP</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            1.5% de chaque transaction brûlé définitivement —
                            réduit la supply et renforce la valeur de l'OKP
                          </div>
                        </div>
                        <div
                          className="text-center px-5 py-3 rounded-xl flex-shrink-0"
                          style={{ background: "oklch(0.65 0.18 35 / 0.1)" }}
                        >
                          <div
                            className="font-bold text-2xl"
                            style={{ color: OKP_COLOR }}
                          >
                            1.5%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            taux de burn
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rate & multiplier info card */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="shadow-card" data-ocid="okapi.card">
                      <CardContent className="pt-5 pb-4">
                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                          Taux effectif OKP/CDF
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span
                            className="font-display font-bold text-3xl"
                            style={{ color: OKP_COLOR }}
                          >
                            {Number(adminStats.currentRate).toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            FC / OKP
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Taux dynamique ajusté selon l'usage du réseau
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-card" data-ocid="okapi.card">
                      <CardContent className="pt-5 pb-4">
                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                          Multiplicateur de récompense
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span
                            className="font-display font-bold text-3xl"
                            style={{
                              color:
                                adminStats.rewardMultiplier >= 0.5
                                  ? "oklch(0.52 0.12 160)"
                                  : OKP_COLOR,
                            }}
                          >
                            {(adminStats.rewardMultiplier * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          ⚡ Le halvening réduit progressivement les récompenses
                          pour limiter l'inflation et protéger la valeur de
                          l'OKP
                        </div>
                      </CardContent>
                    </Card>
                    {/* ── Distribution initiale ── */}
                    <div className="mt-8">
                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className="h-1 flex-1 rounded-full"
                          style={{
                            background: OKP_BG,
                            border: `1px solid ${OKP_COLOR}`,
                          }}
                        />
                        <h3
                          className="text-lg font-bold whitespace-nowrap"
                          style={{ color: OKP_COLOR }}
                        >
                          Distribution initiale — 1 000 000 000 OKP
                        </h3>
                        <div
                          className="h-1 flex-1 rounded-full"
                          style={{
                            background: OKP_BG,
                            border: `1px solid ${OKP_COLOR}`,
                          }}
                        />
                      </div>

                      {/* Stacked bar visual */}
                      <div
                        className="flex rounded-xl overflow-hidden h-5 mb-6 w-full shadow-inner"
                        style={{ border: `1px solid ${OKP_COLOR}30` }}
                      >
                        {OKAPI_ALLOCATIONS.map((a) => (
                          <div
                            key={a.name}
                            title={`${a.name} — ${a.percentage}%`}
                            style={{
                              width: `${a.percentage}%`,
                              background: a.color,
                              opacity: 0.85,
                            }}
                          />
                        ))}
                      </div>

                      {/* Color legend */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        {OKAPI_ALLOCATIONS.map((a) => (
                          <div
                            key={a.name}
                            className="flex items-center gap-1.5 text-xs"
                          >
                            <span
                              className="inline-block w-3 h-3 rounded-full"
                              style={{ background: a.color }}
                            />
                            <span className="text-muted-foreground">
                              {a.name} ({a.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Allocation rows */}
                      <div className="space-y-3">
                        {(adminStats.allocations &&
                        adminStats.allocations.length > 0
                          ? adminStats.allocations
                          : OKAPI_ALLOCATIONS
                        ).map((alloc, idx) => {
                          const colorEntry = OKAPI_ALLOCATIONS.find(
                            (a) => a.name === alloc.name,
                          );
                          const color = colorEntry
                            ? colorEntry.color
                            : OKP_COLOR;
                          return (
                            <div
                              key={alloc.name}
                              className="rounded-xl p-4"
                              style={{
                                background: OKP_BG,
                                border: `1px solid ${OKP_COLOR}22`,
                              }}
                              data-ocid={`okapi.allocation.item.${idx + 1}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span
                                    className="inline-block w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                                    style={{ background: color }}
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className="font-semibold text-sm"
                                        style={{ color }}
                                      >
                                        {alloc.name}
                                      </span>
                                      {alloc.locked && (
                                        <span
                                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                                          style={{
                                            background: `${color}22`,
                                            color,
                                            border: `1px solid ${color}44`,
                                          }}
                                        >
                                          🔒 Bloqué 2 ans
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {alloc.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div
                                    className="text-lg font-bold"
                                    style={{ color }}
                                  >
                                    {alloc.percentage}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {Number(alloc.amount).toLocaleString(
                                      "fr-FR",
                                    )}{" "}
                                    OKP
                                  </div>
                                </div>
                              </div>
                              {/* Progress bar */}
                              <div
                                className="mt-3 h-2 rounded-full overflow-hidden"
                                style={{ background: `${color}20` }}
                              >
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{
                                    width: `${alloc.percentage}%`,
                                    background: color,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="whitepaper">
            <WhitepaperTab />
          </TabsContent>

          <TabsContent value="vesting">
            <VestingEquipeTab />
          </TabsContent>

          <TabsContent value="governance">
            <GovernanceSection />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
