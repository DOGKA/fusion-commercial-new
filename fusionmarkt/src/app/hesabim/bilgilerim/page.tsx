import { staticPageMetadata } from "@/lib/seo";
import { AccountCard } from "../_components/shared";
import ProfileView from "./_components/ProfileView";

export const metadata = staticPageMetadata.accountProfile;

export default function BilgilerimPage() {
  return (
    <AccountCard>
      <ProfileView />
    </AccountCard>
  );
}
