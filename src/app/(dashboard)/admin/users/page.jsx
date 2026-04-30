"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import Papa from "papaparse";
import { Upload, Plus, Pencil, Power, PowerOff, Key, Users } from "lucide-react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const generatePassword = () => {
  return Math.random().toString(36).slice(-8); // 8 char random alfanumerik
};

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States untuk modal Tambah User
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [role, setRole] = useState("SISWA"); // atau GURU
  const [formData, setFormData] = useState({ nisNip: "", name: "", email: "", subject: "", bio: "" });
  const [generatedPwd, setGeneratedPwd] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      const __res = await res.json();
      if (!__res.success && __res.error) throw new Error(__res.error);
      const data = __res.data || __res;
      setUsers(data);
    } catch (e) {
      toast.error("Gagal memuat pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const pwd = generatePassword();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role, password: pwd })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }
      setGeneratedPwd(pwd);
      toast.success("User berhasil ditambahkan!");
      fetchUsers();
      // Jangan langsung tutup modal agar admin bisa copy password
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        toast.success(`User ${currentStatus ? 'dinonaktifkan' : 'diaktifkan'}`);
        fetchUsers();
      }
    } catch (e) {
      toast.error("Gagal update status");
    }
  };

  const handleResetPassword = async (id) => {
    if (!confirm("Yakin ingin mereset password akun ini?")) return;
    const newPwd = generatePassword();
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetPassword: newPwd })
      });
      if (res.ok) {
        prompt("Password berhasil direset. Simpan password baru ini:", newPwd);
      }
    } catch (e) {
      toast.error("Gagal reset password");
    }
  };

  // CSV Upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validUsers = results.data
          .filter(r => r.nisNip && r.name)
          .map(r => ({
            nisNip: r.nisNip,
            name: r.name,
            email: r.email || null,
            password: generatePassword(),
            role: "SISWA"
          }));

        if (validUsers.length === 0) {
          return toast.error("Format CSV tidak valid / kosong");
        }

        try {
          toast(`Memproses ${validUsers.length} data...`, { icon: 'ℹ️' });
          const res = await fetch("/api/users/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ users: validUsers })
          });
          const result = await res.json();
          toast.success(`Berhasil import ${result.created} data`);
          if (result.errors?.length > 0) {
            console.error(result.errors);
            toast(`Ada ${result.errors.length} data gagal. Cek console.`, { icon: '⚠️' });
          }
          fetchUsers();
        } catch (e) {
          toast.error("Gagal import CSV");
        }
      }
    });
  };

  const renderTable = (roleFilter) => {
    const filtered = users.filter(u => u.role === roleFilter);
    
    if (filtered.length === 0) {
      return (
        <EmptyState 
          icon={Users} 
          title={`Data ${roleFilter.toLowerCase()} Kosong`} 
          description={`Belum ada data ${roleFilter.toLowerCase()} yang terdaftar di sistem.`}
          className="bg-white border rounded-lg mt-4"
        />
      );
    }

    return (
      <div className="border rounded-lg bg-white mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIS/NIP</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nisNip}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email || "-"}</TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? "default" : "destructive"} className={u.isActive ? "bg-green-100 text-green-800" : ""}>
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleResetPassword(u.id)} title="Reset Password">
                    <Key className="h-4 w-4" />
                  </Button>
                  <Button variant={u.isActive ? "destructive" : "default"} size="icon" onClick={() => handleToggleActive(u.id, u.isActive)} title={u.isActive ? "Nonaktifkan" : "Aktifkan"}>
                    {u.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen User</h1>
          <p className="text-muted-foreground">Kelola akun Siswa dan Guru.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Import CSV (hanya untuk siswa) */}
          <div className="relative">
            <Input type="file" accept=".csv" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" onChange={handleCSVUpload} />
            <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import CSV Siswa</Button>
          </div>

          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if(!open) { setGeneratedPwd(""); setFormData({ nisNip: "", name: "", email: "", subject: "", bio: "" }); }
          }}>
            <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Tambah User</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Akun Baru</DialogTitle>
              </DialogHeader>
              {!generatedPwd ? (
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <select className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="SISWA">Siswa</option>
                      <option value="GURU">Guru</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{role === "SISWA" ? "NIS" : "NIP"}</Label>
                    <Input required value={formData.nisNip} onChange={e => setFormData({...formData, nisNip: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (Opsional)</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  {role === "GURU" && (
                    <div className="space-y-2">
                      <Label>Mata Pelajaran</Label>
                      <Input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                    </div>
                  )}
                  <Button type="submit" className="w-full">Simpan & Generate Password</Button>
                </form>
              ) : (
                <div className="space-y-4 py-4 text-center bg-slate-50 rounded-lg border">
                  <h3 className="text-lg font-medium text-green-600">Berhasil!</h3>
                  <p className="text-sm text-slate-500">Berikan password ini kepada pengguna. Password ini hanya ditampilkan sekali.</p>
                  <div className="text-2xl font-mono tracking-widest font-bold bg-white border p-3 rounded mx-4 select-all">
                    {generatedPwd}
                  </div>
                  <Button onClick={() => setIsAddOpen(false)} variant="outline" className="mt-2">Tutup</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="siswa" className="w-full">
        <TabsList>
          <TabsTrigger value="siswa">Data Siswa</TabsTrigger>
          <TabsTrigger value="guru">Data Guru</TabsTrigger>
        </TabsList>
        <TabsContent value="siswa">
          {isLoading ? <TableSkeleton cols={5} /> : renderTable("SISWA")}
        </TabsContent>
        <TabsContent value="guru">
          {isLoading ? <TableSkeleton cols={5} /> : renderTable("GURU")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
