import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Copy,
  Landmark,
  Smartphone,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

// ─── Types ──────────────────────────────────────────────────────────────────

type WithdrawalMethod = "airtel" | "mpesa" | "bancaire";
type WithdrawalStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "auto_processing"
  | "auto_approved"
  | "pending_manual";

export interface WithdrawalRequest {
  id: string;
  partnerId: string;
  partnerName: string;
  asset: string;
  amount: number;
  amountCDF: number;
  fee: number;
  method: WithdrawalMethod;
  destination: string;
  status: WithdrawalStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const RATES: Record<string, number> = {
  OKP: 50,
  USDT: 2800,
  USD: 2800,
  CDF: 1,
  BTC: 14_000_000,
  ETH: 8_000_000,
};

const BALANCES: Record<string, number> = {
  OKP: 5750,
  USDT: 320,
  USD: 250,
  CDF: 180000,
  BTC: 0.0045,
  ETH: 0.12,
};

const ASSET_ICONS: Record<string, string> = {
  OKP: "🦌",
  USDT: "₮",
  USD: "$",
  CDF: "FC",
  BTC: "₿",
  ETH: "⟠",
};

const FEE_RATE = 0.005; // 0.5%

function toCDF(asset: string, amount: number): number {
  return Math.round(amount * (RATES[asset] ?? 1));
}

function generateId(): string {
  return `WD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function saveWithdrawal(req: WithdrawalRequest) {
  const existing: WithdrawalRequest[] = JSON.parse(
    localStorage.getItem("partnerWithdrawals") ?? "[]",
  );
  existing.unshift(req);
  localStorage.setItem("partnerWithdrawals", JSON.stringify(existing));

  // Add notification
  const notifs = JSON.parse(localStorage.getItem("notifications") ?? "[]");
  notifs.unshift({
    id: `notif-${Date.now()}`,
    type: "withdrawal",
    title: "Demande de retrait envoyée",
    message: `Retrait de ${req.amount.toLocaleString()} ${req.asset} via ${req.method === "airtel" ? "Airtel Money" : req.method === "mpesa" ? "M-Pesa" : "Virement Bancaire"} — en attente d'approbation`,
    time: "À l'instant",
    read: false,
  });
  localStorage.setItem("notifications", JSON.stringify(notifs));
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = ["Actif & Montant", "Méthode", "Confirmation", "Succès"];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === step;
        const done = num < step;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <CheckCircle2 size={14} /> : num}
              </div>
              <span
                className={`text-[9px] font-medium hidden sm:block whitespace-nowrap ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mb-3 transition-colors ${
                  done ? "bg-green-400" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Asset & Amount ───────────────────────────────────────────────────

function Step1({
  asset,
  setAsset,
  amount,
  setAmount,
  onNext,
  threshold,
}: {
  asset: string;
  setAsset: (a: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  onNext: () => void;
  threshold: number;
}) {
  const balance = BALANCES[asset] ?? 0;
  const numAmount = Number.parseFloat(amount) || 0;
  const cdfValue = toCDF(asset, numAmount);
  const fee = numAmount * FEE_RATE;
  const assets = Object.keys(BALANCES);

  const isValid = numAmount > 0 && numAmount <= balance;

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      {/* Asset selector */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">
          Choisir l'actif
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {assets.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setAsset(a);
                setAmount("");
              }}
              data-ocid="withdrawal.asset_select"
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                asset === a
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40"
              }`}
            >
              <div className="text-xl leading-none">{ASSET_ICONS[a]}</div>
              <div className="text-xs font-bold mt-1">{a}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {BALANCES[a].toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Balance info */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Solde disponible</p>
            <p className="text-2xl font-bold text-primary mt-0.5">
              {balance.toLocaleString()} {ASSET_ICONS[asset]} {asset}
            </p>
            {asset !== "CDF" && (
              <p className="text-xs text-muted-foreground mt-1">
                ≈ {toCDF(asset, balance).toLocaleString()} CDF
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Amount input */}
      <div className="space-y-2">
        <Label htmlFor="withdrawal-amount" className="font-semibold text-sm">
          Montant à retirer
        </Label>
        <div className="flex gap-2">
          <Input
            id="withdrawal-amount"
            type="number"
            step="any"
            placeholder={`0.00 ${asset}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 text-lg font-semibold"
            data-ocid="withdrawal.amount_input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmount(String(balance))}
            className="shrink-0 font-bold text-primary border-primary/40 hover:bg-primary/10"
            data-ocid="withdrawal.max_button"
          >
            MAX
          </Button>
        </div>
        {numAmount > balance && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <XCircle size={12} /> Montant supérieur au solde disponible
          </p>
        )}
      </div>

      {/* Conversion & fee preview */}
      {numAmount > 0 && isValid && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/60 rounded-xl p-4 space-y-2"
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valeur en CDF</span>
            <span className="font-semibold">
              {cdfValue.toLocaleString()} FC
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frais (0.5%)</span>
            <span className="text-amber-600 font-semibold">
              − {fee.toFixed(asset === "CDF" ? 0 : 4)} {asset}
            </span>
          </div>
          <div className="flex justify-between text-sm border-t border-border/60 pt-2 mt-2">
            <span className="font-semibold">Vous recevrez</span>
            <span className="font-bold text-green-600">
              {(numAmount - fee).toFixed(asset === "CDF" ? 0 : 4)} {asset}
            </span>
          </div>
        </motion.div>
      )}

      {/* Auto vs manual badge */}
      {numAmount > 0 && isValid && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          {toCDF(asset, numAmount) < threshold ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
              ⚡ Traitement automatique — Instantané
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
              👤 Validation manuelle requise — Délai 24–48h
            </span>
          )}
        </motion.div>
      )}

      <Button
        onClick={onNext}
        disabled={!isValid}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-base"
        data-ocid="withdrawal.step1_next_button"
      >
        Continuer <ArrowRight size={18} className="ml-2" />
      </Button>
    </motion.div>
  );
}

// ─── Step 2: Method ───────────────────────────────────────────────────────────

function Step2({
  method,
  setMethod,
  destination,
  setDestination,
  onNext,
  onBack,
}: {
  method: WithdrawalMethod | "";
  setMethod: (m: WithdrawalMethod) => void;
  destination: string;
  setDestination: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const methods: {
    id: WithdrawalMethod;
    icon: React.ReactNode;
    label: string;
    sublabel: string;
    delay: string;
    recommended?: boolean;
    inputLabel: string;
    inputPlaceholder: string;
  }[] = [
    {
      id: "airtel",
      icon: <Smartphone size={22} className="text-red-500" />,
      label: "Airtel Money",
      sublabel: "Retrait rapide en CDF",
      delay: "< 24h",
      recommended: true,
      inputLabel: "Numéro Airtel Money",
      inputPlaceholder: "+243 XXX XXX XXX",
    },
    {
      id: "mpesa",
      icon: <Smartphone size={22} className="text-green-600" />,
      label: "M-Pesa",
      sublabel: "Retrait rapide en CDF",
      delay: "< 24h",
      inputLabel: "Numéro M-Pesa",
      inputPlaceholder: "+243 XXX XXX XXX",
    },
    {
      id: "bancaire",
      icon: <Landmark size={22} className="text-blue-500" />,
      label: "Virement Bancaire",
      sublabel: "CDF ou USD",
      delay: "1–3 jours ouvrables",
      inputLabel: "IBAN / RIB + Nom du bénéficiaire",
      inputPlaceholder: "CD12 0001 0000 0000 0000 / Nom Prénom",
    },
  ];

  const selected = methods.find((m) => m.id === method);
  const isValid = !!method && destination.trim().length > 5;

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <p className="text-sm text-muted-foreground font-medium">
        Choisissez votre méthode de retrait
      </p>

      <div className="space-y-3">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMethod(m.id);
              setDestination("");
            }}
            data-ocid={`withdrawal.method_${m.id}`}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
              method === m.id
                ? "border-primary bg-primary/8 shadow-sm"
                : "border-border hover:border-primary/40 bg-card"
            }`}
          >
            <div
              className={`p-3 rounded-xl ${
                method === m.id ? "bg-primary/15" : "bg-muted"
              }`}
            >
              {m.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-foreground">{m.label}</span>
                {m.recommended && (
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px] px-2">
                    <Zap size={10} className="mr-1" /> Recommandé
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {m.sublabel}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={11} />
                <span>{m.delay}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Destination input */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            <Label className="font-semibold text-sm">
              {selected.inputLabel}
            </Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={selected.inputPlaceholder}
              className="font-medium"
              data-ocid="withdrawal.destination_input"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
          data-ocid="withdrawal.step2_back_button"
        >
          <ChevronLeft size={16} className="mr-1" /> Retour
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          data-ocid="withdrawal.step2_next_button"
        >
          Continuer <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Step 3: Summary & Confirm ────────────────────────────────────────────────

function Step3({
  asset,
  amount,
  method,
  destination,
  onConfirm,
  onBack,
  isSubmitting,
}: {
  asset: string;
  amount: string;
  method: WithdrawalMethod;
  destination: string;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const numAmount = Number.parseFloat(amount) || 0;
  const fee = numAmount * FEE_RATE;
  const received = numAmount - fee;
  const cdfValue = toCDF(asset, received);

  const methodLabels: Record<
    WithdrawalMethod,
    { label: string; delay: string }
  > = {
    airtel: { label: "Airtel Money", delay: "< 24 heures" },
    mpesa: { label: "M-Pesa", delay: "< 24 heures" },
    bancaire: { label: "Virement Bancaire", delay: "1–3 jours ouvrables" },
  };

  const rows = [
    { label: "Actif", value: `${asset} ${ASSET_ICONS[asset]}` },
    {
      label: "Montant envoyé",
      value: `${numAmount.toLocaleString()} ${asset}`,
    },
    {
      label: "Frais (0.5%)",
      value: `${fee.toFixed(4)} ${asset}`,
      accent: "text-amber-600",
    },
    {
      label: "Montant reçu",
      value: `${received.toFixed(asset === "CDF" ? 0 : 4)} ${asset}`,
      accent: "text-green-600 font-bold",
    },
    ...(asset !== "CDF"
      ? [{ label: "≈ Valeur CDF", value: `${cdfValue.toLocaleString()} FC` }]
      : []),
    { label: "Méthode", value: methodLabels[method].label },
    { label: "Destination", value: destination },
    { label: "Délai estimé", value: methodLabels[method].delay },
  ];

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <Card className="border border-border/60">
        <CardContent className="p-0 divide-y divide-border/40">
          {rows.map(({ label, value, accent }) => (
            <div
              key={label}
              className="flex justify-between items-center px-4 py-3"
            >
              <span className="text-sm text-muted-foreground">{label}</span>
              <span
                className={`text-sm font-semibold ${accent ?? "text-foreground"}`}
              >
                {value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Irreversible warning */}
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
        <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
        <p className="text-sm text-red-800 font-medium">
          Cette opération est <strong>irréversible</strong>. Vérifiez les
          coordonnées avant de confirmer.
        </p>
      </div>

      {/* Reassurance line */}
      <p
        className="text-xs text-center"
        style={{ color: "oklch(0.65 0.08 160)" }}
      >
        🔒 Vos fonds partent directement de votre wallet vers votre compte —
        KongoKash n'est qu'un facilitateur.
      </p>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1"
          data-ocid="withdrawal.step3_back_button"
        >
          <ChevronLeft size={16} className="mr-1" /> Retour
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-6"
          data-ocid="withdrawal.confirm_button"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
              Traitement...
            </span>
          ) : (
            <>
              <CheckCircle2 size={18} className="mr-2" /> Confirmer le retrait
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Step 4: Success ──────────────────────────────────────────────────────────

function Step4({
  requestId,
  onDone,
}: { requestId: string; onDone: () => void }) {
  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-4 space-y-5"
      data-ocid="withdrawal.success_state"
    >
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <CheckCircle2 size={44} className="text-green-500" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground">Demande envoyée !</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Votre demande de retrait est en cours de traitement.
        </p>
      </div>

      <div className="bg-muted/60 rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-1">
          Identifiant de la demande
        </p>
        <div className="flex items-center justify-center gap-2">
          <code className="text-sm font-bold text-primary">{requestId}</code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(requestId);
              toast.success("ID copié !");
            }}
            className="p-1 hover:bg-muted rounded"
          >
            <Copy size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <Clock size={16} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700 font-medium">
          Vous serez notifié dès que le retrait sera traité par notre équipe.
        </p>
      </div>

      <Button
        onClick={onDone}
        className="w-full"
        variant="outline"
        data-ocid="withdrawal.done_button"
      >
        Voir l'historique des retraits
      </Button>
    </motion.div>
  );
}

// ─── Withdrawal History ───────────────────────────────────────────────────────

export function WithdrawalHistory() {
  const raw = localStorage.getItem("partnerWithdrawals") ?? "[]";
  const withdrawals: WithdrawalRequest[] = JSON.parse(raw);

  const statusConfig: Record<
    string,
    { label: string; className: string; icon: React.ReactNode; txRef?: string }
  > = {
    pending: {
      label: "En attente",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: <Clock size={11} />,
    },
    processing: {
      label: "En cours",
      className: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <Zap size={11} />,
    },
    completed: {
      label: "Complété",
      className: "bg-green-100 text-green-800 border-green-300",
      icon: <CheckCircle2 size={11} />,
    },
    failed: {
      label: "Échoué",
      className: "bg-red-100 text-red-800 border-red-300",
      icon: <XCircle size={11} />,
    },
    auto_processing: {
      label: "⏳ En cours...",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: <Zap size={11} />,
    },
    auto_approved: {
      label: "⚡ Traité automatiquement",
      className: "bg-green-100 text-green-800 border-green-300",
      icon: <CheckCircle2 size={11} />,
    },
    pending_manual: {
      label: "⏳ En attente admin",
      className: "bg-orange-100 text-orange-800 border-orange-300",
      icon: <Clock size={11} />,
    },
    approved: {
      label: "✅ Approuvé",
      className: "bg-green-100 text-green-800 border-green-300",
      icon: <CheckCircle2 size={11} />,
    },
    rejected: {
      label: "❌ Rejeté",
      className: "bg-red-100 text-red-800 border-red-300",
      icon: <XCircle size={11} />,
    },
  };

  const methodLabel: Record<WithdrawalMethod, string> = {
    airtel: "Airtel Money 📱",
    mpesa: "M-Pesa 📱",
    bancaire: "Virement Bancaire 🏦",
  };

  if (withdrawals.length === 0) {
    return (
      <div
        className="text-center py-16 text-muted-foreground"
        data-ocid="withdrawal.history_empty_state"
      >
        <ArrowDownLeft size={40} className="mx-auto mb-3 opacity-40" />
        <p className="font-medium">Aucun retrait pour le moment</p>
        <p className="text-xs mt-1">Vos futures demandes apparaîtront ici</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-96">
      <div className="space-y-3" data-ocid="withdrawal.history_list">
        {withdrawals.map((w, idx) => {
          const cfg = statusConfig[w.status];
          return (
            <Card
              key={w.id}
              className="border border-border/60"
              data-ocid={`withdrawal.history.item.${idx + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 mt-0.5">
                      <ArrowDownLeft size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          {w.amount.toLocaleString()} {ASSET_ICONS[w.asset]}{" "}
                          {w.asset}
                        </span>
                        <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          {w.id}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {methodLabel[w.method]} · {w.destination}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(w.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}
                    >
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// ─── Future Teaser ────────────────────────────────────────────────────────────

export function WithdrawalFutureTeaser() {
  return (
    <div className="mt-6 flex items-start gap-3 bg-blue-50/60 border border-blue-200/60 rounded-xl p-4">
      <span className="text-xl shrink-0">🔜</span>
      <div>
        <p className="text-sm font-semibold text-blue-700">Prochainement</p>
        <p className="text-xs text-blue-600/80 mt-0.5">
          Retrait vers compte bancaire international & carte prépayée KongoKash
        </p>
      </div>
    </div>
  );
}

// ─── Main Gateway Component ───────────────────────────────────────────────────

interface WithdrawalGatewayProps {
  onSuccess?: () => void;
}

export default function WithdrawalGateway({
  onSuccess,
}: WithdrawalGatewayProps) {
  const { actor, isFetching } = useActor();
  const [step, setStep] = useState(1);
  const [asset, setAsset] = useState("OKP");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<WithdrawalMethod | "">("airtel");
  const [destination, setDestination] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [threshold, setThreshold] = useState(50000);

  useEffect(() => {
    if (!actor || isFetching) return;
    (actor as any)
      .getAutoWithdrawalThreshold()
      .then((t: number) => setThreshold(t))
      .catch(() => {});
  }, [actor, isFetching]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const id = generateId();
      const numAmount = Number.parseFloat(amount) || 0;
      const fee = numAmount * FEE_RATE;
      const cdfAmount = toCDF(asset, numAmount);
      const isAuto = cdfAmount < threshold;
      const req: WithdrawalRequest = {
        id,
        partnerId: "partner-001",
        partnerName: "Partenaire KongoKash",
        asset,
        amount: numAmount,
        amountCDF: cdfAmount,
        fee,
        method: method as WithdrawalMethod,
        destination,
        status: isAuto ? "auto_processing" : "pending_manual",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveWithdrawal(req);
      setRequestId(id);

      if (isAuto && actor) {
        try {
          const result = await (actor as any).processAutoWithdrawal(id);
          if (result?.success) {
            // Update status in storage
            const stored: WithdrawalRequest[] = JSON.parse(
              localStorage.getItem("partnerWithdrawals") ?? "[]",
            );
            const updated = stored.map((w) =>
              w.id === id
                ? {
                    ...w,
                    status: "auto_approved" as WithdrawalStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : w,
            );
            localStorage.setItem("partnerWithdrawals", JSON.stringify(updated));
            toast.success(
              `⚡ Retrait traité automatiquement ! Réf: ${result.txRef}`,
            );
          } else {
            toast.success("Demande de retrait envoyée — traitement en cours.");
          }
        } catch {
          toast.success("Demande de retrait envoyée — traitement en cours.");
        }
      } else {
        toast.info("Votre demande est en attente de validation admin.");
      }
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setStep(1);
    setAmount("");
    setDestination("");
    setMethod("airtel");
    onSuccess?.();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/60">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <ArrowDownLeft size={22} className="text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground">
            Passerelle de Retrait
          </h3>
          <p className="text-xs text-muted-foreground">
            Convertissez vos actifs vers Mobile Money ou virement
          </p>
        </div>
      </div>

      {step < 4 && <StepIndicator step={step} />}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <Step1
            asset={asset}
            setAsset={setAsset}
            amount={amount}
            setAmount={setAmount}
            onNext={() => setStep(2)}
            threshold={threshold}
          />
        )}
        {step === 2 && (
          <Step2
            method={method}
            setMethod={setMethod}
            destination={destination}
            setDestination={setDestination}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3
            asset={asset}
            amount={amount}
            method={method as WithdrawalMethod}
            destination={destination}
            onConfirm={handleConfirm}
            onBack={() => setStep(2)}
            isSubmitting={isSubmitting}
          />
        )}
        {step === 4 && <Step4 requestId={requestId} onDone={handleDone} />}
      </AnimatePresence>

      <WithdrawalFutureTeaser />
    </div>
  );
}
