import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Copy, Gift, Link, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useApplyReferralCode,
  useReferralCode,
  useReferralRewards,
  useReferralStats,
} from "../hooks/useReferral";

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl text-center"
      style={{ background: `${color} / 0.08` }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
        style={{ background: color, color: "white" }}
      >
        {icon}
      </div>
      <div className="font-bold text-xl font-display">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export default function ReferralSection() {
  const { data: referralCode, isLoading: codeLoading } = useReferralCode();
  const { data: stats, isLoading: statsLoading } = useReferralStats();
  const { data: totalRewards } = useReferralRewards();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralLink = referralCode
    ? `https://kongokash.cd?ref=${referralCode}`
    : "";

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
      toast.success("Copié dans le presse-papiers !");
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const totalOkpEarned =
    Number(totalRewards ?? 0) + (stats?.totalOkpEarned ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-display font-bold text-xl flex items-center gap-2">
          <Gift size={20} style={{ color: "oklch(0.77 0.13 85)" }} />
          Système de Parrainage
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          Invitez vos amis et recevez un bonus de bienvenue OKP — financé par la
          réserve Communauté, pas par les autres utilisateurs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Mon code de parrainage */}
        <Card className="shadow-card" data-ocid="referral.card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Gift size={15} style={{ color: "oklch(0.77 0.13 85)" }} />
              Mon Code de Parrainage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {codeLoading ? (
              <div className="space-y-2" data-ocid="referral.loading_state">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : (
              <>
                {/* Large referral code display */}
                <div
                  className="flex items-center justify-between p-4 rounded-xl border-2"
                  style={{
                    borderColor: "oklch(0.77 0.13 85)",
                    background: "oklch(0.77 0.13 85 / 0.06)",
                  }}
                >
                  <span
                    className="font-display font-bold text-2xl tracking-widest"
                    style={{ color: "oklch(0.27 0.07 195)" }}
                  >
                    {referralCode || "KONGO-XXX"}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      referralCode && copyToClipboard(referralCode, "code")
                    }
                    data-ocid="referral.button"
                  >
                    <AnimatePresence mode="wait">
                      {copiedCode ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check
                            size={16}
                            style={{ color: "oklch(0.52 0.12 160)" }}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Copy size={16} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>

                {/* Referral link */}
                <div>
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Link size={11} />
                    Lien de parrainage
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 text-xs font-mono px-3 py-2 rounded-lg truncate"
                      style={{ background: "oklch(0.97 0.005 220)" }}
                    >
                      {referralLink || "https://kongokash.cd?ref=..."}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() =>
                        referralLink && copyToClipboard(referralLink, "link")
                      }
                      data-ocid="referral.secondary_button"
                    >
                      {copiedLink ? (
                        <Check
                          size={14}
                          style={{ color: "oklch(0.52 0.12 160)" }}
                        />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Reward info */}
                <div
                  className="text-xs p-3 rounded-lg"
                  style={{
                    background: "oklch(0.52 0.12 160 / 0.08)",
                    color: "oklch(0.27 0.07 195)",
                  }}
                >
                  🎁 <strong>+100 OKP</strong> pour vous et votre filleul à
                  l’activation du compte
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Source : Allocation Communauté congolaise (250M OKP réservés
                  pour l'adoption locale)
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="shadow-card" data-ocid="referral.card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users size={15} style={{ color: "oklch(0.52 0.12 160)" }} />
              Statistiques de Parrainage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div
                className="grid grid-cols-3 gap-3"
                data-ocid="referral.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  label="Parrainés"
                  value={Number(stats?.totalReferred ?? 0)}
                  icon={<Users size={16} />}
                  color="oklch(0.52 0.12 160)"
                />
                <StatCard
                  label="Activés"
                  value={Number(stats?.activated ?? 0)}
                  icon={<Check size={16} />}
                  color="oklch(0.55 0.15 145)"
                />
                <StatCard
                  label="OKP gagnés"
                  value={totalOkpEarned.toFixed(0)}
                  icon={
                    <img
                      src="/assets/generated/okapi-token-logo-transparent.dim_400x400.png"
                      className="w-5 h-5"
                      alt="OKP"
                    />
                  }
                  color="oklch(0.77 0.13 85)"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Referred users list */}
      <Card className="shadow-card" data-ocid="referral.card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users size={15} style={{ color: "oklch(0.52 0.12 160)" }} />
            Mes Filleuls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="space-y-3" data-ocid="referral.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : stats?.referrals && stats.referrals.length > 0 ? (
            <div className="space-y-3">
              {stats.referrals.map((ref, i) => {
                const joinDate = ref.referredAt
                  ? new Date(Number(ref.referredAt) / 1_000_000)
                  : new Date();
                return (
                  <motion.div
                    key={ref.referredUser.toString()}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ borderColor: "oklch(0.90 0.01 220)" }}
                    data-ocid={`referral.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{
                          background: "oklch(0.52 0.12 160 / 0.12)",
                          color: "oklch(0.52 0.12 160)",
                        }}
                      >
                        #{i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          Filleul #{i + 1}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Inscrit le{" "}
                          {joinDate.toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "oklch(0.77 0.13 85)" }}
                      >
                        +{ref.rewardAmount} OKP
                      </span>
                      <Badge
                        variant={ref.activated ? "default" : "secondary"}
                        style={
                          ref.activated
                            ? {
                                background: "oklch(0.55 0.15 145)",
                                color: "white",
                              }
                            : {}
                        }
                      >
                        {ref.activated ? "Actif" : "En attente"}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="referral.empty_state"
            >
              <Users size={40} className="mx-auto mb-3 opacity-25" />
              <p className="text-sm font-medium">
                Aucun filleul pour l’instant
              </p>
              <p className="text-xs mt-1">
                Partagez votre code pour commencer à gagner des OKP !
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ────────────────────────────────────────────────
   Small inline card shown when user has no referredBy
   Used in Dashboard.tsx
──────────────────────────────────────────────── */
export function ApplyReferralCard() {
  const applyCode = useApplyReferralCode();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);

  if (applied) return null;

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error("Veuillez entrer un code de parrainage");
      return;
    }
    try {
      const result = await applyCode.mutateAsync(code.trim());
      if (result.success) {
        toast.success(
          "Code de parrainage appliqué ! +50 OKP ajoutés à votre portefeuille 🎉",
        );
        setApplied(true);
      } else {
        toast.error(result.message || "Code invalide ou déjà utilisé");
      }
    } catch {
      toast.error("Erreur lors de l'application du code");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card
        className="shadow-card border-2"
        style={{ borderColor: "oklch(0.77 0.13 85 / 0.4)" }}
        data-ocid="referral.card"
      >
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "oklch(0.77 0.13 85)", color: "white" }}
            >
              <Gift size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                Avez-vous un code de parrainage ?
              </p>
              <p className="text-xs text-muted-foreground">
                Appliquez-le pour recevoir +50 OKP de bienvenue
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="Ex: KONGO-ABC"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-sm uppercase h-9 tracking-wider"
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                data-ocid="referral.input"
              />
              <Button
                size="sm"
                onClick={handleApply}
                disabled={applyCode.isPending}
                style={{
                  background: "oklch(0.77 0.13 85)",
                  color: "oklch(0.20 0.01 250)",
                }}
                data-ocid="referral.submit_button"
              >
                {applyCode.isPending ? "..." : "Appliquer"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
