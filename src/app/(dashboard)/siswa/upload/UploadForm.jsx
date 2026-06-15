"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { UploadCloud, ChevronDownIcon, Loader2, X, FileCheck } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";

export default function UploadForm({ pilars }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pilarId, setPilarId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]); // Array of { url, name, type }
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (uploadedFiles.length === 0) {
      return toast.error("Silakan unggah bukti kegiatan terlebih dahulu");
    }
    
    if (!teacherId) {
      return toast.error("Silakan pilih Guru Evaluator");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/bvoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilarId,
          teacherId,
          title,
          description,
          fileUrls: uploadedFiles.map(f => f.url)
        })
      });

      const response = await res.json();
      if (response.success) {
        toast.success("Berhasil mengunggah B'Voice!");
        router.push("/siswa/portofolio");
        router.refresh();
      } else {
        toast.error(response.error || "Terjadi kesalahan.");
        setLoading(false);
      }
    } catch (err) {
      toast.error("Kesalahan jaringan atau server.");
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="pilarId">Pilar B'Six</Label>
            <div className="relative">
              <select
                id="pilarId"
                required
                value={pilarId}
                onChange={(e) => setPilarId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
              >
                <option value="" disabled>Pilih Pilar B'Six</option>
                {pilars.map((p) => (
                  <option key={p.id} value={p.id.toString()}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>

          {pilarId && (
            <div className="space-y-2">
              <Label htmlFor="teacherId">Guru Evaluator</Label>
              <div className="relative">
                <select
                  id="teacherId"
                  required
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                >
                  <option value="" disabled>Pilih Guru</option>
                  {pilars.find(p => p.id.toString() === pilarId)?.teachers?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
              {pilars.find(p => p.id.toString() === pilarId)?.teachers?.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Belum ada guru yang ditugaskan untuk pilar ini.</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Judul Kegiatan</Label>
            <Input 
              id="title" 
              required 
              placeholder="Contoh: Membersihkan selokan sekolah" 
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea 
              id="description" 
              rows={4} 
              placeholder="Ceritakan detail kegiatan Anda..." 
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Bukti File / Media</Label>
            
            {uploadedFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group rounded-lg border bg-slate-50 p-2 flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      {file.type.startsWith('image') ? (
                        <img src={file.url} className="w-full h-full object-cover rounded" alt="bukti" />
                      ) : (
                        <UploadCloud className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-slate-700">Bukti #{index + 1}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Berhasil Unggah</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {uploadedFiles.length < 5 && (
                  <div className="border-2 border-dashed rounded-lg p-2 flex items-center justify-center bg-slate-50/50">
                     <p className="text-[10px] text-slate-400">Anda dapat menambah bukti lagi</p>
                  </div>
                )}
              </div>
            ) : null}

            {uploadedFiles.length < 5 && (
              <div className="mt-2">
                <UploadDropzone
                  endpoint="bsixUploader"
                  onUploadBegin={() => setIsUploading(true)}
                  onClientUploadComplete={(res) => {
                    setIsUploading(false);
                    const newFiles = res.map(file => ({
                      url: file.url,
                      name: file.name,
                      type: file.type
                    }));
                    setUploadedFiles(prev => [...prev, ...newFiles]);
                    toast.success("File berhasil diunggah!");
                  }}
                  onUploadError={(error) => {
                    setIsUploading(false);
                    toast.error(`Gagal unggah: ${error.message}`);
                  }}
                  appearance={{
                    container: "border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer py-8",
                    label: "text-primary hover:text-primary/80",
                    allowedContent: "text-[10px] text-slate-400 mt-1",
                    button: "bg-primary text-white text-xs h-8 px-4 mt-4"
                  }}
                  content={{
                    label: "Klik atau tarik file ke sini",
                    allowedContent: "Gambar (4MB), PDF (8MB), atau Video (16MB)"
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading || isUploading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Memproses...
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Mengunggah File...
              </>
            ) : (
              "Kirim Portofolio B'Voice"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
