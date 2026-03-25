import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

const STORAGE_KEY = "kongokash_last_seen_ts";
const POLL_INTERVAL = 30_000;

function getLastSeenTs(): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? Number(raw) : 0;
}

function tsNsToMs(ns: bigint): number {
  return Number(ns) / 1_000_000;
}

function fireToast(tx: Transaction) {
  switch (tx.txType) {
    case "reward":
      toast.success(`Récompense reçue : +${tx.cryptoAmount} OKP`);
      break;
    case "buy":
      toast.success(`Achat ${tx.asset} confirmé`);
      break;
    case "sell":
      toast.success(`Vente ${tx.asset} confirmée`);
      break;
    case "deposit":
      toast.info(`Dépôt ${tx.fiatAmount} ${tx.fiatCurrency} reçu`);
      break;
    case "withdrawal":
      toast.info("Retrait en cours...");
      break;
    case "staking":
      toast.info("Staking OKP activé");
      break;
    default:
      toast.info("Nouvelle transaction");
  }
}

export function useNotifications() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [notifications, setNotifications] = useState<Transaction[]>([]);
  const [lastSeenTs, setLastSeenTs] = useState<number>(getLastSeenTs);
  const isFirstFetch = useRef(true);

  const fetchAndNotify = useCallback(async () => {
    if (!actor) return;
    try {
      const txs = await actor.getTransactions();
      const sorted = [...txs].sort((a, b) => Number(b.timestamp - a.timestamp));
      const top10 = sorted.slice(0, 10);
      setNotifications(top10);

      if (!isFirstFetch.current) {
        const current = getLastSeenTs();
        const newTxs = txs.filter((tx) => tsNsToMs(tx.timestamp) > current);
        for (const tx of newTxs) {
          fireToast(tx);
        }
      } else {
        isFirstFetch.current = false;
      }
    } catch {
      // silently ignore fetch errors
    }
  }, [actor]);

  useEffect(() => {
    if (!actor || isFetching || !identity) return;
    fetchAndNotify();
    const interval = setInterval(fetchAndNotify, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [actor, isFetching, identity, fetchAndNotify]);

  const markAllRead = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, String(now));
    setLastSeenTs(now);
  }, []);

  const unreadCount = notifications.filter(
    (tx) => tsNsToMs(tx.timestamp) > lastSeenTs,
  ).length;

  return { unreadCount, notifications, markAllRead };
}
