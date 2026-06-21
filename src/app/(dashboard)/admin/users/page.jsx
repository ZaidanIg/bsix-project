"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import Papa from "papaparse";
import { Upload, Plus, Pencil, Power, PowerOff, Key, Users, Loader2, Edit } from "lucide-react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
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

const generatePassword = () => {
  return Math.random().toString(36).slice(-8); // 8 char random alfanumerik
};

export default function UserManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "siswa";

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States untuk modal Tambah User
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [role, setRole] = useState("SISWA"); // atau GURU
  const [formData, setFormData] = useState({ nisNik: "", name: "", email: "", subject: "", bio: "" });
  const [generatedPwd, setGeneratedPwd] = useState("");

  // States untuk Aksi (Edit, Reset, Toggle)
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [isSuccessPwdOpen, setIsSuccessPwdOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

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

  const handleTabChange = (value) => {
    router.push(`/admin/users?tab=${value}`);
  };

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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Data user berhasil diperbarui");
        setIsEditOpen(false);
        fetchUsers();
      }
    } catch (e) {
      toast.error("Gagal memperbarui data");
    }
  };

  const handleToggleActive = async () => {
    const id = selectedUser.id;
    const currentStatus = selectedUser.isActive;
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
    } finally {
      setIsToggleOpen(false);
    }
  };

  const handleResetPassword = async () => {
    const id = selectedUser.id;
    const pwd = generatePassword();
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetPassword: pwd })
      });
      if (res.ok) {
        setNewPassword(pwd);
        setIsSuccessPwdOpen(true);
      }
    } catch (e) {
      toast.error("Gagal reset password");
    } finally {
      setIsResetOpen(false);
    }
  };

  // CSV Upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const targetRole = currentTab.toUpperCase();

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validUsers = results.data
          .filter(r => r.nisNik && r.name)
          .map(r => ({
            nisNik: r.nisNik,
            name: r.name,
            email: r.email || null,
            password: generatePassword(),
            role: targetRole,
            subject: targetRole === "GURU" ? (r.subject || "Umum") : null,
            bio: targetRole === "GURU" ? (r.bio || null) : null
          }));

        if (validUsers.length === 0) {
          setIsImporting(false);
          return toast.error("Format CSV tidak valid / kosong");
        }

        try {
          const res = await fetch("/api/users/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ users: validUsers })
          });
          const result = await res.json();
          toast.success(`Berhasil import ${result.created} data ${targetRole.toLowerCase()}`);
          if (result.errors?.length > 0) {
            console.error(result.errors);
            toast(`Ada ${result.errors.length} data gagal. Cek console.`, { icon: '⚠️' });
          }
          fetchUsers();
        } catch (e) {
          toast.error("Gagal import CSV");
        } finally {
          setIsImporting(false);
          e.target.value = ""; // Reset input
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
              <TableHead>NIS/NIK</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nisNik}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email || "-"}</TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? "default" : "destructive"} className={u.isActive ? "bg-green-100 text-green-800" : ""}>
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => {
                      setSelectedUser(u);
                      setFormData({ 
                        nisNik: u.nisNik, 
                        name: u.name, 
                        email: u.email || "", 
                        subject: u.teacher?.subject || "", 
                        bio: u.teacher?.bio || "" 
                      });
                      setIsEditOpen(true);
                    }} 
                    title="Edit User"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => {
                      setSelectedUser(u);
                      setIsResetOpen(true);
                    }} 
                    title="Reset Password"
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={u.isActive ? "destructive" : "default"} 
                    size="icon" 
                    onClick={() => {
                      setSelectedUser(u);
                      setIsToggleOpen(true);
                    }} 
                    title={u.isActive ? "Nonaktifkan" : "Aktifkan"}
                  >
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
      {/* ... (Previous header and actions part) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Data {currentTab === "siswa" ? "Siswa" : "Guru"}
          </h1>
          <p className="text-muted-foreground">
            Manajemen akun {currentTab === "siswa" ? "Siswa" : "Guru"} di sistem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Import CSV Dialog */}
          <Dialog>
            <DialogTrigger render={
              <Button variant="outline" disabled={isImporting}>
                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Import CSV {currentTab === "siswa" ? "Siswa" : "Guru"}
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Import Data {currentTab === "siswa" ? "Siswa" : "Guru"} via CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
                  <p className="font-semibold mb-2">Petunjuk Format CSV:</p>
                  <ul className="list-disc list-inside space-y-1 opacity-90">
                    <li>Gunakan baris pertama sebagai header.</li>
                    <li>Kolom wajib: <strong>nisNik</strong>, <strong>name</strong>.</li>
                    <li>Kolom opsional: <strong>email</strong>.</li>
                    {currentTab === "guru" && (
                      <>
                        <li>Kolom opsional Guru: <strong>subject</strong>, <strong>bio</strong>.</li>
                      </>
                    )}
                    <li>Password akan di-generate secara otomatis.</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <Label>Pilih File CSV</Label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
                    <Input 
                      type="file" 
                      accept=".csv" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleCSVUpload} 
                      disabled={isImporting}
                    />
                    {isImporting ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-sm font-medium text-slate-600">Sedang memproses data...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2" />
                        <p className="text-sm font-medium text-slate-600">Klik atau drop file CSV di sini</p>
                        <p className="text-xs text-slate-400 mt-1">Hanya mendukung format .csv</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <p className="text-[10px] text-slate-400 text-center w-full italic">
                  Pastikan data tidak duplikat dengan NIS/NIK yang sudah ada di sistem.
                </p>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if(!open) { 
              setGeneratedPwd(""); 
              setFormData({ nisNik: "", name: "", email: "", subject: "", bio: "" }); 
            }
            if(open) { 
              setRole(currentTab.toUpperCase()); 
            }
          }}>
            <DialogTrigger render={
              <Button className={currentTab === "guru" ? "bg-blue-600 hover:bg-blue-700" : ""}>
                <Plus className="mr-2 h-4 w-4" /> 
                Tambah {currentTab === "siswa" ? "Siswa" : "Guru"}
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Tambah Data {currentTab === "siswa" ? "Siswa" : "Guru"}</DialogTitle>
              </DialogHeader>
              {!generatedPwd ? (
                <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input value={role} disabled className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>{role === "SISWA" ? "NIS" : "NIK"}</Label>
                      <Input 
                        required 
                        placeholder={role === "SISWA" ? "Masukkan NIS" : "Masukkan NIK"}
                        value={formData.nisNik} 
                        onChange={e => setFormData({...formData, nisNik: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input 
                      required 
                      placeholder="Nama lengkap sesuai identitas"
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (Opsional)</Label>
                    <Input 
                      type="email" 
                      placeholder="contoh@email.com"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                  {role === "GURU" && (
                    <>
                      <div className="space-y-2">
                        <Label>Mata Pelajaran</Label>
                        <Input 
                          required 
                          placeholder="Contoh: Matematika, IPA, dll"
                          value={formData.subject} 
                          onChange={e => setFormData({...formData, subject: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Biografi Singkat</Label>
                        <textarea 
                          className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Ceritakan sedikit tentang guru ini..."
                          value={formData.bio}
                          onChange={e => setFormData({...formData, bio: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                  <Button type="submit" className="w-full">Simpan & Generate Password</Button>
                </form>
              ) : (
                <div className="space-y-4 py-4 text-center bg-green-50/50 rounded-lg border border-green-100">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Key className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-green-700">Akun Berhasil Dibuat!</h3>
                  <p className="text-sm text-slate-600 px-6">Berikan password sementara ini kepada pengguna. Password ini hanya ditampilkan sekali demi keamanan.</p>
                  <div className="text-3xl font-mono tracking-widest font-bold bg-white border shadow-sm p-4 rounded-md mx-6 select-all">
                    {generatedPwd}
                  </div>
                  <div className="px-6">
                    <Button onClick={() => setIsAddOpen(false)} className="w-full">Tutup & Selesai</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsContent value="siswa">
          {isLoading ? <TableSkeleton cols={5} /> : renderTable("SISWA")}
        </TabsContent>
        <TabsContent value="guru">
          {isLoading ? <TableSkeleton cols={5} /> : renderTable("GURU")}
        </TabsContent>
      </Tabs>

      {/* --- ACTION MODALS --- */}
      
      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Data {selectedUser?.role === "GURU" ? "Guru" : "Siswa"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>NIS/NIK</Label>
              <Input value={formData.nisNik} disabled className="bg-slate-50 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            {selectedUser?.role === "GURU" && (
              <>
                <div className="space-y-2">
                  <Label>Mata Pelajaran</Label>
                  <Input 
                    required 
                    value={formData.subject} 
                    onChange={e => setFormData({...formData, subject: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Biografi</Label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
              </>
            )}
            <Button type="submit" className="w-full">Simpan Perubahan</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Confirmation */}
      <AlertDialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password Akun?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghasilkan password baru secara acak untuk user <strong>{selectedUser?.name}</strong>. User harus menggunakan password baru tersebut untuk login kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} className="bg-blue-600 hover:bg-blue-700">
              Ya, Reset Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Confirmation */}
      <AlertDialog open={isToggleOpen} onOpenChange={setIsToggleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedUser?.isActive ? "Nonaktifkan" : "Aktifkan"} Akun?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin {selectedUser?.isActive ? "menonaktifkan" : "mengaktifkan kembali"} akun <strong>{selectedUser?.name}</strong>?
              {selectedUser?.isActive && " User tidak akan bisa login ke sistem selama akun dinonaktifkan."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleActive} 
              className={selectedUser?.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              Ya, {selectedUser?.isActive ? "Nonaktifkan" : "Aktifkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Password Modal */}
      <Dialog open={isSuccessPwdOpen} onOpenChange={setIsSuccessPwdOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center">Password Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Key className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-500 px-4">
              Password berhasil direset. Silakan salin password baru ini dan berikan kepada user:
            </p>
            <div className="text-2xl font-mono tracking-widest font-bold bg-slate-50 border p-3 rounded mx-4 select-all">
              {newPassword}
            </div>
            <Button onClick={() => setIsSuccessPwdOpen(false)} variant="outline" className="w-full">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
