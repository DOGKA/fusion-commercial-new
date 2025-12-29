/**
 * FusionMarkt Logo Component - Email için PNG
 * S3'te host edilen logo kullanılıyor
 * 
 * Email client'lar inline SVG desteklemediği için PNG kullanıyoruz
 */

// Logo PNG URL - S3'te host ediliyor
export const LOGO_URL = "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1766999928300-r9o2sl-favicon-1024x1024.png";

// Email için logo boyutları
export const LOGO_WIDTH = 48;
export const LOGO_HEIGHT = 48;

// Inline HTML version for email clients
export const LogoInline = `
<table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
  <tr>
    <td style="text-align: center;">
      <img 
        src="${LOGO_URL}" 
        alt="FusionMarkt" 
        width="${LOGO_WIDTH}" 
        height="${LOGO_HEIGHT}" 
        style="display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none;"
      />
    </td>
  </tr>
</table>
`;

export default LogoInline;
