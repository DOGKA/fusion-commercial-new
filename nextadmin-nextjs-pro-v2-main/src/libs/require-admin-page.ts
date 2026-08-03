import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

/**
 * Sunucu bileşeni sayfaları için yönetici kapısı.
 *
 * NEDEN MIDDLEWARE YETMİYOR: Yetmeli, ama 31 Tem'de yetmediği görüldü —
 * `middleware.ts` proje kökünde durduğu için Next onu hiç yüklemiyordu ve
 * panelin tamamı oturumsuz açılıyordu (F2-71). Konum düzeltildi; yine de
 * veriyi doğrudan veritabanından çeken sayfalar kendi kontrollerini yapıyor.
 * Tek bir dosyanın doğru yerde olmasına bağlı kalan bir koruma, sessizce
 * devre dışı kalabilen bir korumadır.
 *
 * Yalnızca **veriyi sunucuda çeken** sayfalarda gereklidir; verisini
 * `/api/admin/*` üzerinden alan istemci sayfaları zaten uçtaki
 * `checkAdminAuth` tarafından korunuyor.
 */
export async function requireAdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    redirect("/auth/signin");
  }

  return session;
}
