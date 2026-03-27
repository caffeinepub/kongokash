import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const RATINGS_KEY = "kongokash_ratings";

export interface Rating {
  bookingCode: string;
  serviceName: string;
  stars: number;
  comment: string;
  createdAt: number;
}

function loadRatings(): Rating[] {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRating(rating: Rating) {
  const ratings = loadRatings();
  const filtered = ratings.filter((r) => r.bookingCode !== rating.bookingCode);
  filtered.unshift(rating);
  localStorage.setItem(RATINGS_KEY, JSON.stringify(filtered));
}

export function getRating(bookingCode: string): Rating | undefined {
  return loadRatings().find((r) => r.bookingCode === bookingCode);
}

interface Props {
  bookingCode: string;
  serviceName: string;
  isCompleted: boolean;
  open: boolean;
  onClose: () => void;
}

export function RatingModal({
  bookingCode,
  serviceName,
  isCompleted,
  open,
  onClose,
}: Props) {
  const existing = getRating(bookingCode);
  const [stars, setStars] = useState(existing?.stars ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (stars === 0) {
      toast.error("Veuillez sélectionner une note.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      saveRating({
        bookingCode,
        serviceName,
        stars,
        comment,
        createdAt: Date.now(),
      });
      setSubmitting(false);
      toast.success("Merci pour votre avis !");
      onClose();
    }, 600);
  };

  const labels = ["", "Mauvais", "Passable", "Bien", "Très bien", "Excellent"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm"
        style={{
          background: "oklch(0.15 0.04 220)",
          border: "1px solid oklch(0.28 0.06 220)",
        }}
        data-ocid="rating.dialog"
      >
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2"
            style={{ color: "oklch(0.92 0.04 80)" }}
          >
            <Star size={18} style={{ color: "oklch(0.77 0.15 85)" }} />
            Laisser un avis
          </DialogTitle>
        </DialogHeader>

        {!isCompleted && (
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              background: "oklch(0.18 0.04 220)",
              border: "1px solid oklch(0.30 0.05 220)",
            }}
          >
            {/* Phase 2 overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center z-10 rounded-xl"
              style={{ background: "oklch(0.10 0.04 220 / 0.85)" }}
            >
              <div className="text-center px-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                  style={{
                    background: "oklch(0.30 0.12 85 / 0.4)",
                    color: "oklch(0.77 0.13 85)",
                    border: "1px solid oklch(0.50 0.12 85 / 0.4)",
                  }}
                >
                  Phase 2 — Bientôt disponible
                </span>
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.60 0.04 220)" }}
                >
                  Les avis seront activés une fois votre service terminé.
                </p>
              </div>
            </div>
            {/* Blurred content */}
            <div className="p-4 opacity-30 select-none pointer-events-none">
              <p
                className="text-sm mb-3 font-medium"
                style={{ color: "oklch(0.75 0.03 220)" }}
              >
                {serviceName}
              </p>
              <div className="flex gap-2 justify-center mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={28}
                    style={{ color: "oklch(0.50 0.05 220)" }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="space-y-4 py-1">
            <p
              className="text-sm font-medium"
              style={{ color: "oklch(0.75 0.03 220)" }}
            >
              {serviceName}
            </p>

            {/* Stars */}
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setStars(s)}
                  className="transition-transform hover:scale-110 focus:scale-110"
                  data-ocid="rating.toggle"
                >
                  <Star
                    size={32}
                    style={{
                      color:
                        s <= (hovered || stars)
                          ? "oklch(0.77 0.15 85)"
                          : "oklch(0.30 0.04 220)",
                      fill:
                        s <= (hovered || stars)
                          ? "oklch(0.77 0.15 85)"
                          : "transparent",
                    }}
                  />
                </button>
              ))}
            </div>

            {stars > 0 && (
              <p
                className="text-center text-sm font-semibold"
                style={{ color: "oklch(0.77 0.13 85)" }}
              >
                {labels[stars]}
              </p>
            )}

            {/* Comment */}
            <div className="space-y-1.5">
              <span
                className="text-xs"
                style={{ color: "oklch(0.55 0.03 220)" }}
              >
                Commentaire (optionnel)
              </span>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience…"
                rows={3}
                className="bg-transparent border-white/20 text-white placeholder:text-white/30 resize-none text-sm"
                data-ocid="rating.textarea"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10"
            data-ocid="rating.cancel_button"
          >
            Fermer
          </Button>
          {isCompleted && (
            <Button
              onClick={handleSubmit}
              disabled={submitting || stars === 0}
              style={{ background: "oklch(0.52 0.12 160)" }}
              className="gap-2 text-white font-semibold"
              data-ocid="rating.submit_button"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Star size={14} />
              )}
              Envoyer l'avis
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
