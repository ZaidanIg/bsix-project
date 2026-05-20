import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const pilars = await prisma.pilarBSix.findMany({
      orderBy: { id: "asc" }
    });
    return NextResponse.json({ success: true, data: pilars });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal mengambil data pilar" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, name, description, icon, colorHex } = body;

    if (!code || !name || !description || !icon || !colorHex) {
      return NextResponse.json({ success: false, error: "Semua field wajib diisi" }, { status: 400 });
    }

    const pilar = await prisma.pilarBSix.create({
      data: { code, name, description, icon, colorHex }
    });

    return NextResponse.json({ success: true, data: pilar });
  } catch (error) {
    console.error("[PILAR_POST]", error);
    return NextResponse.json({ success: false, error: "Gagal membuat pilar baru" }, { status: 500 });
  }
}
