"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { FileUp, ArrowRight, ArrowLeft, CheckCircle, FileText, X } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
   const [successId, setSuccessId] = useState(null);
   const [uploadedFiles, setUploadedFiles] = useState({
     kkUrl: "",
     aktaUrl: "",
     ijazahUrl: ""
   });

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formElement = e.target;
    const formDataRaw = new FormData(formElement);
    const data = Object.fromEntries(formDataRaw.entries());
    
    // Gabungkan dengan URL file yang sudah diunggah
    const payload = {
      ...data,
      documents: {
        kk: uploadedFiles.kkUrl,
        akta: uploadedFiles.aktaUrl,
        ijazah: uploadedFiles.ijazahUrl
      }
    };

    if (!uploadedFiles.kkUrl || !uploadedFiles.aktaUrl || !uploadedFiles.ijazahUrl) {
      setLoading(false);
      return toast.error("Semua dokumen wajib diunggah");
    }

    try {
      const res = await fetch("/api/spmb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const response = await res.json();
      if (response.success) {
        setSuccessId(response.data.id);
        toast.success("Pendaftaran berhasil disubmit!");
      } else {
        toast.error(response.error || "Gagal menyimpan data");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  if (successId) {
    return (
      <Card className="text-center p-8 border-t-4 border-t-green-500 shadow-lg">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pendaftaran Berhasil!</h2>
        <p className="text-slate-500 mb-6">Silakan simpan ID Pendaftaran Anda untuk mengecek status.</p>
        
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg inline-block mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">ID Pendaftaran</p>
          <p className="text-xl font-mono font-bold text-primary">{successId}</p>
        </div>

        <div>
          <Button onClick={() => router.push('/spmb')}>Kembali ke Beranda SPMB</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-t-4 border-t-primary">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="flex mb-8">
            <div className={`flex-1 border-b-2 pb-2 text-center text-sm font-medium ${step === 1 ? 'border-primary text-primary' : 'border-slate-200 text-slate-400'}`}>1. Data Pribadi</div>
            <div className={`flex-1 border-b-2 pb-2 text-center text-sm font-medium ${step === 2 ? 'border-primary text-primary' : 'border-slate-200 text-slate-400'}`}>2. Dokumen</div>
          </div>

          <div className={step === 1 ? 'block space-y-4' : 'hidden'}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input id="fullName" name="fullName" required={step===1} placeholder="Cth: Ahmad Budi" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Tempat Lahir</Label>
                <Input id="birthPlace" name="birthPlace" required={step===1} placeholder="Bandung" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tanggal Lahir</Label>
                <Input id="birthDate" name="birthDate" type="date" required={step===1} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Jenis Kelamin</Label>
              <Select name="gender" required={step===1}>
                <SelectTrigger><SelectValue placeholder="Pilih Jenis Kelamin" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Textarea id="address" name="address" required={step===1} rows={3} placeholder="Jl. Raya Jatigede No. 123..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="previousSchool">Asal Sekolah</Label>
              <Input id="previousSchool" name="previousSchool" required={step===1} placeholder="SDN 1 Jatigede" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Nama Orang Tua / Wali</Label>
                <Input id="parentName" name="parentName" required={step===1} placeholder="Budi Santoso" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">No. HP Orang Tua / Wali</Label>
                <Input id="parentPhone" name="parentPhone" required={step===1} placeholder="08123456789" />
              </div>
            </div>
          </div>

          <div className={step === 2 ? 'block space-y-4' : 'hidden'}>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-sm text-yellow-800 dark:text-yellow-200 mb-4">
              Silakan unggah dokumen persyaratan dalam format PDF atau Gambar (JPG/PNG). Maksimal 2MB per file.
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Kartu Keluarga (KK)</Label>
                {uploadedFiles.kkUrl ? (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700 flex-1 truncate">KK Terunggah</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setUploadedFiles({...uploadedFiles, kkUrl: ""})}><X className="h-3 w-3" /></Button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="documentUploader"
                    onClientUploadComplete={(res) => setUploadedFiles({...uploadedFiles, kkUrl: res[0].url})}
                    onUploadError={(e) => toast.error(`Gagal: ${e.message}`)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Akta Kelahiran</Label>
                {uploadedFiles.aktaUrl ? (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700 flex-1 truncate">Akta Terunggah</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setUploadedFiles({...uploadedFiles, aktaUrl: ""})}><X className="h-3 w-3" /></Button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="documentUploader"
                    onClientUploadComplete={(res) => setUploadedFiles({...uploadedFiles, aktaUrl: res[0].url})}
                    onUploadError={(e) => toast.error(`Gagal: ${e.message}`)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>SKL / Ijazah Terakhir</Label>
                {uploadedFiles.ijazahUrl ? (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700 flex-1 truncate">Ijazah Terunggah</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setUploadedFiles({...uploadedFiles, ijazahUrl: ""})}><X className="h-3 w-3" /></Button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="documentUploader"
                    onClientUploadComplete={(res) => setUploadedFiles({...uploadedFiles, ijazahUrl: res[0].url})}
                    onUploadError={(e) => toast.error(`Gagal: ${e.message}`)}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {loading && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Mengunggah dokumen...</span>
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
          <div className="flex justify-between w-full">
            {step === 2 && (
              <Button type="button" variant="outline" onClick={prevStep} disabled={loading}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
            )}
            {step === 1 ? (
              <Button type="button" className="ml-auto" onClick={nextStep}>
                Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" className="bg-primary text-white ml-auto" disabled={loading}>
                <FileUp className="w-4 h-4 mr-2" /> {loading ? "Memproses..." : "Submit Pendaftaran"}
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
