import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { BookOpen } from "lucide-react";

export default async function GuruPublic() {
  const teachers = await prisma.teacher.findMany({
    where: { isActive: true },
    include: {
      user: { select: { name: true } }
    },
    orderBy: { user: { name: "asc" } }
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="bg-green-700 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Tenaga Pendidik BMSF</h1>
        <p className="text-green-100 max-w-2xl mx-auto">
          Mengenal lebih dekat para guru hebat yang mendidik, membimbing, dan menginspirasi siswa-siswi SMP Bina Harapan Jatigede.
        </p>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teachers.map(teacher => {
            const initials = teacher.user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
            
            return (
              <div key={teacher.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow flex flex-col group">
                {/* Bagian Atas / Header Card */}
                <div className="h-24 bg-slate-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 mix-blend-multiply"></div>
                </div>
                
                {/* Avatar */}
                <div className="flex justify-center -mt-12 relative z-10 px-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-sm bg-slate-100 overflow-hidden flex items-center justify-center">
                    {teacher.photo ? (
                      <img src={teacher.photo} alt={teacher.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-slate-400">{initials}</span>
                    )}
                  </div>
                </div>

                {/* Konten Profil */}
                <div className="p-6 pt-4 flex flex-col flex-1 text-center">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-green-700 transition-colors">
                    {teacher.user.name}
                  </h3>
                  
                  <div className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full mx-auto w-fit">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="font-medium line-clamp-1">{teacher.subject}</span>
                  </div>

                  <p className="mt-4 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {teacher.bio || "Dedikasi tinggi dalam mencerdaskan kehidupan bangsa dan membina karakter siswa-siswi BMSF."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {teachers.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            Data tenaga pendidik belum tersedia.
          </div>
        )}
      </div>
    </div>
  );
}
