"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Calendar,
  Save,
  Loader2,
  KeyRound
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
import toast from "react-hot-toast";

export default function ProfilSiswaPage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
          email: result.data.email || ""
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
          email: formData.email
        })
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success("Profil berhasil diperbarui");
        setProfile(result.data);
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil Saya</h1>
        <p className="text-slate-500">Kelola informasi pribadi dan keamanan akun kamu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center overflow-hidden border-none shadow-sm">
            <div className="h-20 bg-primary/10" />
            <CardContent className="-mt-10 pb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-white shadow-md mb-3">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{profile?.name}</h2>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mt-1">Siswa</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 text-left">
                <div className="flex items-center gap-3 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <div className="text-sm">
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">NIS (User ID)</p>
                    <p className="font-mono">{profile?.nisNip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div className="text-sm">
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Terdaftar Sejak</p>
                    <p>{new Date(profile?.createdAt).toLocaleDateString("id-ID", { month: 'long', year: 'numeric' })}</p>
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
              <CardTitle className="text-lg">Informasi Dasar</CardTitle>
              <CardDescription>Perbarui nama dan alamat email kamu.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
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
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email"
                      className="pl-9"
                      placeholder="contoh@email.com"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan Perubahan
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Keamanan Akun</CardTitle>
              <CardDescription>Ubah password kamu secara berkala untuk keamanan.</CardDescription>
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
                  <KeyRound className="w-4 h-4 mr-2" />
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
