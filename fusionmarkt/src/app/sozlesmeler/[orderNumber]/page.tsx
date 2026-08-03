"use client";

/**
 * Sipariş sözleşmelerinin görüntülendiği ekran.
 *
 * Sayfa hesap alanının dışında ama kullanıcı buraya sipariş detayından
 * geliyor: sekme dili (`.account-tabbar`) ve ton token'ları (`--acc-*`)
 * bilinçli olarak hesap alanıyla ortak. Token'lar `.contract-page` kapsamında
 * çözüldüğü için sınıf kökte duruyor.
 */

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FileText, Loader2, AlertCircle, Check, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ContractData {
  orderNumber: string;
  acceptedAt: string;
  contracts: {
    termsAndConditions: {
      accepted: boolean;
      html: string | null;
    };
    distanceSalesContract: {
      accepted: boolean;
      html: string | null;
    };
    newsletter: boolean;
  };
}

type ContractTab = "terms" | "distance";

/** Sekme etiketi kısa, sayfa başlığı uzun: şerit dar ekranda taşmasın. */
const CONTRACT_TABS: { value: ContractTab; label: string; title: string }[] = [
  { value: "terms", label: "Kullanıcı Sözleşmesi", title: "Kullanıcı Sözleşmesi ve Şartlar" },
  { value: "distance", label: "Mesafeli Satış Sözleşmesi", title: "Mesafeli Satış Sözleşmesi" },
];

const tabDomId = (value: ContractTab) => `contract-tab-${value}`;
const panelDomId = (value: ContractTab) => `contract-panel-${value}`;

/**
 * Saklanan belgenin, sayfanın kendi çerçevesiyle çakışan başlıklarını kaldırır.
 *
 * Belge tek başına da açılabildiği için (admin paneli sipariş detayında aynı
 * HTML'i gömüyor) iki ayrı başlık taşıyor: üstte ikon + sözleşme adı + "Ref:
 * <sipariş no>" + "✓ Onaylandı" rozetinden oluşan kart, hemen altında da
 * ortalanmış sözleşme adı + "Ref"/"Tarih" satırı. Bu sayfa aynı bilgileri kendi
 * başlığında ve bilgi şeridinde zaten gösterdiği için belge açıldığında her şey
 * üç kez okunuyordu; ikisi de kaldırılıyor, belge doğrudan maddelerle başlıyor.
 *
 * Temizlik neden burada, üreteçte değil: saklanan HTML kullanıcının kabul ettiği
 * belgenin kaydı, geriye dönük değiştirilmiyor. Üreteci değiştirmek yalnızca
 * yeni siparişleri düzeltir, mevcut siparişlerde tekrar sürerdi.
 *
 * Kaldırılacak bloklar sözleşme metninden başlık etiketleriyle ayrılıyor: `h2` +
 * "Onaylandı" ikilisi yalnızca üst kartta, `h1` yalnızca ortalanmış başlıkta
 * bulunuyor. Madde başlıkları düz `div`, bu yüzden eleme onlara dokunmuyor.
 */
function stripDuplicateHeadings(html: string): string {
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

export default function ContractViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params.orderNumber as string;
  const contractType = searchParams.get("contract") || "terms";

  /**
   * Sayfaya iki yoldan geliniyor: hesaptaki sipariş detayından ve sipariş onay
   * e-postasındaki `?token=` bağlantısından. İkincisinde oturum olmayabilir,
   * o yüzden dönüş hedefi sabit yazılamıyor — oturumsuz kullanıcıyı sipariş
   * detayına yollamak onu giriş ekranına düşürürdü.
   *
   * `status` üç değer alıyor; `"loading"` sırasında da ana sayfa gösteriliyor,
   * yani bağlantı ilk boyamada da geçerli bir hedefe sahip.
   */
  const { status: sessionStatus } = useSession();
  const signedIn = sessionStatus === "authenticated";
  const backHref = signedIn ? `/hesabim/siparisler/${orderNumber}` : "/";
  const backLabel = signedIn ? "Sipariş detayına dön" : "Ana sayfa";

  const [data, setData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeContract, setActiveContract] = useState<ContractTab>(
    contractType === "distance" ? "distance" : "terms"
  );

  const tabRefs = useRef<Partial<Record<ContractTab, HTMLButtonElement | null>>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  // Get token from URL for secure access
  const token = searchParams.get("token");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        // Include token in API request if available
        const tokenParam = token ? `?token=${token}` : "";
        const res = await fetch(`/api/orders/${orderNumber}/contracts${tokenParam}`);

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Sözleşmeler yüklenemedi");
        }

        const contractData = await res.json();
        setData(contractData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchContracts();
    }
  }, [orderNumber, token]);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  const currentContract =
    activeContract === "terms"
      ? data?.contracts.termsAndConditions
      : data?.contracts.distanceSalesContract;

  const contractHtml = useMemo(
    () => (currentContract?.html ? stripDuplicateHeadings(currentContract.html) : null),
    [currentContract?.html]
  );

  const contractTitle =
    CONTRACT_TABS.find((tab) => tab.value === activeContract)?.title ?? CONTRACT_TABS[0].title;

  const otherTab = CONTRACT_TABS.find((tab) => tab.value !== activeContract)!;

  useEffect(() => {
    // Üretilen belgedeki fiyat tablosu dar ekranda yatay kayıyor. Kayan bölge
    // odaklanabilir olmalı, yoksa yalnızca fareyle gezilebiliyor
    // (axe: scrollable-region-focusable).
    const root = contentRef.current;
    if (!root) return;
    root.querySelectorAll("table").forEach((table) => {
      table.tabIndex = 0;
    });
  }, [contractHtml]);

  const selectTab = (value: ContractTab) => {
    setActiveContract(value);
    tabRefs.current[value]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = CONTRACT_TABS.length - 1;
    let target: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      target = index === last ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      target = index === 0 ? last : index - 1;
    } else if (event.key === "Home") {
      target = 0;
    } else if (event.key === "End") {
      target = last;
    }

    if (target === null) return;
    event.preventDefault();
    selectTab(CONTRACT_TABS[target].value);
  };

  if (loading) {
    return (
      <div className="contract-page flex min-h-screen items-center justify-center bg-background">
        <div className="text-center" role="status">
          <Loader2
            className="mx-auto mb-4 h-8 w-8 animate-spin text-[var(--acc-accent-fg)]"
            aria-hidden="true"
          />
          <p className="text-foreground-secondary">Sözleşmeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contract-page flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-background-secondary p-8 text-center">
          <AlertCircle
            className="mx-auto mb-4 h-12 w-12 text-[var(--acc-danger-fg)]"
            aria-hidden="true"
          />
          <h1 className="mb-2 text-xl font-semibold text-foreground">Sözleşme Bulunamadı</h1>
          <p className="mb-6 text-foreground-secondary">{error}</p>
          <Link
            href="/"
            className="acc-chip-accent inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-6 text-[15px] font-medium transition-colors hover:border-[var(--acc-accent-fg)]"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="contract-page min-h-screen bg-background px-3 pb-6 pt-20 sm:px-4 sm:pb-10 sm:pt-24">
      {/* Geri dönüş kartın DIŞINDA ve üstünde: belge uzun, kullanıcı sayfaya
          girer girmez çıkışı görmeli. Kart içine konsaydı sözleşme başlığıyla
          aynı şeridi paylaşıp gezinme mi belge başlığı mı olduğu belirsizleşirdi. */}
      <div className="mx-auto mb-3 max-w-4xl">
        <Link
          href={backHref}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-foreground-secondary transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
      </div>

      {/* Tek kart: üst/orta/alt üç ayrı kutu yerine tek çerçeve, böylece köşeler
          dar ekranda da bütün kalıyor. */}
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-background-secondary">
        <div className="px-4 pt-2 lg:px-6">
          <div className="account-tabbar" role="tablist" aria-label="Sözleşme türü">
            {CONTRACT_TABS.map((tab, index) => {
              const selected = tab.value === activeContract;
              return (
                <button
                  key={tab.value}
                  ref={(node) => {
                    tabRefs.current[tab.value] = node;
                  }}
                  type="button"
                  role="tab"
                  id={tabDomId(tab.value)}
                  aria-selected={selected}
                  aria-controls={panelDomId(tab.value)}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveContract(tab.value)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className="account-tabbar__item"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 border-b border-border bg-[var(--acc-accent-bg)] px-4 py-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--acc-accent-bg)] sm:h-12 sm:w-12"
              aria-hidden="true"
            >
              <FileText className="h-5 w-5 text-[var(--acc-accent-fg)] sm:h-6 sm:w-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-foreground sm:text-lg">
                {contractTitle}
              </h1>
              <p className="text-xs text-foreground-tertiary sm:text-sm">
                Sipariş: <span className="tabular-nums">{orderNumber}</span>
              </p>
            </div>
          </div>
          <span className="acc-chip-success inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Onaylandı
          </span>
        </div>

        <div className="flex items-start gap-2 border-b border-border bg-[var(--acc-info-bg)] px-4 py-3 sm:gap-3 lg:px-6">
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--acc-info-fg)]"
            aria-hidden="true"
          />
          <p className="min-w-0 text-xs text-[var(--acc-info-fg)] sm:text-sm">
            Bu sözleşme sipariş sırasında kabul edilmiş ve saklanmıştır. Onay tarihi:{" "}
            <strong className="font-semibold">
              {data?.acceptedAt ? formatDate(data.acceptedAt) : "-"}
            </strong>
          </p>
        </div>

        <div
          ref={contentRef}
          id={panelDomId(activeContract)}
          role="tabpanel"
          aria-labelledby={tabDomId(activeContract)}
          tabIndex={0}
        >
          {contractHtml ? (
            <div className="contract-content" dangerouslySetInnerHTML={{ __html: contractHtml }} />
          ) : (
            <div className="px-4 py-12 text-center sm:px-6">
              <FileText
                className="mx-auto mb-4 h-10 w-10 text-foreground-muted sm:h-12 sm:w-12"
                aria-hidden="true"
              />
              <p className="text-sm text-foreground-secondary sm:text-base">
                Sözleşme içeriği bulunamadı
              </p>
              <p className="mt-2 text-xs text-foreground-tertiary sm:text-sm">
                Bu sipariş için sözleşme kaydedilmemiş olabilir.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center lg:px-6">
          {/* Üstteki bağlantıyla AYNI hedef: iki uçta iki farklı yer göstermek
              kullanıcıya "geri" nin nereye gittiğini iki kez öğretiyordu. */}
          <Link
            href={backHref}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 text-sm text-foreground-secondary transition-colors hover:text-foreground sm:justify-start"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Link>

          {/* Uzun belgenin sonuna gelen kullanıcı yukarıdaki şeride dönmek
              zorunda kalmasın diye diğer sözleşmeye kısayol. */}
          <button
            type="button"
            onClick={() => selectTab(otherTab.value)}
            aria-label={`${otherTab.label} sekmesine geç`}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-glass-bg px-4 text-sm text-foreground transition-colors hover:border-border-hover"
          >
            {otherTab.value === "terms" && <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
            {otherTab.label}
            {otherTab.value === "distance" && (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
