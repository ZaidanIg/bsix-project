import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    // Security check: If student, must be their notification
    if (session.user.role === "SISWA" && notification.targetId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATION_PATCH]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

