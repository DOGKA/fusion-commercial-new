import { BANK_TRANSFER_DISCOUNT_RATE } from "@/lib/bank-transfer-discount";

const RATE = BANK_TRANSFER_DISCOUNT_RATE * 100;
const TITLE = `Havale / EFT ile ödemelerde ekstra %${RATE} indirim`;

/**
 * Kartta fiyatın hemen sağındaki iki satırlık havale notu.
 * Dar kartta fiyat ile buton arasında yer olmadığı için gizleniyor; orada
 * `BankTransferHint` görünüyor.
 */
export function BankTransferMiniBadge() {
  return (
    <div
      className="flex shrink-0 flex-col items-start gap-[3px] whitespace-nowrap @max-[259px]:hidden"
      role="note"
      aria-label={TITLE}
      title={TITLE}
    >
      <span className="text-[9px] font-medium leading-none text-foreground-tertiary">Havale / EFT</span>
      <span className="text-[10px] font-semibold leading-none text-[var(--fusion-success-text)]">
        %{RATE} ekstra
      </span>
    </div>
  );
}

/**
 * Dar kartta fiyatın altındaki iki satırlık havale notu. Fiyatın yanında yer
 * olmadığı için alt alta; tek satır fiyat genişliğine sığmayıp kesiliyordu.
 */
export default function BankTransferHint() {
  return (
    <span
      className="hidden flex-col gap-[2px] whitespace-nowrap text-[9px] leading-none @max-[259px]:flex"
      title={TITLE}
    >
      <span className="font-medium text-foreground-tertiary">Havale / EFT</span>
      <span className="font-semibold text-[var(--fusion-success-text)]">%{RATE} ekstra</span>
    </span>
  );
}
