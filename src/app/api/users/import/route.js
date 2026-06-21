export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { users } = body; // array of { nisNik, name, email, password, role }

    if (!Array.isArray(users)) return new NextResponse("Format salah", { status: 400 });

    const createdUsers = [];
    const errors = [];

    // Proses satu per satu untuk menghindari seluruh batch gagal jika ada 1 error
    for (const u of users) {
      try {
        if (u.role === "GURU" && (!u.nisNik || u.nisNik.length !== 16)) {
          throw new Error("NIK Guru harus terdiri dari 16 karakter");
        }

        const hashedPassword = await bcrypt.hash(u.password, 10);
        
        await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              nisNik: u.nisNik,
              name: u.name,
              email: u.email || null,
              password: hashedPassword,
              role: u.role || "SISWA",
            }
          });

          if (u.role === "GURU") {
            await tx.teacher.create({
              data: {
                userId: newUser.id,
                nik: u.nisNik,
                subject: u.subject || "Umum",
                bio: u.bio || null,
              }
            });
          }

          createdUsers.push(newUser);
        });
      } catch (err) {
        errors.push(`Gagal untuk NIS/NIK: ${u.nisNik} - ${err.message}`);
      }
    }

    return NextResponse.json({ success: true, created: createdUsers.length, errors });
  } catch (error) {
    console.error("[USERS_IMPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
