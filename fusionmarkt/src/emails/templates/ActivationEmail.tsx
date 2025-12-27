/**
 * Account Activation Email
 * Sent when user registers - contains activation code
 */

import { Text } from "@react-email/components";
import { Layout } from "../components/Layout";
import { Greeting, Paragraph, InfoCard, SmallText, Divider } from "../components/shared";
import { theme } from "../styles/theme";

interface ActivationEmailProps {
  code: string;
  name?: string;
}

export const ActivationEmail = ({ code, name }: ActivationEmailProps) => {
  // Ensure code has F- prefix
  const displayCode = code.startsWith("F-") ? code : `F-${code}`;
  
  return (
    <Layout preview={`Aktivasyon kodunuz: ${displayCode}`}>
      <Greeting name={name} />
      
      <Paragraph>
        Hesabınızı aktifleştirmek için aşağıdaki kodu kullanın.
      </Paragraph>

      <InfoCard label="Aktivasyon Kodu" value={displayCode} mono accent />

      <SmallText>
        Bu kod 5 dakika içinde geçerliliğini yitirecektir.
      </SmallText>

      <Divider />

      <Text
        style={{
          color: theme.colors.textFaded,
          fontSize: theme.fontSizes.sm,
          textAlign: "center" as const,
          margin: 0,
        }}
      >
        Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
      </Text>
    </Layout>
  );
};

export default ActivationEmail;
