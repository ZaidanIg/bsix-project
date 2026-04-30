"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { BookOpen, Edit2, Upload } from "lucide-react";

export default function DataGuru() {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editForm, setEditForm] = useState({ subject: "", bio: "", photo: "" });

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/teachers");
      const __res = await res.json();
      if (!__res.success && __res.error) throw new Error(__res.error);
      const data = __res.data || __res;
      setTeachers(data);
    } catch (e) {
      toast.error("Gagal mengambil data guru");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openEdit = (teacher) => {
    setEditingTeacher(teacher);
    setEditForm({
      subject: teacher.subject || "",
      bio: teacher.bio || "",
      photo: teacher.photo || ""
    });
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/teachers/${editingTeacher.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Gagal menyimpan profil");

      toast.success("Profil guru berhasil diperbarui");
      setIsEditOpen(false);
      fetchTeachers();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Profil Guru</h1>
        <p className="text-muted-foreground">Kelola profil dan bio guru SMP Bina Harapan Jatigede.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Memuat profil guru...</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teachers.map(teacher => {
            const initials = teacher.user.name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();
            return (
              <Card key={teacher.id} className="overflow-hidden flex flex-col">
                <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                  <Badge variant={teacher.user.isActive ? "default" : "destructive"} className={`absolute top-3 right-3 ${teacher.user.isActive ? 'bg-green-500' : ''}`}>
                    {teacher.user.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                <CardContent className="pt-0 relative flex-1 flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 border-4 border-white shadow-sm -mt-10 mb-3 bg-white">
                    <AvatarImage src={teacher.photo || ""} className="object-cover" />
                    <AvatarFallback className="text-xl font-bold text-slate-400">{initials}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{teacher.user.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">{teacher.nip}</p>
                  
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="font-medium truncate max-w-[150px]">{teacher.subject}</span>
                  </div>

                  <p className="text-sm text-slate-600 mt-4 line-clamp-3 w-full px-2">
                    {teacher.bio || "Belum ada deskripsi profil (bio) yang ditambahkan."}
                  </p>
                </CardContent>
                <CardFooter className="border-t bg-slate-50 p-3 mt-auto">
                  <Button variant="outline" className="w-full text-xs" onClick={() => openEdit(teacher)}>
                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Profil
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL EDIT PROFIL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profil Guru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Guru (Read Only)</Label>
              <Input value={editingTeacher?.user.name || ""} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <Input 
                value={editForm.subject} 
                onChange={(e) => setEditForm({...editForm, subject: e.target.value})} 
                placeholder="Contoh: Matematika" 
              />
            </div>
            <div className="space-y-2">
              <Label>Bio / Deskripsi Singkat</Label>
              <Textarea 
                value={editForm.bio} 
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})} 
                placeholder="Deskripsi profil guru..."
                className="h-24"
              />
            </div>
            <div className="space-y-2">
              <Label>URL Foto</Label>
              <div className="flex gap-2">
                <Input 
                  value={editForm.photo} 
                  onChange={(e) => setEditForm({...editForm, photo: e.target.value})} 
                  placeholder="https://contoh.com/foto.jpg" 
                />
                {/* Cloudinary upload bisa diintegrasikan di sini dengan button khusus */}
                <Button variant="outline" size="icon" title="Upload ke Cloudinary (Simulasi)"><Upload className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
