import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prismaDb";
import { blogDbError, plainText, validatePost } from "@/lib/blog/server";
import { BLOG_STATUSES, type BlogStatus } from "@/lib/blog/shared";
import { revalidateBlog } from "@/lib/revalidate-frontend";

type Context = { params: Promise<{ id: string }> };

const POST_SELECT = {
  id: true,
  slug: true,
  title: true,
  category: true,
  status: true,
  featuredImage: true,
  viewCount: true,
  publishedAt: true,
  updatedAt: true,
  content: true,
  excerpt: true,
  metaTitle: true,
  metaDescription: true,
} as const;

async function unauthorized() {
  const session = await getServerSession(authOptions);
  return session?.user ? null : NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
}

const notFound = () => NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });

export async function GET(_request: Request, context: Context) {
  const denied = await unauthorized();
  if (denied) return denied;

  const { id } = await context.params;
  const post = await prisma.blogPost.findUnique({ where: { id }, select: POST_SELECT });
  return post ? NextResponse.json({ post }) : notFound();
}

export async function PUT(request: Request, context: Context) {
  const denied = await unauthorized();
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const input = validatePost(await request.json());
    const current = await prisma.blogPost.findUnique({
      where: { id },
      select: { slug: true, status: true, publishedAt: true },
    });
    if (!current) return notFound();

    await prisma.blogPost.update({
      where: { id },
      data: {
        ...input,
        ...(input.status === "PUBLISHED" && !current.publishedAt ? { publishedAt: new Date() } : {}),
      },
    });
    if (input.status === "PUBLISHED" || current.status === "PUBLISHED") {
      await revalidateBlog([input.slug, current.slug]);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: blogDbError(error).message }, { status: 400 });
  }
}

/** Listedeki hızlı yayınla / yayından kaldır. */
export async function PATCH(request: Request, context: Context) {
  const denied = await unauthorized();
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const { status } = (await request.json()) as { status?: BlogStatus };
    if (!status || !BLOG_STATUSES.includes(status)) throw new Error("Durum geçersiz.");

    const current = await prisma.blogPost.findUnique({
      where: { id },
      select: { slug: true, category: true, content: true, publishedAt: true },
    });
    if (!current) return notFound();
    if (status === "PUBLISHED") {
      if (!current.category) throw new Error("Yayınlamak için önce kategori seçin.");
      if (!plainText(current.content)) throw new Error("Yayınlamak için önce içerik girin.");
    }

    await prisma.blogPost.update({
      where: { id },
      data: {
        status,
        ...(status === "PUBLISHED" && !current.publishedAt ? { publishedAt: new Date() } : {}),
      },
    });
    await revalidateBlog([current.slug]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: blogDbError(error).message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const denied = await unauthorized();
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const post = await prisma.blogPost.delete({ where: { id }, select: { slug: true, status: true } });
    if (post.status === "PUBLISHED") await revalidateBlog([post.slug]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: blogDbError(error).message }, { status: 400 });
  }
}
