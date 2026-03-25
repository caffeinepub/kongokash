import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Phone,
  Smartphone,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { MobileMoneyRequest } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return (
      <Badge style={{ background: "oklch(0.52 0.12 160)", color: "white" }}>
        <CheckCircle size={10} className="mr-1" /> Approuvé
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge style={{ background: "oklch(0.55 0.22 27)", color: "white" }}>
        <XCircle size={10} className="mr-1" /> Rejeté
      </Badge>
    );
  return (
    <Badge style={{ background: "oklch(0.67 0.15 55)", color: "white" }}>
      <Clock size={10} className="mr-1" /> En attente
    </Badge>
  );
}

function OperatorCard({
  operator,
  selected,
  onClick,
}: {
  operator: "airtel" | "mpesa";
  selected: boolean;
  onClick: () => void;
}) {
  const isAirtel = operator === "airtel";
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
      style={{
        borderColor: selected
          ? isAirtel
            ? "oklch(0.55 0.22 27)"
            : "oklch(0.52 0.12 160)"
          : "oklch(0.85 0.02 220)",
        background: selected
          ? isAirtel
            ? "oklch(0.55 0.22 27 / 0.07)"
            : "oklch(0.52 0.12 160 / 0.07)"
          : "transparent",
      }}
      data-ocid={`mobilemoney.${operator}_button`}
    >
      <span className="text-2xl">{isAirtel ? "🔴" : "🟢"}</span>
      <div>
        <div className="font-semibold text-sm">
          {isAirtel ? "Airtel Money" : "M-Pesa"}
        </div>
        <div className="text-xs text-muted-foreground">
          {isAirtel ? "Numéro 09X XXX XXXX" : "Numéro 08X XXX XXXX"}
        </div>
      </div>
      {selected && (
        <CheckCircle
          size={16}
          className="ml-auto"
          style={{
            color: isAirtel ? "oklch(0.55 0.22 27)" : "oklch(0.52 0.12 160)",
          }}
        />
      )}
    </button>
  );
}

function RequestsList({ requests }: { requests: MobileMoneyRequest[] }) {
  if (requests.length === 0)
    return (
      <div
        className="text-center py-8 text-muted-foreground"
        data-ocid="mobilemoney.empty_state"
      >
        <Smartphone size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">Aucune demande pour le moment</p>
      </div>
    );

  return (
    <div className="space-y-2 mt-4" data-ocid="mobilemoney.list">
      <h4 className="text-sm font-semibold text-muted-foreground">
        Mes demandes récentes
      </h4>
      {requests.slice(0, 5).map((req, i) => (
        <div
          key={req.id.toString()}
          className="flex items-center justify-between p-3 rounded-lg border text-sm"
          style={{ background: "oklch(0.97 0.005 220)" }}
          data-ocid={`mobilemoney.item.${i + 1}`}
        >
          <div className="flex items-center gap-2">
            <span>{req.operator === "airtel" ? "🔴" : "🟢"}</span>
            <div>
              <div className="font-medium">
                {req.txType === "deposit" ? "Dépôt" : "Retrait"} —{" "}
                {new Intl.NumberFormat("fr-FR").format(req.amountCdf)} FC
              </div>
              <div className="text-xs text-muted-foreground">
                {req.phone} · {formatDate(req.timestamp)}
              </div>
            </div>
          </div>
          <StatusBadge status={req.status} />
        </div>
      ))}
    </div>
  );
}

function DepositTab() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const [operator, setOperator] = useState<"airtel" | "mpesa">("airtel");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: myRequests = [] } = useQuery({
    queryKey: ["myMobileMoneyRequests"],
    queryFn: () => actor!.getMyMobileMoneyRequests(),
    enabled: !!actor && !isFetching && !!identity,
  });

  const depositMutation = useMutation({
    mutationFn: () =>
      actor!.submitMobileMoneyDeposit(phone, operator, Number(amount)),
    onSuccess: () => {
      toast.success("Demande de dépôt soumise!");
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["myMobileMoneyRequests"] });
    },
    onError: () => toast.error("Erreur lors de la soumission"),
  });

  const handleSubmit = () => {
    if (!identity) {
      toast.error("Connectez-vous d'abord");
      return;
    }
    if (!phone) {
      toast.error("Entrez un numéro de téléphone");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Entrez un montant valide");
      return;
    }
    depositMutation.mutate();
  };

  const depositRequests = myRequests.filter((r) => r.txType === "deposit");

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 space-y-4"
        data-ocid="mobilemoney.success_state"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "oklch(0.77 0.13 85 / 0.15)" }}
        >
          <Clock size={28} style={{ color: "oklch(0.67 0.15 55)" }} />
        </div>
        <div>
          <Badge
            className="mb-3 px-4 py-1 text-sm"
            style={{
              background: "oklch(0.77 0.13 85)",
              color: "oklch(0.20 0.01 250)",
            }}
          >
            En attente de confirmation
          </Badge>
          <h3 className="font-bold text-lg mt-2">Demande envoyée ✓</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Votre demande de dépôt de{" "}
            <strong>
              {new Intl.NumberFormat("fr-FR").format(Number(amount))} FC
            </strong>{" "}
            via{" "}
            <strong>{operator === "airtel" ? "Airtel Money" : "M-Pesa"}</strong>{" "}
            a été soumise. L'administrateur créditera votre portefeuille CDF
            dans <strong>15 à 30 minutes</strong>.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setAmount("");
            setPhone("");
          }}
          data-ocid="mobilemoney.secondary_button"
        >
          Nouvelle demande
        </Button>
        <RequestsList requests={depositRequests} />
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Opérateur</Label>
        <div className="flex gap-3">
          <OperatorCard
            operator="airtel"
            selected={operator === "airtel"}
            onClick={() => setOperator("airtel")}
          />
          <OperatorCard
            operator="mpesa"
            selected={operator === "mpesa"}
            onClick={() => setOperator("mpesa")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deposit-phone">Numéro de téléphone</Label>
        <div className="relative">
          <Phone
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="deposit-phone"
            className="pl-9"
            placeholder="09X XXX XXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-ocid="mobilemoney.input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deposit-amount">Montant (CDF)</Label>
        <div className="relative">
          <Input
            id="deposit-amount"
            type="number"
            placeholder="Ex: 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-ocid="mobilemoney.input"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
            FC
          </span>
        </div>
      </div>

      {!identity && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            background: "oklch(0.77 0.13 85 / 0.1)",
            color: "oklch(0.55 0.13 75)",
          }}
        >
          ⚠️ Connectez-vous pour effectuer des dépôts
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={depositMutation.isPending || !identity}
        className="w-full font-semibold"
        style={{ background: "oklch(0.55 0.22 27)", color: "white" }}
        data-ocid="mobilemoney.submit_button"
      >
        {depositMutation.isPending ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" /> Traitement...
          </>
        ) : (
          "🔴 Déposer via Mobile Money"
        )}
      </Button>

      <RequestsList requests={depositRequests} />
    </div>
  );
}

function WithdrawalTab() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const [operator, setOperator] = useState<"airtel" | "mpesa">("airtel");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: myRequests = [] } = useQuery({
    queryKey: ["myMobileMoneyRequests"],
    queryFn: () => actor!.getMyMobileMoneyRequests(),
    enabled: !!actor && !isFetching && !!identity,
  });

  const withdrawalMutation = useMutation({
    mutationFn: () =>
      actor!.submitMobileMoneyWithdrawal(phone, operator, Number(amount)),
    onSuccess: () => {
      toast.success("Demande de retrait soumise!");
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["myMobileMoneyRequests"] });
    },
    onError: () => toast.error("Erreur lors de la soumission"),
  });

  const handleSubmit = () => {
    if (!identity) {
      toast.error("Connectez-vous d'abord");
      return;
    }
    if (!phone) {
      toast.error("Entrez un numéro de téléphone");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Entrez un montant valide");
      return;
    }
    withdrawalMutation.mutate();
  };

  const withdrawalRequests = myRequests.filter(
    (r) => r.txType === "withdrawal",
  );

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 space-y-4"
        data-ocid="mobilemoney.success_state"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "oklch(0.52 0.12 160 / 0.15)" }}
        >
          <Clock size={28} style={{ color: "oklch(0.52 0.12 160)" }} />
        </div>
        <div>
          <Badge
            className="mb-3 px-4 py-1 text-sm"
            style={{
              background: "oklch(0.77 0.13 85)",
              color: "oklch(0.20 0.01 250)",
            }}
          >
            En attente de confirmation
          </Badge>
          <h3 className="font-bold text-lg mt-2">
            Retrait en cours de traitement ✓
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Votre demande de retrait de{" "}
            <strong>
              {new Intl.NumberFormat("fr-FR").format(Number(amount))} FC
            </strong>{" "}
            vers <strong>{phone}</strong> (
            {operator === "airtel" ? "Airtel Money" : "M-Pesa"}) est en cours.
            Vous recevrez l'argent dans <strong>15 à 30 minutes</strong>.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setAmount("");
            setPhone("");
          }}
          data-ocid="mobilemoney.secondary_button"
        >
          Nouveau retrait
        </Button>
        <RequestsList requests={withdrawalRequests} />
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Opérateur</Label>
        <div className="flex gap-3">
          <OperatorCard
            operator="airtel"
            selected={operator === "airtel"}
            onClick={() => setOperator("airtel")}
          />
          <OperatorCard
            operator="mpesa"
            selected={operator === "mpesa"}
            onClick={() => setOperator("mpesa")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="withdrawal-phone">Numéro de téléphone</Label>
        <div className="relative">
          <Phone
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="withdrawal-phone"
            className="pl-9"
            placeholder="09X XXX XXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-ocid="mobilemoney.input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="withdrawal-amount">Montant (CDF)</Label>
        <div className="relative">
          <Input
            id="withdrawal-amount"
            type="number"
            placeholder="Ex: 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-ocid="mobilemoney.input"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
            FC
          </span>
        </div>
      </div>

      <div
        className="flex items-start gap-2 p-3 rounded-lg text-sm"
        style={{
          background: "oklch(0.55 0.22 27 / 0.08)",
          color: "oklch(0.45 0.18 27)",
        }}
      >
        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
        <span>
          Le montant sera prélevé <strong>immédiatement</strong> de votre
          portefeuille CDF lors de la validation.
        </span>
      </div>

      {!identity && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            background: "oklch(0.77 0.13 85 / 0.1)",
            color: "oklch(0.55 0.13 75)",
          }}
        >
          ⚠️ Connectez-vous pour effectuer des retraits
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={withdrawalMutation.isPending || !identity}
        className="w-full font-semibold"
        style={{ background: "oklch(0.52 0.12 160)", color: "white" }}
        data-ocid="mobilemoney.submit_button"
      >
        {withdrawalMutation.isPending ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" /> Traitement...
          </>
        ) : (
          "Retirer vers Mobile Money"
        )}
      </Button>

      <RequestsList requests={withdrawalRequests} />
    </div>
  );
}

export default function MobileMoneySection() {
  return (
    <section id="mobilemoney" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{
                  background: "oklch(0.52 0.12 160 / 0.12)",
                  color: "oklch(0.38 0.1 160)",
                }}
              >
                <Smartphone size={12} />
                Nouveau
              </div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl">
                Paiements{" "}
                <span style={{ color: "oklch(0.27 0.07 195)" }}>
                  Mobile Money
                </span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Déposez des Francs Congolais ou retirez vers votre compte mobile
                via Airtel Money ou M-Pesa. Simple, rapide et sécurisé.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: "🔴",
                  name: "Airtel Money",
                  desc: "Réseau Airtel Congo",
                  detail: "09X XXX XXXX",
                },
                {
                  icon: "🟢",
                  name: "M-Pesa",
                  desc: "Réseau Vodacom Congo",
                  detail: "08X XXX XXXX",
                },
              ].map((op) => (
                <div
                  key={op.name}
                  className="flex items-center gap-4 p-4 rounded-xl border"
                  style={{ background: "oklch(0.97 0.005 220)" }}
                >
                  <span className="text-3xl">{op.icon}</span>
                  <div>
                    <div className="font-semibold">{op.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {op.desc}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground mt-0.5">
                      {op.detail}
                    </div>
                  </div>
                  <Badge
                    className="ml-auto text-xs"
                    style={{
                      background: "oklch(0.52 0.12 160 / 0.12)",
                      color: "oklch(0.38 0.1 160)",
                    }}
                  >
                    Actif
                  </Badge>
                </div>
              ))}
            </div>

            <div
              className="p-4 rounded-xl border-l-4"
              style={{
                background: "oklch(0.52 0.12 160 / 0.06)",
                borderColor: "oklch(0.52 0.12 160)",
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: "oklch(0.38 0.1 160)" }}
              >
                ⏱ Délai de traitement
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Les dépôts et retraits sont traités par l'administrateur en 15 à
                30 minutes. Vous recevrez une confirmation une fois validé.
              </p>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card
              className="shadow-card-lg border"
              data-ocid="mobilemoney.card"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone
                    size={18}
                    style={{ color: "oklch(0.27 0.07 195)" }}
                  />
                  Mobile Money
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="deposit">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="deposit" data-ocid="mobilemoney.tab">
                      💰 Dépôt
                    </TabsTrigger>
                    <TabsTrigger value="withdrawal" data-ocid="mobilemoney.tab">
                      📤 Retrait
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="deposit">
                    <DepositTab />
                  </TabsContent>
                  <TabsContent value="withdrawal">
                    <WithdrawalTab />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
