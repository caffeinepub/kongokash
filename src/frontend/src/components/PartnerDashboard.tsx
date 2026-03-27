import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  DollarSign,
  DoorOpen,
  Filter,
  TrendingUp,
  Unlock,
  Wallet,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type AcknowledgmentData,
  loadAcknowledgment,
} from "../lib/reservationAcknowledgment";
import WithdrawalGateway, { WithdrawalHistory } from "./WithdrawalGateway";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "released"
  | "paid";

interface PartnerReservation {
  id: string;
  code: string;
  clientName: string;
  service: string;
  checkIn: string;
  checkOut: string;
  amountOKP: number;
  amountCDF: number;
  status: ReservationStatus;
}

interface Payment {
  id: string;
  reservationCode: string;
  clientName: string;
  amountOKP: number;
  amountCDF: number;
  releasedAt: string;
  status: "received" | "pending";
}

type NotifType = "payment" | "reservation" | "release";

interface PartnerNotif {
  id: string;
  type: NotifType;
  message: string;
  time: string;
  read: boolean;
}

type TransactionType = "reservation" | "escrow" | "retrait";

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: TransactionType;
  amountOKP: number;
  amountCDF: number;
  currency: "OKP" | "CDF";
  status: "completed" | "pending" | "failed";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RESERVATIONS: PartnerReservation[] = [
  {
    id: "1",
    code: "RES-KK-7823",
    clientName: "Marie Kabila",
    service: "Suite Deluxe — 2 nuits",
    checkIn: "2026-04-02",
    checkOut: "2026-04-04",
    amountOKP: 1200,
    amountCDF: 60000,
    status: "confirmed",
  },
  {
    id: "2",
    code: "RES-KK-7901",
    clientName: "Jean-Pierre Mwamba",
    service: "Chambre Standard — 1 nuit",
    checkIn: "2026-04-05",
    checkOut: "2026-04-06",
    amountOKP: 500,
    amountCDF: 25000,
    status: "pending",
  },
  {
    id: "3",
    code: "RES-KK-6644",
    clientName: "Sarah Nkosi",
    service: "Suite Junior — 3 nuits",
    checkIn: "2026-03-28",
    checkOut: "2026-03-31",
    amountOKP: 2400,
    amountCDF: 120000,
    status: "paid",
  },
  {
    id: "4",
    code: "RES-KK-5512",
    clientName: "Thomas Müller",
    service: "Visite guidée — Parc Virunga",
    checkIn: "2026-03-20",
    checkOut: "2026-03-20",
    amountOKP: 350,
    amountCDF: 17500,
    status: "cancelled",
  },
  {
    id: "5",
    code: "RES-KK-8110",
    clientName: "Amina Diallo",
    service: "Chambre Standard — 2 nuits",
    checkIn: "2026-04-10",
    checkOut: "2026-04-12",
    amountOKP: 800,
    amountCDF: 40000,
    status: "released",
  },
  {
    id: "6",
    code: "RES-KK-8221",
    clientName: "Céline Tshisekedi",
    service: "Suite Présidentielle — 4 nuits",
    checkIn: "2026-03-15",
    checkOut: "2026-03-19",
    amountOKP: 5600,
    amountCDF: 280000,
    status: "paid",
  },
];

const _MOCK_PAYMENTS: Payment[] = [
  {
    id: "p1",
    reservationCode: "RES-KK-6644",
    clientName: "Sarah Nkosi",
    amountOKP: 2400,
    amountCDF: 120000,
    releasedAt: "2026-03-31 14:22",
    status: "received",
  },
  {
    id: "p2",
    reservationCode: "RES-KK-8110",
    clientName: "Amina Diallo",
    amountOKP: 800,
    amountCDF: 40000,
    releasedAt: "2026-04-12 09:15",
    status: "received",
  },
  {
    id: "p3",
    reservationCode: "RES-KK-7823",
    clientName: "Marie Kabila",
    amountOKP: 1200,
    amountCDF: 60000,
    releasedAt: "—",
    status: "pending",
  },
  {
    id: "p4",
    reservationCode: "RES-KK-8221",
    clientName: "Céline Tshisekedi",
    amountOKP: 5600,
    amountCDF: 280000,
    releasedAt: "2026-03-20 16:40",
    status: "received",
  },
];

const MOCK_NOTIFS: PartnerNotif[] = [
  {
    id: "n1",
    type: "payment",
    message: "Paiement de 2 400 OKP libéré — Sarah Nkosi (RES-KK-6644)",
    time: "Il y a 2h",
    read: false,
  },
  {
    id: "n2",
    type: "reservation",
    message: "Nouvelle réservation reçue — Jean-Pierre Mwamba (RES-KK-7901)",
    time: "Il y a 5h",
    read: false,
  },
  {
    id: "n3",
    type: "release",
    message: "Fonds libérés automatiquement — RES-KK-8110 (800 OKP)",
    time: "Il y a 1j",
    read: true,
  },
  {
    id: "n4",
    type: "reservation",
    message: "Réservation confirmée — Marie Kabila (RES-KK-7823)",
    time: "Il y a 1j",
    read: true,
  },
  {
    id: "n5",
    type: "payment",
    message: "Paiement de 5 600 OKP libéré — Céline Tshisekedi (RES-KK-8221)",
    time: "Il y a 3j",
    read: true,
  },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    date: "31 Mar 2026, 14:22",
    description: "Paiement libéré — Sarah Nkosi",
    type: "escrow",
    amountOKP: 2400,
    amountCDF: 120000,
    currency: "OKP",
    status: "completed",
  },
  {
    id: "t2",
    date: "20 Mar 2026, 16:40",
    description: "Paiement libéré — Céline Tshisekedi",
    type: "escrow",
    amountOKP: 5600,
    amountCDF: 280000,
    currency: "OKP",
    status: "completed",
  },
  {
    id: "t3",
    date: "18 Mar 2026, 10:00",
    description: "Retrait vers Airtel Money — +243 812 345 678",
    type: "retrait",
    amountOKP: 3000,
    amountCDF: 150000,
    currency: "CDF",
    status: "completed",
  },
  {
    id: "t4",
    date: "10 Mar 2026, 08:30",
    description: "Réservation reçue — Thomas Müller",
    type: "reservation",
    amountOKP: 350,
    amountCDF: 17500,
    currency: "OKP",
    status: "failed",
  },
  {
    id: "t5",
    date: "05 Avr 2026, 09:15",
    description: "Paiement libéré — Amina Diallo",
    type: "escrow",
    amountOKP: 800,
    amountCDF: 40000,
    currency: "OKP",
    status: "completed",
  },
  {
    id: "t6",
    date: "04 Avr 2026, 11:00",
    description: "Retrait vers M-Pesa — +243 998 765 432",
    type: "retrait",
    amountOKP: 1500,
    amountCDF: 75000,
    currency: "CDF",
    status: "pending",
  },
  {
    id: "t7",
    date: "02 Avr 2026, 18:10",
    description: "Réservation reçue — Marie Kabila",
    type: "reservation",
    amountOKP: 1200,
    amountCDF: 60000,
    currency: "OKP",
    status: "completed",
  },
];

// ─── Status Helpers ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReservationStatus }) {
  const map: Record<ReservationStatus, { label: string; className: string }> = {
    pending: {
      label: "En attente",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    confirmed: {
      label: "Confirmée",
      className: "bg-green-100 text-green-800 border-green-300",
    },
    cancelled: {
      label: "Annulée",
      className: "bg-red-100 text-red-800 border-red-300",
    },
    released: {
      label: "Libérée",
      className: "bg-teal-100 text-teal-800 border-teal-300",
    },
    paid: {
      label: "Payé",
      className: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
  };
  const { label, className } = map[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}
    >
      {label}
    </span>
  );
}

function StatusIcon({ status }: { status: ReservationStatus }) {
  if (status === "confirmed")
    return <CheckCircle2 size={18} className="text-green-500" />;
  if (status === "pending")
    return <Clock size={18} className="text-yellow-500" />;
  if (status === "cancelled")
    return <XCircle size={18} className="text-red-500" />;
  if (status === "paid")
    return <CheckCircle2 size={18} className="text-emerald-500" />;
  return <Unlock size={18} className="text-teal-500" />;
}

function NotifIcon({ type }: { type: NotifType }) {
  if (type === "payment")
    return <CircleDollarSign size={20} className="text-green-500" />;
  if (type === "reservation")
    return <CalendarDays size={20} className="text-blue-500" />;
  return <Unlock size={20} className="text-amber-500" />;
}

function TxTypeBadge({ type }: { type: TransactionType }) {
  const map: Record<TransactionType, { label: string; className: string }> = {
    reservation: {
      label: "Réservation",
      className: "bg-blue-100 text-blue-800 border-blue-300",
    },
    escrow: {
      label: "Paiement Escrow",
      className: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    retrait: {
      label: "Retrait",
      className: "bg-orange-100 text-orange-800 border-orange-300",
    },
  };
  const { label, className } = map[type];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
}

function TxStatusBadge({ status }: { status: Transaction["status"] }) {
  if (status === "completed")
    return (
      <span className="text-xs text-emerald-600 font-medium">✓ Complété</span>
    );
  if (status === "pending")
    return (
      <span className="text-xs text-yellow-600 font-medium">⏳ En cours</span>
    );
  return <span className="text-xs text-red-600 font-medium">✗ Échoué</span>;
}

// ─── Balance Card ────────────────────────────────────────────────────────────

interface BalanceCardProps {
  label: string;
  value: number;
  symbol: string;
  icon: React.ReactNode;
  change: number;
  color: string;
  isLive: boolean;
}

function BalanceCard({
  label,
  value,
  symbol,
  icon,
  change,
  color,
  isLive,
}: BalanceCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${color} bg-opacity-10`}>
              {icon}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {label}
            </span>
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-green-600 font-medium">
                En direct
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <motion.p
            key={value}
            initial={{ opacity: 0.6, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-foreground tabular-nums"
          >
            {value.toLocaleString("fr-FR")}
            <span className="text-base font-medium text-muted-foreground ml-1.5">
              {symbol}
            </span>
          </motion.p>
          <div className="flex items-center gap-1">
            {change >= 0 ? (
              <ArrowUpRight size={14} className="text-emerald-500" />
            ) : (
              <ArrowDownLeft size={14} className="text-red-500" />
            )}
            <span
              className={`text-xs font-medium ${
                change >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {change >= 0 ? "+" : ""}
              {change.toLocaleString("fr-FR")} {symbol} aujourd'hui
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState("reservations");
  const [ackMap, setAckMap] = useState<Record<string, AcknowledgmentData>>({});

  // Load acknowledgment status for all partner reservations
  useEffect(() => {
    const loadAcks = async () => {
      const entries: Record<string, AcknowledgmentData> = {};
      for (const r of MOCK_RESERVATIONS) {
        entries[r.code] = await loadAcknowledgment(r.code);
      }
      setAckMap(entries);
    };
    loadAcks();
  }, []);
  const [reservations, setReservations] =
    useState<PartnerReservation[]>(MOCK_RESERVATIONS);
  const [notifs, setNotifs] = useState<PartnerNotif[]>(MOCK_NOTIFS);
  const [txFilter, setTxFilter] = useState<"all" | TransactionType>("all");

  // Real-time balance state
  const [balances, setBalances] = useState({
    okp: 9800,
    cdf: 490000,
    usd: 245,
  });
  const [balanceChanges, setBalanceChanges] = useState({
    okp: 320,
    cdf: 16000,
    usd: 8,
  });

  // Simulate real-time balance fluctuation every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      const okpDelta = Math.floor((Math.random() - 0.45) * 80);
      const cdfDelta = okpDelta * 50;
      const usdDelta = Math.floor((Math.random() - 0.45) * 4);
      setBalances((prev) => ({
        okp: Math.max(0, prev.okp + okpDelta),
        cdf: Math.max(0, prev.cdf + cdfDelta),
        usd: Math.max(0, prev.usd + usdDelta),
      }));
      setBalanceChanges({
        okp: okpDelta,
        cdf: cdfDelta,
        usd: usdDelta,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const confirmedCount = reservations.filter(
    (r) =>
      r.status === "confirmed" ||
      r.status === "paid" ||
      r.status === "released",
  ).length;

  const handleCheckin = (id: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "released" as const } : r,
      ),
    );
    toast.success("Check-in confirmé — fonds libérés de l'escrow ✅");
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Toutes les notifications marquées comme lues.");
  };

  const filteredTransactions =
    txFilter === "all"
      ? MOCK_TRANSACTIONS
      : MOCK_TRANSACTIONS.filter((t) => t.type === txFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Non-custodial ownership banner */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{
          background: "oklch(0.22 0.09 195 / 0.55)",
          border: "1.5px solid oklch(0.52 0.12 160 / 0.45)",
        }}
        data-ocid="partner.custody.panel"
      >
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm shrink-0 mt-0.5"
          style={{
            background: "oklch(0.52 0.12 160 / 0.2)",
            color: "oklch(0.72 0.14 160)",
          }}
        >
          ✓
        </span>
        <div>
          <p
            className="font-bold text-sm"
            style={{ color: "oklch(0.80 0.14 160)" }}
          >
            Vous contrôlez vos fonds à 100% 🔐
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.68 0.08 160)" }}
          >
            Votre wallet est non-custodial. KongoKash ne peut pas accéder à vos
            fonds.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-primary/10">
          <Building2 size={28} className="text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Espace Partenaire
          </h2>
          <p className="text-muted-foreground text-sm">
            Gérez vos réservations et vos paiements en temps réel
          </p>
        </div>
      </div>

      {/* Real-time Balance Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        data-ocid="partner.balance.card"
      >
        <BalanceCard
          label="Solde OKP"
          value={balances.okp}
          symbol="OKP 🦌"
          icon={<TrendingUp size={18} className="text-primary" />}
          change={balanceChanges.okp}
          color="bg-primary/10"
          isLive
        />
        <BalanceCard
          label="Solde CDF"
          value={balances.cdf}
          symbol="FC"
          icon={<Wallet size={18} className="text-amber-600" />}
          change={balanceChanges.cdf}
          color="bg-amber-50"
          isLive
        />
        <BalanceCard
          label="Solde USD"
          value={balances.usd}
          symbol="USD"
          icon={<DollarSign size={18} className="text-green-600" />}
          change={balanceChanges.usd}
          color="bg-green-50"
          isLive
        />
      </div>

      {/* Withdraw CTA */}
      <Button
        size="lg"
        className="w-full text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
        onClick={() => setActiveTab("retraits")}
        data-ocid="partner.withdraw.primary_button"
      >
        <ArrowUpRight size={20} className="mr-2" />
        Retirer les fonds 💸
      </Button>

      {/* Summary row */}
      <div className="flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5">
          <CalendarDays size={14} className="text-blue-500" />
          <span className="text-foreground font-medium">
            {reservations.length}
          </span>
          <span className="text-muted-foreground">réservations</span>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5">
          <CheckCircle2 size={14} className="text-green-500" />
          <span className="text-foreground font-medium">{confirmedCount}</span>
          <span className="text-muted-foreground">confirmées</span>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5">
            <Bell size={14} className="text-orange-500" />
            <span className="text-foreground font-medium">{unreadCount}</span>
            <span className="text-muted-foreground">non lues</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-2">
          <TabsTrigger
            value="reservations"
            className="text-xs sm:text-sm"
            data-ocid="partner.reservations.tab"
          >
            <CalendarDays size={14} className="mr-1" />
            Réservations
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="text-xs sm:text-sm"
            data-ocid="partner.transactions.tab"
          >
            <CircleDollarSign size={14} className="mr-1" />
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="retraits"
            className="text-xs sm:text-sm"
            data-ocid="partner.retraits.tab"
          >
            <ArrowUpRight size={14} className="mr-1" />
            Retraits
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-xs sm:text-sm relative"
            data-ocid="partner.notifications.tab"
          >
            <Bell size={14} className="mr-1" />
            Notifs
            {unreadCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Reservations Tab ─────────────────────────────────────────────── */}
        <TabsContent value="reservations">
          <ScrollArea className="h-[520px] pr-1">
            <div className="space-y-3">
              <AnimatePresence>
                {reservations.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ delay: i * 0.05 }}
                    data-ocid={`partner.reservations.item.${i + 1}`}
                  >
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="mt-0.5">
                              <StatusIcon status={r.status} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-foreground truncate">
                                  {r.clientName}
                                </span>
                                <StatusBadge status={r.status} />
                                {(r.status === "paid" ||
                                  r.status === "released") && (
                                  <span className="text-xs text-emerald-600 font-medium">
                                    Fonds reçus ✓
                                  </span>
                                )}
                                {(ackMap[r.code]?.acknowledged ?? false) ? (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                                    style={{
                                      background: "oklch(0.25 0.08 145 / 0.3)",
                                      color: "oklch(0.68 0.14 145)",
                                    }}
                                    title="Le client a confirmé avoir reçu sa réservation"
                                    data-ocid={`partner.reservations.success_state.${i + 1}`}
                                  >
                                    ✅ Reçu
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                                    style={{
                                      background: "oklch(0.25 0.10 85 / 0.3)",
                                      color: "oklch(0.68 0.14 85)",
                                    }}
                                    title="Le client n'a pas encore confirmé la réception"
                                    data-ocid={`partner.reservations.loading_state.${i + 1}`}
                                  >
                                    ⏳ En attente
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {r.service}
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span className="font-mono text-primary">
                                  {r.code}
                                </span>
                                <span>
                                  {r.checkIn} → {r.checkOut}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-sm text-primary">
                              {r.amountOKP.toLocaleString("fr-FR")} OKP
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {r.amountCDF.toLocaleString("fr-FR")} FC
                            </p>
                            {r.status === "confirmed" && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2 text-xs h-7 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                    data-ocid={`partner.checkin.button.${i + 1}`}
                                  >
                                    <DoorOpen size={12} className="mr-1" />
                                    Check-in
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Confirmer le check-in
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="py-3 space-y-2 text-sm">
                                    <p>
                                      Client : <strong>{r.clientName}</strong>
                                    </p>
                                    <p>
                                      Service : <strong>{r.service}</strong>
                                    </p>
                                    <p>
                                      Montant :{" "}
                                      <strong>
                                        {r.amountOKP.toLocaleString("fr-FR")}{" "}
                                        OKP
                                      </strong>
                                    </p>
                                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mt-2">
                                      <AlertTriangle
                                        size={16}
                                        className="text-amber-600 mt-0.5 shrink-0"
                                      />
                                      <p className="text-xs text-amber-800">
                                        En confirmant le check-in, les fonds
                                        bloqués en escrow seront libérés et
                                        transférés à votre wallet partenaire.
                                      </p>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={() => handleCheckin(r.id)}
                                      className="bg-primary text-primary-foreground"
                                      data-ocid={`partner.checkin.confirm_button.${i + 1}`}
                                    >
                                      <CheckCircle2
                                        size={14}
                                        className="mr-1"
                                      />
                                      Confirmer l'arrivée
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              {reservations.length === 0 && (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="partner.reservations.empty_state"
                >
                  <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Aucune réservation pour l'instant</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── Transactions Tab ─────────────────────────────────────────────── */}
        <TabsContent value="transactions">
          <div className="space-y-3">
            {/* Filter chips */}
            <div
              className="flex flex-wrap gap-2"
              data-ocid="partner.transactions.filter"
            >
              {(
                [
                  ["all", "Tous"],
                  ["reservation", "Réservations"],
                  ["escrow", "Paiements"],
                  ["retrait", "Retraits"],
                ] as ["all" | TransactionType, string][]
              ).map(([val, label]) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setTxFilter(val)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    txFilter === val
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                  }`}
                  data-ocid={`partner.tx.${val}.tab`}
                >
                  <Filter size={10} />
                  {label}
                </button>
              ))}
            </div>

            <ScrollArea className="h-[460px] pr-1">
              <div className="space-y-2">
                <AnimatePresence mode="wait">
                  {filteredTransactions.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                      data-ocid={`partner.transactions.item.${i + 1}`}
                    >
                      <Card className="border-border/40">
                        <CardContent className="p-3.5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`p-2 rounded-xl shrink-0 ${
                                  tx.type === "escrow"
                                    ? "bg-emerald-100"
                                    : tx.type === "retrait"
                                      ? "bg-orange-100"
                                      : "bg-blue-100"
                                }`}
                              >
                                {tx.type === "escrow" ? (
                                  <ArrowDownLeft
                                    size={15}
                                    className="text-emerald-600"
                                  />
                                ) : tx.type === "retrait" ? (
                                  <ArrowUpRight
                                    size={15}
                                    className="text-orange-600"
                                  />
                                ) : (
                                  <CalendarDays
                                    size={15}
                                    className="text-blue-600"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {tx.description}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-muted-foreground">
                                    {tx.date}
                                  </span>
                                  <TxTypeBadge type={tx.type} />
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p
                                className={`text-sm font-bold ${
                                  tx.type === "retrait"
                                    ? "text-orange-600"
                                    : "text-emerald-600"
                                }`}
                              >
                                {tx.type === "retrait" ? "-" : "+"}
                                {tx.currency === "OKP"
                                  ? `${tx.amountOKP.toLocaleString("fr-FR")} OKP`
                                  : `${tx.amountCDF.toLocaleString("fr-FR")} FC`}
                              </p>
                              <TxStatusBadge status={tx.status} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredTransactions.length === 0 && (
                  <div
                    className="text-center py-12 text-muted-foreground"
                    data-ocid="partner.transactions.empty_state"
                  >
                    <CircleDollarSign
                      size={40}
                      className="mx-auto mb-3 opacity-30"
                    />
                    <p>Aucune transaction dans cette catégorie</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* ── Retraits Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="retraits" className="space-y-4">
          <WithdrawalGateway onSuccess={() => setActiveTab("retraits")} />
          <WithdrawalHistory />
        </TabsContent>

        {/* ── Notifications Tab ────────────────────────────────────────────── */}
        <TabsContent value="notifications">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
                  : "Toutes les notifications ont été lues"}
              </p>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                  onClick={markAllRead}
                  data-ocid="partner.notifications.mark_all_button"
                >
                  Tout marquer comme lu
                </Button>
              )}
            </div>
            <ScrollArea className="h-[460px] pr-1">
              <div className="space-y-2">
                {notifs.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    data-ocid={`partner.notifications.item.${i + 1}`}
                  >
                    <Card
                      className={`border-border/40 ${
                        !n.read ? "bg-primary/5 border-primary/20" : ""
                      }`}
                    >
                      <CardContent className="p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            <NotifIcon type={n.type} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm ${
                                !n.read
                                  ? "font-semibold text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {n.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {n.time}
                            </p>
                          </div>
                          {!n.read && (
                            <div className="shrink-0 mt-1.5">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {notifs.length === 0 && (
                  <div
                    className="text-center py-12 text-muted-foreground"
                    data-ocid="partner.notifications.empty_state"
                  >
                    <Bell size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Aucune notification</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
