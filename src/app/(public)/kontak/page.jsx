"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (response.success) {
        setIsSuccess(true);
        e.target.reset();
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
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b py-16 px-4 text-center">
        <div className="container mx-auto max-w-3xl space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-2">
            <MessageSquare className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Kritik & Saran
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Kami sangat menghargai setiap masukan Anda untuk kemajuan sistem pendidikan dan layanan di SMP Bina Harapan Jatigede.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* INFO SECTION */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border shadow-sm bg-white">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-bold text-lg text-slate-900">Hubungi Kami</h3>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2.5 rounded-full text-green-700 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">Alamat Sekolah</p>
                    <p className="text-slate-500 text-sm mt-0.5">Dusun Cihegar RT 019 RW 005, Desa Mekarasih, Kecamatan Jatigede, Kabupaten Sumedang, Jawa Barat - 45377</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2.5 rounded-full text-blue-700 shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">WhatsApp</p>
                    <p className="text-slate-500 text-sm mt-0.5">+6285722904667</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2.5 rounded-full text-orange-700 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">Email</p>
                    <p className="text-slate-500 text-sm mt-0.5">smpbinaharapanjatigede@gmail.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute -right-4 -top-4 opacity-5">
                  <MessageSquare className="h-28 w-28 text-green-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 relative z-10">Layanan Pengaduan</h3>
                <p className="text-sm text-slate-500 relative z-10 leading-relaxed">
                  Segala bentuk pelaporan atau pengaduan mengenai fasilitas, akademik, maupun Program B&apos;Six akan diteruskan langsung ke pihak manajemen sekolah.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* FORM SECTION */}
          <div className="md:col-span-2">
            <Card className="border shadow-sm bg-white">
              <CardContent className="p-6 sm:p-8">
                {isSuccess ? (
                  <div className="text-center py-16">
                    <div className="flex justify-center mb-6">
                      <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircle className="h-14 w-14 text-green-600" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Terima Kasih!</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                      Pesan Anda telah berhasil dikirim dan akan segera ditindaklanjuti oleh tim manajemen kami.
                    </p>
                    <Button onClick={() => setIsSuccess(false)} variant="outline" className="rounded-full px-6">
                      Kirim Pesan Lainnya
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-slate-900">Form Kritik & Saran</h2>
                      <p className="text-sm text-slate-500 mt-1">Isi formulir di bawah ini dengan lengkap dan jelas.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
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
                            <SelectItem value="BSIX">Program B&apos;Six</SelectItem>
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

                      <Button type="submit" className="w-full h-12 text-base bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                        {isSubmitting ? (
                          "Mengirim Pesan..."
                        ) : (
                          <>Kirim Pesan <Send className="ml-2 h-4 w-4" /></>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
