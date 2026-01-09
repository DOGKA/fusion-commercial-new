/**
 * Password Reset Script
 * Belirli bir kullanıcının şifresini sıfırlar
 * 
 * Kullanım: npx tsx scripts/reset-password.ts <email> <yeni_şifre>
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// bcrypt yerine bcryptjs kullanalım (daha uyumlu)
async function hashPassword(password: string): Promise<string> {
  // Dynamic import for bcryptjs
  const bcrypt = await import("bcryptjs");
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log("\n❌ Kullanım: npx tsx scripts/reset-password.ts <email> <yeni_şifre>");
    console.log("   Örnek: npx tsx scripts/reset-password.ts admin@test.com Sifre123!");
    console.log("\n📋 Mevcut kullanıcılar:");
    
    const users = await prisma.user.findMany({
      select: { email: true, role: true, name: true },
      orderBy: { role: "asc" }
    });
    
    users.forEach(u => {
      console.log(`   ${u.role.padEnd(12)} | ${u.email} | ${u.name || "-"}`);
    });
    
    return;
  }

  const [email, newPassword] = args;

  // Kullanıcıyı bul
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error(`\n❌ Kullanıcı bulunamadı: ${email}`);
    return;
  }

  // Şifreyi hashle
  console.log("\n🔐 Şifre hashleniyor...");
  const hashedPassword = await hashPassword(newPassword);

  // Güncelle
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log(`\n✅ Şifre başarıyla güncellendi!`);
  console.log(`   Email: ${email}`);
  console.log(`   Yeni Şifre: ${newPassword}`);
  console.log(`   Rol: ${user.role}`);
  console.log(`\n🔗 Giriş yapmak için: http://localhost:3001/auth/signin`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
