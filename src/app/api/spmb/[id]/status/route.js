import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();
    const id = params.id;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await prisma.spmbRegistration.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update SPMB status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
