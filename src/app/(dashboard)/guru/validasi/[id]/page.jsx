import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
import { ValidateForm } from "./ValidateForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, BookOpen } from "lucide-react";

async function getPortfolio(id) {
  const portfolio = await prisma.bVoicePortfolio.findUnique({
    where: { id },
    include: {
      student: { select: { name: true, nisNip: true } },
      pilar: true,
      validation: true,
    },
  });
  return portfolio;
}

export default async function ValidasiDetail({ params }) {
  const portfolio = await getPortfolio(params.id);

  if (!portfolio) {
    notFound();
  }

  const isPending = portfolio.status === "PENDING";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/guru/validasi">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Submission B'Voice</h1>
          <p className="text-muted-foreground">Tinjau kegiatan siswa sebelum memberikan validasi.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-xl">{portfolio.title}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(portfolio.submittedAt), "EEEE, dd MMMM yyyy HH:mm", { locale: localeID })}
                  </CardDescription>
                </div>
                <Badge variant="outline" style={{ borderColor: portfolio.pilar.colorHex, color: portfolio.pilar.colorHex }}>
                  {portfolio.pilar.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm sm:prose-base max-w-none text-slate-700">
                <p className="whitespace-pre-wrap">{portfolio.description}</p>
              </div>

              {portfolio.fileUrls && portfolio.fileUrls.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900 border-b pb-2">Bukti Kegiatan (Media)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {portfolio.fileUrls.map((url, i) => (
                      <div key={i} className="relative aspect-video bg-slate-100 rounded-md overflow-hidden border">
                        {/* Jika video, gunakan tag video, untuk demo gunakan img */}
                        {url.match(/\.(mp4|webm)$/i) ? (
                          <video src={url} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={url} alt={`Lampiran ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isPending ? (
            <ValidateForm portfolioId={portfolio.id} />
          ) : (
            <Card className={portfolio.status === "VALIDATED" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardHeader>
                <CardTitle className={portfolio.status === "VALIDATED" ? "text-green-800" : "text-red-800"}>
                  Status: {portfolio.status === "VALIDATED" ? "Sudah Divalidasi" : "Ditolak"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolio.validation?.score && (
                  <div>
                    <span className="font-medium text-slate-700 block text-sm">Skor:</span>
                    <span className="text-2xl font-bold">{portfolio.validation.score}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-slate-700 block text-sm">Catatan/Feedback:</span>
                  <p className="mt-1 text-slate-800 bg-white p-3 rounded border whitespace-pre-wrap">
                    {portfolio.validation?.feedback}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" /> Informasi Siswa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                <p className="font-medium">{portfolio.student.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NIS / NIP</p>
                <p className="font-medium">{portfolio.student.nisNip}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Kategori Pilar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div 
                  className="mt-1 w-3 h-3 rounded-full" 
                  style={{ backgroundColor: portfolio.pilar.colorHex }} 
                />
                <div>
                  <p className="font-medium">{portfolio.pilar.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {portfolio.pilar.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
