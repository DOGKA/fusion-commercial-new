import { maskPhone } from "../../_lib/format";

export interface DisplayOrderAddress {
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  city?: string | null;
  district?: string | null;
  postalCode?: string | null;
  address?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
}

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

export default function OrderAddressDetails({
  address,
}: {
  address: DisplayOrderAddress;
}) {
  const fullName =
    address.fullName ||
    `${address.firstName || ""} ${address.lastName || ""}`.trim();
  const addressLines = [
    address.address || address.addressLine1,
    address.addressLine2,
  ].filter((line): line is string => Boolean(line));
  const location = [address.district, address.city].filter(Boolean).join(" / ");

  return (
    <dl className="divide-y divide-border">
      {address.title && <DetailRow label="Adres adı">{address.title}</DetailRow>}
      {fullName && <DetailRow label="Alıcı">{fullName}</DetailRow>}
      {addressLines.length > 0 && (
        <DetailRow label="Açık adres">
          <span className="space-y-0.5">
            {addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </span>
        </DetailRow>
      )}
      {location && <DetailRow label="İlçe / İl">{location}</DetailRow>}
      {address.postalCode && (
        <DetailRow label="Posta kodu">
          <span className="tabular-nums">{address.postalCode}</span>
        </DetailRow>
      )}
      {address.phone && (
        <DetailRow label="Telefon">
          <span className="font-mono tabular-nums text-foreground-muted">
            {maskPhone(address.phone)}
          </span>
        </DetailRow>
      )}
    </dl>
  );
}
