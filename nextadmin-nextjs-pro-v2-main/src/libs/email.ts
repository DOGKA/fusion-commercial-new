/**
 * Email Service - Resend Integration
 * 
 * Uses Resend API (https://resend.com)
 * Domain: fusionmarkt.com (verified, eu-west-1)
 */

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "FusionMarkt <noreply@fusionmarkt.com>";

// Email feature toggle
const EMAIL_ENABLED = !!RESEND_API_KEY;

export const sendEmail = async (data: EmailPayload) => {
  // Check if email is enabled
  if (!EMAIL_ENABLED) {
    if (process.env.NODE_ENV === "development") {
      console.log("📧 [DEV] Email would be sent to:", data.to, "Subject:", data.subject);
    }
    return { success: true, messageId: "email-disabled" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [data.to],
        subject: data.subject,
        html: data.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Resend API error:", error);
      throw new Error(error.message || "Email send failed");
    }

    const result = await response.json();
    console.log("📧 Email sent via Resend:", result.id);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error("❌ Email error:", error);
    throw error;
  }
};

export const formatEmail = (email: string) => {
  return email.replace(/\s+/g, "").toLowerCase().trim();
};
