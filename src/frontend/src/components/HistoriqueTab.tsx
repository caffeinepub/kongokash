import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  CreditCard,
  Download,
  Filter,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useActor } from "../hooks/useActor";
import { PaymentProof } from "./PaymentProof";
import { RatingModal } from "./RatingModal";
import {
  type ConfirmationData,
  ReservationConfirmation,
} from "./ReservationConfirmation";
import {
  ReservationTimeline,
  buildReservationSteps,
} from "./ReservationTimeline";

type EventType = "all" | "reservations" | "payments" | "disputes";

interface HistoryEvent {
  id: string;
  type: "reservation" | "payment" | "dispute";
  title: string;
  subtitle: string;
  amount?: number;
  currency?: string;
  status: string;
  timestamp: number;
  bookingCode?: string;
  raw?: any;
}

function loadDisputeEvents(): HistoryEvent[] {
  try {
    const raw = localStorage.getItem("kongokash_support_tickets");
    if (!raw) return [];
    const tickets = JSON.parse(raw) as any[];
    return tickets
      .filter((t) => t.subject === "Litige" || t.category === "dispute")
      .map((t) => ({
        id: t.id,
        type: "dispute" as const,
        title: `Litige ${t.id}`,
        subtitle: `${t.message?.slice(0, 60) ?? "Litige ouvert"}...`,
        status: t.status,
        timestamp: t.createdAt,
      }));
  } catch {
    return [];
  }
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

const TYPE_FILTERS: { key: EventType; label: string; icon: React.ReactNode }[] =
  [
    { key: "all", label: "Tout", icon: <Filter size={12} /> },
    {
      key: "reservations",
      label: "Réservations",
      icon: <BookOpen size={12} />,
    },
    { key: "payments", label: "Paiements", icon: <CreditCard size={12} /> },
    { key: "disputes", label: "Litiges", icon: <AlertTriangle size={12} /> },
  ];

export function HistoriqueTab() {
  const { actor, isFetching } = useActor();
  const [filter, setFilter] = useState<EventType>("all");
  const [confirmationData, setConfirmationData] =
    useState<ConfirmationData | null>(null);
  const [ratingTarget, setRatingTarget] = useState<{
    bookingCode: string;
    serviceName: string;
    isCompleted: boolean;
  } | null>(null);
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null);

  const { data: reservations = [] } = useQuery({
    queryKey: ["myReservations"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await (actor as any).getMyReservations()) as any[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const allEvents = useMemo((): HistoryEvent[] => {
    const resEvents: HistoryEvent[] = reservations.map((r: any) => ({
      id: `res-${r.id}`,
      type: "reservation" as const,
      title: r.structureName,
      subtitle: `${r.checkIn}${r.checkOut ? ` → ${r.checkOut}` : ""} · ${Number(r.guests)} pers.`,
      amount: r.totalAmount,
      currency: r.paymentMethod?.toUpperCase() ?? "OKP",
      status: r.status,
      timestamp: Number(r.createdAt) / 1_000_000,
      bookingCode: r.bookingCode,
      raw: r,
    }));

    const payEvents: HistoryEvent[] = reservations
      .filter((r: any) => r.status === "confirmed" || r.status === "completed")
      .map((r: any) => ({
        id: `pay-${r.id}`,
        type: "payment" as const,
        title: `Paiement — ${r.structureName}`,
        subtitle: `Code ${r.bookingCode}`,
        amount: r.totalAmount,
        currency: r.paymentMethod?.toUpperCase() ?? "OKP",
        status: "confirmed",
        timestamp: Number(r.createdAt) / 1_000_000 + 30_000,
        bookingCode: r.bookingCode,
        raw: r,
      }));

    const disputeEvents = loadDisputeEvents();

    return [...resEvents, ...payEvents, ...disputeEvents].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  }, [reservations]);

  const filtered = useMemo(() => {
    if (filter === "all") return allEvents;
    if (filter === "reservations")
      return allEvents.filter((e) => e.type === "reservation");
    if (filter === "payments")
      return allEvents.filter((e) => e.type === "payment");
    return allEvents.filter((e) => e.type === "dispute");
  }, [allEvents, filter]);

  const exportCSV = () => {
    const headers = [
      "ID",
      "Type",
      "Titre",
      "Montant",
      "Devise",
      "Statut",
      "Date",
    ];
    const rows = allEvents.map((e) => [
      e.id,
      e.type,
      `"${e.title}"`,
      e.amount ?? "",
      e.currency ?? "",
      e.status,
      formatDate(e.timestamp),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kongokash_historique.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const typeIcon = {
    reservation: (
      <BookOpen size={13} style={{ color: "oklch(0.60 0.15 195)" }} />
    ),
    payment: <CreditCard size={13} style={{ color: "oklch(0.70 0.15 145)" }} />,
    dispute: (
      <AlertTriangle size={13} style={{ color: "oklch(0.70 0.15 20)" }} />
    ),
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          bg: "oklch(0.28 0.10 145 / 0.3)",
          color: "oklch(0.70 0.15 145)",
        };
      case "cancelled":
      case "failed":
        return {
          bg: "oklch(0.28 0.10 20 / 0.3)",
          color: "oklch(0.65 0.15 20)",
        };
      case "resolved":
        return {
          bg: "oklch(0.28 0.10 195 / 0.3)",
          color: "oklch(0.65 0.15 195)",
        };
      case "open":
      case "in_progress":
        return {
          bg: "oklch(0.30 0.10 85 / 0.3)",
          color: "oklch(0.77 0.13 85)",
        };
      default:
        return {
          bg: "oklch(0.25 0.05 220 / 0.3)",
          color: "oklch(0.55 0.04 220)",
        };
    }
  };

  const statusLabel: Record<string, string> = {
    confirmed: "Confirmée",
    pending: "En attente",
    cancelled: "Annulée",
    refunded: "Remboursée",
    completed: "Terminée",
    open: "Ouvert",
    in_progress: "En cours",
    resolved: "Résolu",
    failed: "Échoué",
  };

  return (
    <div className="space-y-5" data-ocid="historique.section">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2
            className="text-lg font-bold"
            style={{ color: "oklch(0.92 0.04 80)" }}
          >
            Historique complet
          </h2>
          <p className="text-sm" style={{ color: "oklch(0.55 0.04 220)" }}>
            Toutes vos activités sur KongoKash
          </p>
        </div>
        <Button
          onClick={exportCSV}
          variant="outline"
          size="sm"
          className="gap-2 border-white/20 text-white hover:bg-white/10 text-xs"
          data-ocid="historique.secondary_button"
        >
          <Download size={13} />
          Exporter CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background:
                filter === key
                  ? "oklch(0.52 0.12 160)"
                  : "oklch(0.18 0.04 220)",
              color: filter === key ? "white" : "oklch(0.60 0.04 220)",
              border: `1px solid ${
                filter === key ? "oklch(0.52 0.12 160)" : "oklch(0.28 0.05 220)"
              }`,
            }}
            data-ocid="historique.tab"
          >
            {icon}
            {label}
            {key !== "all" && " ("}
            {key === "reservations" &&
              allEvents.filter((e) => e.type === "reservation").length}
            {key === "payments" &&
              allEvents.filter((e) => e.type === "payment").length}
            {key === "disputes" &&
              allEvents.filter((e) => e.type === "dispute").length}
            {key !== "all" && ")"}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16" data-ocid="historique.empty_state">
          <div className="text-5xl mb-4">📋</div>
          <p className="font-medium" style={{ color: "oklch(0.55 0.04 220)" }}>
            Aucun événement trouvé
          </p>
          <p className="text-sm mt-1" style={{ color: "oklch(0.40 0.03 220)" }}>
            Vos réservations, paiements et litiges apparaîtront ici
          </p>
        </div>
      )}

      {/* Event list */}
      <div className="space-y-3" data-ocid="historique.list">
        {filtered.map((event, idx) => {
          const ss = statusStyle(event.status);
          const isExpanded = expandedTimeline === event.id;
          const isReservation = event.type === "reservation";
          const isCompleted =
            event.status === "completed" || event.status === "funds_released";

          return (
            <div
              key={event.id}
              className="rounded-xl overflow-hidden"
              style={{
                background: "oklch(0.16 0.04 220)",
                border: "1px solid oklch(0.25 0.05 220)",
              }}
              data-ocid={`historique.item.${idx + 1}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div
                      className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background:
                          event.type === "reservation"
                            ? "oklch(0.22 0.08 195 / 0.3)"
                            : event.type === "payment"
                              ? "oklch(0.22 0.08 145 / 0.3)"
                              : "oklch(0.22 0.08 20 / 0.3)",
                      }}
                    >
                      {typeIcon[event.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span
                          className="font-semibold text-sm truncate"
                          style={{ color: "oklch(0.88 0.03 80)" }}
                        >
                          {event.title}
                        </span>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                          style={{ background: ss.bg, color: ss.color }}
                        >
                          {statusLabel[event.status] ?? event.status}
                        </span>
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: "oklch(0.55 0.03 220)" }}
                      >
                        {event.subtitle}
                      </p>
                      {event.bookingCode && (
                        <span
                          className="font-mono text-xs"
                          style={{ color: "oklch(0.65 0.10 85)" }}
                        >
                          #{event.bookingCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {event.amount && (
                      <span
                        className="text-sm font-bold"
                        style={{ color: "oklch(0.77 0.13 85)" }}
                      >
                        {event.amount.toLocaleString("fr-FR")} {event.currency}
                      </span>
                    )}
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.40 0.03 220)" }}
                    >
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Payment proof for payments */}
                {event.type === "payment" && event.bookingCode && (
                  <div className="mt-3">
                    <PaymentProof
                      bookingCode={event.bookingCode}
                      amount={event.amount ?? 0}
                      currency={event.currency ?? "OKP"}
                      timestamp={event.timestamp}
                    />
                  </div>
                )}

                {/* Actions */}
                {isReservation && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {event.status === "confirmed" && event.raw && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmationData({
                            bookingCode: event.raw.bookingCode,
                            serviceName: event.raw.structureName,
                            checkIn: event.raw.checkIn,
                            checkOut: event.raw.checkOut,
                            guests: Number(event.raw.guests),
                            amount: event.raw.totalAmount,
                            currency:
                              event.raw.paymentMethod?.toUpperCase() ?? "OKP",
                            paymentMethod: event.raw.paymentMethod,
                            status: event.raw.status,
                            createdAt: Number(event.raw.createdAt) / 1_000_000,
                          })
                        }
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: "oklch(0.25 0.10 195 / 0.3)",
                          color: "oklch(0.60 0.15 195)",
                          border: "1px solid oklch(0.40 0.12 195 / 0.4)",
                        }}
                        data-ocid={`historique.secondary_button.${idx + 1}`}
                      >
                        📄 Voir confirmation
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedTimeline(isExpanded ? null : event.id)
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: "oklch(0.20 0.06 220 / 0.4)",
                        color: "oklch(0.55 0.06 220)",
                        border: "1px solid oklch(0.30 0.06 220 / 0.4)",
                      }}
                      data-ocid={`historique.toggle.${idx + 1}`}
                    >
                      {isExpanded ? "▲ Masquer" : "📍 Voir progression"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setRatingTarget({
                          bookingCode: event.bookingCode ?? "",
                          serviceName: event.title,
                          isCompleted,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: "oklch(0.28 0.10 85 / 0.3)",
                        color: "oklch(0.70 0.13 85)",
                        border: "1px solid oklch(0.45 0.12 85 / 0.4)",
                      }}
                      data-ocid={`historique.edit_button.${idx + 1}`}
                    >
                      ⭐ Laisser un avis
                    </button>
                  </div>
                )}
              </div>

              {/* Timeline expansion */}
              {isExpanded && isReservation && event.raw && (
                <div
                  className="px-4 pb-4 pt-2"
                  style={{
                    background: "oklch(0.13 0.03 220)",
                    borderTop: "1px solid oklch(0.22 0.04 220)",
                  }}
                >
                  <p
                    className="text-xs font-semibold mb-3"
                    style={{ color: "oklch(0.55 0.04 220)" }}
                  >
                    Progression de la réservation
                  </p>
                  <ReservationTimeline
                    steps={buildReservationSteps(
                      event.raw.status,
                      Number(event.raw.createdAt) / 1_000_000,
                    )}
                    compact
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation modal */}
      {confirmationData && (
        <ReservationConfirmation
          data={confirmationData}
          open={!!confirmationData}
          onClose={() => setConfirmationData(null)}
        />
      )}

      {/* Rating modal */}
      {ratingTarget && (
        <RatingModal
          bookingCode={ratingTarget.bookingCode}
          serviceName={ratingTarget.serviceName}
          isCompleted={ratingTarget.isCompleted}
          open={!!ratingTarget}
          onClose={() => setRatingTarget(null)}
        />
      )}
    </div>
  );
}
