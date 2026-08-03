-- Bir favori kalemi ya normal ürün ya da paket ürün taşır.
ALTER TABLE "wishlist_items"
  ALTER COLUMN "productId" DROP NOT NULL,
  ADD COLUMN "bundleId" TEXT;

ALTER TABLE "wishlist_items"
  ADD CONSTRAINT "wishlist_items_bundleId_fkey"
  FOREIGN KEY ("bundleId") REFERENCES "bundles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "wishlist_items_wishlistId_bundleId_key"
  ON "wishlist_items"("wishlistId", "bundleId");

CREATE INDEX "wishlist_items_bundleId_idx"
  ON "wishlist_items"("bundleId");

ALTER TABLE "wishlist_items"
  ADD CONSTRAINT "wishlist_items_exactly_one_target_check"
  CHECK (
    ("productId" IS NOT NULL AND "bundleId" IS NULL) OR
    ("productId" IS NULL AND "bundleId" IS NOT NULL)
  );
