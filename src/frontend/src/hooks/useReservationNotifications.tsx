import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReservationNotifType =
  | "reservation_created"
  | "reservation_confirmed"
  | "payment_received"
  | "reservation_cancelled";

export interface ReservationNotif {
  id: string;
  type: ReservationNotifType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface NotifContextValue {
  reservationNotifs: ReservationNotif[];
  addReservationNotif: (
    type: ReservationNotifType,
    title: string,
    message: string,
  ) => void;
  markReservationNotifsRead: () => void;
  unreadReservationCount: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "kongokash_reservation_notifs";

const NotifContext = createContext<NotifContextValue>({
  reservationNotifs: [],
  addReservationNotif: () => {},
  markReservationNotifsRead: () => {},
  unreadReservationCount: 0,
});

function loadFromStorage(): ReservationNotif[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReservationNotif[];
  } catch {
    return [];
  }
}

function saveToStorage(notifs: ReservationNotif[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, 50)));
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ReservationNotifProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reservationNotifs, setNotifs] =
    useState<ReservationNotif[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(reservationNotifs);
  }, [reservationNotifs]);

  const addReservationNotif = useCallback(
    (type: ReservationNotifType, title: string, message: string) => {
      const notif: ReservationNotif = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        title,
        message,
        timestamp: Date.now(),
        read: false,
      };
      setNotifs((prev) => [notif, ...prev]);
    },
    [],
  );

  const markReservationNotifsRead = useCallback(() => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadReservationCount = reservationNotifs.filter(
    (n) => !n.read,
  ).length;

  return (
    <NotifContext.Provider
      value={{
        reservationNotifs,
        addReservationNotif,
        markReservationNotifsRead,
        unreadReservationCount,
      }}
    >
      {children}
    </NotifContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReservationNotifications() {
  return useContext(NotifContext);
}
