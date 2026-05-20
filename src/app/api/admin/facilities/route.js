import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, data: facilities });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal mengambil data fasilitas" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, imageUrl, isActive } = body;

    if (!name || !description) {
      return NextResponse.json({ success: false, error: "Nama dan deskripsi wajib diisi" }, { status: 400 });
    }

    const facility = await prisma.facility.create({
      data: { name, description, imageUrl, isActive: isActive ?? true }
    });

    return NextResponse.json({ success: true, data: facility });
  } catch (error) {
    console.error("[FACILITY_POST]", error);
    return NextResponse.json({ success: false, error: "Gagal membuat fasilitas baru" }, { status: 500 });
  }
}
