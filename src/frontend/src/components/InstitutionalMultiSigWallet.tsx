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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  Shield,
  ThumbsUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignatoryStatus = "actif" | "decede" | "indisponible";

export interface Signatory {
  id: string;
  name: string;
  role: string;
  contact: string;
  status: SignatoryStatus;
}

export interface SuccessionVote {
  signatoryId: string;
  voterIds: string[];
  nomineeId?: string;
  documentRef?: string;
  step: 1 | 2 | 3 | 4 | 5;
  nomineeInfo?: { name: string; role: string; contact: string };
}

export interface MultiSigConfig {
  partnerId: string;
  partnerName: string;
  partnerCategory: string;
  total: number; // N
  required: number; // M
  signatories: Signatory[];
  pendingTransactions: PendingTx[];
  successionVotes: SuccessionVote[];
  configured: boolean;
}

export interface PendingTx {
  id: string;
  description: string;
  amount: string;
  currency: string;
  createdAt: string;
  approvals: string[];
  rejections: string[];
  status: "pending" | "approved" | "rejected";
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "kongokash_multisig_configs";

export function loadAllConfigs(): Record<string, MultiSigConfig> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveConfig(cfg: MultiSigConfig) {
  const all = loadAllConfigs();
  all[cfg.partnerId] = cfg;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function loadConfig(partnerId: string): MultiSigConfig | null {
  return loadAllConfigs()[partnerId] ?? null;
}

// ─── Signatory status badge ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: SignatoryStatus }) {
  const map: Record<SignatoryStatus, { label: string; color: string }> = {
    actif: { label: "Actif 🟢", color: "oklch(0.55 0.15 145)" },
    decede: { label: "Décédé 🔴", color: "oklch(0.55 0.18 20)" },
    indisponible: { label: "Indisponible 🟡", color: "oklch(0.70 0.16 85)" },
  };
  const m = map[status];
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: `${m.color}33`,
        color: m.color,
        border: `1px solid ${m.color}55`,
      }}
    >
      {m.label}
    </span>
  );
}

// ─── Multi-sig setup wizard ───────────────────────────────────────────────────

interface SetupWizardProps {
  partnerId: string;
  partnerName: string;
  partnerCategory: string;
  onComplete: (cfg: MultiSigConfig) => void;
  onCancel: () => void;
}

const ROLES = [
  "Directeur Général",
  "Directeur Adjoint",
  "Secrétaire Général",
  "Comptable",
  "Trésorier",
  "Président du Conseil",
  "Responsable Financier",
  "Auditeur Interne",
];

export function MultiSigSetupWizard({
  partnerId,
  partnerName,
  partnerCategory,
  onComplete,
  onCancel,
}: SetupWizardProps) {
  const [step, setStep] = useState<"config" | "signatories" | "review">(
    "config",
  );
  const [total, setTotal] = useState(3);
  const [required, setRequired] = useState(2);
  const [sigs, setSigs] = useState<Omit<Signatory, "id" | "status">[]>(
    Array.from({ length: 3 }, () => ({ name: "", role: "", contact: "" })),
  );

  function updateSig(
    idx: number,
    field: keyof Omit<Signatory, "id" | "status">,
    val: string,
  ) {
    setSigs((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)),
    );
  }

  function handleTotalChange(val: string) {
    const n = Number(val);
    setTotal(n);
    if (required > n) setRequired(Math.max(2, n - 1));
    setSigs((prev) => {
      if (n > prev.length)
        return [
          ...prev,
          ...Array.from({ length: n - prev.length }, () => ({
            name: "",
            role: "",
            contact: "",
          })),
        ];
      return prev.slice(0, n);
    });
  }

  function canProceed() {
    if (step === "config") return required <= total;
    if (step === "signatories")
      return sigs.every(
        (s) => s.name.trim() && s.role.trim() && s.contact.trim(),
      );
    return true;
  }

  function finish() {
    const cfg: MultiSigConfig = {
      partnerId,
      partnerName,
      partnerCategory,
      total,
      required,
      configured: true,
      signatories: sigs.map((s, i) => ({
        ...s,
        id: `sig-${partnerId}-${i}`,
        status: "actif" as SignatoryStatus,
      })),
      pendingTransactions: [
        {
          id: `tx-demo-${Date.now()}`,
          description: "Retrait trésorerie mensuelle",
          amount: "15,000",
          currency: "OKP",
          createdAt: new Date().toLocaleDateString("fr-FR"),
          approvals: [],
          rejections: [],
          status: "pending",
        },
      ],
      successionVotes: [],
    };
    saveConfig(cfg);
    onComplete(cfg);
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {(["config", "signatories", "review"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background:
                  step === s
                    ? "oklch(0.55 0.15 180)"
                    : ["config", "signatories", "review"].indexOf(step) > i
                      ? "oklch(0.55 0.15 145)"
                      : "oklch(0.25 0.04 220)",
                color: "white",
              }}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div
                className="h-px w-8"
                style={{ background: "oklch(0.30 0.04 220)" }}
              />
            )}
          </div>
        ))}
        <span className="ml-2 text-white/60 text-sm">
          {step === "config" && "Configuration M/N"}
          {step === "signatories" && "Signataires"}
          {step === "review" && "Récapitulatif"}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === "config" && (
          <motion.div
            key="config"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div
              className="p-4 rounded-xl text-sm"
              style={{
                background: "oklch(0.18 0.05 200/0.5)",
                border: "1px solid oklch(0.55 0.15 180/0.3)",
                color: "oklch(0.78 0.10 180)",
              }}
            >
              <Shield size={14} className="inline mr-1" />
              En cas de décès ou d'indisponibilité d'un signataire, les autres
              peuvent toujours accéder aux fonds et nommer un remplaçant.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-xs">
                  Nombre total de signataires (N)
                </Label>
                <Select value={String(total)} onValueChange={handleTotalChange}>
                  <SelectTrigger
                    className="bg-white/5 border-white/20 text-white"
                    data-ocid="multisig.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: "oklch(0.18 0.04 220)" }}>
                    {[2, 3, 5].map((n) => (
                      <SelectItem
                        key={n}
                        value={String(n)}
                        className="text-white"
                      >
                        {n} signataires
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-xs">
                  Signatures requises pour valider (M)
                </Label>
                <Select
                  value={String(required)}
                  onValueChange={(v) => setRequired(Number(v))}
                >
                  <SelectTrigger
                    className="bg-white/5 border-white/20 text-white"
                    data-ocid="multisig.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: "oklch(0.18 0.04 220)" }}>
                    {Array.from({ length: total - 1 }, (_, i) => i + 2)
                      .filter((n) => n <= total)
                      .map((n) => (
                        <SelectItem
                          key={n}
                          value={String(n)}
                          className="text-white"
                        >
                          {n} sur {total}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              className="p-4 rounded-xl text-center"
              style={{ background: "oklch(0.20 0.06 220)" }}
            >
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: "oklch(0.77 0.13 85)" }}
              >
                {required}/{total}
              </div>
              <div className="text-white/60 text-sm">
                signatures requises pour toute transaction
              </div>
              <div className="text-white/40 text-xs mt-1">
                Les fonds restent accessibles même si {total - required}{" "}
                signataire{total - required > 1 ? "s" : ""} est
                {total - required > 1 ? " sont" : ""} indisponible
                {total - required > 1 ? "s" : ""}
              </div>
            </div>
          </motion.div>
        )}

        {step === "signatories" && (
          <motion.div
            key="signatories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {sigs.map((sig, i) => (
              <div
                key={`sig-setup-${sig.name || i}`}
                className="p-4 rounded-xl space-y-3"
                style={{ background: "oklch(0.16 0.04 220)" }}
              >
                <div
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.77 0.13 85)" }}
                >
                  Signataire #{i + 1}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">Nom complet</Label>
                    <Input
                      value={sig.name}
                      onChange={(e) => updateSig(i, "name", e.target.value)}
                      placeholder="Jean-Marie Kabila"
                      className="bg-white/5 border-white/20 text-white h-8 text-sm"
                      data-ocid="multisig.input"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">
                      Fonction / Rôle
                    </Label>
                    <Select
                      value={sig.role}
                      onValueChange={(v) => updateSig(i, "role", v)}
                    >
                      <SelectTrigger
                        className="bg-white/5 border-white/20 text-white h-8 text-sm"
                        data-ocid="multisig.select"
                      >
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent
                        style={{ background: "oklch(0.18 0.04 220)" }}
                      >
                        {ROLES.map((r) => (
                          <SelectItem
                            key={r}
                            value={r}
                            className="text-white text-xs"
                          >
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">
                      Contact / Réf.
                    </Label>
                    <Input
                      value={sig.contact}
                      onChange={(e) => updateSig(i, "contact", e.target.value)}
                      placeholder="+243 81x xxx xxx"
                      className="bg-white/5 border-white/20 text-white h-8 text-sm"
                      data-ocid="multisig.input"
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div
              className="p-4 rounded-xl"
              style={{ background: "oklch(0.16 0.04 220)" }}
            >
              <div className="text-white font-semibold mb-3">
                {partnerName} — Wallet Multi-Signature {required}/{total}
              </div>
              <div className="space-y-2">
                {sigs.map((sig, i) => (
                  <div
                    key={`sig-review-${sig.name || i}`}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{
                        background: "oklch(0.55 0.15 180/0.3)",
                        color: "oklch(0.70 0.12 180)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="text-white text-sm">{sig.name}</div>
                    <div className="text-white/50 text-xs">{sig.role}</div>
                    <Badge
                      className="ml-auto text-xs"
                      style={{
                        background: "oklch(0.55 0.15 145/0.2)",
                        color: "oklch(0.65 0.15 145)",
                        border: "1px solid oklch(0.55 0.15 145/0.4)",
                      }}
                    >
                      Actif
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="p-3 rounded-lg text-xs"
              style={{
                background: "oklch(0.18 0.05 145/0.2)",
                border: "1px solid oklch(0.55 0.15 145/0.3)",
                color: "oklch(0.70 0.10 145)",
              }}
            >
              <CheckCircle size={12} className="inline mr-1" />
              Les fonds restent toujours accessibles tant qu'au moins{" "}
              <strong>{required}</strong> signataire{required > 1 ? "s" : ""}{" "}
              sont actifs. En cas de décès, les autres signataires continuent à
              gérer le wallet normalement.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 justify-end pt-2">
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white/60 hover:text-white"
          onClick={
            step === "config"
              ? onCancel
              : () => setStep(step === "review" ? "signatories" : "config")
          }
          data-ocid="multisig.cancel_button"
        >
          {step === "config" ? "Annuler" : "Retour"}
        </Button>
        <Button
          size="sm"
          disabled={!canProceed()}
          onClick={() => {
            if (step === "config") setStep("signatories");
            else if (step === "signatories") setStep("review");
            else finish();
          }}
          style={{ background: "oklch(0.55 0.15 180)", color: "white" }}
          data-ocid="multisig.primary_button"
        >
          {step === "review" ? "Activer le wallet multi-signature" : "Suivant"}
        </Button>
      </div>
    </div>
  );
}

// ─── Succession panel ─────────────────────────────────────────────────────────

interface SuccessionPanelProps {
  config: MultiSigConfig;
  onConfigUpdate: (cfg: MultiSigConfig) => void;
  isAdminView?: boolean;
}

export function SuccessionPanel({
  config,
  onConfigUpdate,
  isAdminView = false,
}: SuccessionPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [declaring, setDeclaring] = useState<string | null>(null);
  const [declareType, setDeclareType] =
    useState<SignatoryStatus>("indisponible");
  const [nomineeInfo, setNomineeInfo] = useState({
    name: "",
    role: "",
    contact: "",
  });
  const [docRef, setDocRef] = useState("");
  const [addingReplacement, setAddingReplacement] = useState<string | null>(
    null,
  );

  const activeCount = config.signatories.filter(
    (s) => s.status === "actif",
  ).length;
  const hasIssue = config.signatories.some((s) => s.status !== "actif");

  function declareStatus(sigId: string, status: SignatoryStatus) {
    const updated: MultiSigConfig = {
      ...config,
      signatories: config.signatories.map((s) =>
        s.id === sigId ? { ...s, status } : s,
      ),
    };
    if (status === "decede" || status === "indisponible") {
      // Start a succession vote
      const existing = updated.successionVotes.find(
        (v) => v.signatoryId === sigId,
      );
      if (!existing) {
        updated.successionVotes = [
          ...updated.successionVotes,
          { signatoryId: sigId, voterIds: [], step: 1 },
        ];
      }
    }
    saveConfig(updated);
    onConfigUpdate(updated);
    setDeclaring(null);
    toast.success("Statut mis à jour. Processus de succession démarré.");
  }

  function advanceSuccession(sigId: string, vote: SuccessionVote) {
    let nextVote = { ...vote };
    if (vote.step === 1) {
      // Confirm vote — simulate adding a voter
      nextVote = {
        ...nextVote,
        voterIds: [...nextVote.voterIds, "admin"],
        step: 2,
      };
      toast.success("Vote enregistré. Nomination du remplaçant requise.");
    } else if (vote.step === 2 && nomineeInfo.name && nomineeInfo.role) {
      nextVote = { ...nextVote, nomineeInfo, step: 3 };
      setNomineeInfo({ name: "", role: "", contact: "" });
      toast.success("Remplaçant nommé. En attente de validation admin.");
    } else if (vote.step === 3 && docRef) {
      nextVote = { ...nextVote, documentRef: docRef, step: 4 };
      setDocRef("");
      toast.success(
        "Document référencé. Le nouveau signataire peut s'enregistrer.",
      );
    } else if (vote.step === 4) {
      // Add new signatory, remove old
      const newSig: Signatory = {
        id: `sig-${config.partnerId}-${Date.now()}`,
        name: vote.nomineeInfo?.name ?? "Nouveau Signataire",
        role: vote.nomineeInfo?.role ?? "Directeur Général",
        contact: vote.nomineeInfo?.contact ?? "",
        status: "actif",
      };
      const updated: MultiSigConfig = {
        ...config,
        signatories: [
          ...config.signatories.filter((s) => s.id !== sigId),
          newSig,
        ],
        successionVotes: config.successionVotes.filter(
          (v) => v.signatoryId !== sigId,
        ),
      };
      saveConfig(updated);
      onConfigUpdate(updated);
      setAddingReplacement(null);
      toast.success("Succession complète. Nouveau signataire actif.");
      return;
    }
    const updated: MultiSigConfig = {
      ...config,
      successionVotes: config.successionVotes.map((v) =>
        v.signatoryId === sigId ? nextVote : v,
      ),
    };
    saveConfig(updated);
    onConfigUpdate(updated);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <button
        type="button"
        className="flex items-center justify-between p-4 rounded-xl cursor-pointer w-full text-left"
        style={{ background: "oklch(0.16 0.04 220)" }}
        onClick={() => setExpanded(!expanded)}
        data-ocid="succession.panel"
      >
        <div className="flex items-center gap-3">
          <Users
            size={16}
            style={{
              color: hasIssue ? "oklch(0.65 0.16 40)" : "oklch(0.55 0.15 180)",
            }}
          />
          <div>
            <div className="text-white text-sm font-semibold">
              Gestion de la Succession
            </div>
            <div className="text-white/50 text-xs">
              {activeCount}/{config.total} signataires actifs — Seuil :{" "}
              {config.required}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasIssue && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                background: "oklch(0.55 0.18 20/0.2)",
                color: "oklch(0.65 0.16 40)",
                border: "1px solid oklch(0.55 0.18 20/0.4)",
              }}
            >
              Action requise
            </span>
          )}
          {expanded ? (
            <ChevronUp size={14} className="text-white/40" />
          ) : (
            <ChevronDown size={14} className="text-white/40" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-4"
          >
            {/* Key message */}
            <div
              className="p-3 rounded-lg text-xs"
              style={{
                background: "oklch(0.18 0.05 180/0.2)",
                border: "1px solid oklch(0.55 0.15 180/0.3)",
                color: "oklch(0.73 0.10 180)",
              }}
            >
              <Shield size={12} className="inline mr-1" />
              Les fonds restent toujours accessibles tant qu'au moins{" "}
              <strong>{config.required}</strong> signataire
              {config.required > 1 ? "s" : ""} sont actifs. En cas de décès, les
              autres signataires continuent à gérer le wallet normalement.
            </div>

            {/* Signatory list */}
            <div className="space-y-3">
              {config.signatories.map((sig) => {
                const vote = config.successionVotes.find(
                  (v) => v.signatoryId === sig.id,
                );
                return (
                  <div
                    key={sig.id}
                    className="p-4 rounded-xl space-y-3"
                    style={{ background: "oklch(0.14 0.03 220)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-white font-medium text-sm">
                          {sig.name}
                        </div>
                        <div className="text-white/50 text-xs">{sig.role}</div>
                        <div className="text-white/40 text-xs">
                          {sig.contact}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={sig.status} />
                        {sig.status === "actif" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                              onClick={() => {
                                setDeclaring(sig.id);
                                setDeclareType("indisponible");
                              }}
                              data-ocid="succession.toggle"
                            >
                              <UserMinus size={10} className="mr-1" />
                              Indisponible
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                              onClick={() => {
                                setDeclaring(sig.id);
                                setDeclareType("decede");
                              }}
                              data-ocid="succession.toggle"
                            >
                              <XCircle size={10} className="mr-1" />
                              Déclarer décès
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Declare form */}
                    {declaring === sig.id && (
                      <div
                        className="p-3 rounded-lg space-y-2"
                        style={{
                          background: "oklch(0.18 0.05 20/0.2)",
                          border: "1px solid oklch(0.55 0.18 20/0.3)",
                        }}
                      >
                        <div className="text-xs text-red-300 font-medium">
                          ⚠️ Confirmation requise
                        </div>
                        <div className="text-white/60 text-xs">
                          Déclarer {sig.name} comme{" "}
                          <strong>
                            {declareType === "decede"
                              ? "décédé"
                              : "indisponible"}
                          </strong>{" "}
                          démarrera le processus de succession. Les{" "}
                          {config.required - 1} autres signataires devront
                          valider.
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => declareStatus(sig.id, declareType)}
                            data-ocid="succession.confirm_button"
                          >
                            Confirmer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-white/20 text-white/60"
                            onClick={() => setDeclaring(null)}
                            data-ocid="succession.cancel_button"
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Succession progress */}
                    {vote && (
                      <SuccessionProgress
                        vote={vote}
                        sig={sig}
                        config={config}
                        nomineeInfo={nomineeInfo}
                        setNomineeInfo={setNomineeInfo}
                        docRef={docRef}
                        setDocRef={setDocRef}
                        addingReplacement={addingReplacement}
                        setAddingReplacement={setAddingReplacement}
                        isAdminView={isAdminView}
                        onAdvance={() => advanceSuccession(sig.id, vote)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Succession progress steps ────────────────────────────────────────────────

interface SuccessionProgressProps {
  vote: SuccessionVote;
  sig: Signatory;
  config: MultiSigConfig;
  nomineeInfo: { name: string; role: string; contact: string };
  setNomineeInfo: (info: {
    name: string;
    role: string;
    contact: string;
  }) => void;
  docRef: string;
  setDocRef: (v: string) => void;
  addingReplacement: string | null;
  setAddingReplacement: (v: string | null) => void;
  isAdminView: boolean;
  onAdvance: () => void;
}

const SUCCESSION_STEPS = [
  "Vote de confirmation",
  "Nomination du remplaçant",
  "Validation admin",
  "Activation credentials",
  "Terminé",
];

function SuccessionProgress({
  vote,
  sig,
  config,
  nomineeInfo,
  setNomineeInfo,
  docRef,
  setDocRef,
  isAdminView,
  onAdvance,
}: SuccessionProgressProps) {
  const pct = ((vote.step - 1) / 4) * 100;

  return (
    <div
      className="p-3 rounded-lg space-y-3"
      style={{
        background: "oklch(0.16 0.05 220/0.5)",
        border: "1px solid oklch(0.55 0.15 180/0.2)",
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="text-xs font-semibold"
          style={{ color: "oklch(0.77 0.13 85)" }}
        >
          Processus de succession — Étape {vote.step}/5
        </div>
        <div className="text-white/40 text-xs">
          {SUCCESSION_STEPS[vote.step - 1]}
        </div>
      </div>
      <Progress value={pct} className="h-1.5" />

      {/* Step 1: Vote */}
      {vote.step === 1 && (
        <div className="space-y-2">
          <div className="text-white/60 text-xs">
            {config.required - 1} signataire{config.required > 2 ? "s" : ""}{" "}
            doit{config.required > 2 ? "vent" : ""} confirmer le
            décès/indisponibilité de {sig.name}.
          </div>
          <div className="flex items-center gap-2">
            <div
              className="text-xs px-2 py-1 rounded"
              style={{
                background: "oklch(0.20 0.05 220)",
                color: "oklch(0.70 0.10 180)",
              }}
            >
              {vote.voterIds.length}/{config.required - 1} votes
            </div>
            <Button
              size="sm"
              className="h-7 text-xs"
              style={{ background: "oklch(0.55 0.15 180)", color: "white" }}
              onClick={onAdvance}
              data-ocid="succession.confirm_button"
            >
              <ThumbsUp size={10} className="mr-1" />
              Voter confirmation
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Nominate */}
      {vote.step === 2 && (
        <div className="space-y-2">
          <div className="text-white/60 text-xs">Nommez le remplaçant :</div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="Nom complet"
              value={nomineeInfo.name}
              onChange={(e) =>
                setNomineeInfo({ ...nomineeInfo, name: e.target.value })
              }
              className="bg-white/5 border-white/20 text-white h-7 text-xs"
              data-ocid="succession.input"
            />
            <Select
              value={nomineeInfo.role}
              onValueChange={(v) => setNomineeInfo({ ...nomineeInfo, role: v })}
            >
              <SelectTrigger
                className="bg-white/5 border-white/20 text-white h-7 text-xs"
                data-ocid="succession.select"
              >
                <SelectValue placeholder="Rôle..." />
              </SelectTrigger>
              <SelectContent style={{ background: "oklch(0.18 0.04 220)" }}>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="text-white text-xs">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Contact"
              value={nomineeInfo.contact}
              onChange={(e) =>
                setNomineeInfo({ ...nomineeInfo, contact: e.target.value })
              }
              className="bg-white/5 border-white/20 text-white h-7 text-xs"
              data-ocid="succession.input"
            />
          </div>
          <Button
            size="sm"
            className="h-7 text-xs"
            style={{ background: "oklch(0.55 0.15 180)", color: "white" }}
            disabled={!nomineeInfo.name || !nomineeInfo.role}
            onClick={onAdvance}
            data-ocid="succession.primary_button"
          >
            <UserPlus size={10} className="mr-1" />
            Nommer le remplaçant
          </Button>
        </div>
      )}

      {/* Step 3: Admin validation (document ref) */}
      {vote.step === 3 && (
        <div className="space-y-2">
          <div className="text-white/60 text-xs">
            {isAdminView
              ? "Saisissez la référence du document officiel (acte de décès / procuration) :"
              : "En attente de validation par l'administrateur KongoKash."}
          </div>
          {isAdminView && (
            <div className="flex gap-2">
              <Input
                placeholder="Réf. acte de décès N°..."
                value={docRef}
                onChange={(e) => setDocRef(e.target.value)}
                className="bg-white/5 border-white/20 text-white h-7 text-xs"
                data-ocid="succession.input"
              />
              <Button
                size="sm"
                className="h-7 text-xs whitespace-nowrap"
                style={{ background: "oklch(0.55 0.15 180)", color: "white" }}
                disabled={!docRef}
                onClick={onAdvance}
                data-ocid="succession.confirm_button"
              >
                <FileText size={10} className="mr-1" />
                Valider
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Credentials activation */}
      {vote.step === 4 && (
        <div className="space-y-2">
          <div className="text-white/60 text-xs">
            {vote.nomineeInfo?.name} doit configurer ses propres credentials
            d'accès. Document validé : {vote.documentRef}
          </div>
          <Button
            size="sm"
            className="h-7 text-xs"
            style={{ background: "oklch(0.55 0.15 145)", color: "white" }}
            onClick={onAdvance}
            data-ocid="succession.primary_button"
          >
            <UserCheck size={10} className="mr-1" />
            Activer les credentials du nouveau signataire
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Transaction Approval Panel ───────────────────────────────────────────────

interface TransactionApprovalProps {
  config: MultiSigConfig;
  onConfigUpdate: (cfg: MultiSigConfig) => void;
}

export function TransactionApprovalPanel({
  config,
  onConfigUpdate,
}: TransactionApprovalProps) {
  const [expanded, setExpanded] = useState(false);
  const [newTxDesc, setNewTxDesc] = useState("");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [newTxCurrency, setNewTxCurrency] = useState("OKP");

  const activeSignatories = config.signatories.filter(
    (s) => s.status === "actif",
  );

  function approveTx(txId: string, sigId: string) {
    const updated: MultiSigConfig = {
      ...config,
      pendingTransactions: config.pendingTransactions.map((tx) => {
        if (tx.id !== txId) return tx;
        const newApprovals = tx.approvals.includes(sigId)
          ? tx.approvals
          : [...tx.approvals, sigId];
        const newStatus =
          newApprovals.length >= config.required ? "approved" : "pending";
        if (newStatus === "approved")
          toast.success("Transaction approuvée et exécutée !");
        return { ...tx, approvals: newApprovals, status: newStatus };
      }),
    };
    saveConfig(updated);
    onConfigUpdate(updated);
  }

  function addTx() {
    if (!newTxDesc || !newTxAmount) return;
    const tx: PendingTx = {
      id: `tx-${Date.now()}`,
      description: newTxDesc,
      amount: newTxAmount,
      currency: newTxCurrency,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      approvals: [],
      rejections: [],
      status: "pending",
    };
    const updated: MultiSigConfig = {
      ...config,
      pendingTransactions: [...config.pendingTransactions, tx],
    };
    saveConfig(updated);
    onConfigUpdate(updated);
    setNewTxDesc("");
    setNewTxAmount("");
    toast.success("Transaction soumise pour approbation.");
  }

  const pending = config.pendingTransactions.filter(
    (t) => t.status === "pending",
  );
  const done = config.pendingTransactions.filter((t) => t.status !== "pending");

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="flex items-center justify-between p-4 rounded-xl cursor-pointer w-full text-left"
        style={{ background: "oklch(0.16 0.04 220)" }}
        onClick={() => setExpanded(!expanded)}
        data-ocid="multisig.panel"
      >
        <div className="flex items-center gap-3">
          <Shield size={16} style={{ color: "oklch(0.77 0.13 85)" }} />
          <div>
            <div className="text-white text-sm font-semibold">
              Approbations de Transactions
            </div>
            <div className="text-white/50 text-xs">
              {pending.length} en attente — {config.required}/{config.total}{" "}
              signatures requises
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <Badge
              className="text-xs"
              style={{
                background: "oklch(0.55 0.18 40/0.25)",
                color: "oklch(0.77 0.13 85)",
                border: "1px solid oklch(0.55 0.18 40/0.4)",
              }}
            >
              {pending.length}
            </Badge>
          )}
          {expanded ? (
            <ChevronUp size={14} className="text-white/40" />
          ) : (
            <ChevronDown size={14} className="text-white/40" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-4"
          >
            {/* New transaction */}
            <div
              className="p-4 rounded-xl space-y-3"
              style={{ background: "oklch(0.14 0.03 220)" }}
            >
              <div className="text-white/70 text-xs font-semibold">
                Soumettre une transaction
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Description (ex: Retrait mensuel)"
                  value={newTxDesc}
                  onChange={(e) => setNewTxDesc(e.target.value)}
                  className="bg-white/5 border-white/20 text-white h-8 text-sm flex-1"
                  data-ocid="multisig.input"
                />
                <Input
                  placeholder="Montant"
                  value={newTxAmount}
                  onChange={(e) => setNewTxAmount(e.target.value)}
                  className="bg-white/5 border-white/20 text-white h-8 text-sm w-28"
                  data-ocid="multisig.input"
                />
                <Select value={newTxCurrency} onValueChange={setNewTxCurrency}>
                  <SelectTrigger
                    className="bg-white/5 border-white/20 text-white h-8 text-sm w-24"
                    data-ocid="multisig.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: "oklch(0.18 0.04 220)" }}>
                    {["OKP", "CDF", "USD", "USDT"].map((c) => (
                      <SelectItem
                        key={c}
                        value={c}
                        className="text-white text-xs"
                      >
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="h-8"
                  style={{ background: "oklch(0.55 0.15 180)", color: "white" }}
                  onClick={addTx}
                  data-ocid="multisig.submit_button"
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>

            {/* Pending transactions */}
            {pending.map((tx) => {
              const pct = (tx.approvals.length / config.required) * 100;
              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-xl space-y-3"
                  style={{
                    background: "oklch(0.14 0.03 220)",
                    border: "1px solid oklch(0.55 0.15 85/0.2)",
                  }}
                  data-ocid="multisig.card"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white text-sm font-medium">
                        {tx.description}
                      </div>
                      <div className="text-white/50 text-xs">
                        {tx.createdAt}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-sm font-bold"
                        style={{ color: "oklch(0.77 0.13 85)" }}
                      >
                        {tx.amount} {tx.currency}
                      </div>
                      <div className="text-white/40 text-xs">
                        Approbations requises : {config.required}/{config.total}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>{tx.approvals.length} approuvé(s)</span>
                      <span>{config.required} requis</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>

                  {/* Signatory approve buttons */}
                  <div className="flex flex-wrap gap-2">
                    {activeSignatories.map((sig) => {
                      const hasApproved = tx.approvals.includes(sig.id);
                      return (
                        <Button
                          key={sig.id}
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          style={{
                            border: hasApproved
                              ? "1px solid oklch(0.55 0.15 145/0.6)"
                              : "1px solid oklch(0.30 0.04 220)",
                            background: hasApproved
                              ? "oklch(0.55 0.15 145/0.15)"
                              : "transparent",
                            color: hasApproved
                              ? "oklch(0.65 0.15 145)"
                              : "oklch(0.60 0.05 220)",
                          }}
                          disabled={hasApproved}
                          onClick={() => approveTx(tx.id, sig.id)}
                          data-ocid="multisig.toggle"
                        >
                          {hasApproved ? (
                            <CheckCircle size={10} className="mr-1" />
                          ) : (
                            <ThumbsUp size={10} className="mr-1" />
                          )}
                          {sig.name.split(" ")[0]}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Completed transactions */}
            {done.length > 0 && (
              <div>
                <div className="text-white/40 text-xs mb-2">
                  Transactions récentes
                </div>
                {done.slice(-3).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center py-2 border-b border-white/5"
                  >
                    <div className="text-white/60 text-xs">
                      {tx.description}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-xs">
                        {tx.amount} {tx.currency}
                      </span>
                      {tx.status === "approved" ? (
                        <CheckCircle
                          size={12}
                          style={{ color: "oklch(0.65 0.15 145)" }}
                        />
                      ) : (
                        <XCircle
                          size={12}
                          style={{ color: "oklch(0.60 0.18 20)" }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Full institutional wallet card ──────────────────────────────────────────

interface InstitutionalWalletCardProps {
  partnerId: string;
  partnerName: string;
  partnerCategory: string;
  isAdminView?: boolean;
}

export function InstitutionalWalletCard({
  partnerId,
  partnerName,
  partnerCategory,
  isAdminView = false,
}: InstitutionalWalletCardProps) {
  const [config, setConfig] = useState<MultiSigConfig | null>(() =>
    loadConfig(partnerId),
  );
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const loaded = loadConfig(partnerId);
    if (loaded) setConfig(loaded);
  }, [partnerId]);

  function handleUpdate(updated: MultiSigConfig) {
    setConfig(updated);
  }

  if (showSetup || !config?.configured) {
    return (
      <Card
        style={{
          background: "oklch(0.15 0.03 220)",
          border: "1px solid oklch(0.25 0.05 180)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Shield size={16} style={{ color: "oklch(0.55 0.15 180)" }} />
            Wallet Multi-Signature Institutionnel
            <Badge
              className="ml-auto text-xs"
              style={{
                background: "oklch(0.55 0.15 85/0.2)",
                color: "oklch(0.77 0.13 85)",
                border: "1px solid oklch(0.55 0.15 85/0.4)",
              }}
            >
              {partnerCategory}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MultiSigSetupWizard
            partnerId={partnerId}
            partnerName={partnerName}
            partnerCategory={partnerCategory}
            onComplete={(cfg) => {
              setConfig(cfg);
              setShowSetup(false);
              toast.success(
                `Wallet multi-signature activé pour ${partnerName}`,
              );
            }}
            onCancel={() => setShowSetup(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      style={{
        background: "oklch(0.15 0.03 220)",
        border: "1px solid oklch(0.25 0.04 220)",
      }}
    >
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Shield size={16} style={{ color: "oklch(0.55 0.15 145)" }} />
          Wallet Multi-Signature Institutionnel
          <Badge
            className="ml-auto text-xs"
            style={{
              background: "oklch(0.55 0.15 145/0.2)",
              color: "oklch(0.65 0.15 145)",
              border: "1px solid oklch(0.55 0.15 145/0.4)",
            }}
          >
            ✓ {config.required}/{config.total} actif
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div
          className="grid grid-cols-3 gap-3 p-3 rounded-xl"
          style={{ background: "oklch(0.13 0.03 220)" }}
        >
          <div className="text-center">
            <div
              className="text-xl font-bold"
              style={{ color: "oklch(0.55 0.15 180)" }}
            >
              {config.required}/{config.total}
            </div>
            <div className="text-white/40 text-xs">Seuil</div>
          </div>
          <div className="text-center">
            <div
              className="text-xl font-bold"
              style={{ color: "oklch(0.65 0.15 145)" }}
            >
              {config.signatories.filter((s) => s.status === "actif").length}
            </div>
            <div className="text-white/40 text-xs">Actifs</div>
          </div>
          <div className="text-center">
            <div
              className="text-xl font-bold"
              style={{ color: "oklch(0.77 0.13 85)" }}
            >
              {
                config.pendingTransactions.filter((t) => t.status === "pending")
                  .length
              }
            </div>
            <div className="text-white/40 text-xs">Tx en attente</div>
          </div>
        </div>

        <SuccessionPanel
          config={config}
          onConfigUpdate={handleUpdate}
          isAdminView={isAdminView}
        />
        <TransactionApprovalPanel
          config={config}
          onConfigUpdate={handleUpdate}
        />
      </CardContent>
    </Card>
  );
}

// ─── Emergency tab (admin) ────────────────────────────────────────────────────

export function UrgencesInstitutionnellesTab() {
  const [configs, setConfigs] = useState<MultiSigConfig[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  useEffect(() => {
    const all = loadAllConfigs();
    setConfigs(Object.values(all));
  }, []);

  function reload() {
    const all = loadAllConfigs();
    setConfigs(Object.values(all));
  }

  // Demo data if empty
  const demoConfigs: MultiSigConfig[] = [
    {
      partnerId: "demo-hotel-virunga",
      partnerName: "Hôtel Virunga Palace",
      partnerCategory: "hotel",
      total: 3,
      required: 2,
      configured: true,
      signatories: [
        {
          id: "s1",
          name: "Michel Kasereka",
          role: "Directeur Général",
          contact: "+243 812 345 678",
          status: "actif",
        },
        {
          id: "s2",
          name: "Joséphine Kahindo",
          role: "Comptable",
          contact: "+243 851 234 567",
          status: "decede",
        },
        {
          id: "s3",
          name: "André Mawazo",
          role: "Secrétaire Général",
          contact: "+243 897 654 321",
          status: "actif",
        },
      ],
      pendingTransactions: [
        {
          id: "tx1",
          description: "Retrait loyer mensuel",
          amount: "45,000",
          currency: "OKP",
          createdAt: "15/03/2026",
          approvals: ["s1"],
          rejections: [],
          status: "pending",
        },
      ],
      successionVotes: [
        {
          signatoryId: "s2",
          voterIds: ["s1"],
          step: 3,
          nomineeInfo: {
            name: "Fatima Baraka",
            role: "Comptable",
            contact: "+243 870 111 222",
          },
          documentRef: "",
        },
      ],
    },
    {
      partnerId: "demo-parc-okapi",
      partnerName: "Réserve Okapi",
      partnerCategory: "parc",
      total: 3,
      required: 2,
      configured: true,
      signatories: [
        {
          id: "p1",
          name: "Directeur Conservation",
          role: "Directeur Général",
          contact: "conservation@okapi.cd",
          status: "actif",
        },
        {
          id: "p2",
          name: "Chef des Rangers",
          role: "Responsable Financier",
          contact: "rangers@okapi.cd",
          status: "actif",
        },
        {
          id: "p3",
          name: "Trésorier ICCN",
          role: "Trésorier",
          contact: "iccn@gouv.cd",
          status: "indisponible",
        },
      ],
      pendingTransactions: [],
      successionVotes: [{ signatoryId: "p3", voterIds: [], step: 1 }],
    },
  ];

  const displayConfigs = configs.length > 0 ? configs : demoConfigs;
  const displayWithIssues = displayConfigs.filter((c) =>
    c.signatories.some((s) => s.status !== "actif"),
  );
  const displayHealthy = displayConfigs.filter((c) =>
    c.signatories.every((s) => s.status === "actif"),
  );

  const selected = selectedPartner
    ? displayConfigs.find((c) => c.partnerId === selectedPartner)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          style={{
            background: "oklch(0.15 0.03 220)",
            border: "1px solid oklch(0.25 0.04 220)",
          }}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle
                size={20}
                style={{ color: "oklch(0.65 0.16 40)" }}
              />
              <div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: "oklch(0.65 0.16 40)" }}
                >
                  {displayWithIssues.length}
                </div>
                <div className="text-white/50 text-xs">
                  Partenaires avec urgences
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          style={{
            background: "oklch(0.15 0.03 220)",
            border: "1px solid oklch(0.25 0.04 220)",
          }}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle
                size={20}
                style={{ color: "oklch(0.65 0.15 145)" }}
              />
              <div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: "oklch(0.65 0.15 145)" }}
                >
                  {displayHealthy.length}
                </div>
                <div className="text-white/50 text-xs">
                  Wallets en bonne santé
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          style={{
            background: "oklch(0.15 0.03 220)",
            border: "1px solid oklch(0.25 0.04 220)",
          }}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Users size={20} style={{ color: "oklch(0.55 0.15 180)" }} />
              <div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: "oklch(0.55 0.15 180)" }}
                >
                  {displayConfigs.reduce((a, c) => a + c.signatories.length, 0)}
                </div>
                <div className="text-white/50 text-xs">Signataires totaux</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partners with issues */}
      {displayWithIssues.length > 0 && (
        <Card
          style={{
            background: "oklch(0.15 0.03 220)",
            border: "1px solid oklch(0.55 0.18 20/0.3)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <AlertTriangle
                size={14}
                style={{ color: "oklch(0.65 0.16 40)" }}
              />
              Partenaires nécessitant une action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "oklch(0.25 0.04 220)" }}>
                  <TableHead className="text-white/60">Institution</TableHead>
                  <TableHead className="text-white/60">Catégorie</TableHead>
                  <TableHead className="text-white/60">Signataires</TableHead>
                  <TableHead className="text-white/60">Successions</TableHead>
                  <TableHead className="text-white/60">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayWithIssues.map((c, idx) => {
                  const deceased = c.signatories.filter(
                    (s) => s.status === "decede",
                  );
                  const unavail = c.signatories.filter(
                    (s) => s.status === "indisponible",
                  );
                  const activeCount = c.signatories.filter(
                    (s) => s.status === "actif",
                  ).length;
                  return (
                    <TableRow
                      key={c.partnerId}
                      style={{ borderColor: "oklch(0.22 0.04 220)" }}
                      data-ocid={`urgences.row.${idx + 1}`}
                    >
                      <TableCell className="text-white font-medium">
                        {c.partnerName}
                      </TableCell>
                      <TableCell className="text-white/60 text-xs capitalize">
                        {c.partnerCategory}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span
                            className="text-xs"
                            style={{
                              color:
                                activeCount >= c.required
                                  ? "oklch(0.65 0.15 145)"
                                  : "oklch(0.60 0.18 20)",
                            }}
                          >
                            {activeCount}/{c.total} actifs
                          </span>
                          {deceased.length > 0 && (
                            <span
                              className="text-xs"
                              style={{ color: "oklch(0.60 0.18 20)" }}
                            >
                              · {deceased.length} décédé
                              {deceased.length > 1 ? "s" : ""}
                            </span>
                          )}
                          {unavail.length > 0 && (
                            <span
                              className="text-xs"
                              style={{ color: "oklch(0.70 0.16 85)" }}
                            >
                              · {unavail.length} indisponible
                              {unavail.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-white/60">
                          {c.successionVotes.length > 0
                            ? `${c.successionVotes.length} en cours`
                            : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          style={{
                            background: "oklch(0.55 0.15 180)",
                            color: "white",
                          }}
                          onClick={() =>
                            setSelectedPartner(
                              selectedPartner === c.partnerId
                                ? null
                                : c.partnerId,
                            )
                          }
                          data-ocid="urgences.primary_button"
                        >
                          {selectedPartner === c.partnerId ? "Fermer" : "Gérer"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Selected partner detail */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={selected.partnerId}
        >
          <Card
            style={{
              background: "oklch(0.13 0.03 220)",
              border: "1px solid oklch(0.55 0.15 180/0.3)",
            }}
          >
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Shield size={14} style={{ color: "oklch(0.55 0.15 180)" }} />
                {selected.partnerName} — Gestion des successions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SuccessionPanel
                config={selected}
                onConfigUpdate={(updated) => {
                  // Merge back and reload
                  const all = loadAllConfigs();
                  all[updated.partnerId] = updated;
                  localStorage.setItem(
                    "kongokash_multisig_configs",
                    JSON.stringify(all),
                  );
                  reload();
                }}
                isAdminView={true}
              />
              <TransactionApprovalPanel
                config={selected}
                onConfigUpdate={(updated) => {
                  const all = loadAllConfigs();
                  all[updated.partnerId] = updated;
                  localStorage.setItem(
                    "kongokash_multisig_configs",
                    JSON.stringify(all),
                  );
                  reload();
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Healthy partners */}
      {displayHealthy.length > 0 && (
        <Card
          style={{
            background: "oklch(0.15 0.03 220)",
            border: "1px solid oklch(0.25 0.04 220)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-white/60 text-sm flex items-center gap-2">
              <CheckCircle
                size={14}
                style={{ color: "oklch(0.65 0.15 145)" }}
              />
              Partenaires en bonne santé ({displayHealthy.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {displayHealthy.map((c) => (
                <div
                  key={c.partnerId}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: "oklch(0.13 0.03 220)" }}
                >
                  <div>
                    <div className="text-white text-sm">{c.partnerName}</div>
                    <div className="text-white/40 text-xs">
                      {c.signatories.filter((s) => s.status === "actif").length}
                      /{c.total} actifs — seuil {c.required}
                    </div>
                  </div>
                  <Badge
                    style={{
                      background: "oklch(0.55 0.15 145/0.15)",
                      color: "oklch(0.65 0.15 145)",
                      border: "1px solid oklch(0.55 0.15 145/0.3)",
                    }}
                  >
                    ✓ OK
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
