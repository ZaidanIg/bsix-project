"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar,
  Save,
  Loader2,
  KeyRound,
  ShieldAlert,
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
import { UploadButton } from "@/lib/uploadthing";
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui/avatar";

export default function ProfilAdminPage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
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

  const handleImageUpload = async (url) => {
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url })
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success("Foto profil diperbarui");
        setProfile(prev => ({ ...prev, image: url }));
        await update({ image: url });
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Gagal memperbarui foto profil");
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
        await update({ name: formData.name });
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

  const initials = profile?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "A";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil Admin</h1>
        <p className="text-slate-500">Kelola informasi akun administrator Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center overflow-hidden border-none shadow-sm">
            <div className="h-20 bg-slate-800" />
            <CardContent className="-mt-10 pb-6 flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="w-28 h-28 border-4 border-white shadow-xl relative overflow-hidden">
                    <AvatarImage src={profile?.image} alt={profile?.name} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 text-slate-700 text-3xl font-bold">
                      {initials}
                    </AvatarFallback>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </Avatar>
                </div>
                <div className="mt-4 flex flex-col items-center">
                  <UploadButton
                    endpoint="imageUploader"
                    onUploadBegin={() => setIsUploading(true)}
                    onClientUploadComplete={(res) => {
                      setIsUploading(false);
                      if (res?.[0]) {
                        handleImageUpload(res[0].url);
                      }
                    }}
                    onUploadError={(error) => {
                      setIsUploading(false);
                      toast.error(`Gagal upload: ${error.message}. Pastikan UPLOADTHING_TOKEN sudah diatur.`);
                    }}
                    appearance={{
                      button: `bg-slate-800 hover:bg-slate-900 text-white rounded-full text-[10px] h-8 px-4 transition-all shadow-sm font-bold uppercase tracking-wider ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`,
                      allowedContent: "hidden",
                    }}
                    content={{
                      button({ ready }) {
                        if (isUploading) return "Mengunggah...";
                        if (ready) return "Ubah Foto";
                        return "Menyiapkan...";
                      },
                    }}
                  />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-4">{profile?.name}</h2>
              <div className="flex items-center gap-1.5 justify-center mt-1 text-slate-500">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Administrator</span>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-5 text-left w-full">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">ID Admin</p>
                    <p className="text-sm font-mono font-medium">{profile?.nisNik}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Akses Sejak</p>
                    <p className="text-sm font-medium">{new Date(profile?.createdAt).toLocaleDateString("id-ID", { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Profil */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-slate-800" />
                Informasi Dasar
              </CardTitle>
              <CardDescription>Perbarui nama dan alamat email administrator Anda.</CardDescription>
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
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button type="submit" disabled={isSaving} className="bg-slate-800 hover:bg-slate-900">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan Perubahan
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-slate-800" />
                Keamanan Akun
              </CardTitle>
              <CardDescription>Ubah password Anda secara berkala untuk menjaga keamanan akses.</CardDescription>
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
