import { AccountCard, AccountSkeleton } from "../_components/shared";

/** En büyük client chunk; indirilirken liste satırı iskeleti gösterilir. */
export default function SiparislerLoading() {
  return (
    <AccountCard>
      <AccountSkeleton variant="orderRow" count={4} />
    </AccountCard>
  );
}
