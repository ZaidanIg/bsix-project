import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, description, imageUrl, isActive } = body;

    const facility = await prisma.facility.update({
      where: { id },
      data: { name, description, imageUrl, isActive }
    });

    return NextResponse.json({ success: true, data: facility });
  } catch (error) {
    console.error("[FACILITY_PUT]", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui fasilitas" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    
    await prisma.facility.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Fasilitas berhasil dihapus" });
  } catch (error) {
    console.error("[FACILITY_DELETE]", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus fasilitas" }, { status: 500 });
  }
}
