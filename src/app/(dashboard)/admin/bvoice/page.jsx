"use client";

import { useState, useEffect } from "react";
import { 
  FolderOpen, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  XCircle,
  MoreVertical,
  Trash2,
  Eye
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import toast from "react-hot-toast";

export default function AdminBVoicePage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
      toast.error("Gagal mengambil data B'Voice");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.student.name.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus portofolio ini? Tindakan ini tidak dapat dibatalkan.")) return;
    
    try {
      const res = await fetch(`/api/bvoice/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchData();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat menghapus");
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen B'Voice</h1>
          <p className="text-slate-500">Kelola semua portofolio dan laporan kegiatan siswa.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData}>
            Refresh Data
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Cari nama siswa atau judul..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Button 
                variant={statusFilter === "ALL" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setStatusFilter("ALL")}
              >
                Semua
              </Button>
              <Button 
                variant={statusFilter === "PENDING" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setStatusFilter("PENDING")}
              >
                Menunggu
              </Button>
              <Button 
                variant={statusFilter === "VALIDATED" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setStatusFilter("VALIDATED")}
              >
                Terverifikasi
              </Button>
              <Button 
                variant={statusFilter === "REJECTED" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setStatusFilter("REJECTED")}
              >
                Ditolak
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton columns={6} rows={5} />
          ) : filteredData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-[100px]">Tanggal</TableHead>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Pilar</TableHead>
                  <TableHead>Judul Kegiatan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-xs text-slate-500 font-medium">
                      {new Date(item.submittedAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{item.student.name}</div>
                      <div className="text-xs text-slate-500">{item.student.nisNip}</div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        style={{ 
                          backgroundColor: `${item.pilar.colorHex}15`, 
                          color: item.pilar.colorHex,
                          borderColor: `${item.pilar.colorHex}30` 
                        }}
                        className="font-semibold text-[10px] uppercase tracking-wider"
                      >
                        {item.pilar.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium text-slate-700">
                      {item.title}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="w-4 h-4" /> Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState 
              icon={FolderOpen}
              title="Tidak ada data B'Voice"
              description={search || statusFilter !== "ALL" ? "Coba ubah filter atau kata kunci pencarian Anda." : "Belum ada siswa yang mengunggah kegiatan B'Voice."}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
