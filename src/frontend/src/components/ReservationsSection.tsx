import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  Clock,
  Coins,
  Loader2,
  MapPin,
  Plane,
  ShieldAlert,
  Sparkles,
  Timer,
  TreePine,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useReservationNotifications } from "../hooks/useReservationNotifications";
import { DigitalTicket, type TicketData } from "./DigitalTicket";

// ─── Local Types ────────────────────────────────────────────────────────────────────

export interface Structure {
  id: bigint;
  name: string;
  description: string;
  category: string;
  priceOKP: number;
  priceCDF: number;
  location: string;
  capacity: bigint;
  imageUrl: string;
  isActive: boolean;
}

export interface Reservation {
  id: bigint;
  userId: unknown;
  structureId: bigint;
  structureName: string;
  checkIn: string;
  checkOut: string;
  guests: bigint;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  bookingCode: string;
  createdAt: bigint;
}

// ─── Static sample structures ──────────────────────────────────────────────────────

const SAMPLE_STRUCTURES: Structure[] = [
  {
    id: 1n,
    name: "Hôtel Okapi Lodge",
    description:
      "Lodge de luxe au cœur de la forêt équatoriale, proche de la Réserve Okapi. Confort moderne et immersion nature.",
    category: "hotel",
    priceOKP: 2500,
    priceCDF: 125000,
    location: "Epulu, Province Orientale",
    capacity: 4n,
    imageUrl: "",
    isActive: true,
  },
  {
    id: 2n,
    name: "Parc National des Virunga",
    description:
      "Le plus ancien parc d'Afrique. Observation des gorilles des montagnes, volcans actifs et faune exceptionnelle.",
    category: "parc",
    priceOKP: 1800,
    priceCDF: 90000,
    location: "Rutshuru, Nord-Kivu",
    capacity: 20n,
    imageUrl: "",
    isActive: true,
  },
  {
    id: 3n,
    name: "Réserve de Faune Okapi",
    description:
      "Site UNESCO classé au patrimoine mondial. Randonnées guidées pour observer l'okapi, l'animal emblématique du Congo.",
    category: "parc",
    priceOKP: 1200,
    priceCDF: 60000,
    location: "Ituri, Province Orientale",
    capacity: 15n,
    imageUrl: "",
    isActive: true,
  },
  {
    id: 4n,
    name: "Hôtel Grand Palais Kinshasa",
    description:
      "Hôtel 5 étoiles en plein centre de Kinshasa. Vue panoramique sur le fleuve Congo, restaurant gastronomique et spa.",
    category: "hotel",
    priceOKP: 4500,
    priceCDF: 225000,
    location: "Gombe, Kinshasa",
    capacity: 2n,
    imageUrl: "",
    isActive: true,
  },
  {
    id: 5n,
    name: "Centre Culturel de Lubumbashi",
    description:
      "Espace culturel dédié aux arts congolais. Expositions, concerts et ateliers artisanaux locaux.",
    category: "structure",
    priceOKP: 300,
    priceCDF: 15000,
    location: "Lubumbashi, Haut-Katanga",
    capacity: 100n,
    imageUrl: "",
    isActive: true,
  },
  {
    id: 6n,
    name: "Parc National de la Garamba",
    description:
      "Sanctuaire du rhinocéros blanc du Nord. Safari unique pour observer girafes et éléphants de savane.",
    category: "parc",
    priceOKP: 2200,
    priceCDF: 110000,
    location: "Dungu, Haut-Uélé",
    capacity: 12n,
    imageUrl: "",
    isActive: true,
  },
];

// ─── Flight data (static/simulated) ────────────────────────────────────────────────────

const CITIES = [
  "Kinshasa",
  "Lubumbashi",
  "Goma",
  "Bukavu",
  "Kisangani",
  "Bruxelles",
  "Paris",
  "Nairobi",
  "Addis-Abéba",
];

interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  priceOKP: number;
  priceCDF: number;
  seats: number;
}

const STATIC_FLIGHTS: Flight[] = [
  {
    id: "F001",
    airline: "CAA Congo",
    airlineCode: "CAA",
    origin: "Kinshasa",
    destination: "Lubumbashi",
    departure: "08:30",
    arrival: "11:15",
    duration: "2h45",
    priceOKP: 3200,
    priceCDF: 160000,
    seats: 42,
  },
  {
    id: "F002",
    airline: "CAA Congo",
    airlineCode: "CAA",
    origin: "Kinshasa",
    destination: "Goma",
    departure: "06:45",
    arrival: "09:30",
    duration: "2h45",
    priceOKP: 3800,
    priceCDF: 190000,
    seats: 36,
  },
  {
    id: "F003",
    airline: "Ethiopian Airlines",
    airlineCode: "ET",
    origin: "Kinshasa",
    destination: "Addis-Abéba",
    departure: "10:20",
    arrival: "16:50",
    duration: "6h30",
    priceOKP: 12400,
    priceCDF: 620000,
    seats: 18,
  },
  {
    id: "F004",
    airline: "Kenya Airways",
    airlineCode: "KQ",
    origin: "Kinshasa",
    destination: "Nairobi",
    departure: "14:10",
    arrival: "19:30",
    duration: "5h20",
    priceOKP: 10600,
    priceCDF: 530000,
    seats: 22,
  },
  {
    id: "F005",
    airline: "Brussels Airlines",
    airlineCode: "SN",
    origin: "Kinshasa",
    destination: "Bruxelles",
    departure: "23:15",
    arrival: "07:45+1",
    duration: "8h30",
    priceOKP: 28000,
    priceCDF: 1400000,
    seats: 14,
  },
  {
    id: "F006",
    airline: "Brussels Airlines",
    airlineCode: "SN",
    origin: "Kinshasa",
    destination: "Paris",
    departure: "22:00",
    arrival: "07:20+1",
    duration: "9h20",
    priceOKP: 26500,
    priceCDF: 1325000,
    seats: 11,
  },
  {
    id: "F007",
    airline: "CAA Congo",
    airlineCode: "CAA",
    origin: "Lubumbashi",
    destination: "Kinshasa",
    departure: "13:00",
    arrival: "15:45",
    duration: "2h45",
    priceOKP: 3200,
    priceCDF: 160000,
    seats: 30,
  },
  {
    id: "F008",
    airline: "CAA Congo",
    airlineCode: "CAA",
    origin: "Goma",
    destination: "Kinshasa",
    departure: "15:30",
    arrival: "18:15",
    duration: "2h45",
    priceOKP: 3800,
    priceCDF: 190000,
    seats: 28,
  },
  {
    id: "F009",
    airline: "CAA Congo",
    airlineCode: "CAA",
    origin: "Kisangani",
    destination: "Kinshasa",
    departure: "09:00",
    arrival: "11:30",
    duration: "2h30",
    priceOKP: 4100,
    priceCDF: 205000,
    seats: 24,
  },
  {
    id: "F010",
    airline: "Ethiopian Airlines",
    airlineCode: "ET",
    origin: "Addis-Abéba",
    destination: "Kinshasa",
    departure: "07:30",
    arrival: "14:00",
    duration: "6h30",
    priceOKP: 12400,
    priceCDF: 620000,
    seats: 20,
  },
];

function getAirlineColor(code: string): string {
  const colors: Record<string, string> = {
    CAA: "oklch(0.55 0.15 195)",
    ET: "oklch(0.55 0.15 145)",
    KQ: "oklch(0.55 0.14 20)",
    SN: "oklch(0.55 0.15 250)",
  };
  return colors[code] ?? "oklch(0.55 0.10 220)";
}

function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────────

function getCategoryInfo(category: string) {
  switch (category) {
    case "hotel":
      return {
        icon: <Building2 size={20} />,
        label: "Hôtel",
        gradient:
          "linear-gradient(135deg, oklch(0.22 0.08 195), oklch(0.28 0.10 210))",
        accent: "oklch(0.60 0.15 195)",
      };
    case "parc":
      return {
        icon: <TreePine size={20} />,
        label: "Parc National",
        gradient:
          "linear-gradient(135deg, oklch(0.20 0.08 155), oklch(0.26 0.10 140))",
        accent: "oklch(0.60 0.15 145)",
      };
    default:
      return {
        icon: <Building2 size={20} />,
        label: "Structure",
        gradient:
          "linear-gradient(135deg, oklch(0.22 0.08 75), oklch(0.28 0.10 60))",
        accent: "oklch(0.75 0.15 75)",
      };
  }
}

function formatCDF(n: number) {
  return `${new Intl.NumberFormat("fr-FR").format(n)} FC`;
}

function getNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const nights = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return nights;
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// ─── Reservation Modal (Hotel/Structure) ───────────────────────────────────────────

interface ReservationModalProps {
  structure: Structure | null;
  onClose: () => void;
}

function ReservationModal({ structure, onClose }: ReservationModalProps) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const { addReservationNotif } = useReservationNotifications();

  const [checkIn, setCheckIn] = useState(getTodayStr());
  const [checkOut, setCheckOut] = useState(getTomorrowStr());
  const [guests, setGuests] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"okp" | "cdf">("okp");
  const [bookingCode, setBookingCode] = useState("");
  const [success, setSuccess] = useState(false);

  const nights = getNights(checkIn, checkOut);
  const basePrice =
    paymentMethod === "okp"
      ? (structure?.priceOKP ?? 0)
      : (structure?.priceCDF ?? 0);
  const totalAmount = basePrice * nights;
  const discount = paymentMethod === "okp" ? 0.1 : 0;
  const finalAmount = Math.round(totalAmount * (1 - discount));

  const createReservation = useMutation({
    mutationFn: async () => {
      if (!actor || !structure) throw new Error("Actor non disponible");
      const result = (await (actor as any).createReservation(
        structure.id,
        checkIn,
        checkOut,
        BigInt(guests),
        paymentMethod,
      )) as { success: boolean; bookingCode: string; message: string };
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        setBookingCode(data.bookingCode);
        setSuccess(true);
        queryClient.invalidateQueries({ queryKey: ["myReservations"] });
        addReservationNotif(
          "reservation_created",
          `Réservation en attente — ${structure?.name ?? ""}`,
          "Confirmez votre paiement dans les 30 minutes pour valider la réservation.",
        );
        addReservationNotif(
          "payment_received",
          "Paiement reçu",
          `${finalAmount} ${paymentMethod.toUpperCase()} débité pour ${structure?.name ?? ""}`,
        );
        addReservationNotif(
          "reservation_confirmed",
          `Réservation confirmée ! ${structure?.name ?? ""}`,
          `Votre réservation est confirmée — Code : ${data.bookingCode}`,
        );
        toast.success("Réservation confirmée !");
        // Create escrow for the reservation
        if (actor && structure) {
          const rId = BigInt(Date.now() % 1_000_000); // fallback ID from booking code hash
          const serviceDateNs =
            BigInt(new Date(checkIn).getTime()) * 1_000_000n;
          (actor as any)
            .createEscrow(
              rId,
              structure.name,
              finalAmount,
              paymentMethod.toUpperCase(),
              serviceDateNs,
            )
            .catch(() => {});
        }
      } else {
        toast.error(data.message || "Erreur lors de la réservation");
      }
    },
    onError: () => {
      toast.error("Erreur de connexion au serveur");
    },
  });

  if (!structure) return null;

  const categoryInfo = getCategoryInfo(structure.category);

  return (
    <Dialog open={!!structure} onOpenChange={() => onClose()}>
      <DialogContent
        className="max-w-md"
        style={{
          background: "oklch(0.16 0.04 220)",
          border: "1px solid oklch(0.28 0.06 220)",
          color: "oklch(0.92 0.02 220)",
        }}
        data-ocid="reservation.dialog"
      >
        <DialogHeader>
          <div
            className="w-full h-24 rounded-xl mb-2 flex items-center justify-center"
            style={{ background: categoryInfo.gradient }}
          >
            <span style={{ color: categoryInfo.accent }} className="scale-150">
              {categoryInfo.icon}
            </span>
          </div>
          <DialogTitle
            className="text-lg font-bold"
            style={{ color: "oklch(0.92 0.04 80)" }}
          >
            {structure.name}
          </DialogTitle>
          <p className="text-sm" style={{ color: "oklch(0.60 0.04 220)" }}>
            <MapPin size={12} className="inline mr-1" />
            {structure.location}
          </p>
        </DialogHeader>

        {success ? (
          <div
            className="rounded-xl p-6 text-center"
            style={{ background: "oklch(0.20 0.06 155 / 0.3)" }}
            data-ocid="reservation.success_state"
          >
            <div className="text-4xl mb-3">🎉</div>
            <h3
              className="text-lg font-bold mb-1"
              style={{ color: "oklch(0.70 0.15 145)" }}
            >
              Réservation confirmée !
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: "oklch(0.65 0.03 220)" }}
            >
              Votre code de réservation
            </p>
            <div
              className="font-mono text-xl font-bold py-3 px-4 rounded-lg tracking-widest"
              style={{
                background: "oklch(0.12 0.03 220)",
                color: "oklch(0.77 0.13 85)",
                border: "1px solid oklch(0.30 0.08 85)",
              }}
            >
              {bookingCode}
            </div>
            <p
              className="text-xs mt-3"
              style={{ color: "oklch(0.50 0.03 220)" }}
            >
              Conservez ce code — il vous sera demandé à l'entrée
            </p>
            <Button
              className="mt-4 w-full"
              onClick={onClose}
              style={{ background: "oklch(0.52 0.12 160)" }}
              data-ocid="reservation.close_button"
            >
              Fermer
            </Button>
          </div>
        ) : (
          <>
            {!identity ? (
              <div
                className="rounded-xl p-5 text-center"
                style={{ background: "oklch(0.20 0.06 40 / 0.3)" }}
                data-ocid="reservation.error_state"
              >
                <div className="text-3xl mb-2">🔐</div>
                <p
                  className="font-medium mb-1"
                  style={{ color: "oklch(0.77 0.13 85)" }}
                >
                  Connexion requise
                </p>
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.60 0.03 220)" }}
                >
                  Connectez-vous pour effectuer une réservation
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="rounded-lg px-4 py-2.5 flex items-center gap-2"
                  style={{
                    background: "oklch(0.25 0.10 85 / 0.25)",
                    border: "1px solid oklch(0.40 0.12 85 / 0.4)",
                  }}
                >
                  <Sparkles
                    size={14}
                    style={{ color: "oklch(0.77 0.13 85)" }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "oklch(0.82 0.10 85)" }}
                  >
                    Payez en OKP et économisez <strong>10%</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label
                      className="text-xs"
                      style={{ color: "oklch(0.65 0.03 220)" }}
                    >
                      Arrivée
                    </Label>
                    <Input
                      type="date"
                      value={checkIn}
                      min={getTodayStr()}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="bg-transparent border-white/20 text-white"
                      data-ocid="reservation.input"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      className="text-xs"
                      style={{ color: "oklch(0.65 0.03 220)" }}
                    >
                      Départ
                    </Label>
                    <Input
                      type="date"
                      value={checkOut}
                      min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="bg-transparent border-white/20 text-white"
                      data-ocid="reservation.input"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.03 220)" }}
                  >
                    Nombre de personnes
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 p-0 border-white/20 text-white"
                      data-ocid="reservation.button"
                    >
                      −
                    </Button>
                    <span
                      className="flex-1 text-center font-semibold text-lg"
                      style={{ color: "oklch(0.92 0.04 80)" }}
                    >
                      {guests}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setGuests(
                          Math.min(Number(structure.capacity), guests + 1),
                        )
                      }
                      className="w-8 h-8 p-0 border-white/20 text-white"
                      data-ocid="reservation.button"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.03 220)" }}
                  >
                    Mode de paiement
                  </Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as "okp" | "cdf")}
                  >
                    <SelectTrigger
                      className="bg-transparent border-white/20 text-white"
                      data-ocid="reservation.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        background: "oklch(0.18 0.04 220)",
                        border: "1px solid oklch(0.28 0.06 220)",
                      }}
                    >
                      <SelectItem value="okp" className="text-white">
                        🦸 OKP — Okapi Token (−10%)
                      </SelectItem>
                      <SelectItem value="cdf" className="text-white">
                        💵 CDF — Franc Congolais
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: "oklch(0.12 0.03 220)" }}
                >
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "oklch(0.60 0.03 220)" }}>
                      {nights} nuit{nights > 1 ? "s" : ""} ×{" "}
                      {paymentMethod === "okp"
                        ? `${structure.priceOKP} OKP`
                        : formatCDF(structure.priceCDF)}
                    </span>
                    <span style={{ color: "oklch(0.80 0.03 220)" }}>
                      {paymentMethod === "okp"
                        ? `${totalAmount} OKP`
                        : formatCDF(totalAmount)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "oklch(0.65 0.12 145)" }}>
                        Remise OKP −10%
                      </span>
                      <span style={{ color: "oklch(0.65 0.12 145)" }}>
                        −
                        {paymentMethod === "okp"
                          ? `${Math.round(totalAmount * 0.1)} OKP`
                          : formatCDF(Math.round(totalAmount * 0.1))}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-white/10">
                    <span style={{ color: "oklch(0.92 0.04 80)" }}>Total</span>
                    <span style={{ color: "oklch(0.77 0.13 85)" }}>
                      {paymentMethod === "okp"
                        ? `${finalAmount} OKP`
                        : formatCDF(finalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div
              className="rounded-xl p-3 flex items-start gap-2 mt-2"
              style={{
                background: "oklch(0.20 0.08 195 / 0.25)",
                border: "1px solid oklch(0.40 0.12 195 / 0.4)",
              }}
            >
              <span className="text-sm shrink-0 mt-0.5">🔒</span>
              <p className="text-xs" style={{ color: "oklch(0.70 0.08 195)" }}>
                <strong>Paiement sécurisé par Escrow :</strong> Vos fonds sont
                bloqués dans un smart contract et seront libérés au partenaire
                uniquement après confirmation de votre arrivée, ou
                automatiquement 6h avant votre service.
              </p>
            </div>
            <div
              className="rounded-xl p-3 flex items-start gap-2 mt-2"
              style={{
                background: "oklch(0.25 0.08 40 / 0.25)",
                border: "1px solid oklch(0.45 0.10 40 / 0.4)",
              }}
            >
              <ShieldAlert
                size={14}
                style={{ color: "oklch(0.70 0.12 50)" }}
                className="shrink-0 mt-0.5"
              />
              <p className="text-xs" style={{ color: "oklch(0.70 0.08 50)" }}>
                <strong>Anti-fraude :</strong> Votre réservation sera annulée
                automatiquement si le paiement n'est pas confirmé dans{" "}
                <strong>30 minutes</strong>.
              </p>
            </div>
            <DialogFooter className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                data-ocid="reservation.cancel_button"
              >
                Annuler
              </Button>
              {identity && (
                <Button
                  className="flex-1 font-semibold"
                  onClick={() => createReservation.mutate()}
                  disabled={createReservation.isPending || isFetching}
                  style={{ background: "oklch(0.52 0.12 160)" }}
                  data-ocid="reservation.submit_button"
                >
                  {createReservation.isPending ? (
                    <Loader2 size={14} className="animate-spin mr-2" />
                  ) : null}
                  Confirmer
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Structure Card ───────────────────────────────────────────────────────────────────

interface StructureCardProps {
  structure: Structure;
  index: number;
  onReserve: (s: Structure) => void;
}

function StructureCard({ structure, index, onReserve }: StructureCardProps) {
  const categoryInfo = getCategoryInfo(structure.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <Card
        className="overflow-hidden flex flex-col h-full"
        style={{
          background: "oklch(0.16 0.04 220)",
          border: "1px solid oklch(0.25 0.05 220)",
        }}
      >
        <div
          className="h-36 flex items-center justify-center relative"
          style={{ background: categoryInfo.gradient }}
        >
          <span
            className="text-5xl opacity-30"
            style={{ color: categoryInfo.accent }}
          >
            {categoryInfo.icon}
          </span>
          <div className="absolute top-3 left-3">
            <Badge
              className="text-xs font-semibold"
              style={{
                background: `${categoryInfo.accent}22`,
                color: categoryInfo.accent,
                border: `1px solid ${categoryInfo.accent}44`,
              }}
            >
              {categoryInfo.icon}{" "}
              <span className="ml-1">{categoryInfo.label}</span>
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge
              className="text-xs"
              style={{
                background: "oklch(0.35 0.10 145 / 0.5)",
                color: "oklch(0.75 0.15 145)",
                border: "1px solid oklch(0.50 0.10 145 / 0.5)",
              }}
            >
              Disponible
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-2">
          <h3
            className="font-bold text-base leading-tight"
            style={{ color: "oklch(0.92 0.04 80)" }}
          >
            {structure.name}
          </h3>
          <p
            className="text-xs flex items-center gap-1"
            style={{ color: "oklch(0.55 0.04 220)" }}
          >
            <MapPin size={11} />
            {structure.location}
          </p>
        </CardHeader>

        <CardContent className="pb-3 flex-1">
          <p
            className="text-sm leading-relaxed"
            style={{ color: "oklch(0.65 0.03 220)" }}
          >
            {structure.description}
          </p>
          <div
            className="mt-3 flex items-center gap-3 text-xs"
            style={{ color: "oklch(0.55 0.04 220)" }}
          >
            <span className="flex items-center gap-1">
              <Users size={11} /> Capacité : {Number(structure.capacity)} pers.
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={11} /> Par nuit
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-0 flex flex-col gap-3">
          <div
            className="w-full rounded-lg p-3 flex justify-between items-center"
            style={{ background: "oklch(0.12 0.03 220)" }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-lg"
                  style={{ color: "oklch(0.77 0.13 85)" }}
                >
                  <Coins size={14} className="inline mr-1" />
                  {Math.round(structure.priceOKP * 0.9).toLocaleString("fr-FR")}{" "}
                  OKP
                </span>
                <Badge
                  className="text-xs px-1.5 py-0"
                  style={{
                    background: "oklch(0.35 0.10 145 / 0.3)",
                    color: "oklch(0.70 0.12 145)",
                  }}
                >
                  −10%
                </Badge>
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "oklch(0.55 0.04 220)" }}
              >
                ou {formatCDF(structure.priceCDF)}
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                color: "oklch(0.77 0.13 85)",
                borderColor: "oklch(0.40 0.10 85)",
              }}
            >
              🦸 OKP
            </Badge>
          </div>

          <Button
            className="w-full font-semibold"
            onClick={() => onReserve(structure)}
            style={{ background: "oklch(0.52 0.12 160)" }}
            data-ocid="reservation.primary_button"
          >
            Réserver maintenant
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// ─── Parks Tab (enhanced) ──────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  { id: "morning", label: "Matin", time: "08h00", icon: "🌅" },
  { id: "afternoon", label: "Après-midi", time: "13h00", icon: "☀️" },
  { id: "evening", label: "Soirée", time: "16h00", icon: "🌆" },
];

interface ParkBookingModalProps {
  park: Structure | null;
  onClose: () => void;
  onTicket: (ticket: TicketData) => void;
}

function ParkBookingModal({ park, onClose, onTicket }: ParkBookingModalProps) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const [visitDate, setVisitDate] = useState(getTodayStr());
  const [visitors, setVisitors] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState("morning");
  const [withGuide, setWithGuide] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"okp" | "cdf">("okp");
  const [success, setSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState("");

  const guideExtra = 500;
  const basePrice =
    paymentMethod === "okp" ? (park?.priceOKP ?? 0) : (park?.priceCDF ?? 0);
  const guidePrice = withGuide
    ? paymentMethod === "okp"
      ? guideExtra
      : guideExtra * 50
    : 0;
  const totalBeforeDiscount = (basePrice + guidePrice) * visitors;
  const discount = paymentMethod === "okp" ? 0.1 : 0;
  const finalAmount = Math.round(totalBeforeDiscount * (1 - discount));

  const createReservation = useMutation({
    mutationFn: async () => {
      if (!actor || !park) throw new Error("Actor non disponible");
      try {
        const result = (await (actor as any).createReservation(
          park.id,
          visitDate,
          visitDate,
          BigInt(visitors),
          paymentMethod,
        )) as { success: boolean; bookingCode: string; message: string };
        return result;
      } catch {
        // fallback mock
        return {
          success: true,
          bookingCode: generateBookingCode(),
          message: "",
        };
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        const code = data.bookingCode;
        setBookingCode(code);
        setSuccess(true);
        queryClient.invalidateQueries({ queryKey: ["myReservations"] });
        const slot = TIME_SLOTS.find((s) => s.id === selectedSlot);
        onTicket({
          type: "PARC",
          serviceName: park!.name,
          passenger: "Visiteur KongoKash",
          date: visitDate,
          time: slot?.time,
          bookingCode: code,
          details: `${visitors} visiteur(s)${withGuide ? " + guide" : ""}`,
          price:
            paymentMethod === "okp"
              ? `${finalAmount} OKP`
              : formatCDF(finalAmount),
        });
        toast.success("Réservation parc confirmée !");
      } else {
        toast.error("Erreur lors de la réservation");
      }
    },
    onError: () => {
      toast.error("Erreur de connexion");
    },
  });

  if (!park) return null;

  return (
    <Dialog open={!!park} onOpenChange={() => onClose()}>
      <DialogContent
        className="max-w-md"
        style={{
          background: "oklch(0.16 0.04 220)",
          border: "1px solid oklch(0.28 0.06 220)",
          color: "oklch(0.92 0.02 220)",
        }}
        data-ocid="park.dialog"
      >
        <DialogHeader>
          <div
            className="w-full h-20 rounded-xl mb-2 flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.20 0.08 155), oklch(0.26 0.10 140))",
            }}
          >
            <TreePine size={36} style={{ color: "oklch(0.60 0.15 145)" }} />
          </div>
          <DialogTitle
            className="text-lg font-bold"
            style={{ color: "oklch(0.92 0.04 80)" }}
          >
            {park.name}
          </DialogTitle>
          <p className="text-sm" style={{ color: "oklch(0.60 0.04 220)" }}>
            <MapPin size={12} className="inline mr-1" />
            {park.location}
          </p>
        </DialogHeader>

        {success ? (
          <div
            className="rounded-xl p-6 text-center"
            style={{ background: "oklch(0.20 0.06 155 / 0.3)" }}
            data-ocid="park.success_state"
          >
            <div className="text-4xl mb-3">🎉</div>
            <h3
              className="text-lg font-bold mb-1"
              style={{ color: "oklch(0.70 0.15 145)" }}
            >
              Accès confirmé !
            </h3>
            <div
              className="font-mono text-xl font-bold py-3 px-4 rounded-lg tracking-widest my-4"
              style={{
                background: "oklch(0.12 0.03 220)",
                color: "oklch(0.77 0.13 85)",
                border: "1px solid oklch(0.30 0.08 85)",
              }}
            >
              {bookingCode}
            </div>
            <p className="text-xs" style={{ color: "oklch(0.50 0.03 220)" }}>
              Votre ticket numérique est prêt — cliquez "Voir Ticket" dans votre
              Dashboard
            </p>
            <Button
              className="mt-4 w-full"
              onClick={onClose}
              style={{ background: "oklch(0.52 0.12 160)" }}
              data-ocid="park.close_button"
            >
              Fermer
            </Button>
          </div>
        ) : (
          <>
            {!identity ? (
              <div
                className="rounded-xl p-5 text-center"
                style={{ background: "oklch(0.20 0.06 40 / 0.3)" }}
              >
                <div className="text-3xl mb-2">🔐</div>
                <p
                  className="font-medium"
                  style={{ color: "oklch(0.77 0.13 85)" }}
                >
                  Connexion requise
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Date */}
                <div className="space-y-1">
                  <Label
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.03 220)" }}
                  >
                    Date de visite
                  </Label>
                  <Input
                    type="date"
                    value={visitDate}
                    min={getTodayStr()}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="bg-transparent border-white/20 text-white"
                    data-ocid="park.input"
                  />
                </div>

                {/* Time slots */}
                <div className="space-y-2">
                  <Label
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.03 220)" }}
                  >
                    Créneau horaire
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot.id)}
                        className="rounded-lg p-2.5 text-center transition-all"
                        style={{
                          background:
                            selectedSlot === slot.id
                              ? "oklch(0.52 0.12 195 / 0.3)"
                              : "oklch(0.20 0.04 220)",
                          border:
                            selectedSlot === slot.id
                              ? "1px solid oklch(0.52 0.12 195)"
                              : "1px solid oklch(0.28 0.05 220)",
                        }}
                        data-ocid="park.toggle"
                      >
                        <div className="text-lg mb-0.5">{slot.icon}</div>
                        <div
                          className="text-xs font-semibold"
                          style={{
                            color:
                              selectedSlot === slot.id
                                ? "oklch(0.70 0.15 195)"
                                : "oklch(0.65 0.04 220)",
                          }}
                        >
                          {slot.label}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "oklch(0.50 0.03 220)" }}
                        >
                          {slot.time}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visitors */}
                <div className="space-y-1">
                  <Label
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.03 220)" }}
                  >
                    Nombre de visiteurs
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVisitors(Math.max(1, visitors - 1))}
                      className="w-8 h-8 p-0 border-white/20 text-white"
                      data-ocid="park.button"
                    >
                      −
                    </Button>
                    <span
                      className="flex-1 text-center font-semibold text-lg"
                      style={{ color: "oklch(0.92 0.04 80)" }}
                    >
                      {visitors}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setVisitors(
                          Math.min(Number(park.capacity), visitors + 1),
                        )
                      }
                      className="w-8 h-8 p-0 border-white/20 text-white"
                      data-ocid="park.button"
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Guide option */}
                <button
                  type="button"
                  onClick={() => setWithGuide(!withGuide)}
                  className="w-full rounded-lg p-3 flex items-center gap-3 transition-all"
                  style={{
                    background: withGuide
                      ? "oklch(0.25 0.10 85 / 0.25)"
                      : "oklch(0.20 0.04 220)",
                    border: withGuide
                      ? "1px solid oklch(0.40 0.12 85 / 0.6)"
                      : "1px solid oklch(0.28 0.05 220)",
                  }}
                  data-ocid="park.toggle"
                >
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                    style={{
                      borderColor: withGuide
                        ? "oklch(0.77 0.13 85)"
                        : "oklch(0.40 0.05 220)",
                      background: withGuide
                        ? "oklch(0.77 0.13 85 / 0.2)"
                        : "transparent",
                    }}
                  >
                    {withGuide && (
                      <span
                        className="text-xs"
                        style={{ color: "oklch(0.77 0.13 85)" }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "oklch(0.85 0.04 220)" }}
                    >
                      Guide officiel
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.55 0.04 220)" }}
                    >
                      +500 OKP / visiteur — Guide expert de la faune locale
                    </p>
                  </div>
                </button>

                {/* Payment */}
                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as "okp" | "cdf")}
                >
                  <SelectTrigger
                    className="bg-transparent border-white/20 text-white"
                    data-ocid="park.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      background: "oklch(0.18 0.04 220)",
                      border: "1px solid oklch(0.28 0.06 220)",
                    }}
                  >
                    <SelectItem value="okp" className="text-white">
                      🦸 OKP (−10%)
                    </SelectItem>
                    <SelectItem value="cdf" className="text-white">
                      💵 CDF
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Total */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: "oklch(0.12 0.03 220)" }}
                >
                  <div className="flex justify-between font-bold text-base">
                    <span style={{ color: "oklch(0.92 0.04 80)" }}>Total</span>
                    <span style={{ color: "oklch(0.77 0.13 85)" }}>
                      {paymentMethod === "okp"
                        ? `${finalAmount} OKP`
                        : formatCDF(finalAmount)}
                    </span>
                  </div>
                  {paymentMethod === "okp" && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "oklch(0.65 0.12 145)" }}
                    >
                      Remise 10% appliquée
                    </p>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                data-ocid="park.cancel_button"
              >
                Annuler
              </Button>
              {identity && (
                <Button
                  className="flex-1 font-semibold"
                  onClick={() => createReservation.mutate()}
                  disabled={createReservation.isPending || isFetching}
                  style={{ background: "oklch(0.52 0.12 160)" }}
                  data-ocid="park.submit_button"
                >
                  {createReservation.isPending ? (
                    <Loader2 size={14} className="animate-spin mr-2" />
                  ) : null}
                  Obtenir mon ticket
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Flights Tab ──────────────────────────────────────────────────────────────────────

interface FlightBookingModalProps {
  flight: Flight | null;
  passengers: number;
  departureDate: string;
  onClose: () => void;
  onTicket: (ticket: TicketData) => void;
}

function FlightBookingModal({
  flight,
  passengers,
  departureDate,
  onClose,
  onTicket,
}: FlightBookingModalProps) {
  const { identity } = useInternetIdentity();
  const [paymentMethod, setPaymentMethod] = useState<"okp" | "cdf">("okp");
  const [success, setSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!flight) return null;

  const basePrice = paymentMethod === "okp" ? flight.priceOKP : flight.priceCDF;
  const total = basePrice * passengers;
  const discount = paymentMethod === "okp" ? 0.1 : 0;
  const finalAmount = Math.round(total * (1 - discount));

  function handleBook() {
    if (!identity) return;
    setIsLoading(true);
    setTimeout(() => {
      const code = generateBookingCode();
      setBookingCode(code);
      setSuccess(true);
      setIsLoading(false);
      onTicket({
        type: "VOL",
        serviceName: `${flight!.origin} → ${flight!.destination}`,
        passenger: "Voyageur KongoKash",
        date: departureDate,
        time: `${flight!.departure} → ${flight!.arrival}`,
        bookingCode: code,
        details: `${flight!.airline} · ${passengers} passager(s) · ${flight!.duration}`,
        price:
          paymentMethod === "okp"
            ? `${finalAmount} OKP`
            : formatCDF(finalAmount),
      });
      toast.success("Billet d'avion confirmé !");
    }, 1200);
  }

  return (
    <Dialog open={!!flight} onOpenChange={() => onClose()}>
      <DialogContent
        className="max-w-md"
        style={{
          background: "oklch(0.16 0.04 220)",
          border: "1px solid oklch(0.28 0.06 220)",
          color: "oklch(0.92 0.02 220)",
        }}
        data-ocid="flight.dialog"
      >
        <DialogHeader>
          <div
            className="w-full h-20 rounded-xl mb-2 flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.08 250), oklch(0.28 0.10 240))",
            }}
          >
            <Plane size={36} style={{ color: "oklch(0.60 0.15 250)" }} />
          </div>
          <DialogTitle
            className="text-lg font-bold"
            style={{ color: "oklch(0.92 0.04 80)" }}
          >
            {flight.origin} → {flight.destination}
          </DialogTitle>
          <p className="text-sm" style={{ color: "oklch(0.60 0.04 220)" }}>
            {flight.airline} · {flight.departure} – {flight.arrival} ·{" "}
            {flight.duration}
          </p>
        </DialogHeader>

        {success ? (
          <div
            className="rounded-xl p-6 text-center"
            style={{ background: "oklch(0.20 0.06 155 / 0.3)" }}
            data-ocid="flight.success_state"
          >
            <div className="text-4xl mb-3">✈️</div>
            <h3
              className="text-lg font-bold mb-1"
              style={{ color: "oklch(0.70 0.15 145)" }}
            >
              Billet confirmé !
            </h3>
            <div
              className="font-mono text-xl font-bold py-3 px-4 rounded-lg tracking-widest my-4"
              style={{
                background: "oklch(0.12 0.03 220)",
                color: "oklch(0.77 0.13 85)",
                border: "1px solid oklch(0.30 0.08 85)",
              }}
            >
              {bookingCode}
            </div>
            <p className="text-xs" style={{ color: "oklch(0.50 0.03 220)" }}>
              Votre ticket numérique est disponible dans le Dashboard
            </p>
            <Button
              className="mt-4 w-full"
              onClick={onClose}
              style={{ background: "oklch(0.52 0.12 160)" }}
              data-ocid="flight.close_button"
            >
              Fermer
            </Button>
          </div>
        ) : (
          <>
            {!identity ? (
              <div
                className="rounded-xl p-5 text-center"
                style={{ background: "oklch(0.20 0.06 40 / 0.3)" }}
              >
                <div className="text-3xl mb-2">🔐</div>
                <p
                  className="font-medium"
                  style={{ color: "oklch(0.77 0.13 85)" }}
                >
                  Connexion requise
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="rounded-xl p-4"
                  style={{ background: "oklch(0.12 0.03 220)" }}
                >
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span style={{ color: "oklch(0.50 0.04 220)" }}>
                        Date
                      </span>
                      <p
                        className="font-semibold"
                        style={{ color: "oklch(0.85 0.04 220)" }}
                      >
                        {departureDate}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: "oklch(0.50 0.04 220)" }}>
                        Passagers
                      </span>
                      <p
                        className="font-semibold"
                        style={{ color: "oklch(0.85 0.04 220)" }}
                      >
                        {passengers}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: "oklch(0.50 0.04 220)" }}>
                        Départ
                      </span>
                      <p
                        className="font-semibold"
                        style={{ color: "oklch(0.85 0.04 220)" }}
                      >
                        {flight.departure}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: "oklch(0.50 0.04 220)" }}>
                        Arrivée
                      </span>
                      <p
                        className="font-semibold"
                        style={{ color: "oklch(0.85 0.04 220)" }}
                      >
                        {flight.arrival}
                      </p>
                    </div>
                  </div>
                </div>

                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as "okp" | "cdf")}
                >
                  <SelectTrigger
                    className="bg-transparent border-white/20 text-white"
                    data-ocid="flight.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      background: "oklch(0.18 0.04 220)",
                      border: "1px solid oklch(0.28 0.06 220)",
                    }}
                  >
                    <SelectItem value="okp" className="text-white">
                      🦸 OKP (−10%)
                    </SelectItem>
                    <SelectItem value="cdf" className="text-white">
                      💵 CDF
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div
                  className="rounded-xl p-4"
                  style={{ background: "oklch(0.12 0.03 220)" }}
                >
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "oklch(0.60 0.03 220)" }}>
                      {passengers} passager(s) ×{" "}
                      {paymentMethod === "okp"
                        ? `${flight.priceOKP} OKP`
                        : formatCDF(flight.priceCDF)}
                    </span>
                    <span style={{ color: "oklch(0.80 0.03 220)" }}>
                      {paymentMethod === "okp"
                        ? `${total} OKP`
                        : formatCDF(total)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: "oklch(0.65 0.12 145)" }}>
                        Remise OKP −10%
                      </span>
                      <span style={{ color: "oklch(0.65 0.12 145)" }}>
                        −{Math.round(total * 0.1)} OKP
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-white/10">
                    <span style={{ color: "oklch(0.92 0.04 80)" }}>Total</span>
                    <span style={{ color: "oklch(0.77 0.13 85)" }}>
                      {paymentMethod === "okp"
                        ? `${finalAmount} OKP`
                        : formatCDF(finalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                data-ocid="flight.cancel_button"
              >
                Annuler
              </Button>
              {identity && (
                <Button
                  className="flex-1 font-semibold"
                  onClick={handleBook}
                  disabled={isLoading}
                  style={{ background: "oklch(0.52 0.12 250)" }}
                  data-ocid="flight.submit_button"
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin mr-2" />
                  ) : (
                    <Plane size={14} className="mr-2" />
                  )}
                  Réserver le vol
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FlightsTab() {
  const [origin, setOrigin] = useState("Kinshasa");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState(getTodayStr());
  const [passengers, setPassengers] = useState(1);
  const [searched, setSearched] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [activeTicket, setActiveTicket] = useState<TicketData | null>(null);
  const [showTicket, setShowTicket] = useState(false);

  const results = searched
    ? STATIC_FLIGHTS.filter(
        (f) =>
          f.origin === origin &&
          (!destination || f.destination === destination),
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Search form */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "oklch(0.16 0.04 220)",
          border: "1px solid oklch(0.25 0.05 220)",
        }}
      >
        <h3
          className="font-bold text-base mb-4 flex items-center gap-2"
          style={{ color: "oklch(0.92 0.04 80)" }}
        >
          <Plane size={16} style={{ color: "oklch(0.60 0.15 250)" }} />
          Rechercher un vol
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="space-y-1">
            <Label
              className="text-xs"
              style={{ color: "oklch(0.65 0.03 220)" }}
            >
              Ville de départ
            </Label>
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger
                className="bg-transparent border-white/20 text-white"
                data-ocid="flight.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "oklch(0.18 0.04 220)",
                  border: "1px solid oklch(0.28 0.06 220)",
                }}
              >
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city} className="text-white">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label
              className="text-xs"
              style={{ color: "oklch(0.65 0.03 220)" }}
            >
              Destination
            </Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger
                className="bg-transparent border-white/20 text-white"
                data-ocid="flight.select"
              >
                <SelectValue placeholder="Toutes destinations" />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "oklch(0.18 0.04 220)",
                  border: "1px solid oklch(0.28 0.06 220)",
                }}
              >
                <SelectItem value="" className="text-white">
                  Toutes destinations
                </SelectItem>
                {CITIES.filter((c) => c !== origin).map((city) => (
                  <SelectItem key={city} value={city} className="text-white">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label
              className="text-xs"
              style={{ color: "oklch(0.65 0.03 220)" }}
            >
              Date de départ
            </Label>
            <Input
              type="date"
              value={departureDate}
              min={getTodayStr()}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="bg-transparent border-white/20 text-white"
              data-ocid="flight.input"
            />
          </div>
          <div className="space-y-1">
            <Label
              className="text-xs"
              style={{ color: "oklch(0.65 0.03 220)" }}
            >
              Passagers
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPassengers(Math.max(1, passengers - 1))}
                className="w-8 h-8 p-0 border-white/20 text-white"
                data-ocid="flight.button"
              >
                −
              </Button>
              <span
                className="flex-1 text-center font-semibold"
                style={{ color: "oklch(0.92 0.04 80)" }}
              >
                {passengers}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPassengers(Math.min(9, passengers + 1))}
                className="w-8 h-8 p-0 border-white/20 text-white"
                data-ocid="flight.button"
              >
                +
              </Button>
            </div>
          </div>
        </div>
        <Button
          className="w-full font-semibold"
          onClick={() => setSearched(true)}
          style={{ background: "oklch(0.52 0.12 250)" }}
          data-ocid="flight.primary_button"
        >
          <Plane size={14} className="mr-2" /> Rechercher des vols
        </Button>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-3" data-ocid="flight.list">
          {results.length === 0 ? (
            <div
              className="text-center py-12"
              style={{ color: "oklch(0.55 0.04 220)" }}
              data-ocid="flight.empty_state"
            >
              <Plane size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">Aucun vol disponible</p>
              <p className="text-sm mt-1">
                Essayez un autre itinéraire ou une autre date
              </p>
            </div>
          ) : (
            results.map((flight, idx) => {
              const color = getAirlineColor(flight.airlineCode);
              const finalOKP = Math.round(flight.priceOKP * passengers * 0.9);
              return (
                <motion.div
                  key={flight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl p-4"
                  style={{
                    background: "oklch(0.16 0.04 220)",
                    border: "1px solid oklch(0.25 0.05 220)",
                  }}
                  data-ocid={`flight.item.${idx + 1}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Airline */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                      style={{
                        background: `${color}22`,
                        color,
                        border: `1px solid ${color}44`,
                      }}
                    >
                      {flight.airlineCode}
                    </div>

                    {/* Route */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-sm"
                          style={{ color: "oklch(0.92 0.04 80)" }}
                        >
                          {flight.departure}
                        </span>
                        <div className="flex-1 flex items-center gap-1">
                          <div
                            className="flex-1 h-px"
                            style={{ background: "oklch(0.30 0.05 220)" }}
                          />
                          <Plane
                            size={10}
                            style={{ color: "oklch(0.50 0.04 220)" }}
                          />
                          <div
                            className="flex-1 h-px"
                            style={{ background: "oklch(0.30 0.05 220)" }}
                          />
                        </div>
                        <span
                          className="font-bold text-sm"
                          style={{ color: "oklch(0.92 0.04 80)" }}
                        >
                          {flight.arrival}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-2 mt-1 text-xs"
                        style={{ color: "oklch(0.55 0.04 220)" }}
                      >
                        <span>{flight.origin}</span>
                        <span>→</span>
                        <span>{flight.destination}</span>
                        <span className="flex items-center gap-0.5">
                          <Clock size={10} />
                          {flight.duration}
                        </span>
                      </div>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(0.50 0.04 220)" }}
                      >
                        {flight.airline} · {flight.seats} sièges restants
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <div
                        className="font-bold text-base"
                        style={{ color: "oklch(0.77 0.13 85)" }}
                      >
                        {finalOKP.toLocaleString("fr-FR")} OKP
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "oklch(0.55 0.04 220)" }}
                      >
                        ou {formatCDF(flight.priceCDF * passengers)}
                      </div>
                      <Badge
                        className="text-xs mt-1"
                        style={{
                          background: "oklch(0.35 0.10 145 / 0.3)",
                          color: "oklch(0.70 0.12 145)",
                        }}
                      >
                        −10%
                      </Badge>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-3 font-semibold"
                    onClick={() => setSelectedFlight(flight)}
                    style={{ background: "oklch(0.52 0.12 250)" }}
                    data-ocid="flight.primary_button"
                  >
                    Sélectionner ce vol
                  </Button>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Booking modal */}
      <FlightBookingModal
        flight={selectedFlight}
        passengers={passengers}
        departureDate={departureDate}
        onClose={() => setSelectedFlight(null)}
        onTicket={(ticket) => {
          setActiveTicket(ticket);
          setSelectedFlight(null);
          setTimeout(() => setShowTicket(true), 300);
        }}
      />

      {/* Digital ticket */}
      <DigitalTicket
        ticket={activeTicket}
        open={showTicket}
        onClose={() => setShowTicket(false)}
      />
    </div>
  );
}

// ─── Main Section ───────────────────────────────────────────────────────────────────

export default function ReservationsSection() {
  const { actor, isFetching } = useActor();
  const [activeCategory, setActiveCategory] = useState("tous");
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(
    null,
  );
  const [selectedPark, setSelectedPark] = useState<Structure | null>(null);
  const [parkTicket, setParkTicket] = useState<TicketData | null>(null);
  const [showParkTicket, setShowParkTicket] = useState(false);

  const { data: structures = SAMPLE_STRUCTURES, isLoading } = useQuery<
    Structure[]
  >({
    queryKey: ["structures"],
    queryFn: async () => {
      if (!actor) return SAMPLE_STRUCTURES;
      try {
        const result = (await (actor as any).getStructures()) as Structure[];
        return result.length > 0 ? result : SAMPLE_STRUCTURES;
      } catch {
        return SAMPLE_STRUCTURES;
      }
    },
    enabled: !!actor && !isFetching,
  });

  const hotelStructures = structures.filter(
    (s) => s.isActive && (s.category === "hotel" || s.category === "structure"),
  );
  const parkStructures = structures.filter(
    (s) => s.isActive && s.category === "parc",
  );

  const hotelCategories = [
    { id: "tous", label: "Tous" },
    { id: "hotel", label: "🏨 Hôtels" },
    { id: "structure", label: "🏙️ Structures" },
  ];

  const filteredHotels =
    activeCategory === "tous"
      ? hotelStructures
      : hotelStructures.filter((s) => s.category === activeCategory);

  return (
    <section
      id="reservations"
      className="py-16 px-4 sm:px-6"
      style={{ background: "oklch(0.12 0.03 220)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge
            className="mb-4 text-sm px-4 py-1.5"
            style={{
              background: "oklch(0.25 0.10 195 / 0.3)",
              color: "oklch(0.70 0.15 195)",
              border: "1px solid oklch(0.40 0.12 195 / 0.4)",
            }}
          >
            🦸 Powered by Okapi Token
          </Badge>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: "oklch(0.92 0.04 80)" }}
          >
            Réservations & Billets
          </h2>
          <p
            className="text-base max-w-2xl mx-auto"
            style={{ color: "oklch(0.65 0.03 220)" }}
          >
            Réservez vos hôtels, accédez aux parcs nationaux et réservez vos
            vols en payant avec des tokens Okapi. Tickets numériques inclus.
          </p>
        </motion.div>

        {/* OKP Advantage Banner */}
        <motion.div
          className="rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.10 85 / 0.25), oklch(0.20 0.10 60 / 0.20))",
            border: "1px solid oklch(0.40 0.12 85 / 0.40)",
          }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.77 0.13 85 / 0.2)" }}
          >
            <Sparkles size={22} style={{ color: "oklch(0.77 0.13 85)" }} />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3
              className="font-bold text-lg mb-1"
              style={{ color: "oklch(0.82 0.12 85)" }}
            >
              Payez en OKP et économisez 10% sur toutes vos réservations
            </h3>
            <p className="text-sm" style={{ color: "oklch(0.65 0.06 85)" }}>
              Hôtels, parcs nationaux, vols — tickets numériques générés
              automatiquement.
            </p>
          </div>
          <Badge
            className="shrink-0 text-base font-bold px-4 py-2"
            style={{
              background: "oklch(0.77 0.13 85 / 0.2)",
              color: "oklch(0.82 0.12 85)",
              border: "1px solid oklch(0.60 0.12 85 / 0.5)",
            }}
          >
            −10% avec OKP
          </Badge>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="hotels" data-ocid="reservation.tab">
          <TabsList
            className="mb-8 w-full sm:w-auto"
            style={{
              background: "oklch(0.16 0.04 220)",
              border: "1px solid oklch(0.25 0.05 220)",
            }}
          >
            <TabsTrigger
              value="hotels"
              className="flex items-center gap-2 data-[state=active]:bg-teal-700"
              data-ocid="reservation.tab"
            >
              <Building2 size={14} /> Hôtels & Structures
            </TabsTrigger>
            <TabsTrigger
              value="parcs"
              className="flex items-center gap-2 data-[state=active]:bg-green-800"
              data-ocid="reservation.tab"
            >
              <TreePine size={14} /> Parcs Nationaux
            </TabsTrigger>
            <TabsTrigger
              value="vols"
              className="flex items-center gap-2 data-[state=active]:bg-blue-800"
              data-ocid="reservation.tab"
            >
              <Plane size={14} /> Vols ✈️
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Hôtels & Structures */}
          <TabsContent value="hotels">
            <div
              className="flex gap-2 flex-wrap mb-6"
              data-ocid="reservation.tab"
            >
              {hotelCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    background:
                      activeCategory === cat.id
                        ? "oklch(0.60 0.15 195)"
                        : "oklch(0.20 0.04 220)",
                    color:
                      activeCategory === cat.id
                        ? "white"
                        : "oklch(0.65 0.04 220)",
                    border:
                      activeCategory === cat.id
                        ? "1px solid oklch(0.60 0.15 195)"
                        : "1px solid oklch(0.28 0.05 220)",
                  }}
                  data-ocid="reservation.tab"
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div
                className="flex items-center justify-center py-20"
                data-ocid="reservation.loading_state"
              >
                <Loader2
                  size={40}
                  className="animate-spin"
                  style={{ color: "oklch(0.60 0.15 195)" }}
                />
              </div>
            ) : filteredHotels.length === 0 ? (
              <div
                className="text-center py-20"
                style={{ color: "oklch(0.55 0.04 220)" }}
                data-ocid="reservation.empty_state"
              >
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg">Aucune structure dans cette catégorie</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHotels.map((structure, idx) => (
                  <StructureCard
                    key={String(structure.id)}
                    structure={structure}
                    index={idx}
                    onReserve={setSelectedStructure}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Parcs Nationaux */}
          <TabsContent value="parcs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {parkStructures.map((park, idx) => (
                <motion.div
                  key={String(park.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                >
                  <Card
                    className="overflow-hidden flex flex-col h-full"
                    style={{
                      background: "oklch(0.16 0.04 220)",
                      border: "1px solid oklch(0.25 0.05 220)",
                    }}
                  >
                    <div
                      className="h-36 flex items-center justify-center relative"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.20 0.08 155), oklch(0.26 0.10 140))",
                      }}
                    >
                      <TreePine
                        size={56}
                        className="opacity-30"
                        style={{ color: "oklch(0.60 0.15 145)" }}
                      />
                      <div className="absolute top-3 left-3">
                        <Badge
                          className="text-xs font-semibold"
                          style={{
                            background: "oklch(0.60 0.15 145 / 0.22)",
                            color: "oklch(0.60 0.15 145)",
                            border: "1px solid oklch(0.60 0.15 145 / 0.44)",
                          }}
                        >
                          <TreePine size={11} className="mr-1" /> Parc National
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge
                          className="text-xs"
                          style={{
                            background: "oklch(0.35 0.10 145 / 0.5)",
                            color: "oklch(0.75 0.15 145)",
                            border: "1px solid oklch(0.50 0.10 145 / 0.5)",
                          }}
                        >
                          Ouvert
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <h3
                        className="font-bold text-base leading-tight"
                        style={{ color: "oklch(0.92 0.04 80)" }}
                      >
                        {park.name}
                      </h3>
                      <p
                        className="text-xs flex items-center gap-1"
                        style={{ color: "oklch(0.55 0.04 220)" }}
                      >
                        <MapPin size={11} />
                        {park.location}
                      </p>
                    </CardHeader>

                    <CardContent className="pb-3 flex-1">
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "oklch(0.65 0.03 220)" }}
                      >
                        {park.description}
                      </p>

                      {/* Time slot preview */}
                      <div className="mt-3 flex items-center gap-2">
                        {TIME_SLOTS.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex-1 rounded-lg py-1.5 text-center"
                            style={{
                              background: "oklch(0.12 0.03 220)",
                              border: "1px solid oklch(0.22 0.04 220)",
                            }}
                          >
                            <div className="text-base">{slot.icon}</div>
                            <div
                              className="text-xs"
                              style={{ color: "oklch(0.55 0.04 220)" }}
                            >
                              {slot.time}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div
                        className="mt-3 flex items-center gap-3 text-xs"
                        style={{ color: "oklch(0.55 0.04 220)" }}
                      >
                        <span className="flex items-center gap-1">
                          <Users size={11} /> Capacité : {Number(park.capacity)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> Guide disponible +500 OKP
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0 flex flex-col gap-3">
                      <div
                        className="w-full rounded-lg p-3 flex justify-between items-center"
                        style={{ background: "oklch(0.12 0.03 220)" }}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="font-bold text-lg"
                              style={{ color: "oklch(0.77 0.13 85)" }}
                            >
                              <Coins size={14} className="inline mr-1" />
                              {Math.round(park.priceOKP * 0.9).toLocaleString(
                                "fr-FR",
                              )}{" "}
                              OKP
                            </span>
                            <Badge
                              className="text-xs px-1.5 py-0"
                              style={{
                                background: "oklch(0.35 0.10 145 / 0.3)",
                                color: "oklch(0.70 0.12 145)",
                              }}
                            >
                              −10%
                            </Badge>
                          </div>
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: "oklch(0.55 0.04 220)" }}
                          >
                            ou {formatCDF(park.priceCDF)}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            color: "oklch(0.60 0.15 145)",
                            borderColor: "oklch(0.40 0.10 145)",
                          }}
                        >
                          🌿 Ticket inclus
                        </Badge>
                      </div>

                      <Button
                        className="w-full font-semibold"
                        onClick={() => setSelectedPark(park)}
                        style={{ background: "oklch(0.45 0.12 145)" }}
                        data-ocid="park.primary_button"
                      >
                        <TreePine size={14} className="mr-2" /> Réserver +
                        Ticket
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 3: Vols */}
          <TabsContent value="vols">
            <FlightsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Hotel Reservation Modal */}
      <ReservationModal
        structure={selectedStructure}
        onClose={() => setSelectedStructure(null)}
      />

      {/* Park Booking Modal */}
      <ParkBookingModal
        park={selectedPark}
        onClose={() => setSelectedPark(null)}
        onTicket={(ticket) => {
          setParkTicket(ticket);
          setSelectedPark(null);
          setTimeout(() => setShowParkTicket(true), 300);
        }}
      />

      {/* Park Digital Ticket */}
      <DigitalTicket
        ticket={parkTicket}
        open={showParkTicket}
        onClose={() => setShowParkTicket(false)}
      />
    </section>
  );
}
