"use client";

import { useState, useEffect } from "react";
import { 
  FolderOpen, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Eye,
  Calendar,
  MessageCircle,
  Trophy
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import toast from "react-hot-toast";
import Link from "next/link";

export default function PortofolioSiswaPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bvoice");
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      toast.error("Gagal mengambil data portofolio");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = data.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.pilar.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "VALIDATED":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Terverifikasi</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Ditolak</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"><Clock className="w-3 h-3 mr-1" /> Menunggu</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portofolio Saya</h1>
          <p className="text-slate-500">Riwayat seluruh kegiatan B'Six yang telah kamu upload.</p>
        </div>
        <Link href="/siswa/upload">
          <Button className="bg-primary hover:bg-primary/90">
            Upload Kegiatan Baru
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari judul kegiatan atau pilar..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-[250px] bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow border-slate-200">
              <div 
                className="h-2 w-full" 
                style={{ backgroundColor: item.pilar.colorHex }}
              />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <Badge 
                    variant="outline"
                    style={{ 
                      color: item.pilar.colorHex, 
                      borderColor: `${item.pilar.colorHex}50`,
                      backgroundColor: `${item.pilar.colorHex}10`
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider"
                  >
                    {item.pilar.name}
                  </Badge>
                  {getStatusBadge(item.status)}
                </div>
                <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.submittedAt).toLocaleDateString("id-ID", { 
                    day: "numeric", 
                    month: "long", 
                    year: "numeric" 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                  {item.description}
                </p>

                {item.status === "VALIDATED" && item.validation && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-green-800 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Skor Akhir
                      </span>
                      <span className="text-lg font-bold text-green-700">{item.validation.score}/100</span>
                    </div>
                    {item.validation.feedback && (
                      <p className="text-xs text-green-600 italic line-clamp-2">
                        "{item.validation.feedback}"
                      </p>
                    )}
                  </div>
                )}

                {item.status === "REJECTED" && item.validation && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-xs font-semibold text-red-800 flex items-center gap-1 mb-1">
                      <MessageCircle className="w-3 h-3" /> Catatan Guru
                    </span>
                    <p className="text-xs text-red-600 italic">
                      {item.validation.feedback || "Kegiatan tidak disetujui."}
                    </p>
                  </div>
                )}

                <Button variant="outline" className="w-full text-xs h-8" asChild>
                  <Link href={`/siswa/portofolio/${item.id}`}>
                    <Eye className="w-3 h-3 mr-2" /> Lihat Detail
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={FolderOpen}
          title="Belum ada portofolio"
          description={search ? "Tidak ada kegiatan yang cocok dengan pencarianmu." : "Kamu belum pernah mengupload kegiatan B'Six. Mulailah mengupload sekarang!"}
        />
      )}
    </div>
  );
}
