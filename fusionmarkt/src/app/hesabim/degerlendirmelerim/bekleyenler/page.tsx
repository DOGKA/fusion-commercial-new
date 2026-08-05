import { Suspense } from "react";
import { staticPageMetadata } from "@/lib/seo";
import { getMyReviews } from "@/lib/my-reviews";
import { getServerAccountUser } from "../../_lib/server-user";
import { AccountCard, AccountSkeleton } from "../../_components/shared";
import ReviewsHub from "../_components/ReviewsHub";

export const metadata = staticPageMetadata.accountReviewsPending;

/**
 * Aynı `getMyReviews` yanıtı — sekme sayaçları için iki listenin de sayısı
 * gerekiyor. İkinci bir istek atılmıyor; layout zaten oturumu çözmüş durumda.
 */
export default function DegerlendirmeBekleyenlerPage() {
  return (
    <AccountCard>
      <Suspense fallback={<AccountSkeleton variant="productCard" count={3} />}>
        <PendingReviewsSection />
      </Suspense>
    </AccountCard>
  );
}

async function PendingReviewsSection() {
  const user = await getServerAccountUser();
  const initialData = user?.id ? await getMyReviews(user.id) : null;

  return <ReviewsHub tab="pending" initialData={initialData} />;
}
