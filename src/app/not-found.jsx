import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="bg-red-100 p-6 rounded-full relative">
            <AlertCircle className="h-20 w-20 text-red-600" />
            <div className="absolute top-0 right-0 bg-white rounded-full p-1 border shadow-sm">
              <div className="bg-red-500 rounded-full w-4 h-4 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight">404</h1>
          <h2 className="text-2xl font-bold text-slate-800">Halaman Tidak Ditemukan</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            Maaf, halaman yang Anda cari tidak ada, telah dipindahkan, atau Anda tidak memiliki akses.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <Button variant="outline" className="w-full sm:w-auto font-medium" render={
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Link>
          } />
          <Button className="w-full sm:w-auto font-medium bg-green-600 hover:bg-green-700" render={
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Ke Beranda Utama
            </Link>
          } />
        </div>
      </div>
    </div>
  );
}
