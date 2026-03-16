/**
 * Password Reset Email
 * Sent when user requests password reset
 * 100% table-based for email client compatibility
 */

import { Link } from "@react-email/components";
import { Layout } from "../components/Layout";
import { Greeting, Paragraph, Button, SmallText } from "../components/shared";
import { theme } from "../styles/theme";

interface PasswordResetEmailProps {
  resetLink: string;
  name?: string;
}

export const PasswordResetEmail = ({ resetLink, name }: PasswordResetEmailProps) => {
  return (
    <Layout preview="Şifre sıfırlama talebiniz">
      <Greeting name={name} />
      
      <Paragraph>
        Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.
      </Paragraph>

      <Button href={resetLink}>Şifremi Sıfırla</Button>

      <p
        style={{
          color: theme.colors.textDim,
          fontSize: theme.fontSizes.xs,
          textAlign: "center" as const,
          wordBreak: "break-all" as const,
          margin: 0,
          marginTop: theme.spacing[2],
          fontFamily: theme.fonts.sans,
        }}
      >
        Buton çalışmıyorsa:{" "}
        <Link
          href={resetLink}
          style={{
            color: theme.colors.textFaded,
          }}
        >
          {resetLink}
        </Link>
      </p>

      <SmallText>
        Bu link 1 saat içinde geçerliliğini yitirecektir.
      </SmallText>

      <p
        style={{
          color: theme.colors.textFaded,
          fontSize: theme.fontSizes.sm,
          textAlign: "center" as const,
          margin: 0,
          fontFamily: theme.fonts.sans,
        }}
      >
        Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
      </p>
    </Layout>
  );
};

export default PasswordResetEmail;
