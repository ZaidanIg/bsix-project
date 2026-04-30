import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const pilars = await prisma.pilarBSix.findMany({
      orderBy: { id: "asc" }
    });
    return NextResponse.json({ success: true, data: pilars });
  } catch (error) {
    console.error("[PILAR_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
