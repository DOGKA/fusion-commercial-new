/**
 * Base Email Layout
 * Glassmorphism design with mobile-first approach
 */

import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { theme } from "../styles/theme";
import { LogoInline } from "./Logo";

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const Layout = ({ preview, children }: LayoutProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html lang="tr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <style>{`
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
              padding: 16px !important;
            }
            .email-content {
              padding: 24px !important;
            }
            .mobile-text-center {
              text-align: center !important;
            }
            .mobile-full-width {
              width: 100% !important;
            }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: theme.colors.bgDark,
          fontFamily: theme.fonts.sans,
          margin: 0,
          padding: 0,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        <Container
          className="email-container"
          style={{
            maxWidth: theme.layout.maxWidth,
            margin: "0 auto",
            padding: theme.spacing[10],
          }}
        >
          {/* Header with Logo */}
          <Section style={{ textAlign: "center", marginBottom: theme.spacing[8] }}>
            <div dangerouslySetInnerHTML={{ __html: LogoInline }} />
          </Section>

          {/* Main Content Card - Glassmorphism */}
          <Section
            className="email-content"
            style={{
              backgroundColor: theme.colors.bgCard,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.xl,
              padding: theme.layout.contentPadding,
              // Subtle inner glow effect
              boxShadow: `
                inset 0 1px 0 0 rgba(255, 255, 255, 0.03),
                0 0 0 1px rgba(255, 255, 255, 0.02),
                0 20px 50px -12px rgba(0, 0, 0, 0.5)
              `,
            }}
          >
            {children}
          </Section>

          {/* Footer */}
          <Section style={{ marginTop: theme.spacing[8], textAlign: "center" }}>
            <Text
              style={{
                color: theme.colors.textDim,
                fontSize: theme.fontSizes.xs,
                margin: 0,
                marginBottom: theme.spacing[2],
              }}
            >
              Bu e-posta FusionMarkt tarafından gönderilmiştir.
            </Text>
            <Text
              style={{
                color: theme.colors.textDim,
                fontSize: theme.fontSizes.xs,
                margin: 0,
              }}
            >
              {currentYear} FusionMarkt. Tüm hakları saklıdır.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default Layout;
