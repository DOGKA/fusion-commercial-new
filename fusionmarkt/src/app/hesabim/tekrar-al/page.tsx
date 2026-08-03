import { staticPageMetadata } from "@/lib/seo";
import { AccountCard } from "../_components/shared";
import AccountFavoritesView from "../favorilerim/_components/AccountFavoritesView";

export const metadata = staticPageMetadata.accountFavorites;

export default function ReorderPage() {
  return (
    <AccountCard>
      <AccountFavoritesView view="REORDER" />
    </AccountCard>
  );
}
