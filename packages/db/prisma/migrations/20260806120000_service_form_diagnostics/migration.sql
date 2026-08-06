-- Servis formuna ürün seçimi + arıza teşhis anketi alanları.
ALTER TABLE "service_form_messages" ADD COLUMN IF NOT EXISTS "productCategory" TEXT;
ALTER TABLE "service_form_messages" ADD COLUMN IF NOT EXISTS "productModel" TEXT;
ALTER TABLE "service_form_messages" ADD COLUMN IF NOT EXISTS "serialNumber" TEXT;
ALTER TABLE "service_form_messages" ADD COLUMN IF NOT EXISTS "diagnostics" JSONB;
