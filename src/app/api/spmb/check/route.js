export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: "ID Pendaftaran diperlukan" }, { status: 400 });
  }

  try {
    const spmb = await prisma.spmbRegistration.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        status: true,
        registeredAt: true,
      }
    });

    if (!spmb) {
      return NextResponse.json({ success: false, error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: spmb });
  } catch (error) {
    console.error("SPMB check error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
