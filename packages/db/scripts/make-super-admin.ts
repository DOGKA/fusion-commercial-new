/**
 * Make user SUPER_ADMIN
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // fusionmarktofficial@gmail.com'u SUPER_ADMIN yap
  const email = "fusionmarktofficial@gmail.com";
  
  const user = await prisma.user.update({
    where: { email },
    data: { role: "SUPER_ADMIN" }
  });

  console.log(`✅ ${user.email} artık SUPER_ADMIN!`);

  // Oluşturulan test admin'i sil (sha256 hash ile oluşturulmuştu)
  try {
    await prisma.user.delete({
      where: { email: "admin@fusionmarkt.com" }
    });
    console.log(`🗑️ admin@fusionmarkt.com silindi (test hesabı)`);
  } catch {
    // Zaten yoksa sorun yok
  }

  // Son durumu göster
  console.log("\n📊 Güncel durum:");
  const users = await prisma.user.findMany({
    select: { email: true, name: true, role: true },
    orderBy: { role: "asc" }
  });
  users.forEach(u => {
    console.log(`   ${u.role.padEnd(12)} | ${u.email}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
