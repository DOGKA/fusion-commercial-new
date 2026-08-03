"use client";

import { Toaster } from "react-hot-toast";

/**
 * react-hot-toast paket olarak kuruluydu ama hiç mount edilmemişti.
 * Root layout dokunulmaz olduğu için Toaster hesap kabuğunda mount edilir —
 * kabuk layout'ta yaşadığı için sayfa geçişlerinde toast kaybolmaz/çoğalmaz.
 *
 * Renkler token'lardan gelir, böylece light/dark otomatik uyar.
 */
export default function AccountToaster() {
  return (
    <Toaster
      position="bottom-right"
      containerClassName="account-toaster"
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--glass-bg-solid)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          fontSize: "14px",
          borderRadius: "12px",
        },
        success: { iconTheme: { primary: "#10b981", secondary: "var(--glass-bg-solid)" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "var(--glass-bg-solid)" } },
      }}
    />
  );
}
