import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();

    const updateData = {};
    if (body.photo !== undefined) updateData.photo = body.photo;
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedTeacher });
  } catch (error) {
    console.error("[TEACHER_PATCH]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
