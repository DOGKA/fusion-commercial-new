import { staticPageMetadata } from "@/lib/seo";
import { getMyReviews } from "@/lib/my-reviews";
import { getServerAccountUser } from "../_lib/server-user";
import { AccountCard } from "../_components/shared";
import ReviewsHub from "./_components/ReviewsHub";

export const metadata = staticPageMetadata.accountReviews;

/**
 * Varsayılan sekme "Değerlendirdiklerim" (`00-KARARLAR §2`).
 *
 * Veri sunucuda çekiliyor (F2-45): liste ilk HTML'de hazır, istemci mount'ta
 * aynı isteği tekrarlamıyor. İki sekme aynı `getMyReviews` yanıtını paylaşıyor.
 */
export default async function DegerlendirmelerimPage() {
  const user = await getServerAccountUser();
  const initialData = user?.id ? await getMyReviews(user.id) : null;

  return (
    <AccountCard>
      <ReviewsHub tab="done" initialData={initialData} />
    </AccountCard>
  );
}
