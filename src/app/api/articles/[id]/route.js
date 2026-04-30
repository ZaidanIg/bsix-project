import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();

    const updateData = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl;
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "PUBLISHED") {
        updateData.publishedAt = new Date();
      } else {
        updateData.publishedAt = null;
      }
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedArticle });
  } catch (error) {
    console.error("[ARTICLE_PATCH]", error);
    if (error.code === 'P2002') return NextResponse.json({ success: false, error: "Slug sudah digunakan" }, { status: 400 });
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    await prisma.article.delete({ where: { id } });

    return NextResponse.json({ success: true, data: null }, { status: 204 });
  } catch (error) {
    console.error("[ARTICLE_DELETE]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
