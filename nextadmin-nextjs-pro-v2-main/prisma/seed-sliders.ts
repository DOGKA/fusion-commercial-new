import { prisma, ButtonStyle, TextAlign, Theme } from "@repo/db";

async function main() {
  console.log("Seeding sliders...");

  // Mevcut frontend sliderlarini veritabanina ekle
  const sliders = [
    {
      name: "Ana Sayfa Slider 1",
      badge: "Lorem Ipsum Badge",
      badgeIcon: "zap",
      title: "Lorem Ipsum",
      titleHighlight: "Dolor Sit Amet",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
      buttonText: "Kesfet",
      buttonLink: "/urunler",
      buttonStyle: ButtonStyle.PRIMARY,
      textAlign: TextAlign.LEFT,
      theme: Theme.DARK,
      order: 0,
      isActive: true,
      showOnMobile: true,
      showOnDesktop: true,
    },
    {
      name: "Ana Sayfa Slider 2",
      badge: "Consectetur Badge",
      badgeIcon: "zap",
      title: "Adipiscing Elit",
      titleHighlight: "Sed Do Eiusmod",
      subtitle: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
      buttonText: "Incele",
      buttonLink: "/kampanyalar",
      buttonStyle: ButtonStyle.PRIMARY,
      textAlign: TextAlign.LEFT,
      theme: Theme.DARK,
      order: 1,
      isActive: true,
      showOnMobile: true,
      showOnDesktop: true,
    },
    {
      name: "Ana Sayfa Slider 3",
      badge: "Tempor Badge",
      badgeIcon: "zap",
      title: "Incididunt Ut",
      titleHighlight: "Labore Et Dolore",
      subtitle: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.",
      buttonText: "Detaylar",
      buttonLink: "/markalar",
      buttonStyle: ButtonStyle.PRIMARY,
      textAlign: TextAlign.LEFT,
      theme: Theme.DARK,
      order: 2,
      isActive: true,
      showOnMobile: true,
      showOnDesktop: true,
    },
  ];

  for (const slider of sliders) {
    await prisma.slider.create({
      data: slider,
    });
    console.log(`Created slider: ${slider.name}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
