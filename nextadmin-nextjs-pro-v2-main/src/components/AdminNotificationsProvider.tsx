"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AdminNotificationItem = {
  id: string;
  type:
    | "order"
    | "payment"
    | "stock"
    | "contact"
    | "service"
    | "review"
    | "cancellation"
    | "return";
  title: string;
  subTitle: string;
  link: string;
  createdAt: string;
  read: boolean;
  presentedAt: string | null;
};

export type AdminNotificationSummary = {
  orders: number;
  cancellations: number;
  returns: number;
  contacts: number;
  serviceForms: number;
  reviews: number;
  total: number;
  unreadCount: number;
  notifications: AdminNotificationItem[];
};

const EMPTY_SUMMARY: AdminNotificationSummary = {
  orders: 0,
  cancellations: 0,
  returns: 0,
  contacts: 0,
  serviceForms: 0,
  reviews: 0,
  total: 0,
  unreadCount: 0,
  notifications: [],
};

const AdminNotificationsContext = createContext<{
  summary: AdminNotificationSummary;
  loading: boolean;
  refresh: () => Promise<void>;
} | null>(null);

export function AdminNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications/summary", {
        cache: "no-store",
      });
      if (!response.ok) return;
      setSummary(await response.json());
    } catch (error) {
      console.error("Admin notification summary failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const value = useMemo(
    () => ({ summary, loading, refresh }),
    [summary, loading, refresh],
  );

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  const value = useContext(AdminNotificationsContext);
  if (!value) {
    throw new Error(
      "useAdminNotifications must be used inside AdminNotificationsProvider",
    );
  }
  return value;
}
