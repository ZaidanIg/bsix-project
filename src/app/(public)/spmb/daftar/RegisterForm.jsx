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
import { FileUp, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successId, setSuccessId] = useState(null);

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    const formData = new FormData(e.target);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/spmb", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          if (response.success) {
            setSuccessId(response.data.id);
            toast.success("Pendaftaran berhasil disubmit!");
          } else {
            toast.error(response.error || "Gagal menyimpan data");
            setLoading(false);
          }
        } else {
          toast.error(response.error || "Gagal mengunggah file");
          setLoading(false);
        }
      } catch (e) {
        toast.error("Format respon server tidak valid");
        setLoading(false);
      }
    };

    xhr.onerror = () => {
      toast.error("Kesalahan jaringan");
      setLoading(false);
    };

    xhr.send(formData);
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
            <div className="space-y-2">
              <Label htmlFor="kkFile">Kartu Keluarga (KK)</Label>
              <Input id="kkFile" name="kkFile" type="file" accept=".pdf,image/*" required={step===2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aktaFile">Akta Kelahiran</Label>
              <Input id="aktaFile" name="aktaFile" type="file" accept=".pdf,image/*" required={step===2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ijazahFile">SKL / Ijazah Terakhir</Label>
              <Input id="ijazahFile" name="ijazahFile" type="file" accept=".pdf,image/*" required={step===2} />
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
