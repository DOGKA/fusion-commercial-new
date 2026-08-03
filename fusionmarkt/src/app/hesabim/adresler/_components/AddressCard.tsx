"use client";

/**
 * Adres kartı.
 *
 * "Sil" düzenleme panelinde; kartta yalnızca düzenleme ve varsayılan yapma var.
 *
 * GÖSTERGE İLE EYLEM AYRI. Önceki sürümde başlığın solundaki yıldız iki işi
 * birden yapıyordu: adres varsayılansa `disabled` bir butona dönüşüp durum
 * göstergesi oluyordu. Bunun iki sorunu vardı — `disabled` öğe sekme sırasından
 * çıktığı için klavye ve ekran okuyucu kullanıcısı "bu varsayılan" bilgisine hiç
 * ulaşamıyordu, ve aynı simge kimi kartta tıklanır kimi kartta tıklanmaz olduğu
 * için kart kalabalık ve kararsız görünüyordu.
 *
 * Şimdi: varsayılan adreste başlığın yanında METİN çipi (buton değil), varsayılan
 * olmayanda kart altında gerçek bir aksiyon. Başlıkta dekoratif kategori ikonu
 * kullanılmıyor; kategori bilgisi metin olarak kullanım etiketinde kalıyor.
 */

import { Pencil } from "lucide-react";
import { formatPhone } from "@/lib/user-validation";
import { effectiveAddressCategory, type UserAddress } from "../_lib/types";

interface AddressCardProps {
  address: UserAddress;
  onEdit: (address: UserAddress) => void;
  onSetDefault: (id: string) => void;
}

const CATEGORY_LABEL = {
  HOME: "Ev",
  WORK: "İş",
  OTHER: "Diğer",
} as const;

const USAGE_LABEL = {
  SHIPPING: "Teslimat adresi",
  BILLING: "Fatura adresi",
  BOTH: "Teslimat ve fatura adresi",
} as const;

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[78px_minmax(0,1fr)] gap-3 py-2 first:pt-0 last:pb-0 sm:grid-cols-[92px_minmax(0,1fr)]">
      <dt className="text-[11px] font-medium text-foreground-muted">{label}</dt>
      <dd className="min-w-0 break-words text-[12px] leading-relaxed text-foreground-secondary">
        {children}
      </dd>
    </div>
  );
}

export default function AddressCard({ address, onEdit, onSetDefault }: AddressCardProps) {
  const addressLine = address.addressLine1 || address.address;
  const location = [address.district, address.city].filter(Boolean).join(" / ");
  // Başlık boş kaydedilebiliyor; buton adlarında "null adresini düzenle"
  // duyurulmasın diye görünen metinle aynı yedeğe düşüyoruz.
  const title = address.title || "Adres";
  const category = effectiveAddressCategory(address);

  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-border bg-glass-bg p-3.5 transition-colors hover:border-border-hover sm:p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <p className="min-w-0 break-words text-[14px] font-semibold leading-snug text-foreground">
              {title}
            </p>
            {address.isDefault && (
              <span className="acc-chip-accent inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium">
                Varsayılan
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] leading-snug text-foreground-muted">
            {USAGE_LABEL[address.type] ?? USAGE_LABEL.BOTH}
            {` · ${CATEGORY_LABEL[category]}`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onEdit(address)}
          aria-label={`${title} adresini düzenle`}
          className="account-icon-btn inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-hover bg-glass-bg text-foreground-secondary transition-colors hover:bg-glass-bg-hover hover:text-foreground"
        >
          <Pencil size={13} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 min-w-0 flex-1 border-t border-border pt-3">
        <dl className="divide-y divide-border">
          {address.fullName && <DetailRow label="Alıcı">{address.fullName}</DetailRow>}
          {addressLine && <DetailRow label="Açık adres">{addressLine}</DetailRow>}
          {location && <DetailRow label="İlçe / İl">{location}</DetailRow>}
          {address.postalCode && (
            <DetailRow label="Posta kodu">
              <span className="tabular-nums">{address.postalCode}</span>
            </DetailRow>
          )}
          <DetailRow label="Telefon">
            <a
              href={`tel:${address.phone.replace(/\D/g, "")}`}
              className="-my-1 inline-flex min-h-[44px] max-w-full items-center rounded-lg tabular-nums transition-colors hover:text-foreground lg:min-h-[36px]"
            >
              {formatPhone(address.phone)}
            </a>
          </DetailRow>
          {address.invoiceType === "CORPORATE" && address.company && (
            <DetailRow label="Firma">{address.company}</DetailRow>
          )}
          {address.invoiceType === "CORPORATE" && address.taxOffice && (
            <DetailRow label="Vergi dairesi">{address.taxOffice}</DetailRow>
          )}
          {address.invoiceType === "CORPORATE" && address.taxNumber && (
            <DetailRow label="VKN">
              <span className="tabular-nums">{address.taxNumber}</span>
            </DetailRow>
          )}
        </dl>
      </div>

      {/* Varsayılan yapma artık adı yazılı gerçek bir aksiyon. Yalnız gereken
          kartta çıkıyor: varsayılan adreste yapılacak bir şey yok, orada
          başlıktaki çip durumu zaten söylüyor. */}
      {!address.isDefault && (
        <button
          type="button"
          onClick={() => onSetDefault(address.id)}
          className="account-btn acc-chip-neutral mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg px-3 text-[12px] font-medium transition-colors hover:bg-[color:var(--acc-neutral-bg-hover)] lg:min-h-[40px]"
        >
          Varsayılan yap
        </button>
      )}
    </div>
  );
}
