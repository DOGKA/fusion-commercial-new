"use client";

/**
 * İptal / iade talebinin durum blokları.
 *
 * Veri artık `GET /api/orders` yanıtından geliyor (`cancellationStatus`,
 * `hasPendingReturnRequest`), ama onaylanmış iadenin adresi ve talimatları
 * listede dönmüyor — o ikisi için karta özel `returnDetail` prop'u var ve
 * yalnızca akordiyon açıldığında dolduruluyor.
 *
 * ⚠️ Bloklar TALEP TİPİNE duyarlı olmak zorunda. `returnRequests` tablosu
 * yalnızca iadeleri değil, fatura talebi / hatalı fatura / fazla ürün
 * bildirimlerini de tutuyor. Metinler eskiden "İade" diye sabitlenmişti; çok
 * tipli talep akışı açıldığında (plan 03 Faz 6) fatura talebi açan müşteriye
 * "ürünü şu adrese gönderin" yazacaktı — yanlış ve zararlı bir yönlendirme.
 *
 * RENKLER: tüm bloklar tonunu `order-status-ui.tsx`'ten alıyor. Eskiden her
 * blok kendi sabit Tailwind tonunu (`text-emerald-400`…) yazıyordu; light
 * temada hiçbiri 4.5:1 kontrast eşiğini geçmiyordu (plan 07 KN-3).
 *
 * YERLEŞİM (plan 10 §5): onaylanan iade bloğu eskiden renkli bir kutunun
 * İÇİNDE üç ayrı kutu taşıyordu ve her seviye kendi `16px` ikon ızgarasını
 * tekrarlıyordu. 390px'te sonuç kalabalık ve hiyerarşisizdi: iade kodu, adres
 * ve uyarı listesiyle aynı görsel ağırlıktaydı. Renkli yüzey artık yalnız
 * başlık şeridi; alt paneller onun çocuğu değil **kardeşi**. Böylece derinlik
 * bir kat azalıyor ve kod tek başına öne çıkabiliyor.
 */

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  MapPin,
  AlertCircle,
  Copy,
  Check,
  PackageCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import {
  REQUEST_TYPE_LABELS,
  requiresReturnShipment,
  type RequestTypeKey,
} from "@/lib/orders";
import { chipClass, toneClass, type UiTone } from "./order-status-ui";

export interface RequestDetail {
  cancellationStatus?: string;
  cancellationAdminNote?: string;
  returnStatus?: string;
  returnAdminNote?: string;
  returnAddress?: string;
  returnInstructions?: string;
  /**
   * Talebin tipi. Verilmezse `RETURN` varsayılıyor: liste ekranı bu alanı
   * döndürmüyor ve orada yalnızca iade açılabiliyor.
   */
  returnRequestType?: RequestTypeKey;
  /**
   * Onay anında üretilen iade kodu. Fatura gibi paket gönderilmeyen talep
   * tiplerinde üretilmediği için burada da opsiyonel.
   */
  returnCode?: string | null;
  /**
   * Müşterinin talebe eklediği fotoğraflar. Alan DTO'da baştan beri vardı ama
   * hiçbir müşteri ekranı okumuyordu: fotoğraf yükleyen müşteri gönderdiği
   * şeyi bir daha göremiyor, özellikle fotoğrafın zorunlu olduğu sebeplerde
   * "yüklendi mi" sorusu cevapsız kalıyordu.
   */
  returnImages?: string[];
  /** İade kabul edilmediğinde ürünün müşteriye geri gönderim bilgisi. */
  sendBackCarrier?: string | null;
  sendBackTrackingNumber?: string | null;
  /**
   * Talebin kapsadığı kalemler. **Boş veya verilmemişse talep tüm siparişi
   * kapsıyor** ve bu durumda liste hiç çizilmiyor — "hepsi" bilgisini ayrıca
   * yazmak her siparişte tekrar eden bir satır olurdu.
   */
  returnItems?: Array<{ orderItemId: string; quantity: number; name: string }>;
}

/**
 * Blok başlığı: renkli şerit, ikon + başlık + açıklama.
 *
 * Artık KAP DEĞİL — `children` almıyor. Eski `StatusCard` hem başlık hem kap
 * rolündeydi ve onaylanan iadede bu ikisi üst üste binince iç içe kutular
 * çıkıyordu. Ek panelleri çağıran yer kardeş olarak diziyor.
 *
 * `grid-cols-[16px_…]` yerine `flex`: ızgara başta uzun admin notunun ikon
 * sütununun altına kayıp hizayı bozmasını engellemek için seçilmişti, aynı
 * korumayı `shrink-0` + `min-w-0` ikilisi sağlıyor ve kalıp her seviyede
 * tekrarlanmıyor.
 */
function StatusHeader({
  tone,
  icon: Icon,
  title,
  description,
}: {
  tone: UiTone;
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className={`rounded-xl p-4 ${chipClass(tone)}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-snug">{title}</p>
          {description && (
            <p className="mt-1.5 text-[13px] leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Panel içi bölüm başlığı. 11px'ten 12px'e çıktı: uppercase + harf aralığıyla
 *  birlikte 11px okunabilirliğin altında kalıyordu. */
function PanelLabel({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <p className="account-subsection-label flex items-center gap-1.5">
      {Icon && <Icon size={13} aria-hidden="true" className="shrink-0" />}
      {children}
    </p>
  );
}

interface RequestStatusCardsProps {
  detail: RequestDetail | undefined;
}

export default function RequestStatusCards({ detail }: RequestStatusCardsProps) {
  const [codeCopied, setCodeCopied] = useState(false);

  if (!detail) return null;

  const requestType = detail.returnRequestType ?? "RETURN";
  const isReturn = requestType === "RETURN";
  /** İade dışı tiplerde başlıklar talebin kendi adını taşıyor. */
  const typeLabel = REQUEST_TYPE_LABELS[requestType];
  /**
   * Gönderi talimatları ve iade kodu bloğunun anahtarı. `isReturn` DEĞİL:
   * fazla ürün bildiriminde de kod üretiliyor ve ürün geri gönderiliyor.
   */
  const expectsShipment = requiresReturnShipment(requestType);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      // Kopyalama başarısızsa kod ekranda yazılı duruyor, elle de alınabilir.
    }
  };

  return (
    <>
      {detail.cancellationStatus === "APPROVED" && (
        <StatusHeader
          tone="success"
          icon={CheckCircle}
          title="İptal Onaylandı"
          description="Siparişiniz iptal edildi. Ödemeniz iade edilecektir."
        />
      )}

      {detail.cancellationStatus === "REJECTED" && (
        <StatusHeader
          tone="danger"
          icon={XCircle}
          title="İptal Reddedildi"
          description={
            detail.cancellationAdminNote
              ? `Sebep: ${detail.cancellationAdminNote}`
              : undefined
          }
        />
      )}

      {/*
        Kısmi talebin kapsamı. Tek yerde çiziliyor, beş durum bloğunda değil:
        kapsam duruma göre değişmiyor, müşterinin her adımda görmesi gereken
        aynı bilgi.
      */}
      {detail.returnStatus && detail.returnItems && detail.returnItems.length > 0 && (
        <div className="rounded-xl border border-border bg-glass-bg p-4">
          <PanelLabel>Talep kapsamındaki ürünler</PanelLabel>
          <ul className="mt-2 space-y-1.5">
            {detail.returnItems.map((item) => (
              <li key={item.orderItemId} className="text-[13px] leading-relaxed text-foreground">
                {item.name}
                {item.quantity > 1 && (
                  <span className="tabular-nums text-foreground-muted"> × {item.quantity}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/*
        Müşterinin kendi yüklediği fotoğraflar. Durum bloklarının dışında ve
        renkli kutuların içine girmeden: yeni bir iç içe yüzey açmadan
        "gönderdiklerim" sorusunu yanıtlıyor.

        `unoptimized`: adresler R2'den geliyor ve tek seferlik kanıt görselleri,
        Next optimizer kuyruğuna sokmanın kazancı yok.
      */}
      {detail.returnStatus &&
        detail.returnImages &&
        detail.returnImages.length > 0 && (
          <div className="rounded-xl border border-border bg-glass-bg p-4">
            <PanelLabel>Gönderdiğiniz fotoğraflar</PanelLabel>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {detail.returnImages.map((src, index) => (
                <a
                  key={src}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-lg border border-border transition-colors hover:border-border-hover"
                >
                  <Image
                    src={src}
                    alt={`Talebe eklenen ${index + 1}. fotoğraf`}
                    width={64}
                    height={64}
                    className="h-16 w-16 object-cover"
                    unoptimized
                  />
                </a>
              ))}
            </div>
          </div>
        )}

      {detail.returnStatus === "APPROVED" && (
        <div className="space-y-3">
          <StatusHeader
            tone="success"
            icon={CheckCircle}
            title={isReturn ? "İade Talebiniz Onaylandı" : `${typeLabel} onaylandı`}
            /* Müşteri "onaylandı" görüp parayı beklemesin: ödeme, ürün bize
               ulaşıp incelendikten sonra iade ediliyor. */
            description={
              isReturn
                ? "Ürünü aşağıdaki adrese gönderebilirsiniz. Ödemeniz, ürün bize ulaşıp incelendikten sonra iade edilecek."
                : expectsShipment
                  ? "Fazla gelen ürünü aşağıdaki adrese gönderebilirsiniz."
                  : "Talebiniz onaylandı ve işleme alındı. Sonuçlandığında size bilgi vereceğiz."
            }
          />

          {/*
            İADE KODU — bu bloğun tek kahramanı ve müşterinin ekrandan alıp
            paketin üzerine yazacağı yegâne bilgi. Diğer panellerle aynı
            ağırlıkta durduğu sürece kaçırılıyordu; 24px mono ve tek renkli
            çerçeve onu tartışmasız birinci yapıyor.

            Kopyala butonu koddan AYRILDI ve tam genişliğe alındı: satır içi
            36px'lik ikon butonu dar ekranda kodu sıkıştırıyor, uzun kodda alt
            satıra kaçırıyordu. Tam genişlik aynı zamanda 44px dokunma hedefi.
          */}
          {expectsShipment && detail.returnCode && (
            <div className="rounded-xl border border-[color:var(--acc-success-border)] bg-glass-bg p-4">
              <PanelLabel>İade Kodunuz</PanelLabel>
              {/* Kod sabit 14 karakter (`IADE-XXXX-XXXX`). 390px'te ölçüldü:
                  24px + 0.12em aralıkla metin 248px, panelin iç genişliği
                  290px — 42px pay var, tek satırda kalıyor. `break-all` yine de
                  duruyor: biçim ileride uzarsa taşma yerine sarma olsun. */}
              <p className="mt-2 select-all break-all font-mono text-[24px] font-semibold leading-tight tracking-[0.12em] text-foreground">
                {detail.returnCode}
              </p>
              <button
                type="button"
                onClick={() => copyCode(detail.returnCode!)}
                className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-border bg-glass-bg text-[13px] font-medium text-foreground transition-colors hover:bg-glass-bg-hover"
              >
                {codeCopied ? (
                  <>
                    <Check size={15} aria-hidden="true" className={toneClass("success")} />
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy size={15} aria-hidden="true" />
                    Kodu kopyala
                  </>
                )}
              </button>
              <p className="mt-3 text-[13px] leading-relaxed text-foreground-secondary">
                Bu kodu paketin üzerine yazın ve kutunun içine bir not olarak
                ekleyin. Kod taşımayan gönderiler depomuzda eşleştirilemediği
                için işleme alınamaz.
              </p>
            </div>
          )}

          {/* Adres ve uyarılar TEK panelde, iki bölüm hâlinde: ayrı kutulara
              bölmek yüzey sayısını gereksiz yere artırıyordu. */}
          {expectsShipment && (
            <div className="space-y-4 rounded-xl border border-border bg-glass-bg p-4">
              {detail.returnAddress && (
                <div>
                  <PanelLabel icon={MapPin}>İade Adresi</PanelLabel>
                  <p className="mt-2 whitespace-pre-line break-words text-[13px] leading-relaxed text-foreground">
                    {detail.returnAddress}
                  </p>
                </div>
              )}

              <div className={detail.returnAddress ? "border-t border-border pt-4" : ""}>
                <PanelLabel icon={AlertCircle}>Önemli Bilgiler</PanelLabel>
                <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-foreground-secondary">
                  <li className="flex items-start gap-2">
                    <span aria-hidden="true" className={toneClass("warning")}>
                      •
                    </span>
                    <span className="min-w-0">Ürünü orijinal kutusuyla gönderin</span>
                  </li>
                  {detail.returnCode && (
                    <li className="flex items-start gap-2">
                      <span aria-hidden="true" className={toneClass("warning")}>
                        •
                      </span>
                      <span className="min-w-0">
                        İade kodunu paketin üzerine yazmayı unutmayın
                      </span>
                    </li>
                  )}
                </ul>
                {detail.returnInstructions && (
                  <p className="mt-3 border-t border-border pt-3 text-[13px] leading-relaxed text-foreground-secondary">
                    {detail.returnInstructions}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Gönderi beklenmeyen tiplerde (fatura vb.) talimat varsa yalnızca o gösterilir. */}
          {!expectsShipment && detail.returnInstructions && (
            <p className="rounded-xl border border-border bg-glass-bg p-4 text-[13px] leading-relaxed text-foreground-secondary">
              {detail.returnInstructions}
            </p>
          )}
        </div>
      )}

      {detail.returnStatus === "RECEIVED" && (
        <StatusHeader
          tone="info"
          icon={PackageCheck}
          title="Ürün bize ulaştı"
          description={
            isReturn
              ? "İadeniz inceleniyor. İnceleme tamamlandığında ödemeniz iade edilecek ve size bilgi vereceğiz."
              : "Talebiniz inceleniyor. Sonuçlandığında size bilgi vereceğiz."
          }
        />
      )}

      {detail.returnStatus === "COMPLETED" && (
        <StatusHeader
          tone="success"
          icon={CheckCircle}
          title={isReturn ? "İade Tamamlandı" : `${typeLabel} sonuçlandı`}
          description={
            isReturn
              ? "Ödemeniz iade edildi. Kartınıza yansıması bankanıza bağlı olarak birkaç iş günü sürebilir."
              : "Talebiniz tamamlandı."
          }
        />
      )}

      {detail.returnStatus === "REJECTED" && (
        <div className="space-y-3">
          <StatusHeader
            tone="danger"
            icon={XCircle}
            title={isReturn ? "İade Reddedildi" : `${typeLabel} reddedildi`}
            description={
              detail.returnAdminNote
                ? `Sebep: ${detail.returnAdminNote}`
                : "Mağaza bu talep için gerekçe bildirmedi."
            }
          />

          {/*
            RET KESİN: aynı sipariş için yeni iade talebi açılamıyor (plan 10
            §4) ve buton bu yüzden ekranda yok. Kuralı yazmadan butonu
            gizlemek, müşteriyi "acaba nerede" diye aratıyor. Kapalı bir kapıyı
            çıkışsız bırakmamak için müşteri hizmetleri bağlantısı da burada.
          */}
          {isReturn && (
            <div className="rounded-xl border border-border bg-glass-bg p-4">
              <p className="text-[13px] leading-relaxed text-foreground-secondary">
                Bu sipariş için yeni bir iade talebi oluşturulamıyor. Kararın
                yeniden değerlendirilmesini istiyorsanız müşteri hizmetlerimize
                ulaşabilirsiniz.
              </p>
              <Link
                href="/iletisim"
                className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-lg border border-border bg-glass-bg text-[13px] font-medium text-foreground transition-colors hover:bg-glass-bg-hover"
              >
                Müşteri hizmetlerine ulaş
              </Link>
            </div>
          )}

          {/* Ürün bize ulaşmış ama iade kabul edilmemişse müşterinin malı
              bizdeydi; nereye gittiğini görmesi gerekiyor. */}
          {detail.sendBackTrackingNumber && (
            <div className="rounded-xl border border-border bg-glass-bg p-4">
              <PanelLabel icon={Truck}>Ürününüz size geri gönderildi</PanelLabel>
              <p className="mt-2 break-words text-[13px] leading-relaxed text-foreground">
                Takip no:{" "}
                <span className="select-all font-mono tabular-nums">
                  {detail.sendBackTrackingNumber}
                </span>
                {detail.sendBackCarrier ? ` · ${detail.sendBackCarrier}` : ""}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-foreground-secondary">
                Gönderi karşı ödemelidir; kargo ücreti teslim alırken tahsil edilir.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
