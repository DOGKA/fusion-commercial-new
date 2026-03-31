/**
 * Checkout OTP Email
 * Sent when a registered user requests a one-time code to continue checkout
 * Uses existing Layout + shared components for consistency
 */

import { Layout } from "../components/Layout";
import { Greeting, Paragraph, InfoCard, SmallText } from "../components/shared";
import { theme } from "../styles/theme";

interface CheckoutOtpEmailProps {
  code: string;
  name?: string;
}

export const CheckoutOtpEmail = ({ code, name }: CheckoutOtpEmailProps) => {
  const displayCode = code.startsWith("F-") ? code : `F-${code}`;

  return (
    <Layout preview={`Doğrulama kodunuz: ${displayCode}`}>
      <Greeting name={name} />

      <Paragraph>
        Alışverişinize devam edebilmek için aşağıdaki tek kullanımlık doğrulama kodunu kullanın.
      </Paragraph>

      <InfoCard label="Doğrulama Kodu" value={displayCode} mono accent />

      <SmallText>
        Bu kod 5 dakika içinde geçerliliğini yitirecektir.
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
        Eğer bu kodu siz talep etmediyseniz, bu e-postayı görmezden gelebilirsiniz.
      </p>
    </Layout>
  );
};

export default CheckoutOtpEmail;
