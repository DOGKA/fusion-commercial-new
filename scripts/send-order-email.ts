import { sendOrderConfirmationEmail } from "../fusionmarkt/src/lib/email";

async function main() {
  await sendOrderConfirmationEmail("gunaysolhan@gmail.com", {
    orderNumber: "FM-2026-17656",
    orderDate: new Date("2026-04-06T00:41:46"),
    customerName: "GÜNAY SOLHAN",
    customerEmail: "gunaysolhan@gmail.com",
    items: [
      { name: "P3200 2048Wh | 6400W Max. Taşınabilir Güç Kaynağı / Solar Jeneratör", quantity: 1, price: 65499 },
      { name: "Taşınabilir Güneş Paneli 400W - IP67 Su Geçirmez - Katlanabilen Güneş Enerjili Şarj Cihazı | SP400", quantity: 1, price: 28999 },
    ],
    subtotal: 86999,
    shipping: 0,
    discount: 0,
    total: 86999,
    shippingAddress: {
      fullName: "GÜNAY SOLHAN",
      address: "İsmetpaşa Mah. 49.Sokak. No 6/1. Temel City 6.Etap. A Blok. Kat 3. D 22.",
      city: "Çanakkale",
      district: "Merkez",
      postalCode: "17010",
      phone: "05325124508",
    },
    billingAddress: {
      fullName: "GÜNAY SOLHAN",
      address: "İsmetpaşa Mah. 49.Sokak. No 6/1. Temel City 6.Etap. A Blok. Kat 3. D 22.",
      city: "Çanakkale",
      district: "Merkez",
      postalCode: "17010",
      phone: "05325124508",
    },
    paymentMethod: "CREDIT_CARD",
  });
  console.log("✅ Sipariş onay maili gönderildi: gunaysolhan@gmail.com");
}

main().catch(console.error).finally(() => process.exit(0));
