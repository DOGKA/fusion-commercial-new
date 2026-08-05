import { Suspense } from "react";
import { staticPageMetadata } from "@/lib/seo";
import { getMyReviews } from "@/lib/my-reviews";
import { getServerAccountUser } from "../_lib/server-user";
import { AccountCard, AccountSkeleton } from "../_components/shared";
import ReviewsHub from "./_components/ReviewsHub";

export const metadata = staticPageMetadata.accountReviews;

/**
 * Varsayılan sekme "Değerlendirdiklerim" (`00-KARARLAR §2`).
 *
 * Veri sunucuda çekiliyor (F2-45): liste ilk HTML'de hazır, istemci mount'ta
 * aynı isteği tekrarlamıyor. İki sekme aynı `getMyReviews` yanıtını paylaşıyor.
 *
 * Sorgu `Suspense` arkasında: iki tablo birden okunduğu için hesap
 * sayfalarının en yavaşı burası, kabuk beklemeden çizilsin.
 */
export default function DegerlendirmelerimPage() {
  return (
    <AccountCard>
      <Suspense fallback={<AccountSkeleton variant="productCard" count={3} />}>
        <ReviewsSection />
      </Suspense>
    </AccountCard>
  );
}

async function ReviewsSection() {
  const user = await getServerAccountUser();
  const initialData = user?.id ? await getMyReviews(user.id) : null;

  return <ReviewsHub tab="done" initialData={initialData} />;
}
