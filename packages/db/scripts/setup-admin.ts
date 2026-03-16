/**
 * Admin Setup Script
 * Mevcut kullanıcıları listele ve SUPER_ADMIN oluştur
 * 
 * Kullanım: npx ts-node scripts/setup-admin.ts
 */

import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

// Simple hash function (bcrypt'sız)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const prisma = new PrismaClient();

async function main() {
  console.log("\n🔍 Mevcut kullanıcılar:\n");
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: { orders: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  users.forEach((user, i) => {
    console.log(`${i + 1}. ${user.email}`);
    console.log(`   Ad: ${user.name || "-"}`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   Siparişler: ${user._count.orders}`);
    console.log(`   Kayıt: ${user.createdAt.toLocaleDateString("tr-TR")}`);
    console.log("");
  });

  // İstatistikler
  const stats = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });

  console.log("📊 İstatistikler:");
  stats.forEach(s => {
    console.log(`   ${s.role}: ${s._count}`);
  });

  // SUPER_ADMIN var mı kontrol et
  const superAdminCount = await prisma.user.count({
    where: { role: "SUPER_ADMIN" }
  });

  if (superAdminCount === 0) {
    console.log("\n⚠️ SUPER_ADMIN bulunamadı!");
    console.log("Yeni SUPER_ADMIN oluşturuluyor...\n");

    // Admin bilgilerini buraya girin
    const adminEmail = "admin@fusionmarkt.com";
    const adminPassword = "Admin123!"; // Güçlü bir şifre kullanın
    const adminName = "FusionMarkt Admin";

    // Email kontrolü
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existing) {
      // Mevcut kullanıcıyı SUPER_ADMIN yap
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "SUPER_ADMIN" }
      });
      console.log(`✅ ${adminEmail} SUPER_ADMIN olarak güncellendi!`);
    } else {
      // Yeni SUPER_ADMIN oluştur
      // NOT: Bu basit hash, production'da bcrypt kullanılmalı
      const hashedPassword = hashPassword(adminPassword);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          password: hashedPassword,
          role: "SUPER_ADMIN",
          emailVerified: new Date(),
        }
      });
      
      console.log(`✅ Yeni SUPER_ADMIN oluşturuldu!`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Şifre: ${adminPassword}`);
    }
  } else {
    console.log(`\n✅ ${superAdminCount} SUPER_ADMIN mevcut.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
