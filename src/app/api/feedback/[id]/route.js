export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();

    const updateData = {};
    if (body.isRead !== undefined) updateData.isRead = body.isRead;
    if (body.isHandled !== undefined) updateData.isHandled = body.isHandled;

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedFeedback });
  } catch (error) {
    console.error("[FEEDBACK_PATCH]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    await prisma.feedback.delete({ where: { id } });

    return NextResponse.json({ success: true, data: null }, { status: 204 });
  } catch (error) {
    console.error("[FEEDBACK_DELETE]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
