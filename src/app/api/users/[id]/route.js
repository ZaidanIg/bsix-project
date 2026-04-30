export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();

    const updateData = {};
    if (body.name) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    if (body.resetPassword) {
      updateData.password = await bcrypt.hash(body.resetPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Update teacher info jika dikirim
    if (updatedUser.role === "GURU" && (body.subject || body.bio)) {
      await prisma.teacher.update({
        where: { userId: id },
        data: {
          ...(body.subject ? { subject: body.subject } : {}),
          ...(body.bio !== undefined ? { bio: body.bio } : {}),
        }
      });
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    // Sebaiknya tidak dihapus beneran (soft delete), tapi kita update isActive = false saja
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
