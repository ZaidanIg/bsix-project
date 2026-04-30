import { Leaf, Award, Shield, BookOpen, Target, Users } from "lucide-react";
import prisma from "@/lib/prisma";

// Map icon string dari database ke Lucide component
const getIcon = (iconName, className) => {
  switch (iconName) {
    case 'Shield': return <Shield className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Target': return <Target className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Leaf': return <Leaf className={className} />;
    default: return <Leaf className={className} />;
  }
};

export default async function ProgramBSix() {
  const pilars = await prisma.pilarBSix.findMany({
    orderBy: { id: "asc" }
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* HERO PROGRAM */}
      <div className="bg-blue-900 text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="container mx-auto max-w-3xl relative z-10">
          <Badge text="Filosofi BMSF" />
          <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-4">Program Unggulan B'Six</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Menjawab tantangan pendidikan bagi warga Orang Terkena Dampak (OTD) Jatigede, BMSF menginisiasi 6 pilar karakter untuk mencetak generasi petani modern yang mandiri, inovatif, dan berakhlak mulia.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 max-w-6xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pilars.map((p, index) => (
            <div key={p.id} className="bg-white rounded-2xl p-8 shadow-sm border hover:shadow-lg transition-all group relative overflow-hidden">
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 opacity-10 transition-transform group-hover:scale-110"
                style={{ backgroundColor: p.colorHex }}
              ></div>
              
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner relative z-10"
                  style={{ backgroundColor: `${p.colorHex}20`, color: p.colorHex }}
                >
                  {getIcon(p.icon, "w-7 h-7")}
                </div>
                <div 
                  className="font-bold text-5xl opacity-20 ml-auto"
                  style={{ color: p.colorHex }}
                >
                  0{index + 1}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">{p.name}</h2>
              <p className="text-slate-600 leading-relaxed relative z-10">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Badge({ text }) {
  return (
    <span className="inline-block bg-blue-800 text-blue-200 text-sm font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full border border-blue-700">
      {text}
    </span>
  );
}
