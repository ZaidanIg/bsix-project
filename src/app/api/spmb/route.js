import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

// GET all registrations (admin only)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registrations = await prisma.spmbRegistration.findMany({
      orderBy: { registeredAt: "desc" },
    });

    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error("[SPMB_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      fullName, birthDate, birthPlace, gender, 
      address, previousSchool, parentName, parentPhone,
      documents 
    } = body;

    if (!fullName || !birthDate || !address) {
      return NextResponse.json({ success: false, error: "Data wajib (Nama, Tanggal Lahir, Alamat) tidak boleh kosong" }, { status: 400 });
    }

    const spmb = await prisma.spmbRegistration.create({
      data: {
        fullName,
        birthDate: new Date(birthDate),
        birthPlace,
        gender,
        address,
        previousSchool,
        parentName,
        parentPhone,
        documents, // Sudah berupa JSON { kk: url, akta: url, ijazah: url }
      },
    });

    return NextResponse.json({ success: true, data: { id: spmb.id } });
  } catch (error) {
    console.error("SPMB register error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan internal pada server" }, { status: 500 });
  }
}
