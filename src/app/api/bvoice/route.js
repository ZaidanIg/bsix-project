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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Jika role SISWA, hanya tampilkan portofolio miliknya sendiri
    const whereClause = {
      ...(status ? { status } : {}),
    };

    if (session.user.role === "SISWA") {
      whereClause.studentId = session.user.id;
    } else if (session.user.role === "GURU") {
      whereClause.teacherId = session.user.id;
    } else if (session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const portfolios = await prisma.bVoicePortfolio.findMany({
      where: whereClause,
      include: {
        student: {
          select: { name: true, nisNik: true },
        },
        pilar: true,
        validation: true, // Sertakan info validasi (skor & feedback)
      },
      orderBy: {
        submittedAt: "desc", // Untuk siswa biasanya ingin lihat yang terbaru dulu
      },
    });

    return NextResponse.json({ success: true, data: portfolios });
  } catch (error) {
    console.error("[BVOICE_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SISWA") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let pilarId, teacherId, title, description, fileUrls;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      pilarId = body.pilarId;
      teacherId = body.teacherId;
      title = body.title;
      description = body.description;
      fileUrls = body.fileUrls;
    } else {
      const formData = await req.formData();
      pilarId = formData.get("pilarId");
      teacherId = formData.get("teacherId");
      title = formData.get("title");
      description = formData.get("description");
      // Fallback lama (jika masih ada yang pakai manual upload)
      fileUrls = ["https://placehold.co/600x400?text=BVoice+Portfolio"];
    }

    if (!pilarId || !title || !description || !teacherId) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 });
    }

    const newPortfolio = await prisma.bVoicePortfolio.create({
      data: {
        studentId: session.user.id,
        pilarId: parseInt(pilarId),
        teacherId,
        title,
        description,
        fileUrls: fileUrls || [],
        status: "PENDING"
      }
    });

    // Create Notification for Guru
    await prisma.notification.create({
      data: {
        type: "BVOICE",
        title: "Submit B'Voice Baru",
        message: `${session.user.name} baru saja mengirim portofolio "${title}"`,
        link: "/guru/validasi",
        role: "GURU",
        targetId: teacherId
      }
    });

    // Create Notification for Admin
    await prisma.notification.create({
      data: {
        type: "BVOICE",
        title: "Submit B'Voice Baru",
        message: `${session.user.name} (Siswa) mengirim portofolio baru`,
        link: "/admin/bvoice",
        role: "ADMIN"
      }
    });

    return NextResponse.json({ success: true, data: newPortfolio });
  } catch (error) {
    console.error("[BVOICE_POST]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
