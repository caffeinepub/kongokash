import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export type TimelineStepStatus = "completed" | "active" | "pending";

export interface TimelineStep {
  key: string;
  label: string;
  description?: string;
  timestamp?: number;
  status: TimelineStepStatus;
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

interface Props {
  steps: TimelineStep[];
  compact?: boolean;
}

export function ReservationTimeline({ steps, compact = false }: Props) {
  return (
    <div className="space-y-0" data-ocid="reservation_timeline.panel">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.key} className="flex gap-3">
            {/* Left: icon + line */}
            <div className="flex flex-col items-center">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 z-10"
                style={{
                  background:
                    step.status === "completed"
                      ? "oklch(0.30 0.12 160 / 0.4)"
                      : step.status === "active"
                        ? "oklch(0.30 0.12 195 / 0.4)"
                        : "oklch(0.18 0.03 220)",
                  border:
                    step.status === "completed"
                      ? "2px solid oklch(0.55 0.15 145)"
                      : step.status === "active"
                        ? "2px solid oklch(0.52 0.12 195)"
                        : "2px solid oklch(0.30 0.05 220)",
                }}
              >
                {step.status === "completed" ? (
                  <CheckCircle2
                    size={14}
                    style={{ color: "oklch(0.70 0.15 145)" }}
                  />
                ) : step.status === "active" ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                    style={{ color: "oklch(0.60 0.15 195)" }}
                  />
                ) : (
                  <Circle size={14} style={{ color: "oklch(0.40 0.04 220)" }} />
                )}
              </div>
              {!isLast && (
                <div
                  className="w-0.5 flex-1 min-h-[20px]"
                  style={{
                    background:
                      step.status === "completed"
                        ? "oklch(0.45 0.12 160)"
                        : "oklch(0.25 0.04 220)",
                  }}
                />
              )}
            </div>

            {/* Right: content */}
            <div className={`flex-1 ${isLast ? "" : "pb-4"}`}>
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span
                  className={`font-semibold ${compact ? "text-xs" : "text-sm"}`}
                  style={{
                    color:
                      step.status === "completed"
                        ? "oklch(0.75 0.12 145)"
                        : step.status === "active"
                          ? "oklch(0.75 0.12 195)"
                          : "oklch(0.45 0.03 220)",
                  }}
                >
                  {step.label}
                </span>
                {step.timestamp && (
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.40 0.03 220)" }}
                  >
                    {formatDate(step.timestamp)}
                  </span>
                )}
              </div>
              {step.description && !compact && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.50 0.03 220)" }}
                >
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function buildReservationSteps(
  status: string,
  createdAt: number,
): TimelineStep[] {
  const confirmed = createdAt + 5 * 60 * 1000;
  const completed = createdAt + 2 * 24 * 60 * 60 * 1000;

  const isConfirmed = [
    "confirmed",
    "checkin_confirmed",
    "completed",
    "funds_released",
  ].includes(status);
  const isCompleted = ["completed", "funds_released"].includes(status);
  const isCancelled = ["cancelled", "refunded"].includes(status);

  return [
    {
      key: "reserved",
      label: "Réservé",
      description: "Demande de réservation enregistrée",
      timestamp: createdAt,
      status: "completed",
    },
    {
      key: "escrow",
      label: "Paiement Escrow Bloqué",
      description: "Fonds sécurisés dans le smart contract",
      timestamp: createdAt + 30 * 1000,
      status: isCancelled ? "pending" : "completed",
    },
    {
      key: "confirmed",
      label: isCancelled ? "Annulée" : "Confirmé par Partenaire",
      description: isCancelled
        ? "Réservation annulée, remboursement en cours"
        : "Le partenaire a validé votre réservation",
      timestamp: isConfirmed ? confirmed : undefined,
      status: isCancelled
        ? "pending"
        : isConfirmed
          ? "completed"
          : status === "pending"
            ? "active"
            : "pending",
    },
    {
      key: "service",
      label: "Service Terminé",
      description: "Check-in effectué, service rendu",
      timestamp: isCompleted ? completed : undefined,
      status: isCompleted ? "completed" : isCancelled ? "pending" : "pending",
    },
    {
      key: "funds",
      label: "Fonds Libérés",
      description: "Paiement transféré au partenaire",
      timestamp: isCompleted ? completed + 1 * 60 * 60 * 1000 : undefined,
      status: isCompleted ? "completed" : isCancelled ? "pending" : "pending",
    },
  ];
}
