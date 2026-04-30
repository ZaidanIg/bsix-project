"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { MessageSquare, Send, MapPin, Phone, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  category: z.enum(["ACADEMIC", "FACILITY", "BSIX", "OTHER"], { required_error: "Pilih kategori feedback" }),
  message: z.string().min(20, "Pesan minimal 20 karakter"),
});

export default function KritikSaranPublic() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      category: "",
      message: "",
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Gagal mengirim feedback");

      setIsSuccess(true);
      form.reset();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="bg-slate-900 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Kritik & Saran</h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Kami sangat menghargai setiap masukan Anda untuk kemajuan sistem pendidikan dan layanan di SMP Bina Harapan Jatigede.
        </p>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Info Kontak */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="font-bold text-lg mb-4 text-slate-900">Hubungi Kami</h3>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Jl. Cijeungjing, Kec. Jatigede, Kabupaten Sumedang, Jawa Barat 45377</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600 shrink-0" />
                  <span>(0261) 123456</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-600 shrink-0" />
                  <span>info@bmsf-jatigede.sch.id</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border">
              {isSuccess ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Terima Kasih!</h3>
                  <p className="text-slate-600 max-w-md mx-auto mb-6">
                    Aspirasi dan masukan Anda telah kami terima dan akan segera ditindaklanjuti oleh pihak sekolah.
                  </p>
                  <Button onClick={() => setIsSuccess(false)} variant="outline">Kirim Pesan Lainnya</Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Opsional)</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori Masukan <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori masukan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ACADEMIC">Akademik & Pembelajaran</SelectItem>
                              <SelectItem value="FACILITY">Fasilitas Sekolah</SelectItem>
                              <SelectItem value="BSIX">Program B'Six</SelectItem>
                              <SelectItem value="OTHER">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pesan Lengkap <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tuliskan detail kritik atau saran Anda di sini..." 
                              className="min-h-[150px] resize-y"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isSubmitting}>
                      {isSubmitting ? "Mengirim..." : <><Send className="mr-2 h-5 w-5" /> Kirim Masukan</>}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
