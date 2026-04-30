export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";


// GET current profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        teacher: true
      }
    });

    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    // Hapus password dari response
    const { password, ...safeUser } = user;

    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

// UPDATE profile
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, email, currentPassword, newPassword, subject, bio } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const result = await prisma.$transaction(async (tx) => {
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      if (newPassword) {
        if (!currentPassword) {
          throw new Error("Password saat ini diperlukan");
        }
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          throw new Error("Password saat ini salah");
        }

        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: updateData
      });

      if (session.user.role === "GURU" && (subject || bio !== undefined)) {
        await tx.teacher.update({
          where: { userId: session.user.id },
          data: {
            ...(subject ? { subject } : {}),
            ...(bio !== undefined ? { bio } : {})
          }
        });
      }

      return updatedUser;
    });

    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Error" }, { status: 500 });
  }
}
