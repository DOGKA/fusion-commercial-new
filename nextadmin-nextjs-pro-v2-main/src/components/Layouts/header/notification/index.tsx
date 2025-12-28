"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BellIcon } from "./icons";

interface NotificationItem {
  id: string;
  type: "order" | "payment" | "stock" | "user";
  title: string;
  subTitle: string;
  link: string;
  createdAt: string;
  read: boolean;
}

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDotVisible, setIsDotVisible] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setIsDotVisible(data.unreadCount > 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return (
          <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="size-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        );
      case "payment":
        return (
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg className="size-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        );
      case "stock":
        return (
          <div className="flex size-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <svg className="size-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <svg className="size-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Az önce";
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
        if (open && isDotVisible) {
          setIsDotVisible(false);
        }
      }}
    >
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="Bildirimleri Görüntüle"
      >
        <span className="relative">
          <BellIcon />

          {isDotVisible && unreadCount > 0 && (
            <span
              className={cn(
                "absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white px-3.5 py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark min-[350px]:min-w-[20rem]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Bildirimler
          </span>
          {unreadCount > 0 && (
          <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
              {unreadCount} yeni
          </span>
          )}
        </div>

        <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
          {loading ? (
            <li className="px-2 py-4 text-center text-sm text-gray-500">
              Yükleniyor...
            </li>
          ) : notifications.length === 0 ? (
            <li className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Henüz bildirim yok
            </li>
          ) : (
            notifications.map((item) => (
              <li key={item.id} role="menuitem">
              <Link
                  href={item.link}
                onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 rounded-lg px-2 py-1.5 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3",
                    !item.read && "bg-blue-50/50 dark:bg-blue-900/10"
                  )}
                >
                  {getIcon(item.type)}

                  <div className="flex-1 min-w-0">
                    <strong className="block text-sm font-medium text-dark dark:text-white truncate">
                    {item.title}
                  </strong>

                    <span className="block truncate text-sm font-medium text-dark-5 dark:text-dark-6">
                    {item.subTitle}
                  </span>
                    
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatTime(item.createdAt)}
                    </span>
                </div>
              </Link>
            </li>
            ))
          )}
        </ul>

        <Link
          href="/orders"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
        >
          Tüm Siparişleri Gör
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
