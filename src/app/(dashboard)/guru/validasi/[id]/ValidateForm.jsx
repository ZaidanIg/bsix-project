"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, X, Loader2 } from "lucide-react";

export function ValidateForm({ portfolioId }) {
  const router = useRouter();
  const [decisionType, setDecisionType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Gunakan state manual untuk keandalan maksimal
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState({});

  const validateLocal = (type) => {
    const newErrors = {};
    if (type === "VALIDATED") {
      const s = parseInt(score);
      if (!score || isNaN(s) || s < 1 || s > 100) {
        newErrors.score = "Skor harus antara 1-100";
      }
      if (!feedback || feedback.trim().length < 5) {
        newErrors.feedback = "Berikan feedback minimal 5 karakter";
      }
    } else if (type === "REJECTED") {
      if (!feedback || feedback.trim().length < 10) {
        newErrors.feedback = "Berikan alasan penolakan minimal 10 karakter";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreSubmit = (type) => {
    setDecisionType(type);
    if (validateLocal(type)) {
      setDialogOpen(true);
    } else {
      toast.error("Mohon lengkapi formulir dengan benar");
    }
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setDialogOpen(false);

    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolioId,
          decision: decisionType,
          score: decisionType === "VALIDATED" ? score : null,
          feedback: feedback
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal memproses validasi");
      }

      toast.success(decisionType === "VALIDATED" ? "Berhasil divalidasi!" : "Berhasil ditolak.");
      router.push("/guru/validasi");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b pb-4">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h3 className="font-bold text-slate-800 text-lg">Panel Penilaian Guru</h3>
        </div>
        
        <div className="grid md:grid-cols-1 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label 
                htmlFor="score_input" 
                className={`font-bold text-sm ${decisionType === "REJECTED" ? "text-slate-400" : "text-slate-700"}`}
              >
                Skor Penilaian (1-100) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="score_input"
                type="number"
                placeholder="Masukkan nilai (contoh: 85)"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                disabled={isSubmitting}
                className={`h-11 ${errors.score ? "border-red-500 bg-red-50" : "bg-white"}`}
              />
              {errors.score && <p className="text-xs text-red-500 font-medium">{errors.score}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback_input" className="font-bold text-sm text-slate-700">
                Catatan Feedback / Alasan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="feedback_input"
                placeholder="Berikan feedback positif atau alasan jika ditolak..."
                className={`min-h-[150px] bg-white leading-relaxed ${errors.feedback ? "border-red-500 bg-red-50" : ""}`}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.feedback && <p className="text-xs text-red-500 font-medium">{errors.feedback}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              type="button" 
              onClick={() => handlePreSubmit("VALIDATED")}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 shadow-md transition-all active:scale-95"
              disabled={isSubmitting}
            >
              {isSubmitting && decisionType === "VALIDATED" ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Check className="mr-2 h-5 w-5" />
              )}
              Setujui & Simpan Nilai
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => handlePreSubmit("REJECTED")}
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-bold h-12 transition-all active:scale-95"
              disabled={isSubmitting}
            >
              {isSubmitting && decisionType === "REJECTED" ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <X className="mr-2 h-5 w-5" />
              )}
              Tolak Submission
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Konfirmasi Penilaian</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Apakah Anda yakin ingin memberikan status 
              <span className={`mx-1 font-bold ${decisionType === "VALIDATED" ? "text-green-600" : "text-red-600"}`}>
                {decisionType === "VALIDATED" ? "DISETUJUI" : "DITOLAK"}
              </span> 
              untuk portofolio ini?
              
              {decisionType === "VALIDATED" && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                   <div className="text-sm text-green-800 font-bold mb-1">Ringkasan Nilai:</div>
                   <div className="text-3xl font-black text-green-700">{score} / 100</div>
                </div>
              )}
              
              <div className="mt-4 p-4 bg-slate-100 rounded-xl border border-slate-200 italic text-sm">
                "{feedback}"
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="font-bold rounded-xl h-11">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSubmit}
              className={`font-bold rounded-xl h-11 ${decisionType === "VALIDATED" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              Ya, Simpan Sekarang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
