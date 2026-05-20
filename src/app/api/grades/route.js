import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { portfolioId, score, feedback, decision } = body;
    
    console.log("[GRADES_DEBUG] Body:", body);
    console.log("[GRADES_DEBUG] Session User:", session.user);

    // Validasi input dasar
    if (!portfolioId) {
      return NextResponse.json({ success: false, error: "ID Portofolio tidak ditemukan." }, { status: 400 });
    }
    if (!decision) {
      return NextResponse.json({ success: false, error: "Tipe keputusan harus ditentukan." }, { status: 400 });
    }
    if (!feedback || feedback.trim().length < 5) {
      return NextResponse.json({ success: false, error: "Feedback minimal 5 karakter." }, { status: 400 });
    }

    if (decision === "VALIDATED") {
      if (score === undefined || score === null || score === "") {
        return NextResponse.json({ success: false, error: "Skor wajib diisi." }, { status: 400 });
      }
      const scoreNum = parseInt(score);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
        return NextResponse.json({ success: false, error: "Skor tidak valid." }, { status: 400 });
      }
    }

    // Cek apakah portofolio ada
    const existingPortfolio = await prisma.bVoicePortfolio.findUnique({
      where: { id: portfolioId }
    });

    if (!existingPortfolio) {
      return NextResponse.json({ success: false, error: "Portofolio tidak ditemukan." }, { status: 404 });
    }

    // Gunakan transaction untuk memastikan integritas
    const result = await prisma.$transaction(async (tx) => {
      console.log("[GRADES_DEBUG] Starting transaction...");
      
      // 1. Buat record GradesValidation
      const grade = await tx.gradesValidation.create({
        data: {
          portfolioId,
          teacherId: session.user.id,
          score: decision === "VALIDATED" ? parseInt(score) : null,
          feedback,
          decision,
        },
      });
      console.log("[GRADES_DEBUG] Grade record created.");

      // 2. Update status BVoicePortfolio
      const newStatus = decision === "VALIDATED" ? "VALIDATED" : "REJECTED";
      const portfolio = await tx.bVoicePortfolio.update({
        where: { id: portfolioId },
        data: { status: newStatus },
        include: { student: true }
      });
      console.log("[GRADES_DEBUG] Portfolio status updated.");

      // 3. Create Notification for Student
      await tx.notification.create({
        data: {
          type: "BVOICE",
          title: decision === "VALIDATED" ? "✅ Portofolio Disetujui" : "❌ Portofolio Perlu Perbaikan",
          message: `Portofolio "${portfolio.title}" Anda telah ${decision === "VALIDATED" ? "disetujui" : "ditolak"}.`,
          link: `/siswa/portofolio/${portfolioId}`,
          role: "SISWA",
          targetId: portfolio.studentId
        }
      });
      console.log("[GRADES_DEBUG] Student notification created.");

      // 4. Create Notification for Admin
      await tx.notification.create({
        data: {
          type: "BVOICE",
          title: "Update Validasi B'Voice",
          message: `Guru ${session.user.name} telah memvalidasi portofolio ${portfolio.student.name}.`,
          link: `/admin/bvoice`,
          role: "ADMIN"
        }
      });
      console.log("[GRADES_DEBUG] Admin notification created.");

      return grade;
    });

    return NextResponse.json({ success: true, message: "Penilaian berhasil.", data: result });
  } catch (error) {
    console.error("[GRADES_POST_ERROR]", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: "Penilaian sudah ada." }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: `Error: ${error.message}` }, { status: 500 });
  }
}
