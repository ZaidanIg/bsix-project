import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

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
