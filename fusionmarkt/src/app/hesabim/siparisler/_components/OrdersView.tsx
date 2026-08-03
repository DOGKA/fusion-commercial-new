"use client";

/**
 * Siparişlerim listesi.
 *
 * Plan 03 Faz 2 ile yeniden yazıldı. Kabuk dilimindeki 1300 satırlık tek dosya
 * şu parçalara bölündü: `OrderFilters`, `OrderCard`, `OrderDetailBody`,
 * `OrderTimeline`, `RequestStatusCards`, `CancelRequestSheet`, `RequestSheet`.
 *
 * DAVRANIŞ DEĞİŞİKLİKLERİ:
 *
 * 1. **Filtre ve arama artık sunucuda.** Eskiden tüm siparişler indirilip
 *    istemcide filtreleniyordu; yüz siparişli bir müşteride bu her açılışta
 *    megabaytlarca transfer demekti.
 *
 * 2. **Sonsuz kaydırma.** Sayfa başına 10 kayıt, görünüre girince sonraki sayfa.
 *
 * 3. **30 saniyelik yoklama KALDIRILDI.** Sayfalama ile bağdaşmıyor: kullanıcı
 *    üçüncü sayfaya kadar kaydırmışken arka planda yalnızca ilk sayfayı çekmek
 *    listeyi kırpardı. Yerine sekmeye dönüşte tazeleme ve elle yenile butonu
 *    var. Durum değişikliği e-posta ile de bildirildiği için 30 saniyelik
 *    tazelik zaten bir gereksinim değildi.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, Loader2, AlertCircle, RefreshCw, ChevronRight, Search } from "lucide-react";
import type { OrderFilterValue } from "@/lib/orders";
import type { Order, OrdersPagination, OrdersResponse } from "../../_lib/types";
import { ACTION_PILL } from "../_lib/action-classes";
import OrderFilters from "./OrderFilters";
import OrderCard from "./OrderCard";
import { chipClass, chipHoverClass, toneClass } from "./order-status-ui";
import type { RequestDetail } from "./RequestStatusCards";

const PAGE_SIZE = 10;

const SEARCH_DEBOUNCE_MS = 400;

export default function OrdersView({
  initialData,
}: {
  /**
   * Sunucuda çekilen ilk sayfa (status=all, q boş — F2-45). Filtre/arama
   * değişince istemci yine `fetch` eder; yalnızca varsayılan görünümde
   * mount isteği atlanır.
   */
  initialData?: OrdersResponse | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  /** Derin link: /hesabim/siparisler?siparis=FM-2026-12345 — yalnızca OKUNUR. */
  const targetOrderNumber = searchParams.get("siparis");

  const [orders, setOrders] = useState<Order[]>(initialData?.orders ?? []);
  const [pagination, setPagination] = useState<OrdersPagination | null>(
    initialData?.pagination ?? null
  );
  const [loading, setLoading] = useState(!initialData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderFilterValue>("all");

  /** Akordiyon açıldığında detay ucundan çekilen talep bilgileri. */
  const [requestDetails, setRequestDetails] = useState<Record<string, RequestDetail>>({});

  const sentinelRef = useRef<HTMLDivElement>(null);
  /** Yarışan isteklerde geç dönen eski yanıtın yeniyi ezmesini engeller. */
  const requestIdRef = useRef(0);

  // Arama girdisini geciktir: her harfte istek atmak sunucuyu boşa yorar.
  useEffect(() => {
    const timer = window.setTimeout(() => setSearchTerm(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const buildUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchTerm) params.set("q", searchTerm);
      return `/api/orders?${params.toString()}`;
    },
    [statusFilter, searchTerm]
  );

  const loadFirstPage = useCallback(
    async (mode: "initial" | "refresh") => {
      const requestId = ++requestIdRef.current;
      if (mode === "initial") setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const res = await fetch(buildUrl(1));
        if (!res.ok) throw new Error("Siparişler alınamadı");
        const data = await res.json();
        if (requestId !== requestIdRef.current) return;
        setOrders(data.orders ?? []);
        setPagination(data.pagination ?? null);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [buildUrl]
  );

  const loadMore = useCallback(async () => {
    if (!pagination?.hasMore || loadingMore) return;
    const requestId = requestIdRef.current;
    setLoadingMore(true);
    try {
      const res = await fetch(buildUrl(pagination.page + 1));
      if (!res.ok) return;
      const data = await res.json();
      // Bu arada filtre değiştiyse gelen sayfa artık başka bir sorguya ait.
      if (requestId !== requestIdRef.current) return;
      setOrders((prev) => [...prev, ...(data.orders ?? [])]);
      setPagination(data.pagination ?? null);
    } catch {
      // Sessiz geç: sonsuz kaydırma hatası tam ekran hata göstermeyi hak etmiyor,
      // kullanıcı kaydırmayı tekrar deneyebilir.
    } finally {
      setLoadingMore(false);
    }
  }, [buildUrl, pagination, loadingMore]);

  /**
   * İlk veri sunucudan geldiyse ve filtreler hâlâ varsayılan ise mount'taki
   * isteği atla. Filtre/arama değişince `loadFirstPage` bağımlılığı değişir,
   * o zaman istemci çeker — sunucu yalnızca ilk boyamayı besliyor.
   */
  const skipInitialFetch = useRef(Boolean(initialData));

  // Filtre veya arama değişince baştan yükle.
  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    void loadFirstPage("initial");
  }, [loadFirstPage]);

  // Sekmeye dönüşte tazele.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) void loadFirstPage("refresh");
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [loadFirstPage]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !pagination?.hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      // Kullanıcı listenin sonuna varmadan yüklemeye başla.
      { rootMargin: "240px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, pagination?.hasMore]);

  const fetchRequestDetail = useCallback(async (orderNumber: string) => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}/detail`);
      if (!res.ok) return;
      const data = await res.json();
      const latestReturn = data.requests?.returns?.[0];
      setRequestDetails((prev) => ({
        ...prev,
        [orderNumber]: {
          cancellationStatus: data.requests?.cancellation?.status,
          cancellationAdminNote: data.requests?.cancellation?.adminNote,
          returnStatus: latestReturn?.status,
          /**
           * Talep tipi olmadan durum kartları her talebi "iade" sanıyor ve
           * fatura talebi açan müşteriye "ürünü şu adrese gönderin" yazıyordu.
           * Detay ekranı bu alanı zaten geçiriyordu, liste geçirmiyordu.
           */
          returnRequestType: latestReturn?.requestType,
          returnAdminNote: latestReturn?.adminNote,
          returnAddress: latestReturn?.returnAddress,
          returnInstructions: latestReturn?.returnInstructions,
          returnCode: latestReturn?.returnCode,
          returnImages: latestReturn?.images,
          sendBackCarrier: latestReturn?.sendBackCarrier,
          sendBackTrackingNumber: latestReturn?.sendBackTrackingNumber,
        },
      }));
    } catch {
      // Talep bilgisi gelmezse kartın geri kalanı çalışmaya devam eder.
    }
  }, []);

  const toggleOrder = useCallback(
    (order: Order) => {
      const next = expandedOrder === order.id ? null : order.id;
      setExpandedOrder(next);
      // Onaylanmış iadenin adresi ve talimatları liste yanıtında yok; yalnızca
      // kart açıldığında çekiliyor.
      if (next) void fetchRequestDetail(order.orderNumber);
    },
    [expandedOrder, fetchRequestDetail]
  );

  /**
   * `?siparis=` param'ını aç. Param `orderNumber` taşır (paylaşılabilir),
   * akordiyon state'i `order.id` ile çalışır — burada eşlenir.
   *
   * Aranan sipariş ilk sayfada olmayabilir; bu durumda sunucu tarafı arama
   * kullanılarak doğrudan getirilir.
   *
   * MOBİLDE akordiyon hiç açılmıyor (Faz 3.2: kart detay sayfasına gidiyor),
   * bu yüzden derin link doğrudan detay sayfasına taşınıyor — aksi halde
   * e-postadaki bağlantı mobilde hiçbir şey açmadan listede bırakırdı.
   * `matchMedia` burada güvenli: efekt yalnızca istemcide çalışıyor, ilk
   * render'ın çıktısını etkilemiyor.
   */
  const deepLinkHandled = useRef<string | null>(null);
  useEffect(() => {
    if (!targetOrderNumber || loading) return;
    if (deepLinkHandled.current === targetOrderNumber) return;

    if (window.matchMedia("(max-width: 1023px)").matches) {
      deepLinkHandled.current = targetOrderNumber;
      router.replace(`/hesabim/siparisler/${encodeURIComponent(targetOrderNumber)}`);
      return;
    }

    const match = orders.find((o) => o.orderNumber === targetOrderNumber);
    if (match) {
      deepLinkHandled.current = targetOrderNumber;
      setExpandedOrder(match.id);
      void fetchRequestDetail(match.orderNumber);
      document
        .getElementById(`order-${match.id}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    // Listede yok: filtreyi temizleyip sipariş numarasıyla ara.
    if (statusFilter !== "all" || searchTerm !== targetOrderNumber) {
      setStatusFilter("all");
      setSearchInput(targetOrderNumber);
    } else {
      // Arama da bulamadıysa tekrar denemeyi bırak, yoksa sonsuz döngü olur.
      deepLinkHandled.current = targetOrderNumber;
    }
  }, [targetOrderNumber, orders, loading, statusFilter, searchTerm, fetchRequestDetail, router]);

  const clearFilters = () => {
    setSearchInput("");
    setStatusFilter("all");
  };

  const hasActiveFilters = statusFilter !== "all" || searchTerm !== "";

  // İlk yükleme
  if (loading && orders.length === 0 && !hasActiveFilters) {
    return (
      <div className="flex min-h-[400px] flex-col">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <span className="text-[15px] font-medium text-foreground">Siparişlerim</span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Loader2
              size={32}
              aria-hidden="true"
              className="acc-tone-accent mx-auto mb-3 animate-spin"
            />
            <p className="text-[14px] text-foreground-muted">Siparişler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <span className="text-[15px] font-medium text-foreground">Siparişlerim</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${chipClass("danger")}`}
          >
            <AlertCircle size={24} aria-hidden="true" />
          </div>
          <p className="mb-1 text-[13px] text-foreground-tertiary">{error}</p>
          <button
            type="button"
            onClick={() => void loadFirstPage("initial")}
            className={`${ACTION_PILL} mt-4 ${chipClass("accent")} ${chipHoverClass("accent")}`}
          >
            <RefreshCw size={12} aria-hidden="true" />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Hiç sipariş yok (filtresiz)
  if (!hasActiveFilters && orders.length === 0 && !loading) {
    return (
      <div className="flex min-h-[400px] flex-col">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <span className="text-[15px] font-medium text-foreground">Siparişlerim</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center pt-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-glass-bg">
            <Package size={24} aria-hidden="true" className="text-foreground-disabled" />
          </div>
          <p className="mb-1 text-[13px] text-foreground-tertiary">Henüz siparişiniz yok</p>
          <p className="mb-5 text-[12px] text-foreground-muted">
            İlk siparişinizi vermek için mağazayı ziyaret edin
          </p>
          <Link
            href="/magaza"
            className={`${ACTION_PILL} ${chipClass("accent")} ${chipHoverClass("accent")}`}
          >
            Mağazaya Git
            <ChevronRight size={12} aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <OrderFilters
        searchTerm={searchInput}
        onSearchChange={setSearchInput}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        total={pagination?.total ?? orders.length}
        onRefresh={() => void loadFirstPage("refresh")}
        refreshing={refreshing}
      />

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={24} aria-hidden="true" className="acc-tone-accent animate-spin" />
          <span className="sr-only">Siparişler yükleniyor</span>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <Search size={32} aria-hidden="true" className="mb-3 text-foreground/15" />
          <p className="mb-1 text-[14px] text-foreground-tertiary">Sonuç bulunamadı</p>
          <p className="mb-4 text-[13px] text-foreground-muted">
            Arama kriterlerinizi değiştirin
          </p>
          <button
            type="button"
            onClick={clearFilters}
            /* Hover'da opaklık düşürmek kontrastı eşiğin altına indiriyordu
               (plan 07 §4); altı çizili hâl aynı geri bildirimi bedelsiz verir. */
            className={`${toneClass("accent")} min-h-[44px] text-[13px] hover:underline`}
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="pt-4">
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expandedOrder === order.id}
                onToggle={() => toggleOrder(order)}
                requestDetail={requestDetails[order.orderNumber]}
              />
            ))}
          </div>

          {pagination?.hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-4">
              {loadingMore ? (
                <Loader2 size={20} aria-hidden="true" className="acc-tone-accent animate-spin" />
              ) : (
                // IntersectionObserver çalışmazsa (eski tarayıcı, reduced
                // motion ayarları) kullanıcı elle devam edebilsin.
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  className="min-h-[44px] rounded-full border border-border bg-glass-bg px-4 text-[12px] text-foreground-tertiary transition-colors hover:text-foreground"
                >
                  Daha fazla göster
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
