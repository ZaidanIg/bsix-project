export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      include: {
        teacher: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("[USERS_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { nisNip, name, email, password, role, subject, bio, class: className } = body;

    // Cek apakah nisNip sudah ada
    const existing = await prisma.user.findUnique({ where: { nisNip } });
    if (existing) return NextResponse.json({ success: false, error: "NIS/NIP sudah terdaftar" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          nisNip,
          name,
          email: email || null,
          password: hashedPassword,
          role,
        },
      });

      if (role === "GURU") {
        await tx.teacher.create({
          data: {
            userId: newUser.id,
            nip: nisNip,
            subject: subject || "Umum",
            bio: bio || null,
          },
        });
      }

      return newUser;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[USERS_POST]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
