import prisma from "@/lib/prisma";
import { Layout } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FasilitasPublic() {
  const facilities = await prisma.facility.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="bg-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Fasilitas Sekolah</h1>
        <p className="text-blue-100 max-w-2xl mx-auto">
          Dukungan sarana dan prasarana yang lengkap untuk menunjang kreativitas dan kenyamanan belajar siswa di SMP Bina Harapan Jatigede.
        </p>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow flex flex-col">
              <div className="aspect-video bg-slate-200 relative overflow-hidden">
                {f.imageUrl ? (
                  <img 
                    src={f.imageUrl} 
                    alt={f.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Layout className="w-12 h-12" />
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.name}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {facilities.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            Data fasilitas belum tersedia.
          </div>
        )}
      </div>
    </div>
  );
}
