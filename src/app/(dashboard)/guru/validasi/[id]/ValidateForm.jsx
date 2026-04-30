"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Check, X } from "lucide-react";

export function ValidateForm({ portfolioId }) {
  const router = useRouter();
  const [decisionType, setDecisionType] = useState(null); // 'VALIDATED' | 'REJECTED' | null
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Schema Validation (Dinamis berdasarkan tipe keputusan)
  const schema = z.object({
    score: z.string().optional(),
    feedback: z.string().min(1, "Wajib diisi").optional(),
  }).superRefine((data, ctx) => {
    if (decisionType === "VALIDATED") {
      const scoreNum = parseInt(data.score || "0");
      if (!data.score || isNaN(scoreNum) || scoreNum < 1 || scoreNum > 100) {
        ctx.addIssue({
          path: ["score"],
          message: "Skor harus berupa angka antara 1-100",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.feedback || data.feedback.length < 10) {
        ctx.addIssue({
          path: ["feedback"],
          message: "Catatan feedback minimal 10 karakter",
          code: z.ZodIssueCode.custom,
        });
      }
    }
    if (decisionType === "REJECTED") {
      if (!data.feedback || data.feedback.length < 20) {
        ctx.addIssue({
          path: ["feedback"],
          message: "Alasan penolakan minimal 20 karakter",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { score: "", feedback: "" }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState(null);

  const onPreSubmit = async (type) => {
    setDecisionType(type);
    const isValid = await trigger();
    if (isValid) {
      setDialogOpen(true);
    }
  };

  const onSubmit = (values) => {
    setPendingValues(values);
  };

  const confirmSubmit = async () => {
    if (!pendingValues || !decisionType) return;
    
    setIsSubmitting(true);
    setDialogOpen(false);

    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolioId,
          decision: decisionType,
          score: decisionType === "VALIDATED" ? pendingValues.score : null,
          feedback: pendingValues.feedback
        })
      });

      if (!res.ok) throw new Error("Gagal memproses validasi");

      toast.success(decisionType === "VALIDATED" ? "Submission divalidasi!" : "Submission ditolak.");
      router.push("/guru/validasi");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
          <h3 className="font-semibold text-slate-800">Beri Penilaian</h3>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="score" className={decisionType === "REJECTED" ? "text-slate-400" : ""}>
                  Skor (1-100) <span className="text-red-500">* (Jika Validasi)</span>
                </Label>
                <Input
                  id="score"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Misal: 85"
                  {...register("score")}
                  disabled={decisionType === "REJECTED" || isSubmitting}
                  className={errors.score ? "border-red-500" : ""}
                />
                {errors.score && decisionType === "VALIDATED" && <p className="text-xs text-red-500">{errors.score.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">
                  Catatan / Alasan Tolak <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Tuliskan feedback kegiatan atau alasan spesifik kenapa ditolak..."
                  className={`min-h-[120px] ${errors.feedback ? "border-red-500" : ""}`}
                  {...register("feedback")}
                  disabled={isSubmitting}
                />
                {errors.feedback && <p className="text-xs text-red-500">{errors.feedback.message}</p>}
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3 border-l pl-0 sm:pl-6 pt-4 sm:pt-0">
              <Button 
                type="button" 
                onClick={() => onPreSubmit("VALIDATED")}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                <Check className="mr-2 h-4 w-4" /> Validasi & Simpan
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={() => onPreSubmit("REJECTED")}
                className="w-full"
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" /> Tolak Submission
              </Button>
            </div>
          </div>
        </div>
      </form>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Keputusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin {decisionType === "VALIDATED" ? "memvalidasi" : "menolak"} submission ini?
              {decisionType === "VALIDATED" ? (
                <span className="block mt-2 font-medium text-green-700">Skor yang diberikan: {pendingValues?.score}</span>
              ) : (
                <span className="block mt-2 font-medium text-red-600">Akan ditolak dan dikembalikan ke siswa.</span>
              )}
              <span className="block mt-2 text-slate-500">Tindakan ini akan disimpan ke dalam sistem.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSubmit}
              className={decisionType === "VALIDATED" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              Ya, {decisionType === "VALIDATED" ? "Validasi" : "Tolak"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
