import { prisma } from "./src/index";

async function checkSettings() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  console.log("=== Site Settings Check ===");
  console.log("GA Property ID:", settings?.gaPropertyId || "NOT SET");
  console.log("GA Service Account Email:", settings?.gaServiceAccountEmail || "NOT SET");
  console.log("GA Service Account Key:", settings?.gaServiceAccountKey ? "SET (hidden)" : "NOT SET");
  
  // GSC alanlarını dinamik olarak kontrol et
  const settingsAny = settings as Record<string, unknown> | null;
  console.log("GSC Site URL:", settingsAny?.gscSiteUrl || "NOT SET");
  console.log("GSC Service Account Email:", settingsAny?.gscServiceAccountEmail || "NOT SET (will use GA email)");
  console.log("GSC Service Account Key:", settingsAny?.gscServiceAccountKey ? "SET (hidden)" : "NOT SET (will use GA key)");
  
  console.log("\n=== Connection Status ===");
  const gaConnected = !!(
    settings?.gaPropertyId &&
    settings?.gaServiceAccountEmail &&
    settings?.gaServiceAccountKey
  );
  console.log("GA Connected:", gaConnected);
  
  const gscSiteUrl = settingsAny?.gscSiteUrl as string | null;
  const gscConnected = !!(
    gscSiteUrl &&
    (settingsAny?.gscServiceAccountEmail || settings?.gaServiceAccountEmail) &&
    (settingsAny?.gscServiceAccountKey || settings?.gaServiceAccountKey)
  );
  console.log("GSC Connected:", gscConnected);

  // Coupon check
  const coupons = await prisma.coupon.findMany({
    select: { id: true, code: true, isActive: true, usageCount: true },
  });
  console.log("\n=== Coupons ===");
  console.log("Total Coupons:", coupons.length);
  coupons.forEach(c => {
    console.log(`  - ${c.code}: active=${c.isActive}, usage=${c.usageCount}`);
  });

  await prisma.$disconnect();
}

checkSettings().catch(console.error);

