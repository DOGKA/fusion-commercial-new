/**
 * Test Script: Add an abandoned cart for testing
 * Run with: npx ts-node scripts/add-test-abandoned-cart.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🛒 Test abandoned cart oluşturuluyor...\n");

  // Get a user (preferably with email)
  const user = await prisma.user.findFirst({
    where: {
      email: { not: null },
    },
  });

  if (!user) {
    console.log("❌ E-posta adresi olan kullanıcı bulunamadı.");
    console.log("Önce bir kullanıcı oluşturun.");
    return;
  }

  console.log(`👤 Kullanıcı: ${user.name || "İsimsiz"} (${user.email})`);

  // Get a product
  const product = await prisma.product.findFirst({
    where: { isActive: true },
  });

  if (!product) {
    console.log("❌ Aktif ürün bulunamadı.");
    return;
  }

  console.log(`📦 Ürün: ${product.name}`);

  // Check if user already has a cart
  let cart = await prisma.cart.findUnique({
    where: { userId: user.id },
  });

  if (cart) {
    // Update the cart to be "abandoned" (more than 7 days old)
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: {
        updatedAt: eightDaysAgo,
        lastReminderSentAt: null,
        reminderCount: 0,
      },
    });

    console.log(`\n✅ Mevcut sepet "terk edilmiş" olarak güncellendi.`);
  } else {
    // Create a new cart
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    cart = await prisma.cart.create({
      data: {
        userId: user.id,
        updatedAt: eightDaysAgo,
        lastReminderSentAt: null,
        reminderCount: 0,
      },
    });

    console.log(`\n✅ Yeni sepet oluşturuldu.`);
  }

  // Check if cart has items
  const existingItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
  });

  if (existingItems.length === 0) {
    // Add product to cart
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: 1,
      },
    });

    console.log(`📦 Sepete ürün eklendi: ${product.name}`);
  } else {
    console.log(`📦 Sepette zaten ${existingItems.length} ürün var.`);
  }

  // Make sure the updatedAt stays old (Prisma might update it)
  const eightDaysAgo = new Date();
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

  await prisma.$executeRaw`
    UPDATE carts 
    SET "updatedAt" = ${eightDaysAgo}
    WHERE id = ${cart.id}
  `;

  console.log(`\n✅ Sepet tarihi 8 gün öncesine ayarlandı.`);
  console.log(`\n🎉 Test abandoned cart başarıyla oluşturuldu!`);
  console.log(`   Kullanıcı: ${user.email}`);
  console.log(`   Sepet ID: ${cart.id}`);
  console.log(`\nŞimdi http://localhost:3001/marketing/abandoned-carts sayfasını kontrol edin.`);
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

