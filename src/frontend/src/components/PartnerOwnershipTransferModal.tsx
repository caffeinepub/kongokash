import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle,
  FileText,
  Lock,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  type TransferRecord,
  usePartnerOwnershipTransfer,
} from "../hooks/usePartnerOwnershipTransfer";
import { PartnerWalletSetup } from "./PartnerWalletSetup";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string;
  partnerName: string;
  existingTransfer?: TransferRecord | null;
  /** Which UI step to open at (0 = init form, 1 = frozen notice, 2 = new wallet, 3 = done) */
  initialStep?: number;
  onTransferComplete?: () => void;
}

export function PartnerOwnershipTransferModal({
  open,
  onOpenChange,
  partnerId,
  partnerName,
  existingTransfer,
  initialStep = 0,
  onTransferComplete,
}: Props) {
  const transfer = usePartnerOwnershipTransfer();

  // Resolve starting UI step from existing transfer record
  function resolveStep(): number {
    if (!existingTransfer) return initialStep;
    if (existingTransfer.status === "en_transfert") return 1;
    if (existingTransfer.status === "nouveau_wallet") return 2;
    if (existingTransfer.status === "complete") return 3;
    return 0;
  }

  const [step, setStep] = useState(resolveStep);

  // Step 0 form
  const [oldOwnerName, setOldOwnerName] = useState(
    existingTransfer?.oldOwnerName ?? "",
  );
  const [newOwnerName, setNewOwnerName] = useState(
    existingTransfer?.newOwnerName ?? "",
  );
  const [newOwnerContact, setNewOwnerContact] = useState(
    existingTransfer?.newOwnerContact ?? "",
  );
  const [legalRef, setLegalRef] = useState(existingTransfer?.legalRef ?? "");
  const [newWalletAddress, setNewWalletAddress] = useState("");

  const canSubmitInit =
    oldOwnerName.trim() &&
    newOwnerName.trim() &&
    newOwnerContact.trim() &&
    legalRef.trim();

  function handleInitTransfer() {
    if (!canSubmitInit) return;
    transfer.initTransfer(partnerId, partnerName, {
      oldOwnerName,
      newOwnerName,
      newOwnerContact,
      legalRef,
    });
    setStep(1);
  }

  function handleStartNewWallet() {
    transfer.advanceToNewWallet(partnerId);
    setStep(2);
  }

  function handleNewWalletComplete() {
    // Grab the address of the freshly created wallet
    const addr = localStorage.getItem(`kk_partner_${partnerId}_address`) ?? "";
    setNewWalletAddress(addr);
    transfer.completeTransfer(partnerId);
    setStep(3);
    onTransferComplete?.();
  }

  // New wallet id — during step 2 we use a temporary id so the new owner's
  // setup doesn't clash with the frozen old wallet keys.
  const newPartnerId = `${partnerId}_new`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          background: "oklch(0.12 0.03 220)",
          border: "1px solid oklch(0.25 0.04 220)",
          color: "white",
        }}
        data-ocid="transfer.dialog"
      >
        <DialogHeader>
          <DialogTitle
            className="text-base font-bold flex items-center gap-2"
            style={{ color: "oklch(0.77 0.13 85)" }}
          >
            <RefreshCw size={16} />
            Transfert de Propriété — {partnerName}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-4">
          {["Initiation", "Wallet gelé", "Nouveau wallet", "Terminé"].map(
            (label, i) => (
              <div key={label} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center gap-0.5 flex-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background:
                        i < step
                          ? "oklch(0.60 0.15 145)"
                          : i === step
                            ? "oklch(0.52 0.12 85)"
                            : "oklch(0.22 0.04 220)",
                      color: "white",
                    }}
                  >
                    {i < step ? <CheckCircle size={12} /> : i + 1}
                  </div>
                  <span
                    className="text-[9px] text-center leading-tight"
                    style={{
                      color:
                        i === step
                          ? "oklch(0.77 0.10 85)"
                          : "oklch(0.40 0.04 220)",
                    }}
                  >
                    {label}
                  </span>
                </div>
                {i < 3 && (
                  <div
                    className="w-4 h-px mb-3"
                    style={{
                      background:
                        i < step
                          ? "oklch(0.60 0.15 145)"
                          : "oklch(0.25 0.04 220)",
                    }}
                  />
                )}
              </div>
            ),
          )}
        </div>

        {/* Key principle banner */}
        <div
          className="rounded-xl px-4 py-3 flex items-start gap-3 text-xs mb-4"
          style={{
            background: "oklch(0.20 0.06 250 / 0.3)",
            border: "1px solid oklch(0.40 0.12 250 / 0.4)",
            color: "oklch(0.75 0.10 250)",
          }}
        >
          <ShieldCheck size={14} className="shrink-0 mt-0.5" />
          <span>
            <strong>Principe de sécurité :</strong> La phrase secrète n'est
            jamais transmise d'une personne à l'autre. Le nouveau propriétaire
            crée son propre wallet — l'ancien est définitivement invalidé.
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            {/* ── Step 0 — Admin initiates transfer ──────────────────────── */}
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-white/60 text-sm">
                  Renseignez les informations du transfert de propriété. Une
                  fois confirmé, l'ancien wallet sera <strong>gelé</strong>{" "}
                  immédiatement.
                </p>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label
                      className="text-xs"
                      style={{ color: "oklch(0.60 0.03 220)" }}
                    >
                      Nom de l'ancien propriétaire / responsable
                    </Label>
                    <Input
                      value={oldOwnerName}
                      onChange={(e) => setOldOwnerName(e.target.value)}
                      placeholder="ex: Jean Mbeki, Directeur Général"
                      className="bg-white/5 border-white/20 text-white"
                      data-ocid="transfer.input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      className="text-xs"
                      style={{ color: "oklch(0.60 0.03 220)" }}
                    >
                      Nom du nouveau propriétaire
                    </Label>
                    <Input
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      placeholder="ex: Marie Lukusa"
                      className="bg-white/5 border-white/20 text-white"
                      data-ocid="transfer.input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      className="text-xs"
                      style={{ color: "oklch(0.60 0.03 220)" }}
                    >
                      Contact du nouveau propriétaire
                    </Label>
                    <Input
                      value={newOwnerContact}
                      onChange={(e) => setNewOwnerContact(e.target.value)}
                      placeholder="ex: +243 8X XXX XXXX ou email"
                      className="bg-white/5 border-white/20 text-white"
                      data-ocid="transfer.input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      className="text-xs flex items-center gap-1"
                      style={{ color: "oklch(0.60 0.03 220)" }}
                    >
                      <FileText size={12} />
                      Référence de l'acte de vente / document légal
                    </Label>
                    <Input
                      value={legalRef}
                      onChange={(e) => setLegalRef(e.target.value)}
                      placeholder="ex: Acte n°2026-1847, Notaire Kalala"
                      className="bg-white/5 border-white/20 text-white"
                      data-ocid="transfer.input"
                    />
                  </div>
                </div>

                <div
                  className="rounded-xl p-3 text-xs flex items-start gap-2"
                  style={{
                    background: "oklch(0.22 0.08 40 / 0.3)",
                    border: "1px solid oklch(0.50 0.12 40 / 0.4)",
                    color: "oklch(0.80 0.10 50)",
                  }}
                >
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span>
                    En confirmant, l'ancien wallet sera immédiatement{" "}
                    <strong>gelé</strong>. Aucune transaction ne sera possible
                    jusqu'à l'activation du nouveau wallet.
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 text-white/60"
                    onClick={() => onOpenChange(false)}
                    data-ocid="transfer.cancel_button"
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!canSubmitInit}
                    onClick={handleInitTransfer}
                    style={{ background: "oklch(0.52 0.12 85)" }}
                    data-ocid="transfer.confirm_button"
                  >
                    Geler & Initier le transfert
                    <ArrowRight size={14} className="ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 1 — Frozen wallet notice ───────────────────────────── */}
            {step === 1 && (
              <div className="space-y-4">
                <div
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{
                    background: "oklch(0.22 0.08 85 / 0.4)",
                    border: "2px solid oklch(0.55 0.14 85 / 0.6)",
                  }}
                >
                  <Lock size={20} style={{ color: "oklch(0.77 0.13 85)" }} />
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: "oklch(0.77 0.13 85)" }}
                    >
                      🔒 Wallet actuellement GELÉ
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "oklch(0.65 0.08 85)" }}
                    >
                      Aucun retrait possible. En attente de la configuration du
                      nouveau wallet par le nouveau propriétaire.
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{
                    background: "oklch(0.15 0.03 220)",
                    border: "1px solid oklch(0.25 0.04 220)",
                  }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.55 0.04 220)" }}
                  >
                    Détails du transfert
                  </p>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <span style={{ color: "oklch(0.50 0.04 220)" }}>
                      Partenaire
                    </span>
                    <span className="text-white font-medium">
                      {partnerName}
                    </span>
                    <span style={{ color: "oklch(0.50 0.04 220)" }}>
                      Ancien propriétaire
                    </span>
                    <span className="text-white/80">
                      {existingTransfer?.oldOwnerName ?? oldOwnerName}
                    </span>
                    <span style={{ color: "oklch(0.50 0.04 220)" }}>
                      Nouveau propriétaire
                    </span>
                    <span className="text-white/80">
                      {existingTransfer?.newOwnerName ?? newOwnerName}
                    </span>
                    <span style={{ color: "oklch(0.50 0.04 220)" }}>
                      Réf. légale
                    </span>
                    <span
                      className="font-mono"
                      style={{ color: "oklch(0.77 0.10 85)" }}
                    >
                      {existingTransfer?.legalRef ?? legalRef}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleStartNewWallet}
                  style={{ background: "oklch(0.52 0.12 195)" }}
                  data-ocid="transfer.primary_button"
                >
                  <UserCheck size={16} className="mr-2" />
                  Le nouveau propriétaire génère son wallet
                </Button>
              </div>
            )}

            {/* ── Step 2 — New owner generates wallet ─────────────────────── */}
            {step === 2 && (
              <div className="space-y-4">
                <div
                  className="rounded-xl px-4 py-3 flex items-start gap-3 text-xs"
                  style={{
                    background: "oklch(0.20 0.06 195 / 0.3)",
                    border: "1px solid oklch(0.45 0.12 195 / 0.5)",
                    color: "oklch(0.75 0.10 195)",
                  }}
                >
                  <Building2 size={13} className="shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      {existingTransfer?.newOwnerName ?? newOwnerName}
                    </strong>{" "}
                    doit maintenant créer son propre wallet institutionnel. La
                    seed phrase sera uniquement connue du nouveau responsable.
                  </span>
                </div>

                <PartnerWalletSetup
                  partnerId={newPartnerId}
                  partnerName={partnerName}
                  onClose={handleNewWalletComplete}
                />
              </div>
            )}

            {/* ── Step 3 — Transfer complete ───────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-5 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mx-auto w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: "oklch(0.22 0.08 145 / 0.5)" }}
                >
                  <CheckCircle
                    size={48}
                    style={{ color: "oklch(0.65 0.15 145)" }}
                  />
                </motion.div>

                <div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "oklch(0.70 0.15 145)" }}
                  >
                    Transfert Terminé ✓
                  </h3>
                  <p className="text-white/60 text-sm mt-1">{partnerName}</p>
                </div>

                <div
                  className="rounded-xl p-4 text-left space-y-2"
                  style={{
                    background: "oklch(0.18 0.06 145 / 0.3)",
                    border: "1px solid oklch(0.45 0.12 145 / 0.5)",
                  }}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle
                      size={12}
                      style={{ color: "oklch(0.65 0.15 145)" }}
                    />
                    <span style={{ color: "oklch(0.70 0.10 145)" }}>
                      Nouveau wallet activé avec succès
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle
                      size={12}
                      style={{ color: "oklch(0.65 0.15 145)" }}
                    />
                    <span style={{ color: "oklch(0.70 0.10 145)" }}>
                      Fonds migrés automatiquement
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle
                      size={12}
                      style={{ color: "oklch(0.65 0.15 145)" }}
                    />
                    <span style={{ color: "oklch(0.70 0.10 145)" }}>
                      Ancien wallet définitivement invalidé
                    </span>
                  </div>
                  {newWalletAddress && (
                    <div
                      className="mt-2 rounded-lg p-2 font-mono text-xs"
                      style={{
                        background: "oklch(0.15 0.03 220)",
                        color: "oklch(0.77 0.13 85)",
                      }}
                    >
                      Nouvelle adresse : {newWalletAddress.slice(0, 8)}...
                      {newWalletAddress.slice(-6)}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                  style={{ background: "oklch(0.52 0.15 195)" }}
                  data-ocid="transfer.close_button"
                >
                  Fermer
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
