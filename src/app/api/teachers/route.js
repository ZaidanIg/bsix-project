import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const teachers = await prisma.teacher.findMany({
      include: {
        user: { select: { name: true, email: true, isActive: true } }
      },
      orderBy: { user: { name: "asc" } }
    });

    return NextResponse.json({ success: true, data: teachers });
  } catch (error) {
    console.error("[TEACHERS_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
