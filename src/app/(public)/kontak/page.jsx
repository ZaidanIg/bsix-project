"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, CheckCircle, Send, MapPin, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function KontakPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      category: formData.get("category"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (response.success) {
        setIsSuccess(true);
        toast.success("Pesan Anda berhasil dikirim!");
      } else {
        toast.error(response.error || "Gagal mengirim pesan.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Hubungi Kami</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Kami sangat menghargai setiap masukan, kritik, dan saran dari Anda untuk membangun SMP Bina Harapan Jatigede yang lebih baik.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* INFO SECTION */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full text-green-700">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Alamat Sekolah</h3>
                    <p className="text-slate-600 text-sm mt-1">Jl. Raya Jatigede No. 123, Kabupaten Sumedang, Jawa Barat</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-700">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Telepon / WhatsApp</h3>
                    <p className="text-slate-600 text-sm mt-1">+62 812-3456-7890</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-700">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Email</h3>
                    <p className="text-slate-600 text-sm mt-1">info@smpbinaharapan.sch.id</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg overflow-hidden relative">
              <div className="absolute -right-4 -top-4 opacity-10">
                <MessageSquare className="h-32 w-32" />
              </div>
              <h3 className="text-lg font-bold mb-2 relative z-10">Layanan Pengaduan</h3>
              <p className="text-sm text-slate-300 relative z-10 leading-relaxed">
                Segala bentuk pelaporan atau pengaduan mengenai fasilitas, akademik, maupun Program B'Six akan diteruskan langsung ke pihak manajemen sekolah.
              </p>
            </div>
          </div>

          {/* FORM SECTION */}
          <div className="md:col-span-2">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-slate-900 text-white rounded-t-xl pb-8">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" /> Form Kritik & Saran
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Isi formulir di bawah ini dengan lengkap dan jelas.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 -mt-4 bg-white rounded-xl">
                {isSuccess ? (
                  <div className="text-center py-16 animate-in zoom-in duration-500">
                    <div className="flex justify-center mb-6">
                      <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircle className="h-16 w-16 text-green-600" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Terima Kasih!</h2>
                    <p className="text-slate-600 max-w-md mx-auto mb-8">
                      Pesan Anda telah berhasil dikirim dan akan segera ditindaklanjuti oleh tim manajemen kami.
                    </p>
                    <Button onClick={() => setIsSuccess(false)} variant="outline">
                      Kirim Pesan Lainnya
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
                        <Input id="name" name="name" placeholder="Masukkan nama Anda" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email (Opsional)</Label>
                        <Input id="email" name="email" type="email" placeholder="contoh@email.com" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori Pesan <span className="text-red-500">*</span></Label>
                      <Select name="category" required defaultValue="OTHER">
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACADEMIC">Akademik & Pembelajaran</SelectItem>
                          <SelectItem value="FACILITY">Fasilitas Sekolah</SelectItem>
                          <SelectItem value="BSIX">Program B'Six</SelectItem>
                          <SelectItem value="OTHER">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Pesan / Kritik / Saran <span className="text-red-500">*</span></Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        placeholder="Tuliskan pesan Anda secara rinci di sini..." 
                        rows={6} 
                        required 
                        className="resize-none"
                      />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                      {isSubmitting ? (
                        "Mengirim Pesan..."
                      ) : (
                        <>Kirim Pesan <Send className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
