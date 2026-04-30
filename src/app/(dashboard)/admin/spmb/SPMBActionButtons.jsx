"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";

export default function SPMBActionButtons({ id, currentStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/spmb/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Gagal update status");
      
      toast.success("Status berhasil diupdate");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus !== 'PENDING') {
    return <span className="text-xs text-slate-400">Selesai</span>;
  }

  return (
    <div className="flex space-x-2">
      <Button 
        size="icon" 
        variant="outline" 
        className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50"
        onClick={() => handleUpdate("ACCEPTED")}
        disabled={loading}
        title="Terima"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        variant="outline" 
        className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => handleUpdate("REJECTED")}
        disabled={loading}
        title="Tolak"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
