import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "GURU") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Ambil semua pilar
    const pilars = await prisma.pilarBSix.findMany({
      orderBy: { id: 'asc' }
    });

    // Ambil semua siswa beserta portofolio dan nilainya
    const students = await prisma.user.findMany({
      where: { role: "SISWA", isActive: true },
      select: {
        id: true,
        name: true,
        nisNip: true,
        bvoicePortfolios: {
          include: {
            pilar: true,
            validation: {
              select: {
                score: true,
                decision: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Format data untuk tabel rekap
    const rekapData = students.map(student => {
      const pilarScores = {};
      
      // Inisialisasi skor untuk setiap pilar dengan null
      pilars.forEach(p => {
        pilarScores[p.code] = null;
      });

      // Isi skor berdasarkan portofolio yang sudah divalidasi
      student.bvoicePortfolios.forEach(p => {
        if (p.validation && p.validation.decision === "VALIDATED") {
          // Jika ada beberapa submission di pilar yang sama, kita ambil yang terbaru (atau rata-rata?)
          // Untuk rekap sederhana kita ambil nilai yang ada.
          pilarScores[p.pilar.code] = p.validation.score;
        }
      });

      return {
        id: student.id,
        name: student.name,
        nisNip: student.nisNip,
        scores: pilarScores
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        pilars,
        rekap: rekapData
      } 
    });
  } catch (error) {
    console.error("[REKAP_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
