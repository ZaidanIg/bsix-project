import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Jika role SISWA, hanya tampilkan portofolio miliknya sendiri
    const whereClause = {
      ...(status ? { status } : {}),
    };

    if (session.user.role === "SISWA") {
      whereClause.studentId = session.user.id;
    } else if (session.user.role !== "ADMIN" && session.user.role !== "GURU") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const portfolios = await prisma.bVoicePortfolio.findMany({
      where: whereClause,
      include: {
        student: {
          select: { name: true, nisNip: true },
        },
        pilar: true,
        validation: true, // Sertakan info validasi (skor & feedback)
      },
      orderBy: {
        submittedAt: "desc", // Untuk siswa biasanya ingin lihat yang terbaru dulu
      },
    });

    return NextResponse.json({ success: true, data: portfolios });
  } catch (error) {
    console.error("[BVOICE_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
