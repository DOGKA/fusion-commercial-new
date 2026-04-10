import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Slider badge'leri güncelleniyor...");

  const sliders = await prisma.slider.findMany();

  for (const slider of sliders) {
    await prisma.slider.update({
      where: { id: slider.id },
      data: {
        badge: slider.subtitle || "",
        subtitle: "",
      },
    });
    console.log(`  ✅ ${slider.name}: badge="${slider.subtitle || ""}" | subtitle="" | badgeIcon="${slider.badgeIcon}" (değişmedi)`);
  }

  console.log(`\n✅ ${sliders.length} slider güncellendi — subtitle → badge, icon aynen kaldı.`);
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
