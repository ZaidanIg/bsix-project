import Link from "next/link";
import { Sprout, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2 text-white mb-6">
              <div className="bg-white p-1 rounded-md">
                <img src="/logo.png" alt="Logo BMSF" className="h-6 w-6 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-tight tracking-tight">BMSF</span>
                <span className="text-[10px] text-slate-400 font-medium leading-none tracking-wider">SMP BINA HARAPAN JATIGEDE</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mendidik Generasi Muda OTD (Orang Terkena Dampak) Jatigede Menjadi Petani Modern yang Berkarakter melalui 6 Pilar B'Six.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Tautan Cepat</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-green-400 transition-colors">Beranda</Link></li>
              <li><Link href="/program-bsix" className="hover:text-green-400 transition-colors">Program B'Six</Link></li>
              <li><Link href="/galeri" className="hover:text-green-400 transition-colors">Galeri Portofolio</Link></li>
              <li><Link href="/spmb" className="hover:text-green-400 transition-colors">Informasi SPMB</Link></li>
              <li><Link href="/kritik-saran" className="hover:text-green-400 transition-colors">Kritik & Saran</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Kontak Kami</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Dusun Cihegar RT 019 RW 005, Desa Mekarasih, Kecamatan Jatigede, Kabupaten Sumedang, Jawa Barat - 45377</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-green-500 shrink-0" />
                <span>+6285722904667</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-green-500 shrink-0" />
                <span>smpbinaharapanjatigede@gmail.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Sosial Media</h3>
            <div className="flex flex-col gap-3 text-sm">
              <a href="#" className="hover:text-green-400 transition-colors">Instagram : @smp_binaraja</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Facebook : SMP Bina Harapan Jatigede</a>
              <a href="#" className="hover:text-red-400 transition-colors">Tiktok : @smp_binaraj</a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; 2026 artefact. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
