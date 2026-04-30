import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const articles = await prisma.article.findMany({
      include: {
        author: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    console.error("[ARTICLES_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, slug, content, thumbnailUrl, status } = body;

    const newArticle = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        thumbnailUrl,
        status: status || "DRAFT",
        authorId: session.user.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      }
    });

    return NextResponse.json({ success: true, data: newArticle });
  } catch (error) {
    console.error("[ARTICLES_POST]", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: "Slug sudah digunakan. Buat judul lain." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
