import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo";
import { AccountCard } from "../_components/shared";
import CommunicationPreferencesView from "./_components/CommunicationPreferencesView";

export const metadata: Metadata = staticPageMetadata.accountCommunication;

export default function CommunicationPreferencesPage() {
  return (
    <AccountCard>
      <CommunicationPreferencesView />
    </AccountCard>
  );
}
