"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Bisa diintegrasikan dengan Sentry atau log service eksternal
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border p-8 text-center space-y-6">
        <div className="mx-auto bg-red-100 w-20 h-20 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Terjadi Kesalahan!</h2>
          <p className="text-slate-500 text-sm">
            Maaf, sistem mengalami kendala teknis saat memproses permintaan Anda. Tim kami telah diberitahu.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border text-left overflow-hidden">
          <p className="text-xs text-slate-400 font-mono line-clamp-3">
            {error.message || "Unknown internal error"}
          </p>
        </div>

        <Button onClick={() => reset()} className="w-full h-12 text-base font-semibold">
          <RotateCcw className="mr-2 h-4 w-4" /> Coba Muat Ulang
        </Button>
      </div>
    </div>
  );
}
