import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "GURU") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await req.json();
    const { action, score, feedback } = body;

    const portfolio = await prisma.bVoicePortfolio.findUnique({
      where: { id }
    });

    if (!portfolio || portfolio.status !== "PENDING") {
      return NextResponse.json({ error: "Portfolio not found or already validated" }, { status: 400 });
    }

    const status = action === "APPROVE" ? "VALIDATED" : "REJECTED";

    // Transaction to update portfolio status and create validation record
    await prisma.$transaction([
      prisma.bVoicePortfolio.update({
        where: { id },
        data: { status },
      }),
      prisma.gradesValidation.create({
        data: {
          portfolioId: id,
          teacherId: session.user.id,
          score: action === "APPROVE" ? parseInt(score) : 0,
          feedback,
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
