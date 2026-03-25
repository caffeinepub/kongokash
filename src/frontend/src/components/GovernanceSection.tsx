import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle,
  ExternalLink,
  Landmark,
  Lock,
  Shield,
  ThumbsDown,
  ThumbsUp,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const GOV_COLOR = "oklch(0.55 0.18 265)";
const GOV_BG = "oklch(0.55 0.18 265 / 0.1)";
const TEAL = "oklch(0.60 0.14 196)";
const GOLD = "oklch(0.78 0.16 85)";

// Simulated start date: 3 months ago
const VESTING_START = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000);
const TOTAL_ALLOCATION = 100_000_000;
const VESTING_MONTHS = 60;
const MONTHLY_UNLOCK = TOTAL_ALLOCATION / VESTING_MONTHS; // 1,666,667 OKP/month

function getElapsedMonths() {
  const now = new Date();
  const diff =
    (now.getFullYear() - VESTING_START.getFullYear()) * 12 +
    (now.getMonth() - VESTING_START.getMonth());
  return Math.max(0, Math.min(diff, VESTING_MONTHS));
}

function getNextUnlockDate() {
  const next = new Date(VESTING_START);
  const elapsed = getElapsedMonths();
  next.setMonth(next.getMonth() + elapsed + 1);
  return next.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const MOCK_WITHDRAWALS = [
  {
    id: 1,
    date: "15 Jan 2026",
    amount: 1_666_667,
    status: "Exécuté",
    hash: "0xa3f1...e2b9",
    month: 1,
  },
  {
    id: 2,
    date: "15 Fév 2026",
    amount: 1_666_667,
    status: "Exécuté",
    hash: "0xb7c4...d0e1",
    month: 2,
  },
  {
    id: 3,
    date: "15 Mar 2026",
    amount: 1_666_667,
    status: "Exécuté",
    hash: "0xf9a2...1c8d",
    month: 3,
  },
];

const MOCK_SIGNERS = [
  {
    icon: "🏛️",
    type: "Entité Publique",
    name: "Banque Centrale du Congo",
    principal: "2vxsx-fae...bcc1",
    signed: true,
  },
  {
    icon: "🔍",
    type: "Auditeur Indépendant",
    name: "Cabinet Ernst & Young RDC",
    principal: "rdmx6-jaaaa...kq2",
    signed: true,
  },
  {
    icon: "👥",
    type: "Équipe Projet",
    name: "KongoKash Core Team",
    principal: "aaaaa-bb...0001",
    signed: false,
  },
];

type ProposalStatus = "en_cours" | "approuvee" | "rejetee";

interface Proposal {
  id: number;
  title: string;
  description: string;
  amount: number;
  pour: number;
  contre: number;
  status: ProposalStatus;
}

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 1,
    title: "Financement école numérique — Kinshasa",
    description:
      "Soutien à la création d'un laboratoire informatique dans les écoles publiques de Kinshasa pour 500 élèves.",
    amount: 5_000_000,
    pour: 72,
    contre: 28,
    status: "approuvee",
  },
  {
    id: 2,
    title: "Subvention PME agricoles — Province du Kasaï",
    description:
      "Allocation de fonds pour soutenir 120 petites exploitations agricoles et renforcer la sécurité alimentaire locale.",
    amount: 3_000_000,
    pour: 54,
    contre: 46,
    status: "en_cours",
  },
];

const TIMELINE = [
  {
    date: "01 Nov 2025",
    event: "Initialisation du contrat de vesting",
    detail: "100,000,000 OKP verrouillés — 60 mois",
    icon: <Lock size={14} />,
    color: TEAL,
  },
  {
    date: "15 Jan 2026",
    event: "Retrait mois 1",
    detail: "1,666,667 OKP — 3/3 signatures",
    icon: <CheckCircle size={14} />,
    color: "oklch(0.55 0.18 145)",
  },
  {
    date: "15 Fév 2026",
    event: "Retrait mois 2",
    detail: "1,666,667 OKP — 3/3 signatures",
    icon: <CheckCircle size={14} />,
    color: "oklch(0.55 0.18 145)",
  },
  {
    date: "15 Mar 2026",
    event: "Retrait mois 3",
    detail: "1,666,667 OKP — 3/3 signatures",
    icon: <CheckCircle size={14} />,
    color: "oklch(0.55 0.18 145)",
  },
  {
    date: "20 Mar 2026",
    event: "Proposition DAO soumise",
    detail: "Financement école numérique — Kinshasa",
    icon: <Users size={14} />,
    color: GOV_COLOR,
  },
  {
    date: "25 Mar 2026",
    event: "Proposition DAO approuvée",
    detail: "Vote : 72% Pour — Quorum atteint",
    icon: <CheckCircle size={14} />,
    color: "oklch(0.55 0.18 145)",
  },
];

const GOVERNANCE_RULES = [
  "Transparence totale : toutes les transactions sont publiques et vérifiables sur la blockchain ICP.",
  "Multi-signature 3/3 : chaque retrait mensuel requiert la signature des 3 entités (publique, auditeur, équipe).",
  "Vesting 5 ans : les tokens sont débloqués progressivement sur 60 mois — impossible d'en extraire la totalité.",
  "Quorum DAO : une proposition est approuvée si elle obtient ≥ 60% des votes et un quorum d'au moins 10% des détenteurs OKP.",
  "Immuabilité : les règles de gouvernance sont encodées dans le smart contract — aucune modification unilatérale possible.",
];

function VestingTab() {
  const elapsed = getElapsedMonths();
  const released = elapsed * MONTHLY_UNLOCK;
  const progress = (elapsed / VESTING_MONTHS) * 100;
  const nextUnlock = getNextUnlockDate();

  return (
    <div className="space-y-6">
      {/* Main card */}
      <Card style={{ border: `1px solid ${GOV_COLOR}33`, background: GOV_BG }}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle
                className="text-xl font-bold mb-1"
                style={{ color: GOV_COLOR }}
              >
                Allocation Fonds pour l'Innovation Numérique en RDC
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                10% du supply OKP — Vesting progressif sur 5 ans
              </p>
            </div>
            <Badge
              className="text-xs font-semibold shrink-0"
              style={{
                background: `${TEAL}22`,
                color: TEAL,
                border: `1px solid ${TEAL}44`,
              }}
            >
              🔒 Transparent — Traçable On-Chain
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total alloué",
                value: "100,000,000 OKP",
                color: GOV_COLOR,
              },
              {
                label: "Libéré à ce jour",
                value: `${released.toLocaleString("fr-FR")} OKP`,
                color: TEAL,
              },
              {
                label: "Mensualité",
                value: `${MONTHLY_UNLOCK.toLocaleString("fr-FR")} OKP`,
                color: GOLD,
              },
              {
                label: "Prochain déblocage",
                value: nextUnlock,
                color: "oklch(0.55 0.18 145)",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-4 text-center"
                style={{ background: "oklch(0 0 0 / 0.05)" }}
              >
                <div
                  className="text-base font-bold leading-tight"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>
                Mois {elapsed} / {VESTING_MONTHS}
              </span>
              <span>{progress.toFixed(1)}% débloqué</span>
            </div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ background: `${GOV_COLOR}20` }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: GOV_COLOR }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Démarrage</span>
              <span>Fin du vesting (5 ans)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Historique des retraits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                    Mois
                  </th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                    Date
                  </th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">
                    Montant
                  </th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">
                    Statut
                  </th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">
                    Hash on-chain
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_WITHDRAWALS.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="py-2 px-3 font-mono text-muted-foreground">
                      #{w.month}
                    </td>
                    <td className="py-2 px-3">{w.date}</td>
                    <td
                      className="py-2 px-3 text-right font-semibold"
                      style={{ color: GOV_COLOR }}
                    >
                      {w.amount.toLocaleString("fr-FR")} OKP
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge
                        className="text-xs"
                        style={{
                          background: "oklch(0.55 0.18 145 / 0.15)",
                          color: "oklch(0.55 0.18 145)",
                          border: "1px solid oklch(0.55 0.18 145 / 0.3)",
                        }}
                      >
                        {w.status} ✓
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-xs text-muted-foreground">
                      {w.hash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProposalsTab() {
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  function submitProposal() {
    if (!title.trim() || !description.trim() || !amount) return;
    const newProp: Proposal = {
      id: proposals.length + 1,
      title: title.trim(),
      description: description.trim(),
      amount: Number(amount),
      pour: 0,
      contre: 0,
      status: "en_cours",
    };
    setProposals((prev) => [newProp, ...prev]);
    setTitle("");
    setDescription("");
    setAmount("");
    setOpen(false);
    toast.success("Proposition soumise avec succès");
  }

  function vote(id: number, type: "pour" | "contre") {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const totalVotes = p.pour + p.contre + 10; // simulate adding votes
        const newPour = type === "pour" ? p.pour + 8 : p.pour;
        const newContre = type === "contre" ? p.contre + 8 : p.contre;
        const total = newPour + newContre + (totalVotes - p.pour - p.contre);
        const pourPct = Math.round((newPour / total) * 100);
        const newStatus: ProposalStatus =
          pourPct >= 60
            ? "approuvee"
            : newContre > newPour
              ? "rejetee"
              : "en_cours";
        return {
          ...p,
          pour: pourPct,
          contre: 100 - pourPct,
          status: newStatus,
        };
      }),
    );
    toast.success(
      type === "pour" ? "Vote Pour enregistré" : "Vote Contre enregistré",
    );
  }

  const statusConfig: Record<ProposalStatus, { label: string; color: string }> =
    {
      en_cours: { label: "En cours", color: "oklch(0.75 0.18 85)" },
      approuvee: { label: "Approuvée", color: "oklch(0.55 0.18 145)" },
      rejetee: { label: "Rejetée", color: "oklch(0.55 0.18 25)" },
    };

  return (
    <div className="space-y-5" data-ocid="governance.proposals.panel">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Propositions DAO</h3>
          <p className="text-sm text-muted-foreground">
            Les détenteurs OKP votent sur l'utilisation des fonds publics.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="governance.proposal.open_modal_button"
              style={{ background: GOV_COLOR, color: "white" }}
            >
              + Soumettre une proposition
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="governance.proposal.dialog">
            <DialogHeader>
              <DialogTitle>Nouvelle proposition DAO</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prop-title">Titre</Label>
                <Input
                  id="prop-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de la proposition"
                  data-ocid="governance.proposal.input"
                />
              </div>
              <div>
                <Label htmlFor="prop-desc">Description</Label>
                <Textarea
                  id="prop-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez l'objectif et l'impact attendu..."
                  rows={3}
                  data-ocid="governance.proposal.textarea"
                />
              </div>
              <div>
                <Label htmlFor="prop-amount">Montant demandé (OKP)</Label>
                <Input
                  id="prop-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="ex: 2000000"
                  data-ocid="governance.proposal.amount.input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                data-ocid="governance.proposal.cancel_button"
              >
                Annuler
              </Button>
              <Button
                onClick={submitProposal}
                style={{ background: GOV_COLOR, color: "white" }}
                data-ocid="governance.proposal.submit_button"
              >
                Soumettre
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4" data-ocid="governance.proposals.list">
        {proposals.map((p, idx) => {
          const sc = statusConfig[p.status];
          return (
            <Card
              key={p.id}
              style={{ border: `1px solid ${GOV_COLOR}22` }}
              data-ocid={`governance.proposals.item.${idx + 1}`}
            >
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold leading-tight">{p.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {p.description}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <Badge
                      style={{
                        background: `${sc.color}20`,
                        color: sc.color,
                        border: `1px solid ${sc.color}44`,
                      }}
                    >
                      {sc.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {p.amount.toLocaleString("fr-FR")} OKP
                    </span>
                  </div>
                </div>

                {/* Vote bars */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "oklch(0.55 0.18 145)" }}>
                      Pour : {p.pour}%
                    </span>
                    <span style={{ color: "oklch(0.55 0.18 25)" }}>
                      Contre : {p.contre}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-muted flex">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${p.pour}%`,
                        background: "oklch(0.55 0.18 145)",
                      }}
                    />
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${p.contre}%`,
                        background: "oklch(0.55 0.18 25)",
                      }}
                    />
                  </div>
                </div>

                {p.status === "en_cours" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => vote(p.id, "pour")}
                      style={{
                        borderColor: "oklch(0.55 0.18 145)",
                        color: "oklch(0.55 0.18 145)",
                      }}
                      data-ocid={`governance.proposals.vote_pour.${idx + 1}`}
                    >
                      <ThumbsUp size={14} className="mr-1" /> Pour
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => vote(p.id, "contre")}
                      style={{
                        borderColor: "oklch(0.55 0.18 25)",
                        color: "oklch(0.55 0.18 25)",
                      }}
                      data-ocid={`governance.proposals.vote_contre.${idx + 1}`}
                    >
                      <ThumbsDown size={14} className="mr-1" /> Contre
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MultiSigTab() {
  return (
    <div className="space-y-6" data-ocid="governance.multisig.panel">
      {/* Explanation */}
      <Card style={{ border: `1px solid ${GOV_COLOR}33`, background: GOV_BG }}>
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <Shield size={20} style={{ color: GOV_COLOR, marginTop: 2 }} />
            <div>
              <h3 className="font-semibold mb-1" style={{ color: GOV_COLOR }}>
                Mécanisme Multi-Signature 3/3
              </h3>
              <p className="text-sm text-muted-foreground">
                <strong>3 signatures requises</strong> pour chaque retrait
                mensuel. Les 3 entités signataires désignées doivent approuver
                individuellement avant qu'aucune transaction ne soit exécutée.
                Ce mécanisme garantit qu'aucune entité seule ne peut accéder aux
                fonds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signers table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Signataires enregistrés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_SIGNERS.map((s, i) => (
              <div
                key={s.name}
                className="flex items-center gap-4 p-3 rounded-xl"
                style={{
                  background: `${GOV_COLOR}08`,
                  border: `1px solid ${GOV_COLOR}18`,
                }}
                data-ocid={`governance.signer.item.${i + 1}`}
              >
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{s.name}</span>
                    <Badge
                      className="text-xs"
                      style={{
                        background: `${TEAL}15`,
                        color: TEAL,
                        border: `1px solid ${TEAL}33`,
                      }}
                    >
                      Enregistré
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.type}</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {s.principal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending withdrawal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Demandes de retrait en attente de signature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-xl p-4"
            style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}33` }}
            data-ocid="governance.pending.item.1"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h4 className="font-semibold" style={{ color: GOLD }}>
                  Retrait Mois 4
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(1_666_667).toLocaleString("fr-FR")} OKP — en attente de
                  signature
                </p>
              </div>
              <Badge
                style={{
                  background: `${GOLD}22`,
                  color: GOLD,
                  border: `1px solid ${GOLD}44`,
                }}
              >
                2 / 3 signatures
              </Badge>
            </div>

            {/* Signers status */}
            <div className="space-y-2 mb-4">
              {MOCK_SIGNERS.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-sm">
                  {s.signed ? (
                    <CheckCircle
                      size={15}
                      style={{ color: "oklch(0.55 0.18 145)" }}
                    />
                  ) : (
                    <XCircle
                      size={15}
                      style={{ color: "oklch(0.55 0.18 25)" }}
                    />
                  )}
                  <span className={s.signed ? "" : "text-muted-foreground"}>
                    {s.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({s.type})
                  </span>
                </div>
              ))}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block">
                    <Button
                      disabled
                      size="sm"
                      data-ocid="governance.pending.sign.button"
                    >
                      <Lock size={14} className="mr-1" /> Signer
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vous n'êtes pas signataire autorisé</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TransparencyTab() {
  return (
    <div className="space-y-6" data-ocid="governance.transparency.panel">
      {/* Intro */}
      <Card style={{ border: `1px solid ${TEAL}33`, background: `${TEAL}08` }}>
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <Shield size={20} style={{ color: TEAL, marginTop: 2 }} />
            <p className="text-sm" style={{ color: TEAL }}>
              Toutes les transactions de ce fonds sont enregistrées sur la
              blockchain ICP et vérifiables publiquement. Aucune modification
              n'est possible sans consensus des 3 signataires.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Journal des opérations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div
              className="absolute left-4 top-0 bottom-0 w-0.5"
              style={{ background: `${GOV_COLOR}30` }}
            />
            <div className="space-y-4">
              {TIMELINE.map((item, i) => (
                <div
                  key={item.event}
                  className="flex items-start gap-4 pl-10 relative"
                  data-ocid={`governance.timeline.item.${i + 1}`}
                >
                  <span
                    className="absolute left-2.5 top-0.5 flex items-center justify-center w-3 h-3 rounded-full"
                    style={{ background: item.color }}
                  >
                    <span style={{ color: "white", transform: "scale(0.65)" }}>
                      {item.icon}
                    </span>
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{item.event}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <a
              href="https://dashboard.internetcomputer.org"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: TEAL }}
              data-ocid="governance.explorer.link"
            >
              Voir sur ICP Explorer
              <ExternalLink size={14} />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Governance rules */}
      <Card style={{ border: `1px solid ${GOV_COLOR}33` }}>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Landmark size={16} style={{ color: GOV_COLOR }} />
            Règles de gouvernance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {GOVERNANCE_RULES.map((rule) => (
              <li
                key={rule.slice(0, 20)}
                className="flex items-start gap-3 text-sm"
              >
                <CheckCircle
                  size={16}
                  className="shrink-0 mt-0.5"
                  style={{ color: GOV_COLOR }}
                />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export function GovernanceSection() {
  return (
    <div className="space-y-6" data-ocid="governance.section">
      {/* Header */}
      <div
        className="rounded-2xl p-5"
        style={{ background: GOV_BG, border: `1px solid ${GOV_COLOR}33` }}
      >
        <div className="flex items-start gap-4">
          <div
            className="rounded-xl p-3"
            style={{ background: `${GOV_COLOR}20` }}
          >
            <Landmark size={28} style={{ color: GOV_COLOR }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: GOV_COLOR }}>
              Fonds pour l'Innovation Numérique en RDC
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              100,000,000 OKP (10% du supply) — gérés avec transparence,
              multisig et gouvernance DAO
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Badge
                style={{
                  background: `${GOV_COLOR}20`,
                  color: GOV_COLOR,
                  border: `1px solid ${GOV_COLOR}44`,
                }}
              >
                🏛️ Vesting 5 ans
              </Badge>
              <Badge
                style={{
                  background: `${TEAL}15`,
                  color: TEAL,
                  border: `1px solid ${TEAL}33`,
                }}
              >
                🔐 Multi-Sig 3/3
              </Badge>
              <Badge
                style={{
                  background: `${GOLD}15`,
                  color: GOLD,
                  border: `1px solid ${GOLD}33`,
                }}
              >
                🗳️ Gouvernance DAO
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <Tabs defaultValue="vesting">
        <TabsList
          className="grid grid-cols-4 w-full max-w-2xl"
          data-ocid="governance.tab"
        >
          <TabsTrigger value="vesting" data-ocid="governance.tab">
            <Lock size={13} className="mr-1" /> Vesting
          </TabsTrigger>
          <TabsTrigger value="proposals" data-ocid="governance.tab">
            <Users size={13} className="mr-1" /> Propositions DAO
          </TabsTrigger>
          <TabsTrigger value="multisig" data-ocid="governance.tab">
            <Shield size={13} className="mr-1" /> Multi-Signature
          </TabsTrigger>
          <TabsTrigger value="transparency" data-ocid="governance.tab">
            <ExternalLink size={13} className="mr-1" /> Transparence
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="vesting">
            <VestingTab />
          </TabsContent>
          <TabsContent value="proposals">
            <ProposalsTab />
          </TabsContent>
          <TabsContent value="multisig">
            <MultiSigTab />
          </TabsContent>
          <TabsContent value="transparency">
            <TransparencyTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
