import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownLeft, ArrowUpRight, Bell, Clock } from "lucide-react";
import { useState } from "react";
import type { Transaction } from "../backend";
import { useNotifications } from "../hooks/useNotifications";

const TX_LABELS: Record<string, string> = {
  buy: "Achat",
  sell: "Vente",
  deposit: "Dépôt",
  withdrawal: "Retrait",
  transfer: "Transfert",
  staking: "Staking",
  reward: "Récompense",
};

function notifIcon(txType: string) {
  if (["buy", "deposit", "reward"].includes(txType)) {
    return (
      <ArrowDownLeft size={13} style={{ color: "oklch(0.52 0.12 160)" }} />
    );
  }
  if (["sell", "withdrawal", "transfer"].includes(txType)) {
    return <ArrowUpRight size={13} style={{ color: "oklch(0.67 0.15 55)" }} />;
  }
  return <Clock size={13} style={{ color: "oklch(0.77 0.13 85)" }} />;
}

function notifIconBg(txType: string): string {
  if (["buy", "deposit", "reward"].includes(txType))
    return "oklch(0.52 0.12 160 / 0.18)";
  if (["sell", "withdrawal", "transfer"].includes(txType))
    return "oklch(0.67 0.15 55 / 0.18)";
  return "oklch(0.77 0.13 85 / 0.18)";
}

function formatTs(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function NotifRow({ tx }: { tx: Transaction }) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/40 transition-colors rounded-lg">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: notifIconBg(tx.txType) }}
      >
        {notifIcon(tx.txType)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">
          {TX_LABELS[tx.txType] ?? tx.txType}
          {tx.asset ? ` ${tx.asset}` : ""}
        </p>
        {tx.cryptoAmount > 0 && (
          <p
            className="text-xs font-mono"
            style={{ color: "oklch(0.52 0.12 160)" }}
          >
            +{tx.cryptoAmount.toFixed(tx.asset === "OKP" ? 0 : 6)} {tx.asset}
          </p>
        )}
        {tx.fiatAmount > 0 && (
          <p className="text-xs text-muted-foreground font-mono">
            {new Intl.NumberFormat("fr-FR", {
              maximumFractionDigits: 2,
            }).format(tx.fiatAmount)}{" "}
            {tx.fiatCurrency}
          </p>
        )}
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          {formatTs(tx.timestamp)}
        </p>
      </div>
    </div>
  );
}

export default function NotificationCenter() {
  const { unreadCount, notifications, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleOpen = (val: boolean) => {
    setOpen(val);
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          data-ocid="notifications.open_modal_button"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold leading-none"
              style={{ background: "oklch(0.55 0.22 27)" }}
              data-ocid="notifications.toast"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 overflow-hidden"
        data-ocid="notifications.popover"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-border"
          style={{ background: "oklch(0.27 0.07 195)" }}
        >
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            <Bell size={14} style={{ color: "oklch(0.77 0.13 85)" }} />
            Notifications
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs hover:underline transition-colors"
              style={{ color: "oklch(0.77 0.13 85)" }}
              data-ocid="notifications.button"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-[340px]">
          {notifications.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 text-muted-foreground"
              data-ocid="notifications.empty_state"
            >
              <Bell size={28} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">Aucune notification</p>
              <p className="text-xs mt-0.5 opacity-60">
                Vos alertes apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {notifications.map((tx) => (
                <NotifRow key={tx.id.toString()} tx={tx} />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
