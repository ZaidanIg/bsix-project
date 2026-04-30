export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, Clock, FileText, MessageSquare, TrendingUp, BarChart3, Edit3, ArrowRight } from "lucide-react";
import AdminCharts from "./AdminCharts";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // --- STATISTIK ---
  const totalSiswa = await prisma.user.count({
    where: { role: "SISWA", isActive: true },
  });

  const totalGuru = await prisma.teacher.count({
    where: { isActive: true },
  });

  const pendingBVoice = await prisma.bVoicePortfolio.count({
    where: { status: "PENDING" },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const spmbBaru = await prisma.spmbRegistration.count({
    where: { registeredAt: { gte: sevenDaysAgo } },
  });

  const unreadFeedback = await prisma.feedback.count({
    where: { isRead: false },
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const totalBVoiceBulanIni = await prisma.bVoicePortfolio.count({
    where: { submittedAt: { gte: startOfMonth } },
  });

  const gradesBulanIni = await prisma.gradesValidation.findMany({
    where: { validatedAt: { gte: startOfMonth }, score: { not: null } },
    select: { score: true },
  });

  const avgSkor = gradesBulanIni.length > 0
    ? Math.round(gradesBulanIni.reduce((a, b) => a + b.score, 0) / gradesBulanIni.length)
    : 0;

  const totalArtikelPublished = await prisma.article.count({
    where: { status: "PUBLISHED" },
  });

  // --- DATA UNTUK GRAFIK (Client Component) ---
  // Pie Chart: Distribusi per pilar
  const pilarDistribution = await prisma.pilarBSix.findMany({
    include: {
      _count: {
        select: { portfolios: true }
      }
    }
  });

  const pieData = pilarDistribution.map(p => ({
    name: p.name,
    value: p._count.portfolios,
    fill: p.colorHex
  }));

  // Line Chart: Aktivitas 30 hari terakhir
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const portfolios30Days = await prisma.bVoicePortfolio.findMany({
    where: { submittedAt: { gte: thirtyDaysAgo } },
    select: { submittedAt: true }
  });

  const activityMap = {};
  portfolios30Days.forEach(p => {
    const dateStr = p.submittedAt.toISOString().split('T')[0];
    activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
  });

  // Isi tanggal yang kosong dengan 0
  const lineData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    lineData.push({
      date: dateStr,
      submissions: activityMap[dateStr] || 0
    });
  }

  // --- 5 PENDING TERBARU ---
  const latestPending = await prisma.bVoicePortfolio.findMany({
    where: { status: "PENDING" },
    orderBy: { submittedAt: "desc" },
    take: 5,
    include: {
      student: { select: { name: true } },
      pilar: { select: { name: true, colorHex: true } }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">
          Ringkasan seluruh aktivitas sistem SMP Bina Harapan Jatigede.
        </p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Siswa Aktif</CardTitle>
            <GraduationCap className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSiswa}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuru}</div>
          </CardContent>
        </Card>

        <Card className={pendingBVoice > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">B'Voice Pending</CardTitle>
            <Clock className={`h-4 w-4 ${pendingBVoice > 0 ? "text-red-500" : "text-slate-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pendingBVoice > 0 ? "text-red-600" : ""}`}>{pendingBVoice}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendaftar SPMB (7h)</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spmbBaru}</div>
          </CardContent>
        </Card>

        <Card className={unreadFeedback > 0 ? "border-amber-200 bg-amber-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Feedback Unread</CardTitle>
            <MessageSquare className={`h-4 w-4 ${unreadFeedback > 0 ? "text-amber-500" : "text-slate-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${unreadFeedback > 0 ? "text-amber-600" : ""}`}>{unreadFeedback}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">B'Voice Bulan Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBVoiceBulanIni}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rata Skor Bulan Ini</CardTitle>
            <BarChart3 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSkor}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Artikel Published</CardTitle>
            <Edit3 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArtikelPublished}</div>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS (Client Component) */}
      <AdminCharts pieData={pieData} lineData={lineData} />

      {/* TABLE PENDING TERBARU */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Submission Pending Terbaru</CardTitle>
            <CardDescription>Portofolio B'Voice yang paling baru disubmit siswa dan menunggu penilaian guru.</CardDescription>
          </div>
          <Link href="/admin/bvoice">
            <Button variant="outline" size="sm">
              Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {latestPending.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Tidak ada portofolio pending.</p>
            ) : (
              latestPending.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{p.title}</p>
                    <p className="text-sm text-muted-foreground">{p.student.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" style={{ borderColor: p.pilar.colorHex, color: p.pilar.colorHex }}>
                      {p.pilar.name}
                    </Badge>
                    <Link href={`/guru/validasi/${p.id}`}>
                      <Button size="sm">Review</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
