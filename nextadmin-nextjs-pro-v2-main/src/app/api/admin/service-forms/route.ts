/**
 * Admin Service Forms API
 * GET /api/admin/service-forms - List service form messages
 * DELETE /api/admin/service-forms - Delete messages (bulk) + remove S3 files
 * PATCH /api/admin/service-forms - Update status / Reply / Approve / Reject
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prismaDb";
import { sendEmail } from "@/libs/email";
import { deleteS3Object, isS3Configured } from "@/lib/s3";

/**
 * Extract S3 key from a full S3 URL
 * e.g. https://fusionmarkt.s3.eu-central-1.amazonaws.com/fusionmarkt/service-forms/xxx.pdf -> fusionmarkt/service-forms/xxx.pdf
 */
function extractS3Key(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Remove leading slash
    return parsed.pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}

/**
 * Build table-based status email HTML (Gmail compatible)
 */
function buildStatusEmail(params: {
  name: string;
  invoiceNo: string;
  platform: string;
  status: "approved" | "rejected";
  reason?: string;
}): string {
  const isApproved = params.status === "approved";
  const statusLabel = isApproved ? "Servis Talebi Onaylandı" : "Servis Talebi Reddedildi";
  const statusBg = isApproved ? "#d1fae5" : "#fee2e2";
  const statusColor = isApproved ? "#047857" : "#b91c1c";
  const reasonBg = isApproved ? "#d1fae5" : "#fef2f2";
  const reasonBorder = isApproved ? "#10b981" : "#ef4444";
  const reasonLabelColor = isApproved ? "#047857" : "#991b1b";
  const reasonTextColor = isApproved ? "#065f46" : "#7f1d1d";
  const reasonLabel = isApproved ? "Açıklama:" : "Ret Sebebi:";
  const bodyText = isApproved
    ? `<strong>${params.platform}</strong> platformundan satın aldığınız ürüne ait <strong>${params.invoiceNo}</strong> fatura numaralı servis talebiniz onaylanmıştır.`
    : `<strong>${params.platform}</strong> platformundan satın aldığınız ürüne ait <strong>${params.invoiceNo}</strong> fatura numaralı servis talebiniz reddedilmiştir.`;
  const footerText = isApproved
    ? "Servis süreciniz hakkında detaylı bilgi için bizimle iletişime geçebilirsiniz."
    : "Sorularınız veya itirazınız için bizimle iletişime geçebilirsiniz.";

  const reasonBlock = params.reason
    ? `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${reasonBg};border-radius:8px;border-left:4px solid ${reasonBorder};margin-bottom:24px;"><tbody><tr><td style="padding:16px;"><p style="margin:0;font-size:12px;color:${reasonLabelColor};margin-bottom:4px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${reasonLabel}</p><p style="margin:0;font-size:14px;color:${reasonTextColor};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;white-space:pre-wrap;">${params.reason}</p></td></tr></tbody></table>`
    : "";

  return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tbody><tr><td style="padding:40px 20px;"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;"><tbody><tr><td style="padding:32px 32px 24px 32px;text-align:center;"><img src="https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1766999928300-r9o2sl-favicon-1024x1024.png" alt="FusionMarkt" width="48" height="48" style="display:inline-block;border:0;outline:none;"></td></tr><tr><td style="padding:0 32px 24px 32px;"><p style="color:#4b5563;font-size:15px;line-height:1.5;margin:0 0 16px 0;">Merhaba${params.name ? ` <strong style="color:#1a1a1a;">${params.name}</strong>` : ""},</p><table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:16px 0;"><tbody><tr><td style="text-align:center;"><span style="display:inline-block;background-color:${statusBg};color:${statusColor};font-size:13px;font-weight:600;padding:8px 20px;border-radius:9999px;">${statusLabel}</span></td></tr></tbody></table><p style="color:#4b5563;font-size:15px;line-height:1.5;margin:0 0 16px 0;">${bodyText}</p><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f9fa;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:16px;"><tbody><tr><td style="padding:16px;"><p style="margin:0;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Fatura No</p><p style="margin:0;font-size:14px;color:#1a1a1a;font-weight:500;">${params.invoiceNo}</p><p style="margin:12px 0 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Platform</p><p style="margin:0;font-size:14px;color:#1a1a1a;font-weight:500;">${params.platform}</p></td></tr></tbody></table>${reasonBlock}<p style="color:#4b5563;font-size:15px;line-height:1.5;margin:0 0 16px 0;">${footerText}</p><table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;"><tbody><tr><td style="text-align:center;"><a href="https://fusionmarkt.com/iletisim" style="display:inline-block;background-color:#10b981;color:#ffffff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">İletişime Geç</a></td></tr></tbody></table><p style="color:#9ca3af;font-size:13px;line-height:1.5;margin:0;">Sorularınız için info@fusionmarkt.com adresinden bize ulaşabilirsiniz.</p></td></tr><tr><td style="padding:0 32px;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tbody><tr><td style="border-top:1px solid #e5e7eb;height:1px;line-height:1px;font-size:1px;">&nbsp;</td></tr></tbody></table></td></tr><tr><td style="padding:24px 32px 32px 32px;text-align:center;"><span style="color:#9ca3af;font-size:11px;">© ${new Date().getFullYear()} FusionMarkt. Tüm hakları saklıdır.</span></td></tr></tbody></table></td></tr></tbody></table></body></html>`;
}

// Helper to get prisma model safely
function getModel() {
  const model = (prisma as any).serviceFormMessage;
  if (!model) throw new Error("serviceFormMessage model not available");
  return model;
}

// GET - List service form messages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const model = getModel();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
        { invoiceNo: { contains: search, mode: "insensitive" } },
      ];
    }

    const [messages, total] = await Promise.all([
      model.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      model.count({ where }),
    ]);

    // Stats
    const stats = await model.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const statusCounts = {
      total,
      pending: stats.find((s: any) => s.status === "PENDING")?._count.status || 0,
      inReview: stats.find((s: any) => s.status === "IN_REVIEW")?._count.status || 0,
      approved: stats.find((s: any) => s.status === "APPROVED")?._count.status || 0,
      rejected: stats.find((s: any) => s.status === "REJECTED")?._count.status || 0,
      replied: stats.find((s: any) => s.status === "REPLIED")?._count.status || 0,
    };

    return NextResponse.json({
      messages,
      stats: statusCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get service form messages error:", error);
    return NextResponse.json(
      { error: "Servis formları yüklenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Delete messages (single or bulk) + remove S3 files
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const model = getModel();
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Silinecek form ID'leri gerekli" },
        { status: 400 }
      );
    }

    // Fetch messages to get S3 URLs before deleting
    if (isS3Configured()) {
      const messages = await model.findMany({
        where: { id: { in: ids } },
        select: { invoicePdfUrl: true, mediaUrls: true },
      });

      for (const msg of messages) {
        // Delete invoice PDF from S3
        if (msg.invoicePdfUrl && msg.invoicePdfUrl !== "s3-not-configured") {
          const key = extractS3Key(msg.invoicePdfUrl);
          if (key) {
            try { await deleteS3Object(key); } catch (e) { console.error("S3 delete error:", e); }
          }
        }
        // Delete media files from S3
        if (msg.mediaUrls && Array.isArray(msg.mediaUrls)) {
          for (const url of msg.mediaUrls) {
            const key = extractS3Key(url);
            if (key) {
              try { await deleteS3Object(key); } catch (e) { console.error("S3 delete error:", e); }
            }
          }
        }
      }
    }

    const result = await model.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Delete service form messages error:", error);
    return NextResponse.json(
      { error: "Formlar silinemedi" },
      { status: 500 }
    );
  }
}

// PATCH - Update status, admin note, approve, reject, or reply
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const model = getModel();
    const body = await request.json();
    const { id, ids, status, adminNote, reply, reason } = body;

    // Bulk status update (no email)
    if (ids && Array.isArray(ids) && status) {
      const result = await model.updateMany({
        where: { id: { in: ids } },
        data: { status },
      });
      return NextResponse.json({ success: true, updated: result.count });
    }

    if (!id) {
      return NextResponse.json({ error: "Form ID gerekli" }, { status: 400 });
    }

    const message = await model.findUnique({ where: { id } });
    if (!message) {
      return NextResponse.json({ error: "Form bulunamadı" }, { status: 404 });
    }

    // Admin note update only
    if (adminNote !== undefined && !reply && !status) {
      const updated = await model.update({
        where: { id },
        data: { adminNote },
      });
      return NextResponse.json({ success: true, message: updated });
    }

    // APPROVE - change status + send approved email
    if (status === "APPROVED") {
      const updated = await model.update({
        where: { id },
        data: {
          status: "APPROVED",
          ...(adminNote !== undefined ? { adminNote } : {}),
        },
      });

      // Send approved email
      try {
        await sendEmail({
          to: message.email,
          subject: "FusionMarkt - Servis Talebiniz Onaylandı",
          html: buildStatusEmail({
            name: message.name,
            invoiceNo: message.invoiceNo,
            platform: message.platform,
            status: "approved",
            reason: reason || undefined,
          }),
          type: "OTHER",
        });
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }

      return NextResponse.json({ success: true, message: updated, emailSent: true });
    }

    // REJECT - change status + send rejected email
    if (status === "REJECTED") {
      const updated = await model.update({
        where: { id },
        data: {
          status: "REJECTED",
          ...(adminNote !== undefined ? { adminNote } : {}),
        },
      });

      // Send rejected email
      try {
        await sendEmail({
          to: message.email,
          subject: "FusionMarkt - Servis Talebiniz Reddedildi",
          html: buildStatusEmail({
            name: message.name,
            invoiceNo: message.invoiceNo,
            platform: message.platform,
            status: "rejected",
            reason: reason || undefined,
          }),
          type: "OTHER",
        });
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }

      return NextResponse.json({ success: true, message: updated, emailSent: true });
    }

    // IN_REVIEW - just status change, no email
    if (status === "IN_REVIEW") {
      const updated = await model.update({
        where: { id },
        data: {
          status: "IN_REVIEW",
          ...(adminNote !== undefined ? { adminNote } : {}),
        },
      });
      return NextResponse.json({ success: true, message: updated });
    }

    // REPLY - send free-text email + status REPLIED
    if (reply) {
      const emailResult = await sendEmail({
        to: message.email,
        subject: `Servis Talebi Yanıtı - FusionMarkt`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">FusionMarkt</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Servis Talebi Yanıtı</p>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
              <p style="color: #374151; margin: 0 0 20px 0;">Merhaba ${message.name},</p>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                ${reply.replace(/\n/g, "<br>")}
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <strong>Orijinal mesajınız:</strong><br>
                <em>${message.message.substring(0, 200)}${message.message.length > 200 ? "..." : ""}</em>
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                FusionMarkt Servis Departmanı<br>
                <a href="https://fusionmarkt.com" style="color: #f59e0b;">fusionmarkt.com</a>
              </p>
            </div>
          </div>
        `,
        type: "OTHER",
      });

      if (!emailResult.success) {
        return NextResponse.json({ error: "E-posta gönderilemedi" }, { status: 500 });
      }

      const updated = await model.update({
        where: { id },
        data: {
          status: "REPLIED",
          adminReply: reply,
          repliedAt: new Date(),
          repliedBy: session.user.id,
          ...(adminNote !== undefined ? { adminNote } : {}),
        },
      });

      return NextResponse.json({ success: true, message: updated, emailSent: true });
    }

    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  } catch (error) {
    console.error("Update service form message error:", error);
    return NextResponse.json(
      { error: "Form güncellenemedi" },
      { status: 500 }
    );
  }
}
