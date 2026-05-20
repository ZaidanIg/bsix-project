"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Leaf, 
  Shield, 
  BookOpen, 
  Target, 
  Users, 
  Award,
  Search,
  MoreVertical,
  Loader2
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
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
import toast from "react-hot-toast";

const ICON_OPTIONS = [
  { value: "Leaf", icon: Leaf },
  { value: "Shield", icon: Shield },
  { value: "BookOpen", icon: BookOpen },
  { value: "Target", icon: Target },
  { value: "Users", icon: Users },
  { value: "Award", icon: Award },
];

export default function AdminPilarPage() {
  const [pilars, setPilars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPilar, setSelectedPilar] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    icon: "Leaf",
    colorHex: "#16a34a"
  });

  useEffect(() => {
    fetchPilars();
  }, []);

  const fetchPilars = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/pilar");
      const result = await res.json();
      if (result.success) {
        setPilars(result.data);
      }
    } catch (err) {
      toast.error("Gagal memuat data pilar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (pilar = null) => {
    if (pilar) {
      setSelectedPilar(pilar);
      setFormData({
        code: pilar.code,
        name: pilar.name,
        description: pilar.description,
        icon: pilar.icon,
        colorHex: pilar.colorHex
      });
    } else {
      setSelectedPilar(null);
      setFormData({
        code: "",
        name: "",
        description: "",
        icon: "Leaf",
        colorHex: "#16a34a"
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    try {
      const method = selectedPilar ? "PUT" : "POST";
      const url = selectedPilar ? `/api/admin/pilar/${selectedPilar.id}` : "/api/admin/pilar";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (result.success) {
        toast.success(selectedPilar ? "Pilar diperbarui" : "Pilar baru ditambahkan");
        setIsDialogOpen(false);
        fetchPilars();
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
    if (!selectedPilar) return;
    setIsSubmitLoading(true);

    try {
      const res = await fetch(`/api/admin/pilar/${selectedPilar.id}`, {
        method: "DELETE"
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Pilar berhasil dihapus");
        setIsDeleteDialogOpen(false);
        fetchPilars();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Gagal menghapus pilar");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const filteredPilars = pilars.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Program B'Six</h1>
          <p className="text-slate-500">Kelola 6 pilar unggulan pendidikan karakter BMSF.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Tambah Pilar
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Cari pilar..." 
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
                  <TableHead className="w-[80px]">Icon</TableHead>
                  <TableHead>Nama Pilar</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead className="max-w-[300px]">Deskripsi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPilars.map((p) => {
                  const IconComp = ICON_OPTIONS.find(i => i.value === p.icon)?.icon || Leaf;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: `${p.colorHex}15`, color: p.colorHex }}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">{p.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold uppercase tracking-wider">
                          {p.code}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleOpenDialog(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedPilar(p);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedPilar ? "Edit Pilar B'Six" : "Tambah Pilar B'Six Baru"}</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah ini untuk mengelola informasi pilar program.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Pilar</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Contoh: B'Smart"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Kode Pilar</Label>
                <Input 
                  id="code" 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value})} 
                  placeholder="Contoh: BSMART"
                  className="uppercase"
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Jelaskan filosofi dan tujuan pilar ini..."
                className="min-h-[100px]"
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pilih Ikon</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({...formData, icon: opt.value})}
                      className={`p-2 rounded-lg border flex items-center justify-center transition-all ${formData.icon === opt.value ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-slate-50'}`}
                    >
                      <opt.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Warna Pilar</Label>
                <div className="flex gap-2">
                  <Input 
                    id="color" 
                    type="color" 
                    value={formData.colorHex} 
                    onChange={e => setFormData({...formData, colorHex: e.target.value})} 
                    className="w-12 h-11 p-1"
                  />
                  <Input 
                    value={formData.colorHex} 
                    onChange={e => setFormData({...formData, colorHex: e.target.value})} 
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitLoading}>
                {isSubmitLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedPilar ? "Simpan Perubahan" : "Tambah Pilar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pilar B'Six?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pilar <strong>{selectedPilar?.name}</strong>? Tindakan ini akan gagal jika ada portofolio siswa yang sudah terdaftar menggunakan pilar ini.
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
