import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { portfolioId, score, feedback, decision } = body;

    if (!portfolioId || !feedback || !decision) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (decision === "VALIDATED" && (score === undefined || score === null)) {
      return NextResponse.json({ success: false, error: "Score is required for VALIDATED decision" }, { status: 400 });
    }

    // Gunakan transaction untuk memastikan integritas
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat record GradesValidation
      const grade = await tx.gradesValidation.create({
        data: {
          portfolioId,
          teacherId: session.user.id,
          score: decision === "VALIDATED" ? parseInt(score) : null,
          feedback,
          decision,
        },
      });

      // 2. Update status BVoicePortfolio
      const newStatus = decision === "VALIDATED" ? "VALIDATED" : "REJECTED";
      await tx.bVoicePortfolio.update({
        where: { id: portfolioId },
        data: { status: newStatus },
      });

      return grade;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[GRADES_POST]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
