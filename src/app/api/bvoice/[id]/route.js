import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "GURU", "SISWA"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const portfolio = await prisma.bVoicePortfolio.findUnique({
      where: {
        id,
      },
      include: {
        student: {
          select: { name: true, nisNip: true },
        },
        pilar: true,
        validation: true,
      },
    });

    if (!portfolio) {
      return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: portfolio });
  } catch (error) {
    console.error("[BVOICE_GET_ID]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // First delete any validations if they exist (though prisma schema should ideally handle this with cascade)
    // In our schema, GradesValidation has portfolioId as unique, so we can delete it.
    await prisma.gradesValidation.deleteMany({
      where: { portfolioId: id }
    });

    await prisma.bVoicePortfolio.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Portofolio berhasil dihapus" });
  } catch (error) {
    console.error("[BVOICE_DELETE]", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus data" }, { status: 500 });
  }
}
