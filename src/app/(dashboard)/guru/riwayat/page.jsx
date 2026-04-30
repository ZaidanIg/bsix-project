import { getServerSession } from "next-auth";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HistoryIcon, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RiwayatValidasi({ searchParams }) {
  const session = await getServerSession(authOptions);
  
  // Ambil data riwayat penilaian dari tabel GradesValidation
  const riwayat = await prisma.gradesValidation.findMany({
    where: {
      teacherId: session.user.id,
    },
    include: {
      portfolio: {
        include: {
          student: { select: { name: true, nisNip: true } },
          pilar: true,
        }
      }
    },
    orderBy: {
      validatedAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Penilaian</h1>
          <p className="text-muted-foreground">
            Semua portofolio B'Voice yang telah Anda nilai atau tolak.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu Validasi</TableHead>
                  <TableHead>Kegiatan & Siswa</TableHead>
                  <TableHead>Pilar</TableHead>
                  <TableHead>Keputusan</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riwayat.length > 0 ? (
                  riwayat.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {format(new Date(grade.validatedAt), "dd MMM yyyy", { locale: localeID })}
                        </div>
                        <div className="text-xs text-slate-500">
                          {format(new Date(grade.validatedAt), "HH:mm", { locale: localeID })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium max-w-[250px] truncate" title={grade.portfolio.title}>
                          {grade.portfolio.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {grade.portfolio.student.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" style={{ borderColor: grade.portfolio.pilar.colorHex, color: grade.portfolio.pilar.colorHex }}>
                          {grade.portfolio.pilar.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={grade.decision === "VALIDATED" ? "default" : "destructive"} 
                               className={grade.decision === "VALIDATED" ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" : ""}>
                          {grade.decision === "VALIDATED" ? "Divalidasi" : "Ditolak"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {grade.score ? (
                          <span className="font-bold text-slate-700">{grade.score}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/guru/validasi/${grade.portfolio.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" /> Detail
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <HistoryIcon className="h-12 w-12 text-slate-300 mb-2" />
                        <p className="font-medium text-lg text-slate-600">Belum ada riwayat</p>
                        <p className="text-sm">Anda belum memvalidasi atau menolak submission apapun.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
