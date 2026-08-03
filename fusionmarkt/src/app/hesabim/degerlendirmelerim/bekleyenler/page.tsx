import { staticPageMetadata } from "@/lib/seo";
import { getMyReviews } from "@/lib/my-reviews";
import { getServerAccountUser } from "../../_lib/server-user";
import { AccountCard } from "../../_components/shared";
import ReviewsHub from "../_components/ReviewsHub";

export const metadata = staticPageMetadata.accountReviewsPending;

/**
 * Aynı `getMyReviews` yanıtı — sekme sayaçları için iki listenin de sayısı
 * gerekiyor. İkinci bir istek atılmıyor; layout zaten oturumu çözmüş durumda.
 */
export default async function DegerlendirmeBekleyenlerPage() {
  const user = await getServerAccountUser();
  const initialData = user?.id ? await getMyReviews(user.id) : null;

  return (
    <AccountCard>
      <ReviewsHub tab="pending" initialData={initialData} />
    </AccountCard>
  );
}
