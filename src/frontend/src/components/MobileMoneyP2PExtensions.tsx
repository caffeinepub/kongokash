/**
 * Mobile Money P2P Extensions for KongoKash
 * ────────────────────────────────────────────
 * - NetworkStatus: connexion lente / offline banner
 * - OperatorSelector: choix opérateur Mobile Money avec badges colorés
 * - SMSParserField: textarea + bouton analyser le SMS
 * - CancellationImpossibleBanner: bannière rouge quand paiement déclaré
 * - OperatorMismatchAlert: avertissement opérateur incorrect
 */

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, HelpCircle, Loader2, WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  MOBILE_MONEY_OPERATORS,
  type OperatorId,
  type SmsParseResult,
  detectOperatorFromMethodString,
  formatPhoneNumber,
  parseSmsConfirmation,
} from "../mobileMoneyOperators";

// ─── NetworkStatus ───────────────────────────────────────────────────────────────────────────

interface NetworkInfo {
  online: boolean;
  effectiveType?: string;
}

function useNetworkStatus(): NetworkInfo {
  const [info, setInfo] = useState<NetworkInfo>({
    online: navigator.onLine,
    effectiveType: (navigator as any).connection?.effectiveType,
  });

  useEffect(() => {
    const update = () => {
      setInfo({
        online: navigator.onLine,
        effectiveType: (navigator as any).connection?.effectiveType,
      });
    };
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = (navigator as any).connection;
    if (conn) conn.addEventListener("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      if (conn) conn.removeEventListener("change", update);
    };
  }, []);

  return info;
}

export function NetworkStatus() {
  const { online, effectiveType } = useNetworkStatus();
  const isSlow = effectiveType === "2g" || effectiveType === "slow-2g";

  if (online && !isSlow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
        style={{
          background: !online
            ? "oklch(0.22 0.09 25 / 0.5)"
            : "oklch(0.26 0.10 55 / 0.5)",
          border: !online
            ? "1px solid oklch(0.50 0.15 25 / 0.6)"
            : "1px solid oklch(0.55 0.15 55 / 0.6)",
        }}
        data-ocid="p2p.error_state"
      >
        <WifiOff
          size={16}
          style={{
            color: !online ? "oklch(0.72 0.16 25)" : "oklch(0.78 0.14 55)",
            flexShrink: 0,
          }}
        />
        <div>
          <p
            className="text-sm font-semibold"
            style={{
              color: !online ? "oklch(0.80 0.14 25)" : "oklch(0.85 0.12 55)",
            }}
          >
            {!online ? "📡 Connexion perdue" : "📡 Connexion lente détectée"}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{
              color: !online ? "oklch(0.62 0.10 25)" : "oklch(0.68 0.10 55)",
            }}
          >
            {!online
              ? "Votre preuve de paiement est sauvegardée localement. Reconnectez-vous pour soumettre."
              : `Connexion ${effectiveType} détectée — le chargement peut prendre plus de temps. Vous pouvez entrer uniquement l'ID de transaction pour l'instant.`}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function useIsSlowNetwork(): boolean {
  const { online, effectiveType } = useNetworkStatus();
  return !online || effectiveType === "2g" || effectiveType === "slow-2g";
}

// ─── OperatorSelector ──────────────────────────────────────────────────────────────────

interface OperatorSelectorProps {
  selectedOperator: OperatorId | null;
  onChange: (op: OperatorId) => void;
  receptionNumber: string;
  onNumberChange: (n: string) => void;
}

export function OperatorSelector({
  selectedOperator,
  onChange,
  receptionNumber,
  onNumberChange,
}: OperatorSelectorProps) {
  const op = selectedOperator ? MOBILE_MONEY_OPERATORS[selectedOperator] : null;

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onNumberChange(formatted);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label style={{ color: "oklch(0.65 0.04 220)" }}>
          📱 Méthode de paiement acceptée{" "}
          <span style={{ color: "oklch(0.60 0.15 25)" }}>*</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {(
            Object.values(
              MOBILE_MONEY_OPERATORS,
            ) as (typeof MOBILE_MONEY_OPERATORS)[OperatorId][]
          ).map((op_item) => {
            const isSelected = selectedOperator === op_item.id;
            return (
              <button
                key={op_item.id}
                type="button"
                onClick={() => onChange(op_item.id as OperatorId)}
                className="rounded-xl px-3 py-2.5 text-left transition-all"
                style={{
                  background: isSelected
                    ? op_item.bgOklch
                    : "oklch(0.16 0.03 220)",
                  border: isSelected
                    ? `1.5px solid ${op_item.borderOklch}`
                    : "1.5px solid oklch(0.25 0.04 220)",
                  outline: "none",
                }}
                data-ocid="p2p.toggle"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{op_item.emoji}</span>
                  <div>
                    <p
                      className="text-xs font-semibold leading-tight"
                      style={{
                        color: isSelected
                          ? op_item.colorOklch
                          : "oklch(0.72 0.04 220)",
                      }}
                    >
                      {op_item.name}
                    </p>
                    <p
                      className="text-[10px] leading-tight mt-0.5"
                      style={{ color: "oklch(0.45 0.03 220)" }}
                    >
                      {op_item.prefix[0]}...
                    </p>
                  </div>
                  {isSelected && (
                    <span
                      className="ml-auto text-xs font-bold"
                      style={{ color: op_item.colorOklch }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {op && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label style={{ color: "oklch(0.65 0.04 220)" }}>
              Numéro de réception {op.name}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="p-0.5"
                    style={{ color: "oklch(0.50 0.05 220)" }}
                    data-ocid="p2p.tooltip"
                  >
                    <HelpCircle size={13} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[220px] text-xs"
                  style={{
                    background: "oklch(0.18 0.05 220)",
                    border: "1px solid oklch(0.28 0.05 220)",
                    color: "oklch(0.80 0.04 220)",
                  }}
                >
                  {op.helpText}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
              style={{ color: op.colorOklch }}
            >
              {op.emoji}
            </span>
            <input
              type="tel"
              value={receptionNumber}
              onChange={handleNumberInput}
              placeholder="+243 XXX XXX XXX"
              className="w-full pl-8 pr-4 py-2 rounded-lg text-sm"
              style={{
                background: "oklch(0.18 0.04 220)",
                border: `1px solid ${op.borderOklch}`,
                color: "white",
                outline: "none",
              }}
              data-ocid="p2p.input"
            />
          </div>
          <p className="text-[10px]" style={{ color: "oklch(0.45 0.04 220)" }}>
            Format automatique : +243XXXXXXXXX
          </p>
        </div>
      )}
    </div>
  );
}

// ─── SMSParserField ──────────────────────────────────────────────────────────────────────

interface SMSParserFieldProps {
  operatorId: string | null;
  onParsed: (result: SmsParseResult) => void;
  isSlowNetwork?: boolean;
}

export function SMSParserField({
  operatorId,
  onParsed,
  isSlowNetwork,
}: SMSParserFieldProps) {
  const [smsText, setSmsText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<
    "idle" | "success" | "partial" | "failed"
  >("idle");
  const [lastResult, setLastResult] = useState<SmsParseResult | null>(null);

  const op = operatorId
    ? MOBILE_MONEY_OPERATORS[operatorId as OperatorId]
    : null;

  const handleParse = () => {
    if (!smsText.trim() || !operatorId) return;
    setParsing(true);
    setTimeout(() => {
      const result = parseSmsConfirmation(smsText, operatorId);
      setParsing(false);
      if (!result || result.confidence === 0) {
        setParseStatus("failed");
        setLastResult(null);
      } else if (result.confidence === 3) {
        setParseStatus("success");
        setLastResult(result);
        onParsed(result);
      } else {
        setParseStatus("partial");
        setLastResult(result);
        onParsed(result);
      }
    }, 600);
  };

  const statusConfig = {
    idle: null,
    success: {
      label: "✅ Auto-détecté par SMS",
      color: "oklch(0.68 0.14 145)",
      bg: "oklch(0.22 0.08 145 / 0.3)",
      border: "oklch(0.45 0.12 145 / 0.5)",
    },
    partial: {
      label: "⚠️ Vérifiez les champs pré-remplis",
      color: "oklch(0.78 0.14 75)",
      bg: "oklch(0.26 0.09 75 / 0.3)",
      border: "oklch(0.50 0.14 75 / 0.5)",
    },
    failed: {
      label: "❌ SMS non reconnu — remplissez manuellement",
      color: "oklch(0.68 0.16 25)",
      bg: "oklch(0.22 0.09 25 / 0.3)",
      border: "oklch(0.45 0.14 25 / 0.5)",
    },
  };

  const status = statusConfig[parseStatus];

  return (
    <div
      className="rounded-xl p-3.5 space-y-3"
      style={{
        background: "oklch(0.16 0.05 195 / 0.3)",
        border: "1px solid oklch(0.38 0.10 185 / 0.4)",
      }}
    >
      <div className="flex items-center justify-between">
        <Label
          className="text-sm font-semibold flex items-center gap-1.5"
          style={{ color: "oklch(0.75 0.08 185)" }}
        >
          📱 Coller votre SMS de confirmation
          {isSlowNetwork && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: "oklch(0.26 0.10 55 / 0.4)",
                color: "oklch(0.78 0.14 55)",
              }}
            >
              Réseau lent
            </span>
          )}
        </Label>
        {op && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "oklch(0.55 0.08 185)" }}
                  data-ocid="p2p.tooltip"
                >
                  <HelpCircle size={12} />
                  {op.name}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[240px]"
                style={{
                  background: "oklch(0.18 0.05 220)",
                  border: "1px solid oklch(0.28 0.05 220)",
                  color: "oklch(0.80 0.04 220)",
                }}
              >
                <p className="text-xs font-semibold mb-1">{op.helpText}</p>
                <p
                  className="text-[10px] font-mono"
                  style={{ color: "oklch(0.55 0.05 220)" }}
                >
                  Ex: {op.exampleSms}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Textarea
        value={smsText}
        onChange={(e) => {
          setSmsText(e.target.value);
          if (parseStatus !== "idle") setParseStatus("idle");
        }}
        placeholder={
          op
            ? `Ex: ${op.exampleSms}`
            : "Collez ici votre SMS de confirmation reçu de l'opérateur..."
        }
        className="min-h-[80px] text-sm resize-none"
        style={{
          background: "oklch(0.14 0.04 220)",
          border: "1px solid oklch(0.28 0.06 185 / 0.5)",
          color: "white",
        }}
        data-ocid="p2p.textarea"
      />

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          size="sm"
          onClick={handleParse}
          disabled={parsing || !smsText.trim() || !operatorId}
          className="gap-1.5"
          style={{ background: "oklch(0.42 0.12 185)", color: "white" }}
          data-ocid="p2p.secondary_button"
        >
          {parsing ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <span>🔍</span>
          )}
          {parsing ? "Analyse..." : "Analyser le SMS"}
        </Button>

        {!operatorId && (
          <p className="text-xs" style={{ color: "oklch(0.50 0.05 220)" }}>
            Sélectionnez d'abord un opérateur
          </p>
        )}
      </div>

      {/* Status badge */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg px-3 py-2 text-xs font-semibold"
            style={{
              background: status.bg,
              border: `1px solid ${status.border}`,
              color: status.color,
            }}
            data-ocid={
              parseStatus === "failed" ? "p2p.error_state" : "p2p.success_state"
            }
          >
            {status.label}
            {lastResult && parseStatus !== "failed" && (
              <div
                className="mt-1.5 space-y-0.5 font-normal"
                style={{ color: "oklch(0.65 0.04 220)" }}
              >
                {lastResult.amount && (
                  <p>
                    Montant :{" "}
                    <strong style={{ color: "oklch(0.80 0.04 220)" }}>
                      {lastResult.amount}
                    </strong>
                  </p>
                )}
                {lastResult.txId && (
                  <p>
                    ID transaction :{" "}
                    <strong
                      className="font-mono"
                      style={{ color: "oklch(0.80 0.04 220)" }}
                    >
                      {lastResult.txId}
                    </strong>
                  </p>
                )}
                {lastResult.sender && (
                  <p>
                    Expéditeur :{" "}
                    <strong style={{ color: "oklch(0.80 0.04 220)" }}>
                      {lastResult.sender}
                    </strong>
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CancellationImpossibleBanner ───────────────────────────────────────────────────────

export function CancellationImpossibleBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl px-4 py-3 space-y-1"
      style={{
        background: "oklch(0.20 0.10 25 / 0.6)",
        border: "2px solid oklch(0.55 0.18 25 / 0.7)",
      }}
      data-ocid="p2p.error_state"
    >
      <p
        className="text-sm font-bold flex items-center gap-2"
        style={{ color: "oklch(0.82 0.16 25)" }}
      >
        <AlertTriangle size={15} />⛔ ANNULATION IMPOSSIBLE
      </p>
      <p className="text-xs" style={{ color: "oklch(0.65 0.10 25)" }}>
        Le paiement a été déclaré. Les fonds ne peuvent être libérés que par :
      </p>
      <p
        className="text-xs font-semibold"
        style={{ color: "oklch(0.72 0.12 25)" }}
      >
        confirmation du vendeur · validation système · arbitrage admin
      </p>
    </motion.div>
  );
}

// ─── OperatorMismatchAlert ───────────────────────────────────────────────────────────────────────

interface OperatorMismatchAlertProps {
  buyerOperator: string | null;
  sellerPaymentMethod: string;
}

export function OperatorMismatchAlert({
  buyerOperator,
  sellerPaymentMethod,
}: OperatorMismatchAlertProps) {
  if (!buyerOperator) return null;

  const sellerOp = detectOperatorFromMethodString(sellerPaymentMethod);
  if (!sellerOp) return null;

  const isMatch = buyerOperator === sellerOp;
  const buyerOpConfig = MOBILE_MONEY_OPERATORS[buyerOperator as OperatorId];
  const sellerOpConfig = MOBILE_MONEY_OPERATORS[sellerOp];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="rounded-lg px-3 py-2 text-xs"
        style={{
          background: isMatch
            ? "oklch(0.22 0.08 145 / 0.3)"
            : "oklch(0.26 0.09 55 / 0.3)",
          border: isMatch
            ? "1px solid oklch(0.45 0.12 145 / 0.5)"
            : "1px solid oklch(0.50 0.14 55 / 0.5)",
          color: isMatch ? "oklch(0.68 0.14 145)" : "oklch(0.78 0.14 55)",
        }}
        data-ocid={isMatch ? "p2p.success_state" : "p2p.error_state"}
      >
        {isMatch ? (
          <span>
            ✅ Opérateur correct — le vendeur accepte{" "}
            <strong>{sellerOpConfig?.name}</strong>
          </span>
        ) : (
          <span>
            ⚠️ L'opérateur{" "}
            <strong style={{ color: buyerOpConfig?.colorOklch }}>
              {buyerOpConfig?.name}
            </strong>{" "}
            ne correspond pas à celui demandé par le vendeur (
            {<strong>{sellerOpConfig?.name}</strong>})
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
