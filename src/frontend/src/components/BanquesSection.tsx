import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  CheckCircle2,
  ClipboardCopy,
  Lock,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import AuthModal from "./AuthModal";

const banques = [
  {
    id: "rawbank",
    nom: "Rawbank",
    logo: "🏦",
    description:
      "Informations publiques. Les coordonnées de virement seront disponibles prochainement.",
    couleur: "oklch(0.27 0.07 195)",
    badge: "Recommandé",
    infos: [
      { label: "Code SWIFT", valeur: "RAWBCDKIXXX" },
      { label: "Réseau", valeur: "Kinshasa + Provinces" },
      { label: "Délai", valeur: "2–24 heures" },
    ],
    coordonnees: undefined as { label: string; valeur: string }[] | undefined,
  },
  {
    id: "tmb",
    nom: "TMB (Trust Merchant Bank)",
    logo: "🏦",
    description:
      "Informations publiques. Les coordonnées de virement seront disponibles prochainement.",
    couleur: "oklch(0.45 0.14 50)",
    badge: null,
    infos: [
      { label: "Code SWIFT", valeur: "TMBKCDKIXXX" },
      { label: "Réseau", valeur: "Nationwide" },
      { label: "Délai", valeur: "2–24 heures" },
    ],
    coordonnees: undefined as { label: string; valeur: string }[] | undefined,
  },
  {
    id: "equitybcdc",
    nom: "Equity BCDC",
    logo: "🏦",
    description:
      "Banque principale de KongoKash. Partenaire solide avec services digitaux avancés. Virement depuis l'app Equity Bank.",
    couleur: "oklch(0.52 0.16 145)",
    badge: "Banque Principale",
    infos: [
      { label: "Code SWIFT", valeur: "BCDCCDKIXXX" },
      { label: "Réseau", valeur: "Kinshasa & Lubumbashi" },
      { label: "Délai", valeur: "2–48 heures" },
    ],
    coordonnees: [
      { label: "Nom du bénéficiaire", valeur: "KongoKash S.A.S.U" },
      { label: "Numéro de compte", valeur: "CD78 0016 0000 0100 0001 2345" },
      { label: "Code SWIFT", valeur: "BCDCCDKIXXX" },
      { label: "Agence", valeur: "Equity BCDC Gombe, Avenue Colonel Ebeya" },
    ] as { label: string; valeur: string }[],
  },
];

type Step = "idle" | "auth" | "kyc" | "revealed";

const KYC_STORAGE_KEY = "kongokash_kyc_verified";

function isKycVerified(): boolean {
  try {
    return localStorage.getItem(KYC_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function setKycVerified() {
  try {
    localStorage.setItem(KYC_STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}

interface CoordonneesDialogProps {
  banque: (typeof banques)[0] | null;
  onClose: () => void;
}

function CoordonneesDialog({ banque, onClose }: CoordonneesDialogProps) {
  const { identity, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const [step, setStep] = useState<Step>(() => {
    if (!identity) return "auth";
    if (!isKycVerified()) return "kyc";
    return "revealed";
  });
  const [kycNom, setKycNom] = useState("");
  const [kycTel, setKycTel] = useState("");
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycIdDocument, setKycIdDocument] = useState("");
  const [kycSelfie, setKycSelfie] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  const paymentRefRef = useRef<string>(
    `KK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  );

  useEffect(() => {
    if (identity && step === "auth") {
      if (isKycVerified()) {
        setStep("revealed");
      } else {
        setStep("kyc");
      }
    }
  }, [identity, step]);

  const handleLoginClick = () => {
    setAuthOpen(true);
  };

  const handleAuthClose = () => {
    setAuthOpen(false);
    if (identity) {
      if (isKycVerified()) {
        setStep("revealed");
      } else {
        setStep("kyc");
      }
    } else {
      setTimeout(() => {
        const el = document.querySelector("[data-identity-check]");
        if (el) (el as HTMLElement).click();
      }, 300);
    }
  };

  const handleIdentityCheck = () => {
    if (identity) {
      if (isKycVerified()) {
        setStep("revealed");
      } else {
        setStep("kyc");
      }
    }
  };

  const handleKycSubmit = async () => {
    if (!kycNom.trim() || !kycTel.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setKycSubmitting(true);
    try {
      if (actor) {
        await (actor as any).submitKyc(
          kycNom,
          kycTel,
          kycIdDocument,
          kycSelfie,
        );
      }
      setKycVerified();
      setStep("revealed");
      toast.success("Vérification réussie ! Accès accordé.");
    } catch (_err) {
      toast.error("Erreur lors de la vérification. Veuillez réessayer.");
    } finally {
      setKycSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!banque?.coordonnees) return;
    let text = banque.coordonnees
      .map((c) => `${c.label}: ${c.valeur}`)
      .join("\n");
    if (banque.id === "equitybcdc") {
      text += `\nRéférence de paiement: ${paymentRefRef.current}`;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Coordonnées copiées !"))
      .catch(() => toast.error("Erreur lors de la copie"));
  };

  return (
    <>
      <Dialog open={!!banque} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock size={18} style={{ color: "oklch(0.27 0.07 195)" }} />
              {banque?.nom} — Coordonnées bancaires
            </DialogTitle>
          </DialogHeader>

          {step === "auth" && (
            <div className="space-y-4 py-2">
              <div
                className="rounded-xl p-4 text-sm text-center space-y-1"
                style={{ background: "oklch(0.95 0.01 200)" }}
              >
                <div className="text-lg mb-2">🔒</div>
                <p className="font-semibold">Accès restreint</p>
                <p className="text-muted-foreground">
                  Vous devez être connecté pour accéder aux coordonnées
                  bancaires complètes.
                </p>
              </div>
              <button
                type="button"
                data-identity-check
                onClick={handleIdentityCheck}
                className="hidden"
              />
              <Button
                className="w-full"
                style={{ background: "oklch(0.27 0.07 195)" }}
                onClick={handleLoginClick}
                disabled={isLoggingIn}
                data-ocid="banque.auth.primary_button"
              >
                Se connecter / S'inscrire
              </Button>
              {identity && (
                <button
                  type="button"
                  className="hidden"
                  onClick={handleIdentityCheck}
                />
              )}
            </div>
          )}

          {step === "kyc" && (
            <div className="space-y-4 py-2">
              <div
                className="rounded-xl p-4 text-sm space-y-1"
                style={{ background: "oklch(0.95 0.01 200)" }}
              >
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <ShieldCheck
                    size={16}
                    style={{ color: "oklch(0.52 0.16 145)" }}
                  />
                  Vérification d'identité (KYC)
                </div>
                <p className="text-muted-foreground text-xs">
                  Pour votre sécurité, veuillez confirmer vos informations avant
                  d'accéder aux coordonnées bancaires.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="kyc-nom">
                    Nom complet{" "}
                    <span className="text-destructive text-xs">*</span>
                  </Label>
                  <Input
                    id="kyc-nom"
                    placeholder="Ex: Jean-Paul Mbeki"
                    value={kycNom}
                    onChange={(e) => setKycNom(e.target.value)}
                    data-ocid="kyc.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="kyc-tel">
                    Numéro de téléphone{" "}
                    <span className="text-destructive text-xs">*</span>
                  </Label>
                  <Input
                    id="kyc-tel"
                    placeholder="Ex: +243 81 234 5678"
                    value={kycTel}
                    onChange={(e) => setKycTel(e.target.value)}
                    data-ocid="kyc.textarea"
                  />
                </div>
              </div>

              <div
                className="rounded-xl border border-dashed p-4 space-y-3"
                style={{ borderColor: "oklch(0.80 0.03 200)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Vérification avancée (optionnelle)
                  </span>
                  <Badge
                    className="text-xs font-medium px-2 py-0.5 text-white"
                    style={{ background: "oklch(0.52 0.16 145)" }}
                  >
                    Actif
                  </Badge>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Pièce d'identité
                  </Label>
                  <label
                    className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors"
                    style={{
                      borderColor: "oklch(0.72 0.08 200)",
                    }}
                  >
                    <Upload size={12} />
                    {kycIdDocument
                      ? "Photo sélectionnée ✓"
                      : "Choisir une photo (optionnel)"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) =>
                          setKycIdDocument((ev.target?.result as string) ?? "");
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  {kycIdDocument && (
                    <img
                      src={kycIdDocument}
                      alt="Pièce d'identité"
                      className="mt-1 h-20 w-auto rounded-md border object-cover"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Selfie de vérification
                  </Label>
                  <label
                    className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors"
                    style={{
                      borderColor: "oklch(0.72 0.08 200)",
                    }}
                  >
                    <Camera size={12} />
                    {kycSelfie
                      ? "Selfie sélectionné ✓"
                      : "Prendre un selfie (optionnel)"}
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) =>
                          setKycSelfie((ev.target?.result as string) ?? "");
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  {kycSelfie && (
                    <img
                      src={kycSelfie}
                      alt="Selfie"
                      className="mt-1 h-20 w-auto rounded-md border object-cover"
                    />
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                style={{ background: "oklch(0.52 0.16 145)" }}
                onClick={handleKycSubmit}
                disabled={kycSubmitting}
                data-ocid="kyc.submit_button"
              >
                {kycSubmitting
                  ? "Vérification en cours..."
                  : "Vérifier mon identité"}
              </Button>
            </div>
          )}

          {step === "revealed" && banque?.coordonnees && (
            <div className="space-y-4 py-2">
              <div
                className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg"
                style={{
                  background: "oklch(0.94 0.05 145)",
                  color: "oklch(0.35 0.12 145)",
                }}
              >
                <CheckCircle2 size={16} />
                Identité vérifiée — accès accordé
              </div>

              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: "oklch(0.96 0.005 220)" }}
              >
                {banque.coordonnees.map((c) => (
                  <div
                    key={c.label}
                    className="flex justify-between text-sm gap-2"
                  >
                    <span className="text-muted-foreground shrink-0">
                      {c.label}
                    </span>
                    <span className="font-mono font-semibold text-right">
                      {c.valeur}
                    </span>
                  </div>
                ))}

                {banque.id === "equitybcdc" && (
                  <>
                    <div
                      className="border-t pt-3 mt-1"
                      style={{ borderColor: "oklch(0.88 0.02 200)" }}
                    />
                    <div className="flex justify-between text-sm gap-2 items-start">
                      <span className="text-muted-foreground shrink-0">
                        Référence de paiement
                      </span>
                      <div className="text-right">
                        <span
                          className="font-mono font-bold text-base tracking-widest px-2 py-0.5 rounded"
                          style={{
                            background: "oklch(0.92 0.06 145)",
                            color: "oklch(0.35 0.14 145)",
                          }}
                        >
                          {paymentRefRef.current}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          À inclure dans la communication du virement
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleCopy}
                data-ocid="banque.copy.button"
              >
                <ClipboardCopy size={16} />
                Copier les coordonnées
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AuthModal open={authOpen} onClose={handleAuthClose} defaultTab="login" />
    </>
  );
}

export default function BanquesSection() {
  const [selectedBanque, setSelectedBanque] = useState<
    (typeof banques)[0] | null
  >(null);

  return (
    <section
      id="banques"
      className="py-16"
      style={{ background: "oklch(0.97 0.005 220)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-bold text-3xl lg:text-4xl mb-3">
            Banques{" "}
            <span style={{ color: "oklch(0.27 0.07 195)" }}>Partenaires</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Effectuez vos virements bancaires via l'une de nos banques
            partenaires agréées en République Démocratique du Congo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {banques.map((banque, i) => (
            <motion.div
              key={banque.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full border hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 flex flex-col gap-4 h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{
                          background: `${banque.couleur} / 0.12`,
                          border: `1.5px solid ${banque.couleur}`,
                        }}
                      >
                        {banque.logo}
                      </div>
                      <div>
                        <div className="font-bold text-base leading-tight">
                          {banque.nom}
                        </div>
                        {banque.badge && (
                          <Badge
                            className="text-xs mt-0.5 text-white"
                            style={{ background: banque.couleur }}
                          >
                            {banque.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {banque.description}
                  </p>

                  {/* Infos publiques */}
                  <div
                    className="rounded-xl p-4 space-y-2"
                    style={{ background: "oklch(0.95 0.005 220)" }}
                  >
                    {banque.infos.map((info) => (
                      <div
                        key={info.label}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {info.label}
                        </span>
                        <span className="font-mono font-semibold">
                          {info.valeur}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bouton coordonnées — Equity BCDC uniquement */}
                  {banque.id === "equitybcdc" ? (
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2 text-sm font-medium"
                      style={{
                        borderColor: banque.couleur,
                        color: banque.couleur,
                      }}
                      onClick={() => setSelectedBanque(banque)}
                      data-ocid="banque.open_modal_button"
                    >
                      <Lock size={14} />
                      Obtenir les coordonnées bancaires
                    </Button>
                  ) : (
                    <div
                      className="rounded-lg px-4 py-2 text-xs text-center text-muted-foreground"
                      style={{ background: "oklch(0.95 0.005 220)" }}
                    >
                      🔒 Coordonnées disponibles prochainement
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 p-5 rounded-2xl border text-sm text-center"
          style={{
            background: "oklch(0.97 0.005 220)",
            borderColor: "oklch(0.85 0.02 200)",
          }}
        >
          <span
            className="font-semibold"
            style={{ color: "oklch(0.27 0.07 195)" }}
          >
            Comment payer par virement ?
          </span>{" "}
          Choisissez la méthode <strong>Virement Bancaire</strong> dans le
          formulaire d'achat, sélectionnez votre banque, puis suivez les
          instructions affichées pour compléter le virement depuis votre agence
          ou appli bancaire.
        </motion.div>
      </div>

      <CoordonneesDialog
        banque={selectedBanque}
        onClose={() => setSelectedBanque(null)}
      />
    </section>
  );
}
