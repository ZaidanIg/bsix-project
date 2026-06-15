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

    const id = parseInt(params.id);
    const body = await req.json();
    const { code, name, description, icon, colorHex, teacherIds } = body;

    const updateData = { code, name, description, icon, colorHex };
    
    if (teacherIds && Array.isArray(teacherIds)) {
      updateData.teachers = {
        set: teacherIds.map(tid => ({ id: tid }))
      };
    }

    const pilar = await prisma.pilarBSix.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: pilar });
  } catch (error) {
    console.error("[PILAR_PUT]", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui pilar" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    
    // Cek apakah ada portfolio yang menggunakan pilar ini
    const count = await prisma.bVoicePortfolio.count({
      where: { pilarId: id }
    });

    if (count > 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Tidak dapat menghapus pilar yang sedang digunakan oleh portofolio siswa." 
      }, { status: 400 });
    }

    await prisma.pilarBSix.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Pilar berhasil dihapus" });
  } catch (error) {
    console.error("[PILAR_DELETE]", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus pilar" }, { status: 500 });
  }
}
