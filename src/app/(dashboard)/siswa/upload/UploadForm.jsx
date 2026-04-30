"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { UploadCloud } from "lucide-react";

export default function UploadForm({ pilars }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    const formData = new FormData(e.target);
    
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/bvoice", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      const response = JSON.parse(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        if (response.success) {
          toast.success("Berhasil mengunggah B'Voice!");
          router.push("/siswa");
          router.refresh();
        } else {
          toast.error(response.error || "Terjadi kesalahan.");
          setLoading(false);
        }
      } else {
        toast.error(response.error || "Gagal mengunggah file.");
        setLoading(false);
      }
    };

    xhr.onerror = () => {
      toast.error("Kesalahan jaringan.");
      setLoading(false);
    };

    xhr.send(formData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setPreview({ type: 'image', url: URL.createObjectURL(file) });
      } else if (file.type.startsWith('video/')) {
        setPreview({ type: 'video', url: URL.createObjectURL(file) });
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="pilarId">Pilar B'Six</Label>
            <Select name="pilarId" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Pilar B'Six" />
              </SelectTrigger>
              <SelectContent>
                {pilars.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul Kegiatan</Label>
            <Input id="title" name="title" required placeholder="Contoh: Membersihkan selokan sekolah" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" rows={4} placeholder="Ceritakan detail kegiatan Anda..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Bukti Foto / Video</Label>
            <div className="flex flex-col items-center justify-center w-full">
              <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-slate-500" />
                  <p className="text-sm text-slate-500"><span className="font-semibold">Klik untuk upload</span></p>
                </div>
                <input id="file" name="file" type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} required />
              </label>
            </div>
            {preview && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Preview:</p>
                {preview.type === 'image' ? (
                  <img src={preview.url} alt="Preview" className="max-h-48 rounded-md object-cover" />
                ) : (
                  <video src={preview.url} controls className="max-h-48 rounded-md" />
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {loading && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Mengunggah...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Memproses..." : "Submit B'Voice"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
