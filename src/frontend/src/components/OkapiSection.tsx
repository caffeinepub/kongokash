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
  BarChart3,
  Gift,
  Loader2,
  Lock,
  Send,
  ShoppingBag,
  Unlock,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useClaimDailyReward,
  useOkpAdminStats,
  useOkpBalance,
  useOkpToCdfRate,
  usePayMerchantOkp,
  useStakeOkp,
  useStakes,
  useTransferOkp,
  useUnstakeOkp,
} from "../hooks/useOkpQueries";

const OKP_COLOR = "oklch(0.65 0.18 35)";
const OKP_BG = "oklch(0.65 0.18 35 / 0.1)";

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
            <span className="text-4xl">🦏</span>
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
            className="grid grid-cols-5 w-full max-w-2xl mx-auto mb-8"
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
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: OKP_BG }}
                      >
                        🦏
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
                            Réduits grâce à OKP 🦏
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
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
