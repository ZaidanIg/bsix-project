import Link from "next/link";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Sprout, ArrowRight } from "lucide-react";

export default async function BeritaListPublic() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: {
      author: { select: { name: true } }
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="bg-slate-900 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Berita & Pengumuman</h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Informasi terkini seputar kegiatan, prestasi, dan program unggulan SMP Bina Harapan Jatigede.
        </p>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 max-w-6xl">
        {articles.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border">
            Belum ada berita yang dipublikasikan.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => {
              // Ekstrak teks biasa dari HTML untuk excerpt
              const plainText = article.content.replace(/<[^>]+>/g, '');
              const excerpt = plainText.length > 150 ? plainText.substring(0, 150) + "..." : plainText;

              return (
                <Link key={article.id} href={`/berita/${article.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-300 hover:border-green-300">
                  <div className="h-56 bg-slate-200 overflow-hidden relative">
                    {article.thumbnailUrl ? (
                      <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <Sprout className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                      {format(new Date(article.publishedAt), "dd MMM yyyy", { locale: localeID })}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-xl text-slate-900 leading-snug line-clamp-2 mb-3 group-hover:text-green-700 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                      {excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Oleh {article.author.name}</span>
                      <span className="text-green-600 font-bold flex items-center group-hover:translate-x-1 transition-transform">
                        Baca <ArrowRight className="ml-1 w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
