import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SPMBActionButtons from "./SPMBActionButtons";

export default async function AdminSPMBPage() {
  const registrations = await prisma.spmbRegistration.findMany({
    orderBy: { registeredAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manajemen SPMB</h1>
      <p className="text-slate-500">Kelola pendaftaran siswa baru.</p>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Asal Sekolah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dokumen</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell>{new Date(reg.registeredAt).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="font-medium">{reg.fullName}</TableCell>
                  <TableCell>{reg.previousSchool}</TableCell>
                  <TableCell>
                    {reg.status === 'PENDING' && <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>}
                    {reg.status === 'ACCEPTED' && <Badge variant="outline" className="bg-green-100 text-green-800">Diterima</Badge>}
                    {reg.status === 'REJECTED' && <Badge variant="outline" className="bg-red-100 text-red-800">Ditolak</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 text-xs">
                      {reg.documents?.kk && <a href={reg.documents.kk} target="_blank" rel="noreferrer" className="text-primary hover:underline">KK</a>}
                      {reg.documents?.akta && <a href={reg.documents.akta} target="_blank" rel="noreferrer" className="text-primary hover:underline">Akta</a>}
                      {reg.documents?.ijazah && <a href={reg.documents.ijazah} target="_blank" rel="noreferrer" className="text-primary hover:underline">Ijazah</a>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <SPMBActionButtons id={reg.id} currentStatus={reg.status} />
                  </TableCell>
                </TableRow>
              ))}
              {registrations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">Belum ada pendaftaran</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
