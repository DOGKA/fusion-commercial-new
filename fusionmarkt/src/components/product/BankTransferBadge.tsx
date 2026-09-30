import { ArrowRightLeft } from "lucide-react";
import { BANK_TRANSFER_DISCOUNT_RATE } from "@/lib/bank-transfer-discount";

/** Ürün ve paket detayında fiyatın sağındaki havale indirimi rozeti. */
export default function BankTransferBadge() {
  const rate = BANK_TRANSFER_DISCOUNT_RATE * 100;

  return (
    <div
      className="product-bank-transfer-badge"
      role="note"
      aria-label={`Havale / EFT ile ödemelerde ekstra %${rate} indirim`}
      title={`Havale / EFT ile ödemelerde ekstra %${rate} indirim`}
    >
      <span className="product-bank-transfer-badge__method">
        <ArrowRightLeft className="product-bank-transfer-badge__icon" aria-hidden="true" />
        Havale / EFT
      </span>
      <span className="product-bank-transfer-badge__offer">
        <span className="product-bank-transfer-badge__rate">%{rate}</span>
        ekstra indirim
      </span>
    </div>
  );
}
