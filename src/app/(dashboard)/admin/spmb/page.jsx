"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Eye, Trash2, Edit, ArrowLeft, Search, Users, Clock, CheckCircle, XCircle, Save, FileText, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSPMBPage() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Detail / Edit view
  const [selectedReg, setSelectedReg] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" | "detail" | "edit"
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/spmb");
      const json = await res.json();
      if (json.success) {
        setRegistrations(json.data);
      } else {
        toast.error("Gagal memuat data pendaftaran");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Filter and search
  const filteredData = registrations.filter((reg) => {
    const matchSearch =
      reg.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.previousSchool?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "ALL" || reg.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === "PENDING").length,
    accepted: registrations.filter((r) => r.status === "ACCEPTED").length,
    rejected: registrations.filter((r) => r.status === "REJECTED").length,
  };

  // Status update
  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`/api/spmb/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Status diperbarui menjadi ${status === "ACCEPTED" ? "Diterima" : "Ditolak"}`);
      fetchRegistrations();
      if (selectedReg?.id === id) {
        setSelectedReg({ ...selectedReg, status });
      }
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pendaftaran ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      const res = await fetch(`/api/spmb/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Data pendaftaran berhasil dihapus");
      setViewMode("list");
      setSelectedReg(null);
      fetchRegistrations();
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  // Open detail
  const openDetail = (reg) => {
    setSelectedReg(reg);
    setViewMode("detail");
  };

  // Open edit
  const openEdit = (reg) => {
    setSelectedReg(reg);
    setEditData({
      fullName: reg.fullName || "",
      birthPlace: reg.birthPlace || "",
      birthDate: reg.birthDate ? new Date(reg.birthDate).toISOString().split("T")[0] : "",
      gender: reg.gender || "",
      address: reg.address || "",
      previousSchool: reg.previousSchool || "",
      parentName: reg.parentName || "",
      parentPhone: reg.parentPhone || "",
      status: reg.status || "PENDING",
      adminNote: reg.adminNote || "",
    });
    setViewMode("edit");
  };

  // Save edit
  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/spmb/${selectedReg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error();
      toast.success("Data pendaftaran berhasil diperbarui");
      setViewMode("list");
      setSelectedReg(null);
      fetchRegistrations();
    } catch {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  };

  // Back to list
  const backToList = () => {
    setViewMode("list");
    setSelectedReg(null);
  };

  // --- DETAIL VIEW ---
  if (viewMode === "detail" && selectedReg) {
    const docs = selectedReg.documents || {};
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={backToList}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Detail Pendaftaran</h1>
            <p className="text-sm text-slate-500">ID: {selectedReg.registrationNumber || selectedReg.id}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => openEdit(selectedReg)}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(selectedReg.id)}>
              <Trash2 className="h-4 w-4 mr-2" /> Hapus
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-500">Status Saat Ini:</span>
                <StatusBadge status={selectedReg.status} />
              </div>
              {selectedReg.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(selectedReg.id, "ACCEPTED")}>
                    <Check className="h-4 w-4 mr-1" /> Terima
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(selectedReg.id, "REJECTED")}>
                    <X className="h-4 w-4 mr-1" /> Tolak
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Pribadi */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Data Pribadi Calon Siswa</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <InfoRow label="Nama Lengkap" value={selectedReg.fullName} />
              <InfoRow label="Tempat Lahir" value={selectedReg.birthPlace} />
              <InfoRow label="Tanggal Lahir" value={selectedReg.birthDate ? new Date(selectedReg.birthDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"} />
              <InfoRow label="Jenis Kelamin" value={selectedReg.gender} />
              <InfoRow label="Alamat" value={selectedReg.address} className="sm:col-span-2" />
              <InfoRow label="Asal Sekolah" value={selectedReg.previousSchool} />
              <InfoRow label="Tanggal Daftar" value={selectedReg.registeredAt ? new Date(selectedReg.registeredAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"} />
            </div>
          </CardContent>
        </Card>

        {/* Data Orang Tua */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Data Orang Tua / Wali</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <InfoRow label="Nama Orang Tua" value={selectedReg.parentName} />
              <InfoRow label="No. HP Orang Tua" value={selectedReg.parentPhone} />
            </div>
          </CardContent>
        </Card>

        {/* Dokumen */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Dokumen Persyaratan</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <DocLink label="Kartu Keluarga (KK)" url={docs.kk} />
              <DocLink label="Akta Kelahiran" url={docs.akta} />
              <DocLink label="Ijazah / SKL" url={docs.ijazah} />
            </div>
          </CardContent>
        </Card>

        {/* Catatan Admin */}
        {selectedReg.adminNote && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Catatan Admin</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedReg.adminNote}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // --- EDIT VIEW ---
  if (viewMode === "edit" && selectedReg) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={backToList}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Pendaftaran</h1>
            <p className="text-sm text-slate-500">{selectedReg.fullName}</p>
          </div>
          <Button className="ml-auto" onClick={handleSaveEdit} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" /> {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Data Pribadi</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input value={editData.fullName} onChange={(e) => setEditData({ ...editData, fullName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tempat Lahir</Label>
                <Input value={editData.birthPlace} onChange={(e) => setEditData({ ...editData, birthPlace: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Lahir</Label>
                <Input type="date" value={editData.birthDate} onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select value={editData.gender} onValueChange={(v) => setEditData({ ...editData, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Alamat Lengkap</Label>
              <Textarea value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Asal Sekolah</Label>
              <Input value={editData.previousSchool} onChange={(e) => setEditData({ ...editData, previousSchool: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Data Orang Tua / Wali</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Orang Tua</Label>
                <Input value={editData.parentName} onChange={(e) => setEditData({ ...editData, parentName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>No. HP Orang Tua</Label>
                <Input value={editData.parentPhone} onChange={(e) => setEditData({ ...editData, parentPhone: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Status & Catatan Admin</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status Pendaftaran</Label>
              <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACCEPTED">Diterima</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catatan Admin (Opsional)</Label>
              <Textarea
                value={editData.adminNote}
                onChange={(e) => setEditData({ ...editData, adminNote: e.target.value })}
                rows={4}
                placeholder="Tambahkan catatan mengenai pendaftar ini..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manajemen SPMB</h1>
        <p className="text-slate-500">Kelola seluruh pendaftaran siswa baru.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Pendaftar" value={stats.total} color="blue" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Menunggu" value={stats.pending} color="yellow" />
        <StatCard icon={<CheckCircle className="h-5 w-5" />} label="Diterima" value={stats.accepted} color="green" />
        <StatCard icon={<XCircle className="h-5 w-5" />} label="Ditolak" value={stats.rejected} color="red" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama, asal sekolah, atau nomor pendaftaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACCEPTED">Diterima</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">Memuat data pendaftaran...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-medium text-slate-700">Tidak ada data ditemukan</p>
              <p className="text-sm text-slate-500 mt-1">
                {searchQuery || filterStatus !== "ALL" ? "Coba ubah filter pencarian Anda." : "Belum ada pendaftaran yang masuk."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Asal Sekolah</TableHead>
                    <TableHead>Orang Tua</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((reg) => (
                    <TableRow key={reg.id} className="cursor-pointer hover:bg-slate-50" onClick={() => openDetail(reg)}>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(reg.registeredAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{reg.fullName}</p>
                          <p className="text-xs text-slate-400">{reg.gender}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{reg.previousSchool}</TableCell>
                      <TableCell className="text-sm">{reg.parentName}</TableCell>
                      <TableCell><StatusBadge status={reg.status} /></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Detail" onClick={() => openDetail(reg)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Edit" onClick={() => openEdit(reg)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {reg.status === "PENDING" && (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" title="Terima" onClick={() => handleStatusUpdate(reg.id, "ACCEPTED")}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" title="Tolak" onClick={() => handleStatusUpdate(reg.id, "REJECTED")}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" title="Hapus" onClick={() => handleDelete(reg.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatusBadge({ status }) {
  const map = {
    PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    ACCEPTED: { label: "Diterima", className: "bg-green-100 text-green-800 border-green-200" },
    REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const s = map[status] || map.PENDING;
  return <Badge variant="outline" className={s.className}>{s.label}</Badge>;
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="font-medium text-slate-800">{value || "-"}</p>
    </div>
  );
}

function DocLink({ label, url }) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md border border-dashed">
        <FileText className="h-4 w-4 text-slate-400" />
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-xs text-slate-400">Belum diunggah</p>
        </div>
      </div>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-green-50 rounded-md border border-green-200 hover:bg-green-100 transition-colors">
      <FileText className="h-4 w-4 text-green-600" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-green-800">{label}</p>
        <p className="text-xs text-green-600">Lihat Dokumen</p>
      </div>
      <ExternalLink className="h-3 w-3 text-green-500 shrink-0" />
    </a>
  );
}
