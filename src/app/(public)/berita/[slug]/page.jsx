import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BeritaDetailPublic({ params }) {
  const { slug } = params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true } }
    }
  });

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  // Sanitasi konten HTML dari database menggunakan DOMPurify
  const cleanHtml = DOMPurify.sanitize(article.content);

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header Image (Opsional) */}
      {article.thumbnailUrl ? (
        <div className="w-full h-[40vh] md:h-[50vh] bg-slate-900 relative">
          <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>
      ) : (
        <div className="w-full h-32 bg-slate-900"></div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl -mt-20 relative z-10">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border">
          <Link href="/berita">
            <Button variant="ghost" size="sm" className="mb-6 -ml-3 text-slate-500 hover:text-green-600">
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Berita
            </Button>
          </Link>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 pb-8 mb-8 border-b border-slate-100 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                {article.author.name.charAt(0)}
              </div>
              <span className="font-medium text-slate-700">{article.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(article.publishedAt), "EEEE, dd MMMM yyyy", { locale: localeID })}</span>
            </div>
          </div>

          {/* Konten Artikel yang Di-Sanitize */}
          <article 
            className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-a:text-green-600 hover:prose-a:text-green-500 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
        </div>
      </div>
    </div>
  );
}
