import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, FileSignature, ArrowRight } from "lucide-react";
import StatusChecker from "./StatusChecker";

export const metadata = {
  title: "SPMB Online - SMP Bina Harapan Jatigede",
  description: "Pendaftaran Siswa Baru SMP Bina Harapan Jatigede",
};

export default function SPMBPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          Penerimaan Siswa Baru
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Bergabunglah dengan SMP Bina Harapan Jatigede dan kembangkan potensi Anda melalui program unggulan B'Six.
        </p>
        <div className="pt-4 flex justify-center">
          <Link href="/spmb/daftar">
            <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/30">
              <FileSignature className="mr-2 h-5 w-5" />
              Daftar Sekarang
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader>
            <CardTitle>Cek Status Pendaftaran</CardTitle>
            <CardDescription>Masukkan ID Pendaftaran Anda untuk melihat status saat ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChecker />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Alur Pendaftaran</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold mr-3 shrink-0">1</span>
                <span>Mengisi formulir pendaftaran online dengan data yang valid.</span>
              </li>
              <li className="flex items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold mr-3 shrink-0">2</span>
                <span>Mengunggah dokumen persyaratan (KK, Akta Kelahiran, dll).</span>
              </li>
              <li className="flex items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold mr-3 shrink-0">3</span>
                <span>Menyimpan ID Pendaftaran yang diberikan oleh sistem.</span>
              </li>
              <li className="flex items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold mr-3 shrink-0">4</span>
                <span>Menunggu validasi dan pengumuman dari pihak sekolah.</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
