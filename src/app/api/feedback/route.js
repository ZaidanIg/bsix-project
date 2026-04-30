import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    console.error("[FEEDBACK_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, category, message } = body;

    if (!name || !category || !message) {
      return NextResponse.json({ success: false, error: "Nama, Kategori, dan Pesan wajib diisi" }, { status: 400 });
    }

    const newFeedback = await prisma.feedback.create({
      data: {
        name,
        email: email || null,
        category,
        message,
      }
    });

    return NextResponse.json({ success: true, data: newFeedback });
  } catch (error) {
    console.error("[FEEDBACK_POST]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
