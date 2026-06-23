import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const settings = await prisma.systemSetting.findMany();
    const config = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal mengambil pengaturan" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { key, value } = await req.json();

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal memperbarui pengaturan" }, { status: 500 });
  }
}
