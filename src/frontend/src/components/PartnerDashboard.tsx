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
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  DoorOpen,
  Unlock,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Mock Data ─────────────────────────────────────────────────────────────────

type ReservationStatus = "pending" | "confirmed" | "cancelled" | "released";

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
    status: "released",
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
    status: "confirmed",
  },
];

interface Payment {
  id: string;
  date: string;
  code: string;
  amountOKP: number;
  clientName: string;
}

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "1",
    date: "2026-03-31",
    code: "RES-KK-6644",
    amountOKP: 2400,
    clientName: "Sarah Nkosi",
  },
  {
    id: "2",
    date: "2026-03-15",
    code: "RES-KK-5005",
    amountOKP: 1800,
    clientName: "Didier Lokumu",
  },
  {
    id: "3",
    date: "2026-03-08",
    code: "RES-KK-4321",
    amountOKP: 600,
    clientName: "Fatou Traoré",
  },
  {
    id: "4",
    date: "2026-02-28",
    code: "RES-KK-3890",
    amountOKP: 950,
    clientName: "Patrice Lumumba Jr.",
  },
];

type NotifType = "payment" | "reservation" | "release";

interface PartnerNotif {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFS: PartnerNotif[] = [
  {
    id: "1",
    type: "payment",
    title: "Paiement reçu",
    message: "2 400 OKP 🦌 reçus pour RES-KK-6644 (Sarah Nkosi)",
    time: "Il y a 2h",
    read: false,
  },
  {
    id: "2",
    type: "reservation",
    title: "Réservation confirmée",
    message: "Nouvelle réservation confirmée — RES-KK-8110 (Amina Diallo)",
    time: "Il y a 5h",
    read: false,
  },
  {
    id: "3",
    type: "release",
    title: "Libération des fonds",
    message: "950 OKP 🦌 libérés de l'escrow — RES-KK-3890",
    time: "Il y a 1j",
    read: true,
  },
  {
    id: "4",
    type: "reservation",
    title: "Réservation confirmée",
    message: "Nouvelle réservation confirmée — RES-KK-7823 (Marie Kabila)",
    time: "Il y a 2j",
    read: true,
  },
  {
    id: "5",
    type: "payment",
    title: "Paiement reçu",
    message: "1 800 OKP 🦌 reçus pour RES-KK-5005 (Didier Lokumu)",
    time: "Il y a 3j",
    read: true,
  },
];

// ─── Status Helpers ─────────────────────────────────────────────────────────────

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
  return <Unlock size={18} className="text-teal-500" />;
}

function NotifIcon({ type }: { type: NotifType }) {
  if (type === "payment")
    return <CircleDollarSign size={20} className="text-green-500" />;
  if (type === "reservation")
    return <CalendarDays size={20} className="text-blue-500" />;
  return <Unlock size={20} className="text-amber-500" />;
}

// ─── Withdraw Modal ─────────────────────────────────────────────────────────────

function WithdrawModal({ totalBalance }: { totalBalance: number }) {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [open, setOpen] = useState(false);

  const handleWithdraw = () => {
    const num = Number.parseFloat(amount);
    if (!num || num <= 0 || num > totalBalance) {
      toast.error("Montant invalide ou supérieur au solde disponible.");
      return;
    }
    if (!address.trim()) {
      toast.error("Veuillez saisir une adresse de destination.");
      return;
    }
    toast.success(
      `Retrait de ${num.toLocaleString()} OKP 🦌 initié vers ${address.slice(0, 12)}...`,
    );
    setOpen(false);
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-6 text-base shadow-lg"
          data-ocid="partner.withdraw_button"
        >
          <ArrowDownLeft size={20} className="mr-2" />
          Retirer les fonds
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" data-ocid="partner.withdraw_modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ArrowDownLeft size={22} className="text-green-600" />
            Retirer les fonds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Balance display */}
          <div className="bg-muted rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Solde disponible
            </p>
            <p className="text-3xl font-bold text-primary">
              {totalBalance.toLocaleString()} OKP 🦌
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-amount" className="font-semibold">
              Montant à retirer (OKP)
            </Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder={`Max: ${totalBalance.toLocaleString()}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-ocid="partner.withdraw_amount_input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-address" className="font-semibold">
              Adresse de destination
            </Label>
            <Input
              id="withdraw-address"
              placeholder="Principal ICP ou adresse wallet..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              data-ocid="partner.withdraw_address_input"
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <AlertTriangle
              size={18}
              className="text-amber-600 mt-0.5 shrink-0"
            />
            <p className="text-sm text-amber-800 font-medium">
              Vérifiez l'adresse soigneusement — ce transfert est{" "}
              <strong>irréversible</strong>.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-ocid="partner.withdraw_cancel_button"
          >
            Annuler
          </Button>
          <Button
            onClick={handleWithdraw}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
            data-ocid="partner.withdraw_confirm_button"
          >
            Confirmer le retrait
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function PartnerDashboard() {
  const [reservations, setReservations] =
    useState<PartnerReservation[]>(MOCK_RESERVATIONS);
  const [notifs, setNotifs] = useState<PartnerNotif[]>(MOCK_NOTIFS);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const totalBalance = MOCK_PAYMENTS.reduce((sum, p) => sum + p.amountOKP, 0);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
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
            Gérez vos réservations et vos paiements
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Réservations",
            value: reservations.length,
            icon: CalendarDays,
            color: "text-blue-500",
          },
          {
            label: "Confirmées",
            value: reservations.filter((r) => r.status === "confirmed").length,
            icon: CheckCircle2,
            color: "text-green-500",
          },
          {
            label: "Solde OKP",
            value: `${totalBalance.toLocaleString()} 🦌`,
            icon: CircleDollarSign,
            color: "text-primary",
          },
          {
            label: "Non lues",
            value: unreadCount,
            icon: Bell,
            color: "text-amber-500",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <Icon size={22} className={color} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reservations" data-ocid="partner.tab">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger
            value="reservations"
            className="gap-2"
            data-ocid="partner.reservations_tab"
          >
            <CalendarDays size={14} /> Réservations 📋
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="gap-2"
            data-ocid="partner.payments_tab"
          >
            <CircleDollarSign size={14} /> Paiements reçus 💰
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="gap-2 relative"
            data-ocid="partner.notifications_tab"
          >
            <Bell size={14} /> Notifications 🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Réservations ─────────────────────────── */}
        <TabsContent value="reservations" className="mt-6">
          <div className="space-y-4" data-ocid="partner.reservations_list">
            {reservations.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
                data-ocid={`partner.reservations.item.${idx + 1}`}
              >
                <Card className="border border-border/60 hover:border-primary/40 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5">
                          <StatusIcon status={r.status} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground">
                              {r.clientName}
                            </p>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              {r.code}
                            </code>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {r.service}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <CalendarDays size={11} />
                            {r.checkIn} → {r.checkOut}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2">
                        <p className="font-bold text-lg text-primary">
                          {r.amountOKP.toLocaleString()} OKP 🦌
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ≈ {r.amountCDF.toLocaleString()} CDF
                        </p>
                        <StatusBadge status={r.status} />
                        {r.status === "confirmed" && (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-1"
                            onClick={() => handleCheckin(r.id)}
                            data-ocid={`partner.checkin_button.${idx + 1}`}
                          >
                            <DoorOpen size={14} className="mr-1.5" />
                            Confirmer l'arrivée
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {reservations.length === 0 && (
              <div
                className="text-center py-16 text-muted-foreground"
                data-ocid="partner.reservations_empty_state"
              >
                <CalendarDays size={40} className="mx-auto mb-3 opacity-40" />
                <p>Aucune réservation pour le moment.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Paiements ───────────────────────────── */}
        <TabsContent value="payments" className="mt-6">
          {/* Balance card + withdraw */}
          <Card className="mb-6 border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Solde total disponible
                </p>
                <p className="text-4xl font-bold text-primary mt-1">
                  {totalBalance.toLocaleString()} OKP 🦌
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ≈ {(totalBalance * 50).toLocaleString()} CDF
                </p>
              </div>
              <WithdrawModal totalBalance={totalBalance} />
            </CardContent>
          </Card>

          {/* Payment history */}
          <Card className="border border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CircleDollarSign size={18} className="text-green-500" />
                Historique des paiements reçus
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-80">
                <div className="divide-y divide-border/60">
                  {MOCK_PAYMENTS.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
                      data-ocid={`partner.payments.item.${idx + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100">
                          <CircleDollarSign
                            size={16}
                            className="text-green-600"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {p.clientName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <code className="text-xs text-muted-foreground">
                              {p.code}
                            </code>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {p.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          +{p.amountOKP.toLocaleString()} 🦌
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] mt-1 border-teal-300 text-teal-700 bg-teal-50"
                        >
                          Libéré par escrow
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {MOCK_PAYMENTS.length === 0 && (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="partner.payments_empty_state"
                >
                  <CircleDollarSign
                    size={36}
                    className="mx-auto mb-3 opacity-40"
                  />
                  <p>Aucun paiement reçu pour l'instant.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Notifications ───────────────────────── */}
        <TabsContent value="notifications" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? (
                <span className="font-semibold text-foreground">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              ) : (
                "Tout est à jour"
              )}
            </p>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllRead}
                data-ocid="partner.mark_all_read_button"
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>

          <div className="space-y-3" data-ocid="partner.notifications_list">
            {notifs.map((n, idx) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                data-ocid={`partner.notifications.item.${idx + 1}`}
              >
                <Card
                  className={`border transition-colors ${
                    n.read
                      ? "border-border/40 bg-card"
                      : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        n.type === "payment"
                          ? "bg-green-100"
                          : n.type === "reservation"
                            ? "bg-blue-100"
                            : "bg-amber-100"
                      }`}
                    >
                      <NotifIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`font-semibold text-sm ${n.read ? "text-muted-foreground" : "text-foreground"}`}
                        >
                          {n.title}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {n.time}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`text-sm mt-0.5 ${n.read ? "text-muted-foreground" : "text-foreground/80"}`}
                      >
                        {n.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
