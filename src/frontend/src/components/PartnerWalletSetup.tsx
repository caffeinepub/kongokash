import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { usePartnerWallet } from "../hooks/usePartnerWallet";

const SECURITY_QUIZ = [
  {
    question: "Que faire si vous perdez votre seed phrase ?",
    options: [
      "Il est impossible de r\u00e9cup\u00e9rer votre wallet",
      "Contacter le support KongoKash",
      "Utiliser votre mot de passe",
      "R\u00e9initialiser via email",
    ],
    correct: 0,
  },
  {
    question: "Qui peut acc\u00e9der \u00e0 votre wallet ?",
    options: [
      "L'\u00e9quipe KongoKash en cas d'urgence",
      "Seulement moi, avec ma seed phrase ou biom\u00e9trie",
      "L'administrateur de la plateforme",
      "N'importe qui avec mon adresse",
    ],
    correct: 1,
  },
  {
    question: "KongoKash peut-il r\u00e9cup\u00e9rer vos fonds ?",
    options: [
      "Oui, avec une proc\u00e9dure de r\u00e9cup\u00e9ration",
      "Oui, si vous avez votre KYC valid\u00e9",
      "Non, jamais \u2014 wallet non-custodial",
      "Oui, en cas de perte de seed phrase",
    ],
    correct: 2,
  },
  {
    question: "O\u00f9 devez-vous stocker votre seed phrase ?",
    options: [
      "Dans un email chiffr\u00e9",
      "Dans les notes de votre t\u00e9l\u00e9phone",
      "Dans un fichier sur votre ordinateur",
      "Sur papier, dans un endroit s\u00e9curis\u00e9 hors ligne",
    ],
    correct: 3,
  },
  {
    question: "Que faire si quelqu'un vous demande votre seed phrase ?",
    options: [
      "La partager uniquement avec le support KongoKash",
      "Ne jamais la partager \u2014 c'est une tentative de fraude",
      "La partager si la personne est de confiance",
      "V\u00e9rifier d'abord l'identit\u00e9 de la personne",
    ],
    correct: 1,
  },
];

const STEP_LABELS = [
  "Institution",
  "Seed Phrase",
  "Confirmation",
  "Mot de passe",
  "Biom\u00e9trie",
  "Quiz",
  "Activ\u00e9",
];

function passwordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "Tr\u00e8s faible", color: "oklch(0.60 0.20 20)" },
    { label: "Faible", color: "oklch(0.65 0.18 40)" },
    { label: "Moyen", color: "oklch(0.77 0.13 85)" },
    { label: "Fort", color: "oklch(0.60 0.15 145)" },
    { label: "Tr\u00e8s fort", color: "oklch(0.70 0.15 145)" },
  ];
  return { score, ...levels[Math.min(score, 4)] };
}

function SeedGrid({ words }: { words: string[] }) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
    >
      {words.map((word) => (
        <div
          key={word}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
          style={{
            background: "oklch(0.18 0.04 220)",
            border: "1px solid oklch(0.28 0.05 220)",
          }}
        >
          <span
            className="font-mono font-semibold"
            style={{ color: "oklch(0.90 0.03 220)" }}
          >
            {word}
          </span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  partnerId: string;
  partnerName: string;
  onClose: () => void;
}

export function PartnerWalletSetup({ partnerId, partnerName, onClose }: Props) {
  const wallet = usePartnerWallet(partnerId);

  const [step, setStep] = useState(0);
  const [institutionName, setInstitutionName] = useState("");
  const [institutionRole, setInstitutionRole] = useState("");
  const [seedLength, setSeedLength] = useState<12 | 24>(12);
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [savedChecked, setSavedChecked] = useState(false);

  const [quizPositions, setQuizPositions] = useState<number[]>([]);
  const [quizInputs, setQuizInputs] = useState<string[]>(["", "", "", ""]);
  const [quizErrors, setQuizErrors] = useState<boolean[]>([]);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [bioAttempted, setBioAttempted] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);
  const [bioUnavailable, setBioUnavailable] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
    new Array(5).fill(null),
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  const [finalAddress, setFinalAddress] = useState("");

  const pwStrength = useMemo(() => passwordStrength(password), [password]);
  const pwMatch = password === passwordConfirm;
  const pwValid = pwStrength.score >= 3;

  function generateSeed() {
    const words = wallet.generateSeedPhrase(seedLength);
    setSeedWords(words);
    setSavedChecked(false);
    const positions: number[] = [];
    while (positions.length < 4) {
      const n = Math.floor(Math.random() * seedLength);
      if (!positions.includes(n)) positions.push(n);
    }
    positions.sort((a, b) => a - b);
    setQuizPositions(positions);
    setQuizInputs(["", "", "", ""]);
    setQuizErrors([]);
  }

  function checkConfirmation() {
    const errors = quizPositions.map(
      (pos, i) =>
        quizInputs[i].trim().toLowerCase() !== seedWords[pos].toLowerCase(),
    );
    setQuizErrors(errors);
    if (errors.every((e) => !e)) {
      setStep(3);
    }
  }

  async function handleBiometric() {
    setBioAttempted(true);
    if (!wallet.biometricAvailable) {
      setBioUnavailable(true);
      return;
    }
    const address = wallet.deriveAddress(seedWords);
    const ok = await wallet.enrollBiometric(address);
    setBioSuccess(ok);
    if (!ok) setBioUnavailable(true);
  }

  function submitSecurityQuiz() {
    setQuizSubmitted(true);
    const correct = quizAnswers.every(
      (ans, i) => ans === SECURITY_QUIZ[i].correct,
    );
    setQuizPassed(correct);
  }

  async function activateWallet() {
    await wallet.createWallet(seedWords, password);
    const address = wallet.deriveAddress(seedWords);
    if (institutionName.trim()) {
      localStorage.setItem(
        `kk_partner_${partnerId}_institution`,
        JSON.stringify({ institutionName, institutionRole }),
      );
    }
    setFinalAddress(address);
    setStep(6);
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium"
        style={{
          background: "oklch(0.18 0.06 195 / 0.4)",
          border: "1px solid oklch(0.40 0.12 195 / 0.5)",
          color: "oklch(0.80 0.12 195)",
        }}
      >
        <Lock size={16} className="shrink-0" />
        <span>
          \uD83D\uDD12 Vos cl\u00e9s priv\u00e9es ne quittent jamais votre
          appareil \u2014 KongoKash n'y a aucun acc\u00e8s
        </span>
      </div>

      <div className="text-center">
        <p className="text-white/50 text-sm">Wallet non-custodial pour</p>
        <p
          className="font-bold text-lg"
          style={{ color: "oklch(0.77 0.13 85)" }}
        >
          {partnerName}
        </p>
      </div>

      <div className="flex items-center justify-between gap-1">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background:
                  i < step
                    ? "oklch(0.60 0.15 145)"
                    : i === step
                      ? "oklch(0.52 0.15 195)"
                      : "oklch(0.25 0.04 220)",
                color: i <= step ? "white" : "oklch(0.45 0.04 220)",
              }}
            >
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span
              className="text-[10px] text-center leading-tight hidden sm:block"
              style={{
                color:
                  i === step ? "oklch(0.80 0.10 195)" : "oklch(0.45 0.04 220)",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && (
            <div className="space-y-5">
              {/* Institutional info box */}
              <div
                className="rounded-xl p-4 flex items-start gap-3 text-sm"
                style={{
                  background: "oklch(0.18 0.07 250 / 0.35)",
                  border: "1px solid oklch(0.45 0.12 250 / 0.5)",
                  color: "oklch(0.78 0.10 250)",
                }}
              >
                <span className="text-lg shrink-0">🏛️</span>
                <span>
                  Ce wallet appartient à votre <strong>institution</strong>, pas
                  à vous personnellement. En cas de vente ou changement de
                  direction, KongoKash facilite un transfert sécurisé — vous
                  n'aurez jamais à transmettre votre phrase secrète à quelqu'un
                  d'autre.
                </span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="inst-name"
                    className="text-xs block"
                    style={{ color: "oklch(0.60 0.03 220)" }}
                  >
                    Nom de l'institution
                  </label>
                  <Input
                    id="inst-name"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="ex: Hôtel Okapi Palace, Parc des Virunga…"
                    className="bg-white/5 border-white/20 text-white"
                    data-ocid="partner_wallet.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="inst-role"
                    className="text-xs block"
                    style={{ color: "oklch(0.60 0.03 220)" }}
                  >
                    Votre rôle au sein de l'institution
                  </label>
                  <Input
                    id="inst-role"
                    value={institutionRole}
                    onChange={(e) => setInstitutionRole(e.target.value)}
                    placeholder="ex: Directeur Général, Gérant, Responsable financier"
                    className="bg-white/5 border-white/20 text-white"
                    data-ocid="partner_wallet.input"
                  />
                </div>
              </div>

              <p
                className="text-xs text-center"
                style={{ color: "oklch(0.45 0.04 220)" }}
              >
                Ces informations sont stockées localement et associées au wallet
                de l'institution.
              </p>

              <Button
                className="w-full"
                disabled={!institutionName.trim() || !institutionRole.trim()}
                onClick={() => setStep(1)}
                style={{ background: "oklch(0.52 0.15 195)" }}
                data-ocid="partner_wallet.primary_button"
              >
                Continuer vers la seed phrase
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="flex gap-2 justify-center">
                {([12, 24] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => {
                      setSeedLength(len);
                      setSeedWords([]);
                    }}
                    className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
                    style={{
                      background:
                        seedLength === len
                          ? "oklch(0.52 0.15 195)"
                          : "oklch(0.20 0.04 220)",
                      color: "white",
                      border:
                        seedLength === len
                          ? "1px solid oklch(0.60 0.15 195)"
                          : "1px solid oklch(0.28 0.04 220)",
                    }}
                  >
                    {len} mots
                  </button>
                ))}
              </div>

              {seedWords.length === 0 ? (
                <Button
                  className="w-full"
                  onClick={generateSeed}
                  style={{ background: "oklch(0.52 0.15 195)" }}
                  data-ocid="partner_wallet.primary_button"
                >
                  G\u00e9n\u00e9rer la seed phrase
                </Button>
              ) : (
                <div className="space-y-4">
                  <div
                    className="rounded-xl p-3 flex gap-3 text-sm"
                    style={{
                      background: "oklch(0.22 0.08 40 / 0.5)",
                      border: "1px solid oklch(0.50 0.12 40 / 0.6)",
                      color: "oklch(0.85 0.10 50)",
                    }}
                  >
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>
                      Notez ces mots dans l'ordre exact. Ne les partagez{" "}
                      <strong>JAMAIS</strong>. KongoKash ne peut pas les
                      r\u00e9cup\u00e9rer.
                    </span>
                  </div>

                  <SeedGrid words={seedWords} />

                  <label
                    className="flex items-center gap-3 cursor-pointer select-none"
                    data-ocid="partner_wallet.checkbox"
                    htmlFor="saved-seed-checkbox"
                  >
                    <input
                      id="saved-seed-checkbox"
                      type="checkbox"
                      checked={savedChecked}
                      onChange={(e) => setSavedChecked(e.target.checked)}
                      className="w-4 h-4 accent-teal-500"
                    />
                    <span className="text-white/70 text-sm">
                      J'ai not\u00e9 ma seed phrase dans un endroit s\u00fbr
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateSeed}
                      className="border-white/20 text-white/60"
                    >
                      Reg\u00e9n\u00e9rer
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={!savedChecked}
                      onClick={() => setStep(2)}
                      style={{ background: "oklch(0.52 0.15 195)" }}
                      data-ocid="partner_wallet.primary_button"
                    >
                      Continuer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="text-white/70 text-sm text-center">
                Saisissez les mots aux positions indiqu\u00e9es pour confirmer
                votre sauvegarde.
              </p>
              <div className="space-y-3">
                {quizPositions.map((pos, i) => (
                  <div key={pos} className="space-y-1">
                    <label
                      htmlFor={`confirm-word-${i}`}
                      className="text-xs block"
                      style={{ color: "oklch(0.60 0.03 220)" }}
                    >
                      Mot #{pos + 1}
                    </label>
                    <Input
                      id={`confirm-word-${i}`}
                      value={quizInputs[i]}
                      onChange={(e) => {
                        const next = [...quizInputs];
                        next[i] = e.target.value;
                        setQuizInputs(next);
                        if (quizErrors.length > 0) setQuizErrors([]);
                      }}
                      placeholder={`Entrez le mot num\u00e9ro ${pos + 1}`}
                      className="bg-white/5 border-white/20 text-white"
                      style={{
                        borderColor:
                          quizErrors[i] === true
                            ? "oklch(0.60 0.20 20)"
                            : undefined,
                      }}
                      data-ocid="partner_wallet.input"
                    />
                    {quizErrors[i] && (
                      <p
                        className="text-xs"
                        style={{ color: "oklch(0.65 0.15 20)" }}
                        data-ocid="partner_wallet.error_state"
                      >
                        Mot incorrect. V\u00e9rifiez votre sauvegarde.
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={checkConfirmation}
                style={{ background: "oklch(0.52 0.15 195)" }}
                data-ocid="partner_wallet.submit_button"
              >
                V\u00e9rifier
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <p className="text-white/70 text-sm text-center">
                Cr\u00e9ez un mot de passe fort (minimum 12 caract\u00e8res).
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="bg-white/5 border-white/20 text-white pr-10"
                    data-ocid="partner_wallet.input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "oklch(0.22 0.04 220)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(pwStrength.score / 5) * 100}%`,
                          background: pwStrength.color,
                        }}
                      />
                    </div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: pwStrength.color }}
                    >
                      {pwStrength.label}
                    </p>
                  </div>
                )}
                <Input
                  type={showPw ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  className="bg-white/5 border-white/20 text-white"
                  style={{
                    borderColor:
                      passwordConfirm.length > 0 && !pwMatch
                        ? "oklch(0.60 0.20 20)"
                        : undefined,
                  }}
                  data-ocid="partner_wallet.input"
                />
                {passwordConfirm.length > 0 && !pwMatch && (
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.15 20)" }}
                  >
                    Les mots de passe ne correspondent pas.
                  </p>
                )}
              </div>
              <Button
                className="w-full"
                disabled={!pwValid || !pwMatch || password.length < 12}
                onClick={() => setStep(4)}
                style={{
                  background: pwValid ? "oklch(0.52 0.15 195)" : undefined,
                }}
                data-ocid="partner_wallet.submit_button"
              >
                Continuer
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 text-center">
              <div
                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.18 0.06 195 / 0.4)" }}
              >
                <Fingerprint
                  size={40}
                  style={{ color: "oklch(0.60 0.15 195)" }}
                />
              </div>
              <div>
                <p className="text-white font-semibold">
                  Activez l'acc\u00e8s biom\u00e9trique
                </p>
                <p className="text-white/50 text-sm mt-1">
                  Empreinte digitale ou Face ID pour d\u00e9verrouiller
                  instantan\u00e9ment.
                </p>
              </div>
              {!bioAttempted && (
                <Button
                  className="w-full"
                  onClick={handleBiometric}
                  style={{ background: "oklch(0.52 0.15 195)" }}
                  data-ocid="partner_wallet.primary_button"
                >
                  <Fingerprint size={16} className="mr-2" />
                  Activer Empreinte / Face ID
                </Button>
              )}
              {bioAttempted && bioSuccess && (
                <div
                  className="rounded-xl p-3 text-sm"
                  style={{
                    background: "oklch(0.20 0.06 145 / 0.4)",
                    border: "1px solid oklch(0.45 0.12 145 / 0.5)",
                    color: "oklch(0.70 0.15 145)",
                  }}
                  data-ocid="partner_wallet.success_state"
                >
                  \u2705 Biom\u00e9trie activ\u00e9e avec succ\u00e8s !
                </div>
              )}
              {bioAttempted && bioUnavailable && (
                <div
                  className="rounded-xl p-3 text-sm"
                  style={{
                    background: "oklch(0.22 0.08 40 / 0.4)",
                    border: "1px solid oklch(0.50 0.12 40 / 0.5)",
                    color: "oklch(0.80 0.10 50)",
                  }}
                >
                  \u26a0\ufe0f Biom\u00e9trie non disponible sur cet appareil
                  \u2014 le mot de passe sera utilis\u00e9.
                </div>
              )}
              {bioAttempted && (
                <Button
                  className="w-full"
                  onClick={() => setStep(5)}
                  style={{ background: "oklch(0.52 0.15 195)" }}
                  data-ocid="partner_wallet.primary_button"
                >
                  Continuer vers le quiz de s\u00e9curit\u00e9
                </Button>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <p className="text-white/70 text-sm text-center">
                R\u00e9pondez correctement aux 5 questions pour activer votre
                wallet.
              </p>
              {SECURITY_QUIZ.map((q, qi) => (
                <div key={q.question} className="space-y-2">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.90 0.03 220)" }}
                  >
                    {qi + 1}. {q.question}
                  </p>
                  <div className="space-y-1">
                    {q.options.map((opt, oi) => {
                      const selected = quizAnswers[qi] === oi;
                      const isCorrect = oi === q.correct;
                      let bg = "oklch(0.18 0.04 220)";
                      let border = "oklch(0.28 0.05 220)";
                      let color = "oklch(0.75 0.03 220)";
                      if (quizSubmitted) {
                        if (isCorrect) {
                          bg = "oklch(0.20 0.06 145 / 0.4)";
                          border = "oklch(0.45 0.12 145)";
                          color = "oklch(0.70 0.15 145)";
                        } else if (selected) {
                          bg = "oklch(0.22 0.08 20 / 0.4)";
                          border = "oklch(0.55 0.18 20)";
                          color = "oklch(0.65 0.15 20)";
                        }
                      } else if (selected) {
                        bg = "oklch(0.22 0.06 195 / 0.4)";
                        border = "oklch(0.52 0.15 195)";
                        color = "white";
                      }
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => {
                            if (quizSubmitted) return;
                            const next = [...quizAnswers];
                            next[qi] = oi;
                            setQuizAnswers(next);
                          }}
                          className="w-full text-left rounded-lg px-3 py-2 text-sm transition-all"
                          style={{
                            background: bg,
                            border: `1px solid ${border}`,
                            color,
                          }}
                          data-ocid="partner_wallet.radio"
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!quizSubmitted ? (
                <Button
                  className="w-full"
                  disabled={quizAnswers.some((a) => a === null)}
                  onClick={submitSecurityQuiz}
                  style={{ background: "oklch(0.52 0.15 195)" }}
                  data-ocid="partner_wallet.submit_button"
                >
                  Soumettre les r\u00e9ponses
                </Button>
              ) : quizPassed ? (
                <Button
                  className="w-full"
                  onClick={activateWallet}
                  style={{ background: "oklch(0.50 0.15 145)" }}
                  data-ocid="partner_wallet.primary_button"
                >
                  <ShieldCheck size={16} className="mr-2" />
                  Activer le Wallet Partenaire
                </Button>
              ) : (
                <div className="space-y-3">
                  <div
                    className="rounded-xl p-3 text-sm text-center"
                    style={{
                      background: "oklch(0.22 0.08 20 / 0.4)",
                      color: "oklch(0.70 0.12 20)",
                    }}
                    data-ocid="partner_wallet.error_state"
                  >
                    Score insuffisant. Revoyez les r\u00e9ponses correctes et
                    r\u00e9essayez.
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white/70"
                    onClick={() => {
                      setQuizAnswers(new Array(5).fill(null));
                      setQuizSubmitted(false);
                      setQuizPassed(false);
                    }}
                  >
                    R\u00e9essayer le quiz
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-5 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.22 0.08 145 / 0.5)" }}
              >
                <ShieldCheck
                  size={48}
                  style={{ color: "oklch(0.65 0.15 145)" }}
                />
              </motion.div>
              <div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: "oklch(0.70 0.15 145)" }}
                >
                  Wallet Partenaire Activ\u00e9 \u2713
                </h3>
                <p className="text-white/60 text-sm mt-1">{partnerName}</p>
              </div>
              {finalAddress && (
                <div
                  className="rounded-xl p-3 font-mono text-sm"
                  style={{
                    background: "oklch(0.18 0.04 220)",
                    border: "1px solid oklch(0.28 0.05 220)",
                    color: "oklch(0.77 0.13 85)",
                  }}
                >
                  {finalAddress.slice(0, 6)}...{finalAddress.slice(-6)}
                </div>
              )}
              <div
                className="rounded-xl p-4 text-sm text-left"
                style={{
                  background: "oklch(0.18 0.06 195 / 0.3)",
                  border: "1px solid oklch(0.40 0.12 195 / 0.4)",
                  color: "oklch(0.75 0.08 195)",
                }}
              >
                <Lock size={14} className="inline mr-2" />
                KongoKash ne stocke jamais vos cl\u00e9s priv\u00e9es. Ce wallet
                vous appartient exclusivement.
              </div>
              <Button
                className="w-full"
                onClick={onClose}
                style={{ background: "oklch(0.52 0.15 195)" }}
                data-ocid="partner_wallet.primary_button"
              >
                Acc\u00e9der au Wallet
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface PartnerWalletDialogProps {
  partnerId: string;
  partnerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PartnerWalletDialog({
  partnerId,
  partnerName,
  open,
  onOpenChange,
}: PartnerWalletDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          background: "oklch(0.12 0.03 220)",
          border: "1px solid oklch(0.25 0.04 220)",
          color: "white",
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-base font-bold flex items-center gap-2"
            style={{ color: "oklch(0.77 0.13 85)" }}
          >
            <Lock size={16} />
            Configuration du Wallet Partenaire
          </DialogTitle>
        </DialogHeader>
        <PartnerWalletSetup
          partnerId={partnerId}
          partnerName={partnerName}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
