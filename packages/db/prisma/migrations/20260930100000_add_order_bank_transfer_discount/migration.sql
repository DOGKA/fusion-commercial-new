-- Havale/EFT indirimi payı. "discount" toplam indirim olarak kalıyor.
ALTER TABLE "orders" ADD COLUMN "bankTransferDiscount" DECIMAL(10,2) NOT NULL DEFAULT 0;
