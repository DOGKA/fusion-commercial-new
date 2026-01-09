import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

// GET - Tek marka getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const brand = await (prisma as any).brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            bundles: true,
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Marka bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ brand });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Marka getirilemedi" },
      { status: 500 }
    );
  }
}

// PATCH - Marka güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Marka var mı kontrol et
    const existingBrand = await (prisma as any).brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: "Marka bulunamadı" },
        { status: 404 }
      );
    }

    // Slug güncellenmişse benzersizlik kontrolü
    if (body.slug && body.slug !== existingBrand.slug) {
      const slugExists = await (prisma as any).brand.findFirst({
        where: {
          slug: body.slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Bu slug zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // İsim güncellenmişse benzersizlik kontrolü
    if (body.name && body.name !== existingBrand.name) {
      const nameExists = await (prisma as any).brand.findFirst({
        where: {
          name: body.name.trim(),
          id: { not: id },
        },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Bu marka adı zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    const brand = await (prisma as any).brand.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.slug && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl || null }),
        ...(body.website !== undefined && { website: body.website || null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    return NextResponse.json({ brand });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Marka güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Marka sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Marka var mı kontrol et
    const existingBrand = await (prisma as any).brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            bundles: true,
          },
        },
      },
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: "Marka bulunamadı" },
        { status: 404 }
      );
    }

    // Ürün veya bundle bağlı mı kontrol et
    if (existingBrand._count.products > 0 || existingBrand._count.bundles > 0) {
      return NextResponse.json(
        { 
          error: "Bu markaya bağlı ürünler veya paketler var. Önce bunları kaldırın.",
          productCount: existingBrand._count.products,
          bundleCount: existingBrand._count.bundles,
        },
        { status: 400 }
      );
    }

    await (prisma as any).brand.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Marka silinemedi" },
      { status: 500 }
    );
  }
}

