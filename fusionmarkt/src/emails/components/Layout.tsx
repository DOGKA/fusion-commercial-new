/**
 * Base Email Layout
 * 100% table-based design for maximum email client compatibility
 * Tüm içerik tek bir table içinde - yekpare tasarım
 */

import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
} from "@react-email/components";
import { theme } from "../styles/theme";
import { LOGO_URL, LOGO_WIDTH, LOGO_HEIGHT } from "./Logo";

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
          /* Reset */
          body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            border-collapse: collapse !important;
          }
          img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
          }
          /* Mobile */
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
              padding: 12px !important;
            }
            .email-card {
              padding: 20px !important;
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
            padding: "40px 20px",
          }}
        >
          {/* ANA KART - Tek table, tüm içerik burada */}
          <table
            cellPadding="0"
            cellSpacing="0"
            border={0}
            width="100%"
            className="email-card"
            style={{
              backgroundColor: theme.colors.bgCard,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.xl,
              boxShadow: `
                inset 0 1px 0 0 rgba(255, 255, 255, 0.03),
                0 0 0 1px rgba(255, 255, 255, 0.02),
                0 20px 50px -12px rgba(0, 0, 0, 0.5)
              `,
            }}
          >
            <tbody>
              {/* LOGO */}
              <tr>
                <td
                  style={{
                    padding: "32px 32px 24px 32px",
                    textAlign: "center",
                  }}
                >
                  <Img
                    src={LOGO_URL}
                    alt="FusionMarkt"
                    width={LOGO_WIDTH}
                    height={LOGO_HEIGHT}
                    style={{
                      display: "inline-block",
                      border: "0",
                      outline: "none",
                    }}
                  />
                </td>
              </tr>

              {/* İÇERİK */}
              <tr>
                <td style={{ padding: "0 32px 24px 32px" }}>
                  {children}
                </td>
              </tr>

              {/* DIVIDER */}
              <tr>
                <td style={{ padding: "0 32px" }}>
                  <table cellPadding="0" cellSpacing="0" border={0} width="100%">
                    <tbody>
                      <tr>
                        <td
                          style={{
                            borderTop: `1px solid ${theme.colors.border}`,
                            height: "1px",
                            lineHeight: "1px",
                            fontSize: "1px",
                          }}
                        >
                          &nbsp;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* FOOTER - Tek satır */}
              <tr>
                <td
                  style={{
                    padding: "24px 32px 32px 32px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      color: theme.colors.textDim,
                      fontSize: theme.fontSizes.xs,
                      fontFamily: theme.fonts.sans,
                    }}
                  >
                    © {currentYear} FusionMarkt. Tüm hakları saklıdır.
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </Container>
      </Body>
    </Html>
  );
};

export default Layout;
