import { AccountCard, AccountSkeleton } from "../../_components/shared";

/** Detay chunk'ı indirilirken kart iskeleti gösterilir. */
export default function OrderDetailLoading() {
  return (
    <AccountCard>
      <AccountSkeleton variant="orderRow" count={3} />
    </AccountCard>
  );
}
