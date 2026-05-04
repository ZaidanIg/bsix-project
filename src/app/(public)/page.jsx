import Link from "next/link";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { ArrowRight, GraduationCap, Users, Sprout, Calendar, Leaf, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BerandaPublic() {
  const [totalSiswa, totalGuru, pilarTeratas, beritaTerbaru] = await Promise.all([
    prisma.user.count({ where: { role: "SISWA", isActive: true } }),
    prisma.teacher.count({ where: { isActive: true } }),
    prisma.pilarBSix.findMany({ take: 3 }),
    prisma.article.findMany({ 
      where: { status: "PUBLISHED" }, 
      orderBy: { publishedAt: "desc" }, 
      take: 3,
      select: { id: true, title: true, slug: true, thumbnailUrl: true, publishedAt: true }
    })
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-blue-900/80 mix-blend-multiply" />
          <img 
            src="https://images.unsplash.com/photo-1595188544569-808fc52c1e6c?auto=format&fit=crop&q=80" 
            alt="Pertanian Modern" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl space-y-8">
          <Badge text="Pendaftaran SPMB Telah Dibuka" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Mendidik Generasi Muda Menjadi <span className="text-green-400">Petani Modern</span> Berkarakter.
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed">
            SMP Bina Harapan Jatigede hadir sebagai solusi pendidikan adaptif bagi Generasi Muda OTD melalui program unggulan B'Six.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/spmb">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 h-12 px-8 text-base font-semibold w-full sm:w-auto">
                Daftar Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/program-bsix">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold text-slate-900 border-white hover:bg-slate-100 w-full sm:w-auto">
                Pelajari Program
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <GraduationCap className="h-8 w-8 text-green-600 mx-auto" />
              <h3 className="text-3xl font-bold text-slate-900">{totalSiswa}</h3>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Siswa Aktif</p>
            </div>
            <div className="space-y-2">
              <Users className="h-8 w-8 text-blue-600 mx-auto" />
              <h3 className="text-3xl font-bold text-slate-900">{totalGuru}</h3>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Tenaga Pendidik</p>
            </div>
            <div className="space-y-2">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto" />
              <h3 className="text-3xl font-bold text-slate-900">2017</h3>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Tahun Berdiri</p>
            </div>
            <div className="space-y-2">
              <Trophy className="h-8 w-8 text-purple-600 mx-auto" />
              <h3 className="text-3xl font-bold text-slate-900">6</h3>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Pilar B'Six</p>
            </div>
          </div>
        </div>
      </section>

      {/* B'SIX PREVIEW SECTION */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Program Unggulan B'Six</h2>
            <p className="text-slate-600">
              Kerangka pendidikan inovatif yang membentuk kompetensi agrikultur dan karakter generasi masa depan.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pilarTeratas.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-8 shadow-sm border hover:shadow-md transition-shadow">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${p.colorHex}20`, color: p.colorHex }}
                >
                  <Leaf className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{p.name}</h3>
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">{p.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/program-bsix">
              <Button variant="outline" className="font-semibold">Lihat Semua Pilar B'Six</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* BERITA TERBARU */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Berita & Pengumuman</h2>
              <p className="text-slate-600">Informasi terbaru seputar kegiatan BMSF.</p>
            </div>
            <Link href="/berita">
              <Button variant="link" className="text-green-600 p-0 font-semibold">Lihat Semua Berita <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>

          {beritaTerbaru.length === 0 ? (
            <p className="text-slate-500 text-center py-10">Belum ada berita yang dipublikasikan.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {beritaTerbaru.map(b => (
                <Link key={b.id} href={`/berita/${b.slug}`} className="group flex flex-col bg-slate-50 rounded-xl overflow-hidden border hover:border-green-300 transition-colors">
                  <div className="h-48 bg-slate-200 overflow-hidden">
                    {b.thumbnailUrl ? (
                      <img src={b.thumbnailUrl} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <Sprout className="h-10 w-10 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-xs text-slate-500 mb-2 font-medium">
                      {format(new Date(b.publishedAt), "dd MMMM yyyy", { locale: localeID })}
                    </p>
                    <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
                      {b.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA FOOTER SECTION */}
      <section className="bg-green-600 py-16 text-center text-white px-4">
        <h2 className="text-3xl font-bold mb-4">Mari Bergabung Bersama Kami!</h2>
        <p className="mb-8 max-w-xl mx-auto text-green-100">
          Daftarkan diri Anda di SMP Bina Harapan Jatigede dan jadilah pelopor generasi petani modern di masa depan.
        </p>
        <Link href="/spmb">
          <Button size="lg" className="bg-white text-green-700 hover:bg-slate-100 font-bold px-10 h-14 text-lg rounded-full shadow-lg">
            Daftar SPMB Sekarang
          </Button>
        </Link>
      </section>
    </div>
  );
}

// Simple internal badge component
function Badge({ text }) {
  return (
    <div className="inline-flex items-center rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-sm font-medium text-green-300 backdrop-blur-sm">
      <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
      {text}
    </div>
  );
}
