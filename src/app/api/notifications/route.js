import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let whereClause = {};

    if (session.user.role === "SISWA") {
      // Siswa hanya melihat notifikasi miliknya sendiri
      whereClause = {
        role: "SISWA",
        targetId: session.user.id
      };
    } else if (session.user.role === "GURU") {
      whereClause = {
        OR: [
          { role: "GURU", targetId: session.user.id },
          { role: "GURU", targetId: null },
          { role: null, targetId: null }
        ]
      };
    } else {
      // Admin melihat notifikasi berdasarkan role atau global
      whereClause = {
        OR: [
          { role: session.user.role },
          { role: null }
        ]
      };
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const unreadCount = await prisma.notification.count({
      where: {
        isRead: false,
        ...whereClause
      }
    });

    return NextResponse.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let whereClause = {};
    if (session.user.role === "SISWA") {
      whereClause = { role: "SISWA", targetId: session.user.id };
    } else if (session.user.role === "GURU") {
      whereClause = {
        OR: [
          { role: "GURU", targetId: session.user.id },
          { role: "GURU", targetId: null },
          { role: null, targetId: null }
        ]
      };
    } else {
      whereClause = {
        OR: [
          { role: session.user.role },
          { role: null }
        ]
      };
    }

    // Mark all as read
    await prisma.notification.updateMany({
      where: {
        isRead: false,
        ...whereClause
      },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

