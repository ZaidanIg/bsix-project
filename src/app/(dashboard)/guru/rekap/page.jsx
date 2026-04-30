"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Download, 
  Search, 
  FileSpreadsheet,
  AlertCircle
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import toast from "react-hot-toast";
import Papa from "papaparse";

export default function RekapSiswaPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/guru/rekap");
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || "Gagal mengambil data rekap");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRekap = data?.rekap.filter(student => 
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.nisNip.includes(search)
  ) || [];

  const handleExportCSV = () => {
    if (!data) return;

    const exportData = filteredRekap.map(student => {
      const row = {
        "Nama Siswa": student.name,
        "NIS": student.nisNip,
      };
      data.pilars.forEach(p => {
        row[p.name] = student.scores[p.code] || "-";
      });
      return row;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Nilai_BVoice_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Berhasil mengekspor data ke CSV");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rekap Nilai Siswa</h1>
          <p className="text-slate-500">Pantau pencapaian pilar B'Six seluruh siswa.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={isLoading || !data}>
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={fetchData} variant="secondary">Refresh</Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b bg-slate-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Cari nama atau NIS siswa..." 
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
              <AlertCircle className="w-3 h-3" />
              <span>Hanya menampilkan nilai yang sudah divalidasi</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton columns={8} rows={10} />
          ) : filteredRekap.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="w-[250px] font-bold text-slate-700">Nama Siswa</TableHead>
                    <TableHead className="w-[120px] font-bold text-slate-700">NIS</TableHead>
                    {data.pilars.map(pilar => (
                      <TableHead key={pilar.id} className="text-center font-bold text-slate-700 min-w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] uppercase tracking-wider opacity-60">{pilar.code}</span>
                          <span className="text-xs">{pilar.name}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRekap.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900">{student.name}</TableCell>
                      <TableCell className="text-slate-500 font-mono text-xs">{student.nisNip}</TableCell>
                      {data.pilars.map(pilar => {
                        const score = student.scores[pilar.code];
                        return (
                          <TableCell key={pilar.id} className="text-center">
                            {score !== null ? (
                              <div 
                                className="inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm"
                                style={{ 
                                  backgroundColor: `${pilar.colorHex}15`, 
                                  color: pilar.colorHex,
                                  border: `1px solid ${pilar.colorHex}30`
                                }}
                              >
                                {score}
                              </div>
                            ) : (
                              <span className="text-slate-300 font-bold">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState 
              icon={BarChart}
              title="Tidak ada data ditemukan"
              description="Pastikan siswa sudah mengunggah kegiatan dan Anda sudah memberikan penilaian."
            />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="text-blue-600 font-bold text-2xl">{data?.rekap.length || 0}</div>
            <p className="text-blue-800 text-sm font-medium">Total Siswa Aktif</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="pt-6">
            <div className="text-green-600 font-bold text-2xl">
              {data?.rekap.reduce((acc, s) => acc + Object.values(s.scores).filter(v => v !== null).length, 0) || 0}
            </div>
            <p className="text-green-800 text-sm font-medium">Total Pilar Tervalidasi</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="pt-6">
            <div className="text-amber-600 font-bold text-2xl">
              {Math.round(data?.rekap.reduce((acc, s) => {
                const scores = Object.values(s.scores).filter(v => v !== null);
                return acc + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
              }, 0) / (data?.rekap.length || 1)) || 0}
            </div>
            <p className="text-amber-800 text-sm font-medium">Rata-rata Skor Global</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
