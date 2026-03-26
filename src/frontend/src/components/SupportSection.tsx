import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Clock,
  Headphones,
  MessageSquare,
  Plus,
  Send,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TicketStatus = "open" | "in_progress" | "resolved";
export type TicketSubject = "Réservation" | "Paiement" | "Compte" | "Autre";

export interface SupportTicket {
  id: string;
  subject: TicketSubject;
  message: string;
  status: TicketStatus;
  createdAt: number;
  updatedAt: number;
  reply?: string;
}

const STORAGE_KEY = "kongokash_support_tickets";

function loadTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEMO_TICKETS;
    const parsed = JSON.parse(raw) as SupportTicket[];
    return parsed.length > 0 ? parsed : DEMO_TICKETS;
  } catch {
    return DEMO_TICKETS;
  }
}

function saveTickets(tickets: SupportTicket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

const DEMO_TICKETS: SupportTicket[] = [
  {
    id: "TKT-001",
    subject: "Réservation",
    message:
      "J'ai effectué une réservation à l'Hôtel Okapi Lodge mais je n'ai pas reçu mon code de confirmation. Pouvez-vous m'aider ?",
    status: "resolved",
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    reply:
      "Votre code de réservation a été renvoyé. Vérifiez votre section Mes Tickets dans le tableau de bord.",
  },
  {
    id: "TKT-002",
    subject: "Paiement",
    message:
      "Mon dépôt Airtel Money de 50 000 FC n'apparaît pas sur mon compte après 2 heures.",
    status: "in_progress",
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 60 * 60 * 1000,
    reply: "Votre dossier est en cours d'examen par notre équipe technique.",
  },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusLabel(status: TicketStatus) {
  switch (status) {
    case "open":
      return "Ouvert";
    case "in_progress":
      return "En cours";
    case "resolved":
      return "Résolu";
  }
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<
    TicketStatus,
    { bg: string; color: string; icon: React.ReactNode }
  > = {
    open: {
      bg: "oklch(0.30 0.10 85 / 0.25)",
      color: "oklch(0.77 0.13 85)",
      icon: <Clock size={11} />,
    },
    in_progress: {
      bg: "oklch(0.28 0.10 250 / 0.25)",
      color: "oklch(0.65 0.15 250)",
      icon: <MessageSquare size={11} />,
    },
    resolved: {
      bg: "oklch(0.28 0.10 145 / 0.25)",
      color: "oklch(0.65 0.15 145)",
      icon: <CheckCircle2 size={11} />,
    },
  };
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.icon}
      {statusLabel(status)}
    </span>
  );
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

// ─── User Support Section ─────────────────────────────────────────────────────

export default function SupportSection() {
  const [tickets, setTickets] = useState<SupportTicket[]>(loadTickets);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState<TicketSubject>("Réservation");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );

  const handleSubmit = () => {
    if (!message.trim() || message.trim().length < 10) {
      toast.error("Veuillez décrire votre problème en au moins 10 caractères.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const newTicket: SupportTicket = {
        id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
        subject,
        message: message.trim(),
        status: "open",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [newTicket, ...tickets];
      setTickets(updated);
      saveTickets(updated);
      setShowForm(false);
      setMessage("");
      setSubmitting(false);
      toast.success(
        "Votre ticket a été envoyé. Nous vous répondrons dans les 24h.",
      );
    }, 800);
  };

  const openTickets = tickets.filter((t) => t.status !== "resolved");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved");

  return (
    <div className="space-y-6" data-ocid="support.section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.52 0.12 160 / 0.2)" }}
          >
            <Headphones size={20} style={{ color: "oklch(0.60 0.15 195)" }} />
          </div>
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: "oklch(0.92 0.04 80)" }}
            >
              Support Client
            </h2>
            <p className="text-sm" style={{ color: "oklch(0.55 0.04 220)" }}>
              Notre équipe vous répond en moins de 24h
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          style={{ background: "oklch(0.52 0.12 160)" }}
          className="gap-2 text-white font-semibold"
          data-ocid="support.open_modal_button"
        >
          <Plus size={15} />
          Nouveau ticket
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total",
            value: tickets.length,
            color: "oklch(0.60 0.15 195)",
          },
          {
            label: "En cours",
            value: openTickets.length,
            color: "oklch(0.77 0.13 85)",
          },
          {
            label: "Résolus",
            value: resolvedTickets.length,
            color: "oklch(0.65 0.15 145)",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 text-center"
            style={{
              background: "oklch(0.16 0.04 220)",
              border: "1px solid oklch(0.25 0.05 220)",
            }}
          >
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: "oklch(0.55 0.04 220)" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Ticket list */}
      {tickets.length === 0 ? (
        <div className="text-center py-14" data-ocid="support.empty_state">
          <Headphones size={36} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium" style={{ color: "oklch(0.65 0.04 220)" }}>
            Aucun ticket ouvert
          </p>
          <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.03 220)" }}>
            Créez un ticket si vous avez besoin d'aide
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="support.list">
          {tickets.map((ticket, idx) => (
            <button
              key={ticket.id}
              type="button"
              className="w-full rounded-xl p-4 cursor-pointer transition-all hover:border-teal-500/40 text-left"
              style={{
                background: "oklch(0.16 0.04 220)",
                border: "1px solid oklch(0.25 0.05 220)",
              }}
              onClick={() => setSelectedTicket(ticket)}
              data-ocid={`support.item.${idx + 1}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: "oklch(0.77 0.13 85)" }}
                    >
                      {ticket.id}
                    </span>
                    <StatusBadge status={ticket.status} />
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "oklch(0.25 0.08 195 / 0.3)",
                        color: "oklch(0.60 0.15 195)",
                      }}
                    >
                      {ticket.subject}
                    </span>
                  </div>
                  <p
                    className="text-sm line-clamp-2"
                    style={{ color: "oklch(0.75 0.03 220)" }}
                  >
                    {ticket.message}
                  </p>
                  {ticket.reply && (
                    <div
                      className="mt-2 rounded-lg px-3 py-2 text-xs"
                      style={{
                        background: "oklch(0.22 0.06 195 / 0.25)",
                        color: "oklch(0.65 0.04 220)",
                        borderLeft: "2px solid oklch(0.52 0.12 160)",
                      }}
                    >
                      <span
                        style={{ color: "oklch(0.60 0.15 195)" }}
                        className="font-semibold"
                      >
                        Réponse :{" "}
                      </span>
                      {ticket.reply}
                    </div>
                  )}
                </div>
                <div
                  className="text-xs shrink-0 mt-0.5"
                  style={{ color: "oklch(0.45 0.03 220)" }}
                >
                  {formatDate(ticket.createdAt)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New ticket dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          className="max-w-md"
          style={{
            background: "oklch(0.16 0.04 220)",
            border: "1px solid oklch(0.28 0.06 220)",
            color: "oklch(0.92 0.02 220)",
          }}
          data-ocid="support.dialog"
        >
          <DialogHeader>
            <DialogTitle
              className="flex items-center gap-2"
              style={{ color: "oklch(0.92 0.04 80)" }}
            >
              <Headphones size={18} style={{ color: "oklch(0.60 0.15 195)" }} />
              Nouveau ticket de support
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                className="text-xs"
                style={{ color: "oklch(0.65 0.03 220)" }}
              >
                Sujet
              </Label>
              <Select
                value={subject}
                onValueChange={(v) => setSubject(v as TicketSubject)}
              >
                <SelectTrigger
                  className="bg-transparent border-white/20 text-white"
                  data-ocid="support.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "oklch(0.18 0.04 220)",
                    border: "1px solid oklch(0.28 0.06 220)",
                  }}
                >
                  <SelectItem value="Réservation" className="text-white">
                    🏨 Réservation
                  </SelectItem>
                  <SelectItem value="Paiement" className="text-white">
                    💳 Paiement
                  </SelectItem>
                  <SelectItem value="Compte" className="text-white">
                    👤 Compte
                  </SelectItem>
                  <SelectItem value="Autre" className="text-white">
                    ❓ Autre
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-xs"
                style={{ color: "oklch(0.65 0.03 220)" }}
              >
                Décrivez votre problème
              </Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Expliquez votre problème en détail…"
                rows={5}
                className="bg-transparent border-white/20 text-white placeholder:text-white/30 resize-none"
                data-ocid="support.textarea"
              />
              <p className="text-xs" style={{ color: "oklch(0.45 0.03 220)" }}>
                {message.length} / 500 caractères (minimum 10)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="border-white/20 text-white hover:bg-white/10"
              data-ocid="support.cancel_button"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || message.trim().length < 10}
              style={{ background: "oklch(0.52 0.12 160)" }}
              className="gap-2 text-white font-semibold"
              data-ocid="support.submit_button"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        {selectedTicket && (
          <DialogContent
            className="max-w-md"
            style={{
              background: "oklch(0.16 0.04 220)",
              border: "1px solid oklch(0.28 0.06 220)",
              color: "oklch(0.92 0.02 220)",
            }}
            data-ocid="support.dialog"
          >
            <DialogHeader>
              <DialogTitle
                className="flex items-center gap-2"
                style={{ color: "oklch(0.92 0.04 80)" }}
              >
                <span
                  className="font-mono text-sm"
                  style={{ color: "oklch(0.77 0.13 85)" }}
                >
                  {selectedTicket.id}
                </span>
                <StatusBadge status={selectedTicket.status} />
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "oklch(0.55 0.04 220)" }}
                >
                  Sujet
                </p>
                <span
                  className="text-sm px-2.5 py-1 rounded-full"
                  style={{
                    background: "oklch(0.25 0.08 195 / 0.3)",
                    color: "oklch(0.60 0.15 195)",
                  }}
                >
                  {selectedTicket.subject}
                </span>
              </div>
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "oklch(0.55 0.04 220)" }}
                >
                  Votre message
                </p>
                <div
                  className="rounded-xl p-4 text-sm"
                  style={{
                    background: "oklch(0.12 0.03 220)",
                    color: "oklch(0.80 0.03 220)",
                  }}
                >
                  {selectedTicket.message}
                </div>
              </div>
              {selectedTicket.reply && (
                <div>
                  <p
                    className="text-xs mb-2"
                    style={{ color: "oklch(0.55 0.04 220)" }}
                  >
                    Réponse du support
                  </p>
                  <div
                    className="rounded-xl p-4 text-sm"
                    style={{
                      background: "oklch(0.18 0.06 195 / 0.3)",
                      color: "oklch(0.80 0.03 220)",
                      borderLeft: "3px solid oklch(0.52 0.12 160)",
                    }}
                  >
                    {selectedTicket.reply}
                  </div>
                </div>
              )}
              <p className="text-xs" style={{ color: "oklch(0.40 0.03 220)" }}>
                Créé le {formatDate(selectedTicket.createdAt)}
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setSelectedTicket(null)}
                style={{ background: "oklch(0.52 0.12 160)" }}
                className="text-white font-semibold"
                data-ocid="support.close_button"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

// ─── Admin Support Tab ────────────────────────────────────────────────────────

export function AdminSupportTab() {
  const [tickets, setTickets] = useState<SupportTicket[]>(loadTickets);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);

  const updateTicket = (id: string, updates: Partial<SupportTicket>) => {
    const updated = tickets.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t,
    );
    setTickets(updated);
    saveTickets(updated);
  };

  const handleReply = (ticketId: string) => {
    const reply = replyDrafts[ticketId]?.trim();
    if (!reply) return;
    updateTicket(ticketId, { reply, status: "in_progress" });
    setReplyDrafts((prev) => ({ ...prev, [ticketId]: "" }));
    setOpenReplyId(null);
    toast.success("Réponse envoyée au client");
  };

  const statusColors: Record<TicketStatus, string> = {
    open: "oklch(0.77 0.13 85)",
    in_progress: "oklch(0.65 0.15 250)",
    resolved: "oklch(0.65 0.15 145)",
  };

  return (
    <div className="space-y-6" data-ocid="admin.support.panel">
      <div className="flex items-center gap-3 mb-2">
        <Headphones size={20} style={{ color: "oklch(0.60 0.15 195)" }} />
        <h3 className="text-lg font-bold text-white">Tickets de Support</h3>
        <Badge
          style={{
            background: "oklch(0.30 0.10 85 / 0.3)",
            color: "oklch(0.77 0.13 85)",
          }}
        >
          {tickets.filter((t) => t.status === "open").length} ouvert(s)
        </Badge>
      </div>

      {tickets.length === 0 ? (
        <div
          className="text-center py-16"
          style={{ color: "oklch(0.55 0.04 220)" }}
          data-ocid="admin.support.empty_state"
        >
          Aucun ticket
        </div>
      ) : (
        <div className="space-y-4" data-ocid="admin.support.list">
          {tickets.map((ticket, idx) => (
            <Card
              key={ticket.id}
              style={{
                background: "oklch(0.16 0.04 220)",
                border: "1px solid oklch(0.25 0.05 220)",
              }}
              data-ocid={`admin.support.item.${idx + 1}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: "oklch(0.77 0.13 85)" }}
                    >
                      {ticket.id}
                    </span>
                    <StatusBadge status={ticket.status} />
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "oklch(0.25 0.08 195 / 0.3)",
                        color: "oklch(0.60 0.15 195)",
                      }}
                    >
                      {ticket.subject}
                    </span>
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.45 0.03 220)" }}
                  >
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.78 0.03 220)" }}
                >
                  {ticket.message}
                </p>

                {ticket.reply && (
                  <div
                    className="rounded-lg px-3 py-2 text-sm"
                    style={{
                      background: "oklch(0.18 0.06 195 / 0.25)",
                      color: "oklch(0.70 0.03 220)",
                      borderLeft: "3px solid oklch(0.52 0.12 160)",
                    }}
                  >
                    <span
                      className="font-semibold"
                      style={{ color: "oklch(0.60 0.15 195)" }}
                    >
                      Réponse admin :{" "}
                    </span>
                    {ticket.reply}
                  </div>
                )}

                {/* Status changer */}
                <div className="flex items-center gap-3 flex-wrap pt-1">
                  <Select
                    value={ticket.status}
                    onValueChange={(v) =>
                      updateTicket(ticket.id, { status: v as TicketStatus })
                    }
                  >
                    <SelectTrigger
                      className="w-40 h-8 text-xs bg-transparent border-white/20"
                      style={{ color: statusColors[ticket.status] }}
                      data-ocid="admin.support.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        background: "oklch(0.18 0.04 220)",
                        border: "1px solid oklch(0.28 0.06 220)",
                      }}
                    >
                      <SelectItem value="open" className="text-white">
                        Ouvert
                      </SelectItem>
                      <SelectItem value="in_progress" className="text-white">
                        En cours
                      </SelectItem>
                      <SelectItem value="resolved" className="text-white">
                        Résolu
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-white/20 text-white hover:bg-white/10"
                    onClick={() =>
                      setOpenReplyId(
                        openReplyId === ticket.id ? null : ticket.id,
                      )
                    }
                    data-ocid="admin.support.button"
                  >
                    <MessageSquare size={12} className="mr-1" />
                    {ticket.reply ? "Modifier la réponse" : "Répondre"}
                  </Button>
                </div>

                {openReplyId === ticket.id && (
                  <div className="space-y-2 pt-1">
                    <Textarea
                      value={replyDrafts[ticket.id] ?? ticket.reply ?? ""}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [ticket.id]: e.target.value,
                        }))
                      }
                      placeholder="Rédigez votre réponse…"
                      rows={3}
                      className="bg-transparent border-white/20 text-white placeholder:text-white/30 resize-none text-sm"
                      data-ocid="admin.support.textarea"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(ticket.id)}
                        style={{ background: "oklch(0.52 0.12 160)" }}
                        className="gap-1.5 text-white font-semibold"
                        data-ocid="admin.support.submit_button"
                      >
                        <Send size={12} />
                        Envoyer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenReplyId(null)}
                        className="border-white/20 text-white hover:bg-white/10"
                        data-ocid="admin.support.cancel_button"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
