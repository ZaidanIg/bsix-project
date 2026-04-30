"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StatusChecker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    const id = e.target.id.value;
    if (!id) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/spmb/check?id=${id}`);
      const __res = await res.json();
      if (!__res.success && __res.error) throw new Error(__res.error);
      const data = __res.data || __res;
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message || "Pendaftaran tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCheck} className="flex gap-2">
        <Input 
          id="id" 
          name="id" 
          placeholder="Contoh: cm8..." 
          required 
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          <Search className="w-4 h-4 mr-2" /> Cek
        </Button>
      </form>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md dark:bg-red-900/30">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 bg-slate-50 border rounded-md space-y-2 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">Nama Lengkap</p>
            <p className="font-semibold">{result.fullName}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">Tanggal Daftar</p>
            <p className="font-medium">{new Date(result.registeredAt).toLocaleDateString('id-ID')}</p>
          </div>
          <div className="flex justify-between items-center pt-2 border-t dark:border-slate-700">
            <p className="text-sm text-slate-500">Status</p>
            {result.status === 'PENDING' && <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Menunggu Validasi</Badge>}
            {result.status === 'ACCEPTED' && <Badge variant="outline" className="bg-green-100 text-green-800">Diterima</Badge>}
            {result.status === 'REJECTED' && <Badge variant="outline" className="bg-red-100 text-red-800">Ditolak</Badge>}
          </div>
        </div>
      )}
    </div>
  );
}
