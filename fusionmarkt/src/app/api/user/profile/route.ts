/**
 * User Profile API
 * GET /api/user/profile - Get profile
 * PUT /api/user/profile - Update profile
 *
 * E-posta BU ENDPOINT'TEN GÜNCELLENEMEZ — doğrulamalı ayrı bir akış gerektirir.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@repo/db";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  isGender,
  normalizePhone,
  validateBirthDate,
  validateName,
  type Gender,
} from "@/lib/user-validation";

interface UpdateProfileBody {
  name?: string;
  phone?: string;
  birthDate?: string;
  gender?: Gender | null;
}

/**
 * Tüm profil alanları tek yerden seçilir; GET ve PUT aynı şekli döndürür.
 * `password` ASLA yer almaz — yerine türetilmiş `hasPassword` döner.
 */
const profileSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  phone: true,
  birthDate: true,
  gender: true,
  image: true,
  password: true,
  pendingEmail: true,
  smsConsent: true,
  emailConsent: true,
  callConsent: true,
  personalizationConsent: true,
  consentUpdatedAt: true,
  createdAt: true,
  _count: {
    select: {
      orders: true,
      // Yumuşak silinen adresler sayılmaz; kullanıcı "2 adres" görüp listede
      // bir adres bulurdu.
      addresses: { where: { deletedAt: null } },
    },
  },
} as const;

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  phone: string | null;
  birthDate: string | null;
  gender: Gender | null;
  image: string | null;
  password: string | null;
  pendingEmail: string | null;
  smsConsent: boolean | null;
  emailConsent: boolean | null;
  callConsent: boolean | null;
  personalizationConsent: boolean | null;
  consentUpdatedAt: Date | null;
  createdAt: Date;
  _count: { orders: number; addresses: number };
};

function serializeProfile(user: ProfileRow) {
  const { password, smsConsent, emailConsent, callConsent, personalizationConsent, consentUpdatedAt, ...rest } = user;

  return {
    ...rest,
    hasPassword: password !== null,
    preferences: {
      // null = "hiç sorulmadı", false = "reddetti" — ikisi aynı şey değil.
      sms: smsConsent,
      email: emailConsent,
      call: callConsent,
      personalization: personalizationConsent,
      updatedAt: consentUpdatedAt,
    },
  };
}

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: profileSelect,
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ user: serializeProfile(user as ProfileRow) });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Profil bilgileri alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(
      `profile-update:${session.user.id}`,
      RATE_LIMITS.profileUpdate
    );
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Çok fazla deneme yaptınız, lütfen biraz bekleyin",
          retryAfter: rateLimit.resetIn,
        },
        { status: 429 }
      );
    }

    const body: UpdateProfileBody = await request.json();
    const { name, phone, birthDate, gender } = body;

    const updateData: {
      name?: string | null;
      phone?: string | null;
      birthDate?: string | null;
      gender?: Gender | null;
    } = {};

    if (name !== undefined) {
      const trimmed = name.trim();
      // Boş gönderim "alanı temizle" demek; uzunluk kuralı yalnızca dolu değere uygulanır.
      if (trimmed === "") {
        updateData.name = null;
      } else {
        const error = validateName(trimmed);
        if (error) return NextResponse.json(error, { status: 400 });
        updateData.name = trimmed;
      }
    }

    if (phone !== undefined) {
      const trimmed = phone.trim();
      if (trimmed === "") {
        updateData.phone = null;
      } else {
        const normalized = normalizePhone(trimmed);
        if (!normalized) {
          return NextResponse.json(
            { error: "Geçerli bir cep telefonu numarası giriniz", field: "phone" },
            { status: 400 }
          );
        }
        updateData.phone = normalized;
      }
    }

    if (birthDate !== undefined) {
      const trimmed = birthDate.trim();
      if (trimmed === "") {
        updateData.birthDate = null;
      } else {
        const error = validateBirthDate(trimmed);
        if (error) return NextResponse.json(error, { status: 400 });
        updateData.birthDate = trimmed;
      }
    }

    if (gender !== undefined) {
      if (gender === null) {
        updateData.gender = null;
      } else if (isGender(gender)) {
        updateData.gender = gender;
      } else {
        return NextResponse.json(
          { error: "Geçersiz değer", field: "gender" },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: profileSelect,
    });

    return NextResponse.json({
      success: true,
      message: "Profil güncellendi",
      user: serializeProfile(updatedUser as ProfileRow),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Profil güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
