"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";

const formSchema = z.object({
  nisNip: z.string().min(1, { message: "NIS/NIP tidak boleh kosong" }),
  password: z.string().min(1, { message: "Password tidak boleh kosong" }),
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nisNip: "",
      password: "",
    },
  });

  const [roleTab, setRoleTab] = useState("SISWA");

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        nisNip: values.nisNip,
        password: values.password,
      });

      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "NIS/NIP atau Password salah" : res.error);
        setIsLoading(false);
      } else {
        const session = await getSession();
        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else if (session?.user?.role === "GURU") {
          router.push("/guru");
        } else if (session?.user?.role === "SISWA") {
          router.push("/siswa");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 gap-6">
      <Link 
        href="/" 
        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium text-sm self-center md:self-auto md:absolute md:top-8 md:left-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Halaman Utama
      </Link>

      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary overflow-hidden">
        <div className="bg-primary/5 p-6 border-b flex flex-col items-center justify-center text-center space-y-2">
          <img src="/logo.png" alt="Logo BMSF" className="h-12 w-12 object-contain mb-1" />
          <CardTitle className="text-2xl font-bold tracking-tight">Portal BMSF</CardTitle>
          <CardDescription>
            SMP Bina Harapan Jatigede
          </CardDescription>
        </div>

        <div className="p-1 bg-slate-100 flex">
          <button 
            type="button"
            onClick={() => setRoleTab("SISWA")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${roleTab === "SISWA" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"}`}
          >
            Masuk sebagai Siswa
          </button>
          <button 
            type="button"
            onClick={() => setRoleTab("GURU")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${roleTab === "GURU" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"}`}
          >
            Masuk sebagai Guru
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="nisNip">{roleTab === "SISWA" ? "Nomor Induk Siswa (NIS)" : "Nomor Induk Pegawai (NIP)"}</Label>
              <input
                id="nisNip"
                placeholder={roleTab === "SISWA" ? "Contoh: 21221001" : "Contoh: 19850101..."}
                {...register("nisNip")}
                className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.nisNip ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
              {errors.nisNip && (
                <p className="text-xs text-red-500">{errors.nisNip.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.password ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full h-11 text-base" type="submit" disabled={isLoading}>
              {isLoading ? "Memverifikasi..." : `Masuk sebagai ${roleTab === "SISWA" ? "Siswa" : "Guru"}`}
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-slate-500">
                Lupa password? Hubungi Admin Sekolah.
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
