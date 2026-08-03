/**
 * Saklanan sözleşme belgesinin, onu gömen çerçeveyle çakışan başlıklarını
 * kaldırır.
 *
 * Belge kendi başına ayakta duracak şekilde üretiliyor: üstte ikon + sözleşme
 * adı + "Ref: <sipariş no>" + "✓ Onaylandı" rozetinden oluşan bir kart, hemen
 * altında da ortalanmış sözleşme adı + "Ref"/"Tarih" satırı var. Hem buradaki
 * sözleşme modalı hem de mağaza tarafındaki sözleşme sayfası aynı bilgileri
 * kendi başlığında gösterdiği için, belge açıldığında her şey üç kez okunuyordu.
 *
 * Temizlik neden görüntülemede, üreteçte değil: saklanan HTML kullanıcının kabul
 * ettiği belgenin kaydı, geriye dönük değiştirilmiyor. Üreteci değiştirmek
 * yalnızca yeni siparişleri düzeltir, mevcut siparişlerde tekrar sürerdi.
 *
 * İKİZİ VAR: mağaza tarafında `fusionmarkt/src/app/sozlesmeler/[orderNumber]/
 * page.tsx` içinde aynı işi yapan `stripDuplicateHeadings` duruyor. İki uygulama
 * yalnızca `@repo/db` ve `@repo/storage` paketlerini paylaşıyor; tek bir yardımcı
 * için üçüncü bir paket kurmak yerine kopya tercih edildi. Belgenin yapısı
 * değişirse ikisi birlikte güncellenmeli.
 */
export function stripDuplicateHeadings(html: string): string {
  if (typeof window === "undefined") return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const card = doc.body.firstElementChild;

  const header = card?.firstElementChild;
  if (header?.querySelector("h2") && header.textContent?.includes("Onaylandı")) {
    header.remove();
  }

  // Üst kart silindiği için içerik bloğu artık ilk çocuk.
  const titleBlock = card?.firstElementChild?.firstElementChild;
  if (titleBlock?.querySelector("h1")) {
    titleBlock.remove();
  }

  return doc.body.innerHTML;
}
