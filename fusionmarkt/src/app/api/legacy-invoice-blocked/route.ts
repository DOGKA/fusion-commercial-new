/**
 * Eski fatura yolunun kapatılması (F2-70).
 *
 * `next.config.ts` içindeki `beforeFiles` yeniden yazımı `/storage/invoices/*`
 * isteklerini buraya yönlendirir. Doğrudan çağrılması beklenmez.
 *
 * NEDEN GEREKLİ: Faturalar 31 Tem'e kadar `public/storage/invoices/` içindeydi.
 * Next.js `public/` altındaki her şeyi kimlik doğrulaması olmadan servis eder,
 * yani `/storage/invoices/FM-2025-08423.pdf` **oturumsuz** indirilebiliyor ve
 * `/api/invoices/...` ucundaki oturum + token kapısını (F2-61) boşa
 * çıkarıyordu. Dosya adları sipariş numarasından türediği için tahmin de
 * edilebiliyordu.
 *
 * NEDEN ROUTE YETMEDİ: Önce `src/app/storage/invoices/[...file]` altına bir
 * route konuldu ama işe yaramadı — Next `public/` içindeki dosyayı route
 * eşleşmesinden **önce** servis ediyor. Dosya sisteminden önce çalışan tek
 * kanca `beforeFiles`.
 *
 * Yeni faturalar `public/` dışına yazılıyor; eski dosyalar kullanıcı kararıyla
 * diskte bırakıldı, bu kanca yalnızca yollarını kapatıyor. Veritabanında bu
 * yola işaret eden sipariş yok (31 Tem'de sayıldı), yani kırılan meşru bir
 * bağlantı yok. Eski dosyalar silindiğinde bu route ve yeniden yazım da
 * silinebilir.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response("Not found", { status: 404 });
}
