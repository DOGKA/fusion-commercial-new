/**
 * Admin Contact Messages API
 * GET /api/admin/contact - List messages
 * DELETE /api/admin/contact - Delete messages (bulk)
 * PATCH /api/admin/contact - Update status / Reply
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prismaDb";
import { sendEmail } from "@/libs/email";

// GET - List contact messages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    // İstatistikler
    const stats = await prisma.contactMessage.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const statusCounts = {
      total,
      unread: stats.find(s => s.status === "UNREAD")?._count.status || 0,
      read: stats.find(s => s.status === "READ")?._count.status || 0,
      replied: stats.find(s => s.status === "REPLIED")?._count.status || 0,
      spam: stats.find(s => s.status === "SPAM")?._count.status || 0,
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
    console.error("Get contact messages error:", error);
    return NextResponse.json(
      { error: "Mesajlar yüklenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Delete messages (single or bulk)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Silinecek mesaj ID'leri gerekli" },
        { status: 400 }
      );
    }

    const result = await prisma.contactMessage.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });

  } catch (error) {
    console.error("Delete contact messages error:", error);
    return NextResponse.json(
      { error: "Mesajlar silinemedi" },
      { status: 500 }
    );
  }
}

// PATCH - Update status or reply
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ids, status, reply } = body;

    // Bulk status update
    if (ids && Array.isArray(ids) && status) {
      const result = await prisma.contactMessage.updateMany({
        where: { id: { in: ids } },
        data: { status },
      });

      return NextResponse.json({
        success: true,
        updated: result.count,
      });
    }

    // Single message update
    if (!id) {
      return NextResponse.json(
        { error: "Mesaj ID gerekli" },
        { status: 400 }
      );
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Mesaj bulunamadı" },
        { status: 404 }
      );
    }

    // Status update only
    if (status && !reply) {
      const updated = await prisma.contactMessage.update({
        where: { id },
        data: { status },
      });

      return NextResponse.json({
        success: true,
        message: updated,
      });
    }

    // Reply to message
    if (reply) {
      // E-posta gönder
      const emailResult = await sendEmail({
        to: message.email,
        subject: `Re: ${message.subject || "İletişim Formu"} - FusionMarkt`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">FusionMarkt</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Destek Yanıtı</p>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
              <p style="color: #374151; margin: 0 0 20px 0;">Merhaba ${message.name},</p>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                ${reply.replace(/\n/g, "<br>")}
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <strong>Orijinal mesajınız:</strong><br>
                <em>${message.message.substring(0, 200)}${message.message.length > 200 ? "..." : ""}</em>
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                FusionMarkt Müşteri Hizmetleri<br>
                <a href="https://fusionmarkt.com" style="color: #10b981;">fusionmarkt.com</a>
              </p>
            </div>
          </div>
        `,
        type: "OTHER",
      });

      if (!emailResult.success) {
        return NextResponse.json(
          { error: "E-posta gönderilemedi" },
          { status: 500 }
        );
      }

      // Mesajı güncelle
      const updated = await prisma.contactMessage.update({
        where: { id },
        data: {
          status: "REPLIED",
          adminReply: reply,
          repliedAt: new Date(),
          repliedBy: session.user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: updated,
        emailSent: true,
      });
    }

    return NextResponse.json(
      { error: "Geçersiz istek" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Update contact message error:", error);
    return NextResponse.json(
      { error: "Mesaj güncellenemedi" },
      { status: 500 }
    );
  }
}

