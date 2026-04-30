"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Trophy,
  MessageCircle,
  FileText,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

export default function DetailPortofolioSiswa() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/bvoice/${params.id}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          toast.error("Data tidak ditemukan");
          router.push("/siswa/portofolio");
        }
      } catch (err) {
        toast.error("Gagal memuat detail");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [params.id, router]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Memuat detail portofolio...</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <Badge 
            style={{ 
              backgroundColor: `${data.pilar.colorHex}15`, 
              color: data.pilar.colorHex,
              borderColor: `${data.pilar.colorHex}30` 
            }}
            className="font-bold uppercase tracking-wider px-3"
          >
            Pilar {data.pilar.name}
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900">{data.title}</h1>
          <div className="flex items-center gap-3 text-slate-500 text-sm mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(data.submittedAt).toLocaleDateString("id-ID", { 
                day: "numeric", 
                month: "long", 
                year: "numeric" 
              })}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          {data.status === "VALIDATED" ? (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg border border-green-200 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5" /> Tervalidasi
            </div>
          ) : data.status === "REJECTED" ? (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg border border-red-200 flex items-center gap-2 font-bold">
              <XCircle className="w-5 h-5" /> Ditolak
            </div>
          ) : (
            <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 flex items-center gap-2 font-bold">
              <Clock className="w-5 h-5" /> Menunggu Antrian
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Deskripsi Kegiatan
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {data.description}
            </p>
          </CardContent>
          
          {data.fileUrls && data.fileUrls.length > 0 && (
            <div className="px-6 pb-6 border-t pt-6">
              <CardTitle className="text-lg flex items-center gap-2 mb-4">
                <ImageIcon className="w-4 h-4 text-primary" /> Lampiran / Bukti
              </CardTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {data.fileUrls.map((url, i) => (
                  <a 
                    key={i} 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="group relative aspect-square rounded-lg overflow-hidden border bg-slate-50 hover:border-primary transition-colors"
                  >
                    <img 
                      src={url} 
                      alt={`Lampiran ${i+1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="text-white w-6 h-6" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {data.status !== "PENDING" && data.validation && (
            <Card className={data.status === "VALIDATED" ? "bg-green-50 border-green-200 shadow-sm" : "bg-red-50 border-red-200 shadow-sm"}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {data.status === "VALIDATED" ? (
                    <Trophy className="w-5 h-5 text-green-600" />
                  ) : (
                    <MessageCircle className="w-5 h-5 text-red-600" />
                  )}
                  {data.status === "VALIDATED" ? "Hasil Validasi" : "Catatan Guru"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.status === "VALIDATED" && (
                  <div className="text-center py-4">
                    <span className="text-5xl font-black text-green-700">{data.validation.score}</span>
                    <span className="text-green-600 font-bold ml-1">/100</span>
                  </div>
                )}
                
                <div className={data.status === "VALIDATED" ? "text-green-800" : "text-red-800"}>
                  <p className="text-sm font-semibold mb-1 opacity-70 italic">Feedback Guru:</p>
                  <p className="text-sm leading-relaxed">
                    {data.validation.feedback || "Tidak ada catatan tambahan."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Pilar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div 
                className="p-3 rounded-lg text-white font-bold text-center text-sm"
                style={{ backgroundColor: data.pilar.colorHex }}
              >
                Pilar {data.pilar.code}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {data.pilar.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
