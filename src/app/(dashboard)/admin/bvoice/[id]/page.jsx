"use client";

import { useState, useEffect, useCallback } from "react";
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
  Image as ImageIcon,
  User,
  ShieldCheck,
  Loader2
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

export default function DetailBVoiceAdmin() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bvoice/${params.id}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error("Data tidak ditemukan");
        router.push("/admin/bvoice");
      }
    } catch (err) {
      toast.error("Gagal memuat detail");
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Memuat detail portofolio...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge 
              style={{ 
                backgroundColor: `${data.pilar.colorHex}15`, 
                color: data.pilar.colorHex,
                borderColor: `${data.pilar.colorHex}30` 
              }}
              className="font-bold uppercase tracking-wider"
            >
              Pilar {data.pilar.name}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">{data.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm mt-3">
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">{data.student.name}</span>
              <span className="text-slate-400">({data.student.nisNik})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(data.submittedAt).toLocaleDateString("id-ID", { 
                day: "numeric", 
                month: "long", 
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {data.status === "VALIDATED" ? (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg border border-green-200 flex items-center gap-2 font-bold shadow-sm">
              <CheckCircle2 className="w-5 h-5" /> Tervalidasi
            </div>
          ) : data.status === "REJECTED" ? (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg border border-red-200 flex items-center gap-2 font-bold shadow-sm">
              <XCircle className="w-5 h-5" /> Ditolak
            </div>
          ) : (
            <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 flex items-center gap-2 font-bold shadow-sm">
              <Clock className="w-5 h-5" /> Menunggu Antrian
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Deskripsi Kegiatan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {data.description}
              </p>
            </CardContent>
          </Card>

          {data.fileUrls && data.fileUrls.length > 0 && (
            <Card className="shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" /> Lampiran / Bukti
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.fileUrls.map((url, i) => (
                    <div 
                      key={i} 
                      className="group relative aspect-video rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50 hover:border-primary transition-all cursor-pointer shadow-sm"
                      onClick={() => window.open(url, '_blank')}
                    >
                      {url.match(/\.(mp4|webm|mov)$/i) ? (
                        <video src={url} className="w-full h-full object-cover" />
                      ) : (
                        <img 
                          src={url} 
                          alt={`Lampiran ${i+1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                          <ExternalLink className="text-white w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {data.status !== "PENDING" && data.validation ? (
            <Card className={data.status === "VALIDATED" ? "bg-green-50/50 border-green-200 shadow-sm" : "bg-red-50/50 border-red-200 shadow-sm"}>
              <CardHeader className="pb-2 border-b border-inherit">
                <CardTitle className="text-lg flex items-center gap-2">
                  {data.status === "VALIDATED" ? (
                    <Trophy className="w-5 h-5 text-green-600" />
                  ) : (
                    <MessageCircle className="w-5 h-5 text-red-600" />
                  )}
                  {data.status === "VALIDATED" ? "Hasil Validasi" : "Catatan Guru"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {data.status === "VALIDATED" && (
                  <div className="text-center py-2 bg-white rounded-lg border-2 border-green-100 shadow-inner">
                    <span className="text-5xl font-black text-green-700 tracking-tighter">{data.validation.score}</span>
                    <span className="text-green-600 font-bold ml-1">/100</span>
                  </div>
                )}
                
                <div className={data.status === "VALIDATED" ? "text-green-800" : "text-red-800"}>
                  <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> 
                    Feedback dari Guru:
                  </p>
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-inherit text-sm leading-relaxed shadow-sm italic">
                    "{data.validation.feedback || "Tidak ada catatan tambahan."}"
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
             <Card className="bg-slate-50 border-slate-200 shadow-sm border-dashed">
                <CardContent className="py-10 text-center space-y-3">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                  <div>
                    <p className="text-sm font-bold text-slate-500">Menunggu Penilaian</p>
                    <p className="text-xs text-slate-400 mt-1">Belum ada guru yang memvalidasi kegiatan ini.</p>
                  </div>
                </CardContent>
             </Card>
          )}

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <CardTitle className="text-base">Informasi Pilar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div 
                className="p-4 rounded-xl text-white font-black text-center text-lg shadow-md tracking-tight"
                style={{ backgroundColor: data.pilar.colorHex }}
              >
                Pilar {data.pilar.code}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deskripsi Pilar:</p>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {data.pilar.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
