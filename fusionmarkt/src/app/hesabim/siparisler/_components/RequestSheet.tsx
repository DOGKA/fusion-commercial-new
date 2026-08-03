"use client";

/**
 * Çok tipli talep paneli (plan 03 Faz 6 · F2-60).
 *
 * `ReturnRequestSheet`'in yerine geldi ve onu kapsıyor. Sunucu beş talep tipini
 * (`RETURN`, `INVOICE_REQUEST`, `WRONG_INVOICE`, `EXTRA_ITEM`, `OTHER`) uzun
 * süredir kabul ediyordu; arayüz yalnızca iadeyi sunuyordu, yani fatura talebi
 * gibi tipler ölü yetenekti.
 *
 * İki adımlı: tip seçimi → tipe göre form. `initialType` verilirse ilk adım
 * atlanır — "İade et" butonu müşteriyi liste üzerinden dolaştırmasın diye.
 *
 * Hangi tipin hangi durumda açılabileceğine SUNUCU karar veriyor
 * (`permissions.availableRequestTypes`); burada o liste olduğu gibi çiziliyor.
 * Kuralı istemcide ikinci kez yazmak, iki tarafın sapmasına açık kapı bırakırdı.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Camera,
  Check,
  ChevronRight,
  Headphones,
  Loader2,
  Wrench,
  X,
} from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  REASONS_REQUIRING_IMAGE,
  REQUEST_TYPE_DESCRIPTIONS,
  REQUEST_TYPE_LABELS,
  RETURN_REASON_LABELS,
  isDescriptionRequired,
  type RequestTypeKey,
  type ReturnReasonKey,
} from "@/lib/orders";
import { DISABLED_TONE, SHEET_SECONDARY, sheetPrimary } from "../_lib/action-classes";
import { toneClass } from "./order-status-ui";

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/** Görsel yalnızca kanıt değeri olan tiplerde teklif ediliyor. */
const IMAGES_OFFERED: RequestTypeKey[] = ["RETURN", "WRONG_INVOICE", "EXTRA_ITEM", "OTHER"];

/**
 * Kalem seçimi yalnızca "hangi ürün?" sorusunun anlamlı olduğu tiplerde çıkar.
 * Fatura talebinin konusu siparişin tamamıdır, orada seçim gürültüdür.
 */
const ITEM_SELECTION_OFFERED: RequestTypeKey[] = ["RETURN", "EXTRA_ITEM", "OTHER"];

const DESCRIPTION_PLACEHOLDER: Record<RequestTypeKey, string> = {
  RETURN: "İade sebebinizi açıklayabilirsiniz...",
  INVOICE_REQUEST: "Eklemek istediğiniz bir not varsa yazabilirsiniz...",
  WRONG_INVOICE: "Faturadaki hangi bilgi hatalı? Doğrusu ne olmalı?",
  EXTRA_ITEM: "Hangi ürün fazla geldi? Kutuda kaç adet vardı?",
  OTHER: "Talebinizi kısaca açıklayın...",
};

/** "Talep yerine" kısayol satırlarının ortak görünümü. */
const ALT_ROW_CLASS =
  "flex min-h-[48px] items-center gap-3 rounded-lg border border-border bg-glass-bg px-3 transition-colors hover:border-border-hover hover:bg-glass-bg-hover";

/** Seçilebilir sipariş kalemi. */
export interface RequestItemOption {
  id: string;
  name: string;
  quantity: number;
  image?: string | null;
  variantLabel?: string | null;
}

interface RequestSheetProps {
  /** Açıksa siparişin numarası, kapalıysa `null`. */
  orderNumber: string | null;
  /** Verilirse tip seçim adımı atlanır. */
  initialType?: RequestTypeKey;
  /** Sunucudan gelen izinli tipler. Boşsa seçim adımı bilgilendirme gösterir. */
  availableTypes?: RequestTypeKey[];
  /** Sunucudan gelen izinli iade nedenleri; verilmezse tüm liste gösterilir. */
  availableReturnReasons?: ReturnReasonKey[];
  /**
   * Siparişin kalemleri. Verilmezse veya seçilecek bir şey yoksa (tek kalem,
   * tek adet) seçim bölümü hiç çizilmez ve talep tüm siparişi kapsar.
   */
  orderItems?: RequestItemOption[];
  /**
   * Sipariş teslim edildi mi. Yalnızca "TALEP YERİNE" kısayollarını kapılıyor
   * (plan 07 M-13): ürün daha müşteride değilken "ürünümde arıza var" satırını
   * göstermek anlamsız ve teknik servis kuyruğunu boş kayıtla dolduruyordu.
   *
   * Talep TİPLERİ bu bayrağa bakmıyor — onları sunucu `enabledRequestTypes`
   * ile kapılıyor ve o kural istemcide ikinci kez yazılmıyor.
   */
  delivered?: boolean;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
}

export default function RequestSheet({
  orderNumber,
  initialType,
  availableTypes = [],
  availableReturnReasons,
  orderItems = [],
  delivered = false,
  onClose,
  onSuccess,
}: RequestSheetProps) {
  const [chosenType, setChosenType] = useState<RequestTypeKey | null>(null);
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  /**
   * Kalem kimliği → iade edilmek istenen adet. **Anahtarı olmayan kalem tam
   * adetle seçili sayılır**; başlangıç durumu bilinçli olarak boş.
   *
   * Neden böyle: varsayılanı `useState` başlangıç değerinde kurmak, kalemler
   * panel bağlandıktan sonra gelirse (ya da panel ikinci kez açılırsa) bayat
   * bir seçim bırakıyordu. Varsayılanı okurken türetmek bu sınıf hatayı
   * tamamen ortadan kaldırıyor.
   */
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const type = initialType ?? chosenType;
  const quantityFor = (item: RequestItemOption) => itemQuantities[item.id] ?? item.quantity;

  /**
   * Seçim bölümü yalnızca seçilecek bir şey varken çizilir: tek kalemli ve tek
   * adetli siparişte "hangisini iade ediyorsunuz?" sormak boş bir adım olurdu.
   */
  const itemSelectionVisible =
    type != null &&
    ITEM_SELECTION_OFFERED.includes(type) &&
    (orderItems.length > 1 || orderItems.some((item) => item.quantity > 1));

  const selectedItems = orderItems
    .map((item) => ({ orderItemId: item.id, quantity: quantityFor(item) }))
    .filter((entry) => entry.quantity > 0);

  /**
   * Her kalem tam adetle seçiliyse talep tüm siparişi kapsıyor demektir ve
   * sunucuya kalem listesi **gönderilmez**. Böylece "kayıt var ⇔ kısmi talep"
   * değişmezi korunuyor; admin tarafındaki kısmi talep kontrolü buna dayanıyor.
   */
  const isPartialSelection =
    itemSelectionVisible &&
    orderItems.some((item) => quantityFor(item) !== item.quantity);

  const reasonKeys =
    availableReturnReasons && availableReturnReasons.length > 0
      ? availableReturnReasons
      : (Object.keys(RETURN_REASON_LABELS) as ReturnReasonKey[]);

  const imageRequired =
    type === "RETURN" &&
    !!reason &&
    REASONS_REQUIRING_IMAGE.includes(reason as ReturnReasonKey);
  const descriptionRequired = type != null && isDescriptionRequired(type);

  const trimmedDescription = description.trim();

  /**
   * Gönderimi engelleyen İLK eksik. Tek bir dize döndürüyor çünkü ekranda
   * gösterilecek olan da tek satır: bütün eksikleri birden listelemek, henüz
   * sırası gelmemiş alanları da hatalıymış gibi gösterirdi.
   *
   * Buton bu değere göre pasifleşiyor ve **aynı metin butonun hemen üstünde
   * yazılı**. Eskiden buton yalnızca iade sebebine bakıyordu; açıklama boşken
   * aktif görünüyor, basılınca hata veriyordu. Şimdi tersi de doğru olmalı:
   * pasif buton sebepsiz bırakılırsa müşteri neyi eksik bıraktığını
   * anlayamadan formda kalıyor.
   */
  const blockingRequirement: string | null = (() => {
    if (type == null) return null;
    if (type === "RETURN" && !reason) return "İade sebebini seçin.";
    if (descriptionRequired && !trimmedDescription) {
      return "Açıklama alanını doldurun.";
    }
    if (descriptionRequired && trimmedDescription.length < DESCRIPTION_MIN_LENGTH) {
      return `Açıklama en az ${DESCRIPTION_MIN_LENGTH} karakter olmalı (şu an ${trimmedDescription.length}).`;
    }
    if (imageRequired && images.length === 0) {
      return "Bu iade sebebi için en az bir fotoğraf ekleyin.";
    }
    if (itemSelectionVisible && selectedItems.length === 0) {
      return "En az bir ürün seçin.";
    }
    return null;
  })();

  const resetForm = () => {
    setReason("");
    setDescription("");
    setImages([]);
    setPreviews([]);
    setItemQuantities({});
    setError(null);
  };

  const close = () => {
    setChosenType(null);
    setSuccess(null);
    resetForm();
    onClose();
  };

  /** Tip seçiminden geldiyse geri dönülebilir; doğrudan açıldıysa dönülecek adım yok. */
  const goBack = () => {
    setChosenType(null);
    resetForm();
  };

  const onSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const picked = Array.from(files);
    if (images.length + picked.length > MAX_IMAGES) {
      setError(`En fazla ${MAX_IMAGES} görsel yükleyebilirsiniz`);
      return;
    }

    for (const file of picked) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Sadece JPEG, PNG ve WebP formatları desteklenir");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Her görsel 5MB'dan küçük olmalıdır");
        return;
      }
    }

    setError(null);
    setImages((prev) => [...prev, ...picked]);
    picked.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    // Aynı dosyayı tekrar seçebilmek için input sıfırlanır.
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (!orderNumber || !type) return;

    // Buton zaten pasif; bu kontrol klavye/otomasyon yoluyla gelen çağrılar
    // için son bir kapı. Metin butonun üstündekiyle aynı, iki ayrı sözlük
    // tutmuyoruz.
    if (blockingRequirement) {
      setError(blockingRequirement);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("requestType", type);
      if (type === "RETURN") formData.append("reason", reason);
      if (trimmedDescription) formData.append("description", trimmedDescription);
      if (isPartialSelection) formData.append("items", JSON.stringify(selectedItems));
      images.forEach((file) => formData.append("images", file));

      const res = await fetch(`/api/orders/${orderNumber}/return-request`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Talebiniz oluşturulamadı");
        return;
      }

      setSuccess(data.message || "Talebiniz alındı.");
      onSuccess(orderNumber);
      window.setTimeout(close, 2500);
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  };

  const showPicker = type === null;

  return (
    <Sheet
      open={orderNumber !== null}
      onClose={close}
      onBack={!showPicker && initialType == null && !success ? goBack : undefined}
      title={
        success
          ? "Talebiniz alındı"
          : showPicker
            ? "Talep oluştur"
            : REQUEST_TYPE_LABELS[type]
      }
      description={showPicker && !success ? "Konusunu seçin, formu ona göre açalım." : undefined}
      busy={loading}
      footer={
        success || showPicker ? null : (
          <div className="space-y-2">
            {/* Pasif butonun gerekçesi butonun ÜSTÜNDE: müşteri sebebi
                aramak için formu yukarı aşağı taramak zorunda kalmasın. */}
            {blockingRequirement && !loading && (
              <p
                className={`flex items-start gap-1.5 text-[12px] ${toneClass("warning")}`}
                aria-live="polite"
              >
                <AlertCircle size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span className="min-w-0">{blockingRequirement}</span>
              </p>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={close} className={SHEET_SECONDARY}>
                Vazgeç
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={loading || blockingRequirement !== null}
                className={sheetPrimary("progress")}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  "Talep Oluştur"
                )}
              </button>
            </div>
          </div>
        )
      }
    >
      {success ? (
        <div className="py-4 text-center">
          {/* Zemin `-bg`, sınır `-border`: daire eskiden doğrudan `-border`
              rengiyle dolduruluyordu, o değişken artık sınır için koyu
              olduğundan aynı tonun ikonu üstünde kaybolurdu. */}
          <div className="acc-chip-success mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <Check size={28} aria-hidden="true" />
          </div>
          <p className="text-[14px] text-foreground">{success}</p>
        </div>
      ) : showPicker ? (
        <div className="space-y-1.5">
          {availableTypes.length === 0 && (
            <p className="rounded-lg border border-border bg-glass-bg p-3 text-[13px] text-foreground-muted">
              Bu sipariş için şu anda talep oluşturamıyorsunuz. Devam eden bir
              talebiniz varsa sonuçlanmasını beklemeniz gerekiyor.
            </p>
          )}

          {availableTypes.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setChosenType(key)}
              className="flex w-full min-h-[56px] items-center gap-3 rounded-lg border border-border bg-glass-bg px-3 py-2 text-left transition-colors hover:border-[color:var(--acc-progress-border)] hover:bg-[color:var(--acc-progress-bg)]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-foreground">
                  {REQUEST_TYPE_LABELS[key]}
                </span>
                <span className="block text-[11px] text-foreground-muted">
                  {REQUEST_TYPE_DESCRIPTIONS[key]}
                </span>
              </span>
              <ChevronRight
                size={15}
                aria-hidden="true"
                className="shrink-0 text-foreground-muted"
              />
            </button>
          ))}

          {/*
            Bu satırlar talep AÇMIYOR, başka akışa gönderiyor. Referansta da
            böyle: arızalı ürün servis süreci, genel sorular müşteri hizmetleri.
            Bunları talep tipi yapmak iade kuyruğunu servis kayıtlarıyla karıştırırdı.

            Teknik servis kısayolu yalnızca TESLİM EDİLMİŞ siparişte (M-13):
            eskiden sipariş durumundan bağımsız basılıyordu ve daha kargoya bile
            verilmemiş siparişte "ürünümde arıza var" çıkıyordu. Müşteri
            hizmetleri kısayolu her aşamada geçerli, o kalıyor.
          */}
          <div className="pt-2">
            <p className="account-eyebrow mb-1.5">
              Talep yerine
            </p>
            <div className="space-y-1.5">
              {delivered && (
                <Link
                  href={`/servis-formu?siparis=${encodeURIComponent(orderNumber ?? "")}`}
                  onClick={close}
                  className={ALT_ROW_CLASS}
                >
                  <Wrench size={15} aria-hidden="true" className="shrink-0 text-foreground-muted" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] text-foreground">
                      Ürünümde arıza var
                    </span>
                    <span className="block text-[11px] text-foreground-muted">
                      Teknik servis formunu doldurun
                    </span>
                  </span>
                  <ChevronRight
                    size={15}
                    aria-hidden="true"
                    className="shrink-0 text-foreground-muted"
                  />
                </Link>
              )}
              <Link href="/iletisim" onClick={close} className={ALT_ROW_CLASS}>
                <Headphones
                  size={15}
                  aria-hidden="true"
                  className="shrink-0 text-foreground-muted"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] text-foreground">
                    Müşteri hizmetlerine ulaş
                  </span>
                  <span className="block text-[11px] text-foreground-muted">
                    Telefon, e-posta ve iletişim formu
                  </span>
                </span>
                <ChevronRight
                  size={15}
                  aria-hidden="true"
                  className="shrink-0 text-foreground-muted"
                />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-glass-bg p-3">
            <p className="mb-1 text-[12px] text-foreground-muted">Sipariş No</p>
            <p className="break-all font-mono text-[14px] tabular-nums text-foreground">
              #{orderNumber}
            </p>
          </div>

          {type === "INVOICE_REQUEST" && (
            <p className="rounded-lg border border-border bg-glass-bg p-3 text-[13px] text-foreground-tertiary">
              Faturanız hazırlandığında sipariş detayınıza eklenir ve e-posta ile
              bilgilendirilirsiniz.
            </p>
          )}

          {itemSelectionVisible && (
            <fieldset>
              <legend className="mb-2 text-[13px] text-foreground-secondary">
                Hangi ürünler?{" "}
                <span className="text-foreground-muted">
                  (varsayılan: tümü)
                </span>
              </legend>
              <div className="space-y-1.5">
                {orderItems.map((item) => {
                  const quantity = quantityFor(item);
                  const selected = quantity > 0;
                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border px-3 py-2.5 transition-colors ${
                        selected
                          ? "border-[color:var(--acc-progress-border)] bg-[color:var(--acc-progress-bg)]"
                          : "border-border bg-glass-bg"
                      }`}
                    >
                      <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            setItemQuantities((prev) => ({
                              ...prev,
                              [item.id]: selected ? 0 : item.quantity,
                            }))
                          }
                          className="h-4 w-4 shrink-0 accent-[color:var(--acc-progress-fg)]"
                        />
                        {item.image && (
                          <Image
                            src={item.image}
                            alt=""
                            width={36}
                            height={36}
                            className="h-9 w-9 shrink-0 rounded-md border border-border object-cover"
                          />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-foreground">
                            {item.name}
                          </span>
                          {item.variantLabel && (
                            <span className="block truncate text-[11px] text-foreground-muted">
                              {item.variantLabel}
                            </span>
                          )}
                        </span>
                      </label>

                      {/* Adet seçimi yalnızca birden fazla adet alınmışsa anlamlı. */}
                      {selected && item.quantity > 1 && (
                        <div className="mt-2 flex items-center gap-2 pl-7">
                          <span className="text-[11px] text-foreground-muted">Adet</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setItemQuantities((prev) => ({
                                  ...prev,
                                  [item.id]: Math.max(1, quantity - 1),
                                }))
                              }
                              disabled={quantity <= 1}
                              aria-label={`${item.name} adedini azalt`}
                              className={`account-icon-btn flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-glass-bg-hover ${DISABLED_TONE}`}
                            >
                              −
                            </button>
                            <span className="min-w-[2rem] text-center text-[13px] text-foreground">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setItemQuantities((prev) => ({
                                  ...prev,
                                  [item.id]: Math.min(item.quantity, quantity + 1),
                                }))
                              }
                              disabled={quantity >= item.quantity}
                              aria-label={`${item.name} adedini artır`}
                              className={`account-icon-btn flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-glass-bg-hover ${DISABLED_TONE}`}
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[11px] text-foreground-muted">
                            / {item.quantity}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isPartialSelection && (
                <p className="mt-2 flex items-start gap-1.5 text-[11px] text-foreground-muted">
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span className="min-w-0">
                    Yalnızca seçtiğiniz ürünler için talep açılıyor. Kalan ürünler
                    siparişinizde kalır.
                  </span>
                </p>
              )}
            </fieldset>
          )}

          {type === "RETURN" && (
            <fieldset>
              <legend className="mb-2 text-[13px] text-foreground-secondary">
                İade Sebebi <span className={toneClass("danger")}>*</span>
              </legend>
              <div className="space-y-1.5">
                {reasonKeys.map((key) => (
                  <label
                    key={key}
                    className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-border bg-glass-bg px-3 transition-colors hover:border-border-hover has-[:checked]:border-[color:var(--acc-progress-border)] has-[:checked]:bg-[color:var(--acc-progress-bg)]"
                  >
                    <input
                      type="radio"
                      name="returnReason"
                      value={key}
                      checked={reason === key}
                      onChange={(e) => setReason(e.target.value)}
                      className="h-4 w-4 shrink-0 accent-[color:var(--acc-progress-fg)]"
                    />
                    <span className="text-[13px] text-foreground">
                      {RETURN_REASON_LABELS[key]}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div>
            <label
              htmlFor="request-description"
              className="mb-2 block text-[13px] text-foreground-secondary"
            >
              Açıklama{" "}
              {descriptionRequired ? (
                <span className={toneClass("danger")}>*</span>
              ) : (
                <span className="text-foreground-muted">(İsteğe bağlı)</span>
              )}
            </label>
            <textarea
              id="request-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={DESCRIPTION_PLACEHOLDER[type]}
              rows={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
              aria-required={descriptionRequired}
              aria-describedby={descriptionRequired ? "request-description-hint" : undefined}
              className="w-full resize-none rounded-lg border border-border bg-glass-bg px-3 py-2.5 text-[14px] text-foreground placeholder:text-foreground-muted transition-colors focus:border-[color:var(--acc-progress-fg)] focus:outline-none"
            />
            {/* Asgari uzunluk gönderim ANINDA değil yazarken görünüyor: eşiği
                ancak hata mesajından öğrenmek, formu ikinci kez doldurtuyor. */}
            {descriptionRequired && (
              <p
                id="request-description-hint"
                className={`mt-1.5 text-[12px] ${
                  trimmedDescription.length >= DESCRIPTION_MIN_LENGTH
                    ? "text-foreground-muted"
                    : toneClass("warning")
                }`}
              >
                {trimmedDescription.length >= DESCRIPTION_MIN_LENGTH
                  ? `${trimmedDescription.length}/${DESCRIPTION_MAX_LENGTH} karakter`
                  : `En az ${DESCRIPTION_MIN_LENGTH} karakter yazın (${trimmedDescription.length}/${DESCRIPTION_MIN_LENGTH}).`}
              </p>
            )}
          </div>

          {IMAGES_OFFERED.includes(type) && (
            <div>
              <p className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-foreground-secondary">
                <span>
                  {type === "WRONG_INVOICE" ? "Fatura Görseli" : "Ürün Görselleri"}
                </span>
                {!imageRequired && (
                  <span className="text-foreground-muted">(İsteğe bağlı)</span>
                )}
                <span className="text-foreground-muted">en fazla {MAX_IMAGES}</span>
              </p>

              {previews.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={preview}
                        alt={`Görsel ${index + 1}`}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-lg border border-border object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label={`${index + 1}. görseli kaldır`}
                        className="account-icon-btn account-icon-btn--round absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-[color:var(--acc-danger-fg)] shadow-sm transition-colors hover:bg-[color:var(--acc-danger-bg)]"
                      >
                        <X size={12} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < MAX_IMAGES && (
                <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-glass-bg px-4 py-3 transition-colors hover:border-[color:var(--acc-progress-fg)] hover:bg-glass-bg-hover">
                  <Camera size={18} aria-hidden="true" className="text-foreground-muted" />
                  <span className="text-[13px] text-foreground-muted">
                    Görsel Ekle ({images.length}/{MAX_IMAGES})
                  </span>
                  <input
                    type="file"
                    accept={ALLOWED_TYPES.join(",")}
                    multiple
                    onChange={onSelectImages}
                    className="hidden"
                  />
                </label>
              )}

              {imageRequired && (
                <p
                  className={`mt-2 flex items-start gap-1.5 text-[11px] ${toneClass("warning")}`}
                >
                  <AlertCircle size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span className="min-w-0">
                    Bu sebep için fotoğraf zorunlu — talebiniz fotoğraf olmadan
                    değerlendirilemiyor.
                  </span>
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="acc-chip-danger rounded-lg p-3" role="alert">
              <p className="text-[13px]">{error}</p>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
