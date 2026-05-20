"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InboxIcon, ChevronLeft, ChevronRight, Inbox, Eye, CheckCircle2, Clock, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function AntrianValidasi() {
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPilar, setFilterPilar] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("PENDING"); // Default ke pending
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bvoice");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const __res = await res.json();
      if (!__res.success && __res.error) throw new Error(__res.error);
      const data = __res.data || __res;
      setPortfolios(data);
    } catch (error) {
      toast.error("Gagal mengambil data B'Voice");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPortfolios = portfolios.filter((p) => {
    const matchesPilar = filterPilar === "ALL" || p.pilar.code === filterPilar;
    const matchesStatus = filterStatus === "ALL" || p.status === filterStatus;
    return matchesPilar && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPortfolios.length / itemsPerPage);
  const currentData = filteredPortfolios.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const pilars = [
    { code: "BSMART", name: "B'Smart" },
    { code: "BGREEN", name: "B'Green" },
    { code: "BLIFE", name: "B'Life" },
    { code: "BFUN", name: "B'Fun" },
    { code: "BPOINS", name: "B'Poins & Coin" },
    { code: "BMART", name: "B'Mart" },
  ];

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Validasi B'Voice</h1>
          <p className="text-muted-foreground">
            Tinjau dan berikan penilaian pada portofolio kegiatan siswa.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status:</span>
                <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); setPage(1); }}>
                    <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua</SelectItem>
                        <SelectItem value="PENDING">Menunggu</SelectItem>
                        <SelectItem value="VALIDATED">Terverifikasi</SelectItem>
                        <SelectItem value="REJECTED">Ditolak</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pilar:</span>
                <Select value={filterPilar} onValueChange={(val) => { setFilterPilar(val); setPage(1); }}>
                    <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Semua Pilar" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Semua Pilar</SelectItem>
                        {pilars.map(p => (
                            <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button variant="outline" size="sm" onClick={fetchPortfolios} className="h-9">
                Refresh
            </Button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton cols={5} rows={10} />
      ) : currentData.length > 0 ? (
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold">Kegiatan</TableHead>
                    <TableHead className="font-bold">Siswa</TableHead>
                    <TableHead className="font-bold">Pilar</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((portfolio) => (
                    <TableRow key={portfolio.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {portfolio.fileUrls && portfolio.fileUrls.length > 0 ? (
                            <div className="h-10 w-10 rounded-lg bg-slate-200 flex-shrink-0 overflow-hidden border">
                              <img src={portfolio.fileUrls[0]} alt="thumb" className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-slate-100 border flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] text-slate-400 font-bold">NO IMG</span>
                            </div>
                          )}
                          <div className="max-w-[200px]">
                            <div className="font-bold text-slate-800 truncate">{portfolio.title}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {format(new Date(portfolio.submittedAt), "dd MMM yyyy", { locale: id })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-700">{portfolio.student.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{portfolio.student.nisNip}</div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                            variant="secondary" 
                            style={{ 
                                backgroundColor: `${portfolio.pilar.colorHex}15`, 
                                color: portfolio.pilar.colorHex,
                                borderColor: `${portfolio.pilar.colorHex}30` 
                            }}
                            className="text-[10px] font-black uppercase tracking-tighter"
                        >
                          {portfolio.pilar.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(portfolio.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {portfolio.status === "PENDING" ? (
                            <Link href={`/guru/validasi/${portfolio.id}`}>
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-8 px-4 rounded-lg shadow-sm">
                                    Nilai Sekarang
                                </Button>
                            </Link>
                        ) : (
                            <Link href={`/guru/validasi/${portfolio.id}`}>
                                <Button size="sm" variant="outline" className="h-8 px-4 rounded-lg gap-1.5 font-bold">
                                    <Eye className="w-3.5 h-3.5" /> Detail
                                </Button>
                            </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/30">
                <div className="text-xs font-medium text-slate-500">
                  Menampilkan {currentData.length} dari {filteredPortfolios.length} data
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <div className="text-xs font-bold px-3">
                    {page} / {totalPages}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <EmptyState 
          icon={Inbox} 
          title="Tidak Ada Submission" 
          description={filterStatus !== "PENDING" ? "Belum ada kegiatan dengan status ini." : "Semua kegiatan telah divalidasi. Kerja bagus!"}
          className="bg-white border rounded-xl py-24 shadow-sm"
        />
      )}
    </div>
  );
}
