/**
 * İletişim Tercihleri API
 * PATCH /api/user/preferences - İzinleri güncelle
 *
 * GET yoktur: güncel izinler `GET /api/user/profile` içindeki `preferences`
 * alanından okunur.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@repo/db";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import {
  buildConsentLogRows,
  CONSENT_CHANNELS,
  CONSENT_SOURCES,
  type ConsentChange,
  type ConsentChannel,
} from "@/lib/consent";

interface PreferencesBody {
  sms?: boolean;
  email?: boolean;
  call?: boolean;
  personalization?: boolean;
}

type ConsentColumn =
  | "smsConsent"
  | "emailConsent"
  | "callConsent"
  | "personalizationConsent";

/** Yalnızca izin alanları — `select` sonucu ile birebir aynı şekil. */
type CurrentConsents = Record<ConsentColumn, boolean | null>;

/** İstek anahtarı → veritabanı alanı → izin kaydı kanalı eşlemesi. */
const CHANNEL_MAP: readonly {
  key: keyof PreferencesBody;
  column: ConsentColumn;
  channel: ConsentChannel;
}[] = [
  { key: "sms", column: "smsConsent", channel: CONSENT_CHANNELS.SMS },
  { key: "email", column: "emailConsent", channel: CONSENT_CHANNELS.EMAIL },
  { key: "call", column: "callConsent", channel: CONSENT_CHANNELS.CALL },
  {
    key: "personalization",
    column: "personalizationConsent",
    channel: CONSENT_CHANNELS.PERSONALIZATION,
  },
];

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const userId = session.user.id;

    const rateLimit = checkRateLimit(`preferences:${userId}`, RATE_LIMITS.preferences);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Çok fazla deneme yaptınız, lütfen biraz bekleyin",
          retryAfter: rateLimit.resetIn,
        },
        { status: 429 }
      );
    }

    const body: PreferencesBody = await request.json();

    // Yalnızca boolean kabul edilir. `null` gönderilemez: bir izin bir kez
    // sorulduktan sonra "hiç sorulmadı" durumuna geri dönülemez.
    const requested = CHANNEL_MAP.filter((entry) => body[entry.key] !== undefined);
    if (requested.length === 0) {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
    }
    if (requested.some((entry) => typeof body[entry.key] !== "boolean")) {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
    }

    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        smsConsent: true,
        emailConsent: true,
        callConsent: true,
        personalizationConsent: true,
      },
    });

    if (!current) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const consents: CurrentConsents = current;
    const updateData: Partial<Record<ConsentColumn, boolean>> & {
      consentUpdatedAt?: Date;
    } = {};
    const changes: ConsentChange[] = [];

    for (const entry of requested) {
      const granted = body[entry.key] as boolean;
      const previousValue = consents[entry.column];

      // Değer aynıysa ne yazılır ne kaydedilir; aksi hâlde toggle'a her
      // dokunuşta anlamsız denetim kaydı birikir.
      if (previousValue === granted) continue;

      updateData[entry.column] = granted;
      changes.push({ channel: entry.channel, granted, previousValue });
    }

    if (changes.length === 0) {
      return NextResponse.json({
        success: true,
        preferences: {
          sms: current.smsConsent,
          email: current.emailConsent,
          call: current.callConsent,
          personalization: current.personalizationConsent,
          updatedAt: null,
        },
      });
    }

    updateData.consentUpdatedAt = new Date();

    const logRows = buildConsentLogRows(changes, {
      userId,
      source: CONSENT_SOURCES.ACCOUNT_SETTINGS,
      ipAddress: getClientIP(request.headers),
      userAgent: request.headers.get("user-agent"),
    });

    // İzin kaydı kanıt belgesidir: kullanıcının değeri değişip kaydın
    // yazılmaması denetimde savunulamaz, o yüzden ikisi tek transaction.
    const [updated] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          smsConsent: true,
          emailConsent: true,
          callConsent: true,
          personalizationConsent: true,
          consentUpdatedAt: true,
        },
      }),
      prisma.userConsentLog.createMany({ data: logRows }),
    ]);

    return NextResponse.json({
      success: true,
      preferences: {
        sms: updated.smsConsent,
        email: updated.emailConsent,
        call: updated.callConsent,
        personalization: updated.personalizationConsent,
        updatedAt: updated.consentUpdatedAt,
      },
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { error: "Tercihler güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
