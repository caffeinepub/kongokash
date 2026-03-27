import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Copy,
  Fingerprint,
  Lock,
  LockOpen,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  generateSeedPhrase,
  useNonCustodialWallet,
} from "../hooks/useNonCustodialWallet";

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}

function SeedGrid({ words }: { words: string[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {words.map((word, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: seed position is meaningful
          key={`seed-${i}`}
          className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-sm"
          style={{
            background: "oklch(0.18 0.04 220)",
            border: "1px solid oklch(0.30 0.06 195)",
          }}
          data-ocid={`wallet.item.${i + 1}`}
        >
          <span
            className="text-xs w-5 shrink-0 text-right"
            style={{ color: "oklch(0.52 0.12 160)" }}
          >
            {i + 1}
          </span>
          <span style={{ color: "oklch(0.92 0.04 80)" }}>{word}</span>
        </div>
      ))}
    </div>
  );
}

// —— VIEW: No Wallet ——
function ViewNoWallet({
  onCreate,
  onRestore,
}: {
  onCreate: () => void;
  onRestore: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-8 py-8"
    >
      <div
        className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
        style={{ background: "oklch(0.27 0.07 195)" }}
      >
        <ShieldCheck size={40} style={{ color: "oklch(0.77 0.13 85)" }} />
      </div>
      <div>
        <h2
          className="font-display font-bold text-2xl mb-2"
          style={{ color: "oklch(0.92 0.04 80)" }}
        >
          Wallet Non-Custodial
        </h2>
        <p className="text-sm" style={{ color: "oklch(0.65 0.03 220)" }}>
          Vos clés, votre argent. Aucun accès serveur. Sécurité totale.
        </p>
      </div>

      <div className="grid gap-4 max-w-xs mx-auto">
        <Button
          size="lg"
          className="w-full font-semibold"
          style={{
            background: "oklch(0.77 0.13 85)",
            color: "oklch(0.10 0.01 250)",
          }}
          onClick={onCreate}
          data-ocid="wallet.primary_button"
        >
          <Wallet className="mr-2" size={18} />
          Créer un nouveau wallet
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full font-semibold"
          style={{
            borderColor: "oklch(0.52 0.12 160)",
            color: "oklch(0.52 0.12 160)",
          }}
          onClick={onRestore}
          data-ocid="wallet.secondary_button"
        >
          <RotateCcw className="mr-2" size={18} />
          Restaurer avec seed phrase
        </Button>
      </div>

      <div
        className="rounded-xl p-4 text-xs space-y-1 max-w-sm mx-auto"
        style={{
          background: "oklch(0.22 0.04 220)",
          color: "oklch(0.65 0.03 220)",
        }}
      >
        <div className="flex items-center gap-2">
          <Check size={12} style={{ color: "oklch(0.52 0.12 160)" }} />
          Clé privée stockée localement et chiffrée
        </div>
        <div className="flex items-center gap-2">
          <Check size={12} style={{ color: "oklch(0.52 0.12 160)" }} />
          Aucune donnée envoyée sur un serveur
        </div>
        <div className="flex items-center gap-2">
          <Check size={12} style={{ color: "oklch(0.52 0.12 160)" }} />
          Biométrie (empreinte / Face ID) pour l'accès rapide
        </div>
      </div>
    </motion.div>
  );
}

// —— VIEW: Create Step 1 ——
function ViewCreateStep1({
  onContinue,
  onBack,
}: {
  onContinue: (words: string[]) => void;
  onBack: () => void;
}) {
  const [length, setLength] = useState<12 | 24>(12);
  const [words, setWords] = useState<string[]>(() => generateSeedPhrase(12));
  const [saved, setSaved] = useState(false);

  const regenerate = () => {
    setWords(generateSeedPhrase(length));
    setSaved(false);
  };

  const handleLengthToggle = (l: 12 | 24) => {
    setLength(l);
    setWords(generateSeedPhrase(l));
    setSaved(false);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(words.join(" "));
    toast.success("Seed phrase copiée dans le presse-papier");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={onBack}
          style={{ color: "oklch(0.65 0.03 220)" }}
        >
          ← Retour
        </Button>
        <h3
          className="font-display font-bold text-lg"
          style={{ color: "oklch(0.92 0.04 80)" }}
        >
          Votre Seed Phrase
        </h3>
      </div>

      {/* Length toggle */}
      <div
        className="flex rounded-xl overflow-hidden border"
        style={{ borderColor: "oklch(0.30 0.06 195)" }}
      >
        {([12, 24] as const).map((l) => (
          <button
            key={l}
            type="button"
            className="flex-1 py-2 text-sm font-semibold transition-colors"
            style={{
              background:
                length === l ? "oklch(0.52 0.12 160)" : "oklch(0.18 0.04 220)",
              color: length === l ? "white" : "oklch(0.65 0.03 220)",
            }}
            onClick={() => handleLengthToggle(l)}
            data-ocid="wallet.toggle"
          >
            {l} mots
          </button>
        ))}
      </div>

      {/* Warning */}
      <div
        className="rounded-xl p-4 flex gap-3 items-start"
        style={{
          background: "oklch(0.55 0.22 25 / 0.15)",
          border: "1px solid oklch(0.55 0.22 25 / 0.4)",
        }}
      >
        <AlertTriangle
          size={18}
          style={{ color: "oklch(0.77 0.13 85)", flexShrink: 0 }}
        />
        <p
          className="text-xs leading-relaxed"
          style={{ color: "oklch(0.85 0.05 80)" }}
        >
          ⚠️ <strong>Écrivez ces mots et conservez-les en sécurité.</strong> Vous
          ne pourrez plus les voir après avoir quitté cet écran. Ne les partagez
          jamais.
        </p>
      </div>

      {/* Seed grid */}
      <SeedGrid words={words} />

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={copyAll}
          className="flex-1"
          style={{
            borderColor: "oklch(0.52 0.12 160)",
            color: "oklch(0.52 0.12 160)",
          }}
          data-ocid="wallet.secondary_button"
        >
          <Copy size={14} className="mr-1" /> Copier
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={regenerate}
          className="flex-1"
          style={{
            borderColor: "oklch(0.35 0.09 195)",
            color: "oklch(0.65 0.03 220)",
          }}
          data-ocid="wallet.button"
        >
          <RefreshCw size={14} className="mr-1" /> Regénérer
        </Button>
      </div>

      {/* Confirmation checkbox */}
      <div
        className="flex items-start gap-3 rounded-xl p-4"
        style={{ background: "oklch(0.22 0.04 220)" }}
      >
        <Checkbox
          id="saved-check"
          checked={saved}
          onCheckedChange={(v) => setSaved(!!v)}
          data-ocid="wallet.checkbox"
        />
        <Label
          htmlFor="saved-check"
          className="text-sm cursor-pointer leading-relaxed"
          style={{ color: "oklch(0.80 0.03 220)" }}
        >
          J'ai sauvegardé ma seed phrase dans un endroit sécurisé et je
          comprends qu'il est impossible de la récupérer si je la perds.
        </Label>
      </div>

      <Button
        className="w-full font-semibold"
        disabled={!saved}
        onClick={() => onContinue(words)}
        style={{
          background: saved ? "oklch(0.77 0.13 85)" : "oklch(0.30 0.02 220)",
          color: saved ? "oklch(0.10 0.01 250)" : "oklch(0.50 0.02 220)",
        }}
        data-ocid="wallet.primary_button"
      >
        Continuer la vérification →
      </Button>
    </motion.div>
  );
}

// —— VIEW: Create Step 2 (Quiz) ——
function ViewCreateStep2({
  words,
  onComplete,
  onBack,
}: {
  words: string[];
  onComplete: () => void;
  onBack: () => void;
}) {
  const TOTAL = 4;
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);

  const buildQuiz = () => {
    const indices = new Set<number>();
    while (indices.size < TOTAL) {
      indices.add(Math.floor(Math.random() * words.length));
    }
    return Array.from(indices).map((idx) => {
      const correctWord = words[idx];
      const distractors: string[] = [];
      while (distractors.length < 3) {
        const r = Math.floor(Math.random() * words.length);
        if (r !== idx && !distractors.includes(words[r])) {
          distractors.push(words[r]);
        }
      }
      const options = [correctWord, ...distractors].sort(
        () => Math.random() - 0.5,
      );
      return { index: idx, correct: correctWord, options };
    });
  };

  const [quiz] = useState(buildQuiz);
  const current = quiz[step];

  const handleAnswer = (choice: string) => {
    if (choice === current.correct) {
      setError(null);
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      if (step + 1 === TOTAL) {
        onComplete();
      } else {
        setStep((s) => s + 1);
      }
    } else {
      setError("Mot incorrect — réessayez.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={onBack}
          style={{ color: "oklch(0.65 0.03 220)" }}
        >
          ← Retour
        </Button>
        <h3
          className="font-display font-bold text-lg"
          style={{ color: "oklch(0.92 0.04 80)" }}
        >
          Vérification
        </h3>
      </div>

      <div className="space-y-2">
        <div
          className="flex justify-between text-xs"
          style={{ color: "oklch(0.65 0.03 220)" }}
        >
          <span>
            Question {step + 1} / {TOTAL}
          </span>
          <span>{Math.round((step / TOTAL) * 100)}%</span>
        </div>
        <Progress
          value={(step / TOTAL) * 100}
          className="h-2"
          data-ocid="wallet.loading_state"
        />
      </div>

      <div
        className="rounded-xl p-5 text-center"
        style={{ background: "oklch(0.22 0.04 220)" }}
      >
        <p className="text-sm mb-2" style={{ color: "oklch(0.65 0.03 220)" }}>
          Quel est le mot
        </p>
        <p
          className="font-display font-bold text-3xl"
          style={{ color: "oklch(0.77 0.13 85)" }}
        >
          #{current.index + 1}
        </p>
        <p className="text-sm mt-2" style={{ color: "oklch(0.65 0.03 220)" }}>
          de votre seed phrase ?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {current.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleAnswer(opt)}
            className="rounded-xl py-3 px-4 font-mono text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{
              background: "oklch(0.18 0.04 220)",
              border: "1px solid oklch(0.30 0.06 195)",
              color: "oklch(0.80 0.03 220)",
            }}
            data-ocid="wallet.button"
          >
            {opt}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl p-3 text-sm"
            style={{
              background: "oklch(0.55 0.22 25 / 0.15)",
              color: "oklch(0.75 0.18 25)",
            }}
            data-ocid="wallet.error_state"
          >
            <X size={14} /> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// —— VIEW: Biometric Enrollment ——
function ViewBiometricEnrollment({
  address,
  onEnroll,
  onSkip,
  biometricAvailable,
}: {
  address: string;
  onEnroll: () => void;
  onSkip: () => void;
  biometricAvailable: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    await onEnroll();
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-6 py-4"
    >
      <div
        className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
        style={{ background: "oklch(0.52 0.12 160 / 0.15)" }}
      >
        <Fingerprint size={40} style={{ color: "oklch(0.52 0.12 160)" }} />
      </div>

      <div>
        <h3
          className="font-display font-bold text-xl mb-2"
          style={{ color: "oklch(0.92 0.04 80)" }}
        >
          Accès biométrique
        </h3>
        <p className="text-sm" style={{ color: "oklch(0.65 0.03 220)" }}>
          Activez l'empreinte digitale ou Face ID pour déverrouiller votre
          wallet rapidement et en toute sécurité.
        </p>
      </div>

      {biometricAvailable ? (
        <Button
          size="lg"
          className="w-full font-semibold"
          onClick={handleEnroll}
          disabled={loading}
          style={{ background: "oklch(0.52 0.12 160)", color: "white" }}
          data-ocid="wallet.primary_button"
        >
          <Fingerprint className="mr-2" size={18} />
          {loading ? "Activation..." : "Activer l'empreinte / Face ID"}
        </Button>
      ) : (
        <div
          className="rounded-xl p-4 text-sm"
          style={{
            background: "oklch(0.22 0.04 220)",
            color: "oklch(0.65 0.03 220)",
          }}
          data-ocid="wallet.error_state"
        >
          Authentification biométrique non disponible sur cet appareil.
        </div>
      )}

      <button
        type="button"
        onClick={onSkip}
        className="text-sm transition-colors hover:opacity-80"
        style={{ color: "oklch(0.52 0.12 160)" }}
        data-ocid="wallet.button"
      >
        Passer — utiliser la seed phrase à la place
      </button>

      <div
        className="rounded-xl p-3 text-sm text-left flex gap-2"
        style={{
          background: "oklch(0.25 0.06 230 / 0.5)",
          border: "1px solid oklch(0.52 0.12 200 / 0.3)",
        }}
        data-ocid="wallet.panel"
      >
        <span className="shrink-0">ℹ️</span>
        <p style={{ color: "oklch(0.75 0.05 220)" }}>
          <strong style={{ color: "oklch(0.85 0.06 220)" }}>
            Déverrouillage local uniquement.
          </strong>{" "}
          La biométrie permet uniquement de déverrouiller l'app rapidement sur
          cet appareil. Elle ne remplace pas votre phrase secrète et ne peut pas
          récupérer votre wallet.
        </p>
      </div>

      <p className="text-xs" style={{ color: "oklch(0.45 0.02 220)" }}>
        Wallet : {truncateAddress(address)}
      </p>
    </motion.div>
  );
}

// —— VIEW: Locked ——
function ViewLocked({
  address,
  onBiometric,
  onRestoreFlow,
  biometricAvailable,
  hasBiometricEnrolled,
}: {
  address: string;
  onBiometric: () => void;
  onRestoreFlow: () => void;
  biometricAvailable: boolean;
  hasBiometricEnrolled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    setError(false);
    const ok = await (async () => {
      await onBiometric();
      return true;
    })().catch(() => false);
    if (!ok) setError(true);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-6 py-6"
    >
      <div
        className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
        style={{ background: "oklch(0.22 0.04 220)" }}
      >
        <Lock size={36} style={{ color: "oklch(0.77 0.13 85)" }} />
      </div>

      <div>
        <h3
          className="font-display font-bold text-xl mb-1"
          style={{ color: "oklch(0.92 0.04 80)" }}
        >
          Wallet verrouillé
        </h3>
        <p
          className="font-mono text-sm"
          style={{ color: "oklch(0.52 0.12 160)" }}
        >
          {address.slice(0, 6)}...{address.slice(-6)}
        </p>
      </div>

      {biometricAvailable && hasBiometricEnrolled ? (
        <Button
          size="lg"
          className="w-full font-semibold"
          onClick={handleUnlock}
          disabled={loading}
          style={{
            background: "oklch(0.77 0.13 85)",
            color: "oklch(0.10 0.01 250)",
          }}
          data-ocid="wallet.primary_button"
        >
          <Fingerprint className="mr-2" size={18} />
          {loading ? "Vérification..." : "Déverrouiller avec Biométrie"}
        </Button>
      ) : (
        <p className="text-sm" style={{ color: "oklch(0.65 0.03 220)" }}>
          Biométrie non configurée. Utilisez votre seed phrase.
        </p>
      )}

      <div
        className="rounded-xl p-3 text-xs text-left flex gap-2"
        style={{
          background: "oklch(0.25 0.06 230 / 0.4)",
          border: "1px solid oklch(0.52 0.12 200 / 0.25)",
        }}
        data-ocid="wallet.panel"
      >
        <span className="shrink-0">🔒</span>
        <p style={{ color: "oklch(0.65 0.04 220)" }}>
          Déverrouillage local uniquement — pour récupérer votre wallet sur un
          autre appareil, utilisez votre phrase secrète.
        </p>
      </div>

      {error && (
        <div
          className="rounded-xl p-3 text-sm"
          style={{
            background: "oklch(0.55 0.22 25 / 0.15)",
            color: "oklch(0.75 0.18 25)",
          }}
          data-ocid="wallet.error_state"
        >
          Échec de l'authentification biométrique.
        </div>
      )}

      <button
        type="button"
        onClick={onRestoreFlow}
        className="text-sm transition-colors hover:opacity-80"
        style={{ color: "oklch(0.52 0.12 160)" }}
        data-ocid="wallet.button"
      >
        Restaurer avec seed phrase
      </button>
    </motion.div>
  );
}

// —— VIEW: Unlocked ——
function ViewUnlocked({
  address,
  onLock,
}: {
  address: string;
  onLock: () => void;
}) {
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Adresse copiée");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      {/* Header */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.27 0.07 195), oklch(0.35 0.09 195))",
        }}
      >
        <div className="flex items-center justify-between">
          <Badge
            className="text-xs font-semibold"
            style={{
              background: "oklch(0.52 0.12 160 / 0.25)",
              color: "oklch(0.52 0.12 160)",
            }}
          >
            <ShieldCheck size={10} className="mr-1" />
            Non-Custodial — Aucun accès serveur
          </Badge>
          <button
            type="button"
            onClick={copyAddress}
            className="text-white/60 hover:text-white transition-colors"
            data-ocid="wallet.button"
          >
            <Copy size={14} />
          </button>
        </div>

        <div>
          <p className="text-white/60 text-xs mb-1">Adresse du wallet</p>
          <p className="font-mono text-sm text-white font-semibold">
            {truncateAddress(address)}
          </p>
        </div>

        <div>
          <p className="text-white/60 text-xs mb-1">Solde total (simulé)</p>
          <p
            className="font-display font-bold text-3xl"
            style={{ color: "oklch(0.77 0.13 85)" }}
          >
            0.00 OKP
          </p>
          <p className="text-white/50 text-xs mt-1">≈ 0 FC</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          className="font-semibold"
          style={{ background: "oklch(0.52 0.12 160)", color: "white" }}
          onClick={() => setSendOpen(true)}
          data-ocid="wallet.primary_button"
        >
          <Send size={15} className="mr-2" /> Envoyer
        </Button>
        <Button
          variant="outline"
          className="font-semibold"
          style={{
            borderColor: "oklch(0.77 0.13 85)",
            color: "oklch(0.77 0.13 85)",
          }}
          onClick={() => setReceiveOpen(true)}
          data-ocid="wallet.secondary_button"
        >
          <LockOpen size={15} className="mr-2" /> Recevoir
        </Button>
      </div>

      {/* Send panel */}
      <AnimatePresence>
        {sendOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "oklch(0.22 0.04 220)",
                border: "1px solid oklch(0.30 0.06 195)",
              }}
              data-ocid="wallet.panel"
            >
              <h4
                className="font-semibold text-sm"
                style={{ color: "oklch(0.92 0.04 80)" }}
              >
                Envoyer des fonds
              </h4>
              <div className="space-y-2">
                <Input
                  placeholder="Adresse destinataire (0x...)"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  className="font-mono text-xs"
                  style={{
                    background: "oklch(0.15 0.03 220)",
                    borderColor: "oklch(0.30 0.06 195)",
                  }}
                  data-ocid="wallet.input"
                />
                <Input
                  placeholder="Montant"
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  style={{
                    background: "oklch(0.15 0.03 220)",
                    borderColor: "oklch(0.30 0.06 195)",
                  }}
                  data-ocid="wallet.input"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  style={{ background: "oklch(0.52 0.12 160)" }}
                  onClick={() => {
                    toast.info("Fonctionnalité disponible avec le vrai réseau");
                    setSendOpen(false);
                  }}
                  data-ocid="wallet.submit_button"
                >
                  Confirmer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSendOpen(false)}
                  data-ocid="wallet.cancel_button"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receive panel */}
      <AnimatePresence>
        {receiveOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl p-4 space-y-3 text-center"
              style={{
                background: "oklch(0.22 0.04 220)",
                border: "1px solid oklch(0.30 0.06 195)",
              }}
              data-ocid="wallet.panel"
            >
              <h4
                className="font-semibold text-sm"
                style={{ color: "oklch(0.92 0.04 80)" }}
              >
                Recevoir des fonds
              </h4>
              <div
                className="rounded-lg p-3 font-mono text-xs break-all"
                style={{
                  background: "oklch(0.15 0.03 220)",
                  color: "oklch(0.77 0.13 85)",
                }}
              >
                {address}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyAddress}
                style={{
                  borderColor: "oklch(0.52 0.12 160)",
                  color: "oklch(0.52 0.12 160)",
                }}
                data-ocid="wallet.button"
              >
                <Copy size={12} className="mr-1" /> Copier l'adresse
              </Button>
              <div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReceiveOpen(false)}
                  data-ocid="wallet.close_button"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock button */}
      <Button
        variant="outline"
        className="w-full"
        style={{
          borderColor: "oklch(0.30 0.06 195)",
          color: "oklch(0.65 0.03 220)",
        }}
        onClick={onLock}
        data-ocid="wallet.toggle"
      >
        <Lock size={14} className="mr-2" /> Verrouiller le wallet
      </Button>
    </motion.div>
  );
}

// —— VIEW: Restore ——
function ViewRestore({
  onBack,
  onRestored,
}: {
  onBack: () => void;
  onRestored: (address: string) => void;
}) {
  const [length, setLength] = useState<12 | 24>(12);
  const [inputWords, setInputWords] = useState<string[]>(Array(12).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { restoreFromSeed } = useNonCustodialWallet();

  const handleLengthToggle = (l: 12 | 24) => {
    setLength(l);
    setInputWords(Array(l).fill(""));
    setError(null);
  };

  const handleWordChange = (i: number, val: string) => {
    const next = [...inputWords];
    next[i] = val.toLowerCase().trim();
    setInputWords(next);
  };

  const handleRestore = async () => {
    const filled = inputWords.filter((w) => w.length > 0);
    if (filled.length !== length) {
      setError(`Veuillez entrer les ${length} mots de votre seed phrase.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await restoreFromSeed(inputWords);
      if (result.success) {
        toast.success("Wallet restauré avec succès !");
        onRestored(result.address);
      } else {
        setError(
          "Impossible de restaurer le wallet. Vérifiez votre seed phrase.",
        );
      }
    } catch {
      setError("Erreur lors de la restauration.");
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={onBack}
          style={{ color: "oklch(0.65 0.03 220)" }}
        >
          ← Retour
        </Button>
        <h3
          className="font-display font-bold text-lg"
          style={{ color: "oklch(0.92 0.04 80)" }}
        >
          Restaurer le Wallet
        </h3>
      </div>

      {/* Length toggle */}
      <div
        className="flex rounded-xl overflow-hidden border"
        style={{ borderColor: "oklch(0.30 0.06 195)" }}
      >
        {([12, 24] as const).map((l) => (
          <button
            key={l}
            type="button"
            className="flex-1 py-2 text-sm font-semibold transition-colors"
            style={{
              background:
                length === l ? "oklch(0.52 0.12 160)" : "oklch(0.18 0.04 220)",
              color: length === l ? "white" : "oklch(0.65 0.03 220)",
            }}
            onClick={() => handleLengthToggle(l)}
            data-ocid="wallet.toggle"
          >
            {l} mots
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {inputWords.map((word, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: word position is meaningful
          <div key={`word-input-${i}`} className="relative">
            <span
              className="absolute left-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
              style={{ color: "oklch(0.52 0.12 160)" }}
            >
              {i + 1}
            </span>
            <input
              type="text"
              value={word}
              onChange={(e) => handleWordChange(i, e.target.value)}
              className="w-full rounded-lg pl-6 pr-2 py-2 font-mono text-xs outline-none transition-colors"
              style={{
                background: "oklch(0.18 0.04 220)",
                border: "1px solid oklch(0.30 0.06 195)",
                color: "oklch(0.92 0.04 80)",
              }}
              placeholder={`mot ${i + 1}`}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              data-ocid="wallet.input"
            />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl p-3 text-sm"
            style={{
              background: "oklch(0.55 0.22 25 / 0.15)",
              color: "oklch(0.75 0.18 25)",
            }}
            data-ocid="wallet.error_state"
          >
            <X size={14} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        className="w-full font-semibold"
        onClick={handleRestore}
        disabled={loading}
        style={{
          background: "oklch(0.77 0.13 85)",
          color: "oklch(0.10 0.01 250)",
        }}
        data-ocid="wallet.primary_button"
      >
        {loading ? "Restauration..." : "Restaurer le Wallet"}
      </Button>
    </motion.div>
  );
}

// —— Main Component ——
type Screen =
  | "home"
  | "create-step1"
  | "create-step2"
  | "biometric-enroll"
  | "locked"
  | "unlocked"
  | "restore";

export default function NonCustodialWallet() {
  const {
    walletState,
    walletAddress,
    biometricAvailable,
    isLoading,
    createWallet,
    unlockWithBiometric,
    lockWallet,
    enrollBiometric,
  } = useNonCustodialWallet();

  const [screen, setScreen] = useState<Screen | null>(null);
  const [pendingWords, setPendingWords] = useState<string[] | null>(null);
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);
  const [justRestored, setJustRestored] = useState(false);

  const hasBiometricEnrolled = !!localStorage.getItem("kk_webauthn_id");

  // Determine screen from wallet state
  const effectiveScreen: Screen = (() => {
    if (screen) return screen;
    if (isLoading) return "home";
    if (walletState === "unlocked" || justRestored) return "unlocked";
    if (walletState === "locked") return "locked";
    return "home";
  })();

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="wallet.loading_state"
      >
        <div
          className="animate-spin w-8 h-8 rounded-full border-2 border-t-transparent"
          style={{
            borderColor: "oklch(0.52 0.12 160)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-[500px] rounded-2xl p-6 max-w-lg mx-auto"
      style={{
        background: "oklch(0.14 0.03 220)",
        border: "1px solid oklch(0.25 0.06 195)",
      }}
      data-ocid="wallet.panel"
    >
      <AnimatePresence mode="wait">
        {effectiveScreen === "home" && (
          <ViewNoWallet
            key="home"
            onCreate={() => setScreen("create-step1")}
            onRestore={() => setScreen("restore")}
          />
        )}

        {effectiveScreen === "create-step1" && (
          <ViewCreateStep1
            key="create-step1"
            onContinue={(words) => {
              setPendingWords(words);
              setScreen("create-step2");
            }}
            onBack={() => setScreen("home")}
          />
        )}

        {effectiveScreen === "create-step2" && pendingWords && (
          <ViewCreateStep2
            key="create-step2"
            words={pendingWords}
            onComplete={async () => {
              if (!pendingWords) return;
              await createWallet(pendingWords);
              const addr = localStorage.getItem("kk_wallet_address") ?? "";
              setPendingAddress(addr);
              setScreen("biometric-enroll");
            }}
            onBack={() => setScreen("create-step1")}
          />
        )}

        {effectiveScreen === "biometric-enroll" &&
          (pendingAddress ?? walletAddress) && (
            <ViewBiometricEnrollment
              key="biometric-enroll"
              address={(pendingAddress ?? walletAddress) as string}
              biometricAvailable={biometricAvailable}
              onEnroll={async () => {
                const addr = (pendingAddress ?? walletAddress) as string;
                const ok = await enrollBiometric(addr);
                if (ok) toast.success("Biométrie activée avec succès !");
                else toast.error("Impossible d'activer la biométrie");
                setScreen("unlocked");
              }}
              onSkip={() => setScreen("unlocked")}
            />
          )}

        {effectiveScreen === "locked" && walletAddress && (
          <ViewLocked
            key="locked"
            address={walletAddress}
            biometricAvailable={biometricAvailable}
            hasBiometricEnrolled={hasBiometricEnrolled}
            onBiometric={async () => {
              const ok = await unlockWithBiometric();
              if (ok) setScreen("unlocked");
              else toast.error("Échec de l'authentification biométrique");
            }}
            onRestoreFlow={() => setScreen("restore")}
          />
        )}

        {effectiveScreen === "unlocked" && (
          <ViewUnlocked
            key="unlocked"
            address={walletAddress ?? pendingAddress ?? "0x0000...0000"}
            onLock={() => {
              lockWallet();
              setScreen("locked");
              setJustRestored(false);
            }}
          />
        )}

        {effectiveScreen === "restore" && (
          <ViewRestore
            key="restore"
            onBack={() =>
              setScreen(walletState === "locked" ? "locked" : "home")
            }
            onRestored={(addr) => {
              setPendingAddress(addr);
              setJustRestored(true);
              setScreen("biometric-enroll");
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer info */}
      <div
        className="mt-6 pt-4 flex items-center justify-center gap-2 text-xs"
        style={{
          borderTop: "1px solid oklch(0.22 0.04 220)",
          color: "oklch(0.40 0.02 220)",
        }}
      >
        <CheckCircle size={12} style={{ color: "oklch(0.52 0.12 160)" }} />
        Clé privée chiffrée localement — Aucune donnée serveur
      </div>
    </div>
  );
}
