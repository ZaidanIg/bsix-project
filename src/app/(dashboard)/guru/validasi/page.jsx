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
import { InboxIcon, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import toast from "react-hot-toast";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function AntrianValidasi() {
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPilar, setFilterPilar] = useState("ALL");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPending = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/bvoice?status=PENDING");
        if (!res.ok) throw new Error("Gagal mengambil data");
        const __res = await res.json();
      if (!__res.success && __res.error) throw new Error(__res.error);
      const data = __res.data || __res;
        setPortfolios(data);
      } catch (error) {
        toast.error("Gagal mengambil antrian validasi");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPending();
  }, []);

  const filteredPortfolios = portfolios.filter((p) => {
    if (filterPilar === "ALL") return true;
    return p.pilar.code === filterPilar;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Antrian Validasi</h1>
          <p className="text-muted-foreground">
            Daftar kegiatan siswa yang menunggu penilaian Anda.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 font-medium">Filter Pilar:</span>
          <Select value={filterPilar} onValueChange={(val) => { setFilterPilar(val); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
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
      </div>

      {isLoading ? (
        <TableSkeleton cols={5} rows={10} />
      ) : currentData.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kegiatan</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Pilar</TableHead>
                    <TableHead>Tanggal Submit</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((portfolio) => (
                    <TableRow key={portfolio.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {portfolio.fileUrls && portfolio.fileUrls.length > 0 ? (
                            <div className="h-10 w-10 rounded bg-slate-200 flex-shrink-0 overflow-hidden">
                              <img src={portfolio.fileUrls[0]} alt="thumb" className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded bg-slate-100 border flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-slate-400">No Img</span>
                            </div>
                          )}
                          <div className="max-w-[200px] truncate font-medium">
                            {portfolio.title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{portfolio.student.name}</div>
                        <div className="text-xs text-slate-500">{portfolio.student.nisNip}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" style={{ borderColor: portfolio.pilar.colorHex, color: portfolio.pilar.colorHex }}>
                          {portfolio.pilar.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(portfolio.submittedAt), "dd MMM yyyy", { locale: id })}
                        </div>
                        <div className="text-xs text-slate-500">
                          {format(new Date(portfolio.submittedAt), "HH:mm", { locale: id })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/guru/validasi/${portfolio.id}`}>
                          <Button size="sm" variant="default">Nilai Sekarang</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-slate-500">
                  Halaman {page} dari {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
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
          description="Belum ada kegiatan yang menunggu validasi saat ini atau tidak sesuai filter."
          className="bg-white border rounded-lg py-20"
        />
      )}
    </div>
  );
}
