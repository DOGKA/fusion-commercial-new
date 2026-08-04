"use client";

import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  type AdminNotificationItem,
  useAdminNotifications,
} from "@/components/AdminNotificationsProvider";

type PopupItem = {
  id: string;
  title: string;
  subTitle: string;
  link: string;
  presentedAt: string | null;
};

const SESSION_KEY = "admin-notifications-presented";

export function AdminNotificationPopups() {
  const router = useRouter();
  const { data: session } = useSession();
  const { summary, refresh } = useAdminNotifications();
  const userId = session?.user?.id;
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<PopupItem[]>([]);

  const mutate = useCallback(async (id: string, action: string, minutes?: number) => {
    const response = await fetch(`/api/admin/notifications/${encodeURIComponent(id)}/state`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, minutes }),
    });
    if (response.ok) void refresh();
    return response.ok;
  }, [refresh]);

  const showFreshPopups = useCallback(async () => {
    if (!userId) return;
    try {
      const sessionKey = `${SESSION_KEY}:${userId}`;
      const seen = new Set<string>(
        JSON.parse(sessionStorage.getItem(sessionKey) || "[]"),
      );
      const fresh = (summary.notifications as AdminNotificationItem[])
        .filter((item) => !item.presentedAt && !seen.has(item.id))
        .slice(0, 3);
      if (!fresh.length) return;
      fresh.forEach((item) => seen.add(item.id));
      sessionStorage.setItem(sessionKey, JSON.stringify([...seen].slice(-500)));
      setItems((current) => {
        const ids = new Set(current.map((item) => item.id));
        return [...current, ...fresh.filter((item) => !ids.has(item.id))].slice(0, 3);
      });
      await Promise.all(fresh.map((item) => mutate(item.id, "presented")));
    } catch (error) {
      console.error("Notification popup fetch failed:", error);
    }
  }, [mutate, summary.notifications, userId]);

  useEffect(() => {
    setMounted(true);
    void showFreshPopups();
  }, [showFreshPopups]);

  const remove = (id: string) =>
    setItems((current) => current.filter((item) => item.id !== id));

  if (!mounted || !items.length) return null;
  return createPortal(
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[10000] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      role="region"
      aria-label="Yeni admin bildirimleri"
      aria-live="polite"
    >
      {items.map((item) => (
        <section
          key={item.id}
          className="pointer-events-auto animate-in fade-in-0 slide-in-from-bottom-5 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-dark"
        >
          <strong className="block text-sm text-dark dark:text-white">{item.title}</strong>
          <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
            {item.subTitle}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
            <button
              className="rounded-md bg-primary px-3 py-1.5 text-white"
              onClick={async () => {
                if (!(await mutate(item.id, "read"))) return;
                remove(item.id);
                router.push(item.link);
              }}
            >
              Görüntüle
            </button>
            <button
              className="rounded-md border px-3 py-1.5 dark:border-gray-600"
              onClick={async () => {
                if (!(await mutate(item.id, "read"))) return;
                remove(item.id);
              }}
            >
              Okundu
            </button>
            <button
              className="rounded-md border px-3 py-1.5 dark:border-gray-600"
              onClick={async () => {
                if (!(await mutate(item.id, "remind", 60))) return;
                if (userId) {
                  const sessionKey = `${SESSION_KEY}:${userId}`;
                  const seen = new Set<string>(
                    JSON.parse(sessionStorage.getItem(sessionKey) || "[]"),
                  );
                  seen.delete(item.id);
                  sessionStorage.setItem(sessionKey, JSON.stringify([...seen]));
                }
                remove(item.id);
              }}
            >
              1 saat sonra
            </button>
            <button
              className="rounded-md border px-3 py-1.5 text-red-600 dark:border-gray-600"
              onClick={async () => {
                if (!(await mutate(item.id, "dismiss"))) return;
                remove(item.id);
              }}
            >
              Kapat
            </button>
          </div>
        </section>
      ))}
    </div>,
    document.body,
  );
}
