"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar,
  Save,
  Loader2,
  KeyRound,
  BookOpen,
  FileText,
  Badge,
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

export default function ProfilGuruPage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/profile");
      const result = await res.json();
      if (result.success) {
        setProfile(result.data);
        setFormData(prev => ({
          ...prev,
          name: result.data.name,
          email: result.data.email || "",
          subject: result.data.teacher?.subject || "",
          bio: result.data.teacher?.bio || ""
        }));
      }
    } catch (err) {
      toast.error("Gagal memuat profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          bio: formData.bio
        })
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success("Profil berhasil diperbarui");
        fetchProfile(); // Refresh data
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Konfirmasi password tidak cocok");
    }
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success("Password berhasil diubah");
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Gagal mengubah password");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil Guru</h1>
        <p className="text-slate-500">Kelola informasi profesional dan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center overflow-hidden border-none shadow-sm">
            <div className="h-24 bg-blue-600" />
            <CardContent className="-mt-12 pb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white border-4 border-white shadow-md mb-3 overflow-hidden">
                <User className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{profile?.name}</h2>
              <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700 hover:bg-blue-100 uppercase tracking-wider text-[10px] font-bold">
                Tenaga Pendidik
              </Badge>
              
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-5 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">NIP (User ID)</p>
                    <p className="text-sm font-mono font-medium">{profile?.nisNip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Mata Pelajaran</p>
                    <p className="text-sm font-medium">{profile?.teacher?.subject || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Bergabung</p>
                    <p className="text-sm font-medium">{new Date(profile?.createdAt).toLocaleDateString("id-ID", { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Settings */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informasi Profesional
              </CardTitle>
              <CardDescription>Perbarui data diri dan biografi pengajar Anda.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Kerja</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="email@sekolah.sch.id"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Mata Pelajaran Utama</Label>
                  <Input 
                    id="subject" 
                    value={formData.subject} 
                    onChange={e => setFormData({...formData, subject: e.target.value})} 
                    placeholder="Contoh: IPA Terpadu (Pertanian)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografi Singkat</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tuliskan sedikit tentang latar belakang pendidikan atau fokus pengajaran Anda..."
                    className="min-h-[120px] resize-none"
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan Perubahan
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                Keamanan Akun
              </CardTitle>
              <CardDescription>Kelola password untuk menjaga keamanan akses portal Anda.</CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={formData.currentPassword}
                    onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                    required={!!formData.newPassword}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={formData.newPassword}
                      onChange={e => setFormData({...formData, newPassword: e.target.value})}
                      required={!!formData.currentPassword}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      required={!!formData.newPassword}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button type="submit" variant="outline" disabled={isSaving || !formData.newPassword}>
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
