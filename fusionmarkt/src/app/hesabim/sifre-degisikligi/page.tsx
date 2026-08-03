import { prisma } from "@repo/db";
import { staticPageMetadata } from "@/lib/seo";
import { AccountCard } from "../_components/shared";
import { getServerAccountUser } from "../_lib/server-user";
import PasswordView from "./_components/PasswordView";

export const metadata = staticPageMetadata.accountPassword;

export default async function SifreDegisikligiPage() {
  // Sayfanın tek sunucu ihtiyacı: kullanıcının şifresi var mı? Sosyal girişle
  // açılmış hesaplarda form yerine bilgi kartı gösteriliyor ve bu karar ilk
  // HTML'de verilebilirse ekran bir an boş iskelet olarak görünmüyor (F2-45).
  const serverUser = await getServerAccountUser();

  let initialHasPassword: boolean | undefined;
  if (serverUser) {
    const row = await prisma.user.findUnique({
      where: { id: serverUser.id },
      select: { password: true },
    });
    initialHasPassword = Boolean(row?.password);
  }

  return (
    <AccountCard>
      <PasswordView initialHasPassword={initialHasPassword} />
    </AccountCard>
  );
}
