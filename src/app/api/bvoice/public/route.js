import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pilarId = searchParams.get("pilarId");

    const portfolios = await prisma.bVoicePortfolio.findMany({
      where: {
        status: "VALIDATED",
        ...(pilarId ? { pilarId: parseInt(pilarId) } : {})
      },
      select: {
        id: true,
        title: true,
        description: true,
        fileUrls: true,
        submittedAt: true,
        student: { select: { name: true } },
        pilar: { select: { name: true, colorHex: true } }
      },
      orderBy: { submittedAt: "desc" },
      take: 50 // Limit 50 to prevent huge payloads, can implement cursor pagination later
    });

    return NextResponse.json({ success: true, data: portfolios });
  } catch (error) {
    console.error("[BVOICE_PUBLIC_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
