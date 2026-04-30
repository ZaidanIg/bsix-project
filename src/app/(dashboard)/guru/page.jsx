import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, BarChart3, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GuruDashboard() {
  const session = await getServerSession(authOptions);

  // Ambil statistik
  const pendingCount = await prisma.bVoicePortfolio.count({
    where: { status: "PENDING" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validatedToday = await prisma.gradesValidation.count({
    where: {
      teacherId: session.user.id,
      validatedAt: { gte: today },
    },
  });

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const validatedThisMonth = await prisma.gradesValidation.count({
    where: {
      teacherId: session.user.id,
      validatedAt: { gte: firstDayOfMonth },
    },
  });

  const grades = await prisma.gradesValidation.findMany({
    where: {
      teacherId: session.user.id,
      score: { not: null },
    },
    select: { score: true },
  });

  const avgScore = grades.length > 0 
    ? Math.round(grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length) 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Guru</h1>
        <p className="text-muted-foreground">
          Ringkasan aktivitas validasi dan penilaian Anda.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={pendingCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Validasi
            </CardTitle>
            <Clock className={`h-4 w-4 ${pendingCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pendingCount > 0 ? "text-red-600" : ""}`}>
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Menunggu untuk dinilai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Divalidasi Hari Ini
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validatedToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Submission diselesaikan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bulan Ini
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validatedThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Validasi sejak awal bulan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Skor
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Skor yang diberikan
            </p>
          </CardContent>
        </Card>
      </div>
      
      {pendingCount > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Perhatian: Ada submission yang menunggu</h3>
              <p className="text-sm text-red-600 mt-1">
                Terdapat {pendingCount} portofolio siswa yang menunggu validasi dari Anda. Silakan cek menu Antrian Validasi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
