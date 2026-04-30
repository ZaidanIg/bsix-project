import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function SiswaDashboard() {
  const session = await getServerSession(authOptions);
  
  const portfolios = await prisma.bVoicePortfolio.findMany({
    where: { studentId: session.user.id },
    include: { pilar: true, validation: true },
    orderBy: { submittedAt: 'desc' },
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'VALIDATED': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Validated</Badge>;
      case 'REJECTED': return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Siswa</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Submit B'Voice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{portfolios.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Divalidasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {portfolios.filter(p => p.status === 'VALIDATED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {portfolios.filter(p => p.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat B'Voice</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolios.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Belum ada portofolio yang disubmit.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pilar</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolios.map((portfolio) => (
                  <TableRow key={portfolio.id}>
                    <TableCell>{new Date(portfolio.submittedAt).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>
                      <span className="font-medium text-primary">{portfolio.pilar.name}</span>
                    </TableCell>
                    <TableCell>{portfolio.title}</TableCell>
                    <TableCell>{getStatusBadge(portfolio.status)}</TableCell>
                    <TableCell>
                      {portfolio.status === 'VALIDATED' && portfolio.validation ? (
                        <span className="font-bold">{portfolio.validation.score} / 100</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
