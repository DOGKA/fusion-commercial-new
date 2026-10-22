import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { prisma } from "@/libs/prismaDb";
import { blogDbError, validatePost } from "@/lib/blog/server";
import { revalidateBlog } from "@/lib/revalidate-frontend";

const LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  category: true,
  status: true,
  featuredImage: true,
  viewCount: true,
  publishedAt: true,
  updatedAt: true,
} as const;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

  try {
    const [posts, categories] = await Promise.all([
      prisma.blogPost.findMany({ select: LIST_SELECT, orderBy: { updatedAt: "desc" } }),
      prisma.blogPost.findMany({
        where: { category: { not: null } },
        distinct: ["category"],
        select: { category: true },
      }),
    ]);
    return NextResponse.json({
      posts,
      categories: categories.map((row) => row.category).filter(Boolean),
    });
  } catch (error) {
    console.error("Blog listesi alınamadı:", error);
    return NextResponse.json({ error: "Yazılar alınamadı." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

  try {
    const input = validatePost(await request.json());
    const post = await prisma.blogPost.create({
      data: {
        ...input,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
      select: { id: true },
    });
    if (input.status === "PUBLISHED") await revalidateBlog([input.slug]);
    return NextResponse.json({ id: post.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: blogDbError(error).message }, { status: 400 });
  }
}
