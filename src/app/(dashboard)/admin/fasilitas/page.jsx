"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { UploadButton } from "@/lib/uploadthing";

export default function AdminFasilitasPage() {
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    isActive: true
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/facilities");
      const result = await res.json();
      if (result.success) {
        setFacilities(result.data);
      }
    } catch (err) {
      toast.error("Gagal memuat data fasilitas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (facility = null) => {
    if (facility) {
      setSelectedFacility(facility);
      setFormData({
        name: facility.name,
        description: facility.description,
        imageUrl: facility.imageUrl || "",
        isActive: facility.isActive
      });
    } else {
      setSelectedFacility(null);
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        isActive: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    try {
      const method = selectedFacility ? "PUT" : "POST";
      const url = selectedFacility ? `/api/admin/facilities/${selectedFacility.id}` : "/api/admin/facilities";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (result.success) {
        toast.success(selectedFacility ? "Fasilitas diperbarui" : "Fasilitas baru ditambahkan");
        setIsDialogOpen(false);
        fetchFacilities();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Gagal menyimpan data");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFacility) return;
    setIsSubmitLoading(true);

    try {
      const res = await fetch(`/api/admin/facilities/${selectedFacility.id}`, {
        method: "DELETE"
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Fasilitas berhasil dihapus");
        setIsDeleteDialogOpen(false);
        fetchFacilities();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Gagal menghapus fasilitas");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Fasilitas</h1>
          <p className="text-slate-500">Kelola sarana dan prasarana pendukung belajar di BMSF.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Tambah Fasilitas
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Cari fasilitas..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[100px]">Foto</TableHead>
                  <TableHead>Nama Fasilitas</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFacilities.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      {f.imageUrl ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border">
                          <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">{f.name}</TableCell>
                    <TableCell className="max-w-[400px]">
                      <p className="text-sm text-slate-500 line-clamp-2">{f.description}</p>
                    </TableCell>
                    <TableCell>
                      {f.isActive ? (
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-full text-xs font-bold">
                          <XCircle className="w-3 h-3" /> Nonaktif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleOpenDialog(f)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedFacility(f);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedFacility ? "Edit Fasilitas" : "Tambah Fasilitas Baru"}</DialogTitle>
            <DialogDescription>Masukkan informasi fasilitas sekolah.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Fasilitas</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Contoh: Green House"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Jelaskan kegunaan fasilitas ini..."
                className="min-h-[100px]"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>Foto Fasilitas</Label>
              <div className="flex items-center gap-4">
                {formData.imageUrl && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      setFormData({ ...formData, imageUrl: res[0].url });
                      toast.success("Gambar berhasil diunggah");
                    }
                  }}
                  onUploadError={(error) => {
                    toast.error(`Gagal upload: ${error.message}`);
                  }}
                  appearance={{
                    button: "bg-slate-100 hover:bg-slate-200 text-slate-900 border text-sm h-10 px-4",
                    allowedContent: "hidden"
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="active" className="cursor-pointer">Status Aktif</Label>
              <Switch 
                id="active" 
                checked={formData.isActive}
                onCheckedChange={(val) => setFormData({...formData, isActive: val})}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitLoading}>
                {isSubmitLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedFacility ? "Simpan Perubahan" : "Tambah Fasilitas"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Fasilitas?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{selectedFacility?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitLoading}
            >
              {isSubmitLoading ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
