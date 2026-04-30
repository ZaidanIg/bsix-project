"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MessageSquare, Trash2, CheckCircle2, Circle, Inbox } from "lucide-react";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function KelolaFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, UNREAD, HANDLED
  
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/feedback");
      const __res = await res.json();
      if (!__res.success && __res.error) throw new Error(__res.error);
      const data = __res.data || __res;
      setFeedbacks(data);
    } catch (e) {
      toast.error("Gagal memuat feedback");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleStatusChange = async (id, payload) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (selectedFeedback) setSelectedFeedback({ ...selectedFeedback, ...payload });
        fetchFeedback();
        toast.success("Status berhasil diperbarui");
      }
    } catch (e) {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus pesan ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
      if (res.ok) {
        setIsModalOpen(false);
        fetchFeedback();
        toast.success("Feedback dihapus");
      }
    } catch (e) {
      toast.error("Gagal menghapus feedback");
    }
  };

  const openDetail = (fb) => {
    setSelectedFeedback(fb);
    setIsModalOpen(true);
    // Auto mark as read
    if (!fb.isRead) {
      handleStatusChange(fb.id, { isRead: true });
    }
  };

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (filterCategory !== "ALL" && fb.category !== filterCategory) return false;
    if (filterStatus === "UNREAD" && fb.isRead) return false;
    if (filterStatus === "HANDLED" && !fb.isHandled) return false;
    return true;
  });

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'ACADEMIC': return 'bg-blue-100 text-blue-800';
      case 'FACILITY': return 'bg-orange-100 text-orange-800';
      case 'BSIX': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Feedback</h1>
          <p className="text-muted-foreground">Pesan, kritik, dan saran dari publik atau siswa.</p>
        </div>

        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              <SelectItem value="ACADEMIC">Akademik</SelectItem>
              <SelectItem value="FACILITY">Fasilitas</SelectItem>
              <SelectItem value="BSIX">Program B'Six</SelectItem>
              <SelectItem value="OTHER">Lainnya</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="UNREAD">Belum Dibaca</SelectItem>
              <SelectItem value="HANDLED">Selesai/Handled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <CardSkeleton count={5} />
        ) : filteredFeedbacks.length === 0 ? (
          <EmptyState 
            icon={MessageSquare} 
            title="Feedback Kosong" 
            description="Tidak ada feedback yang sesuai dengan filter atau belum ada feedback masuk."
            className="bg-white border rounded-lg"
          />
        ) : (
          filteredFeedbacks.map(fb => (
            <Card 
              key={fb.id} 
              className={`cursor-pointer hover:border-blue-400 transition-colors ${!fb.isRead ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''} ${fb.isHandled ? 'opacity-70' : ''}`}
              onClick={() => openDetail(fb)}
            >
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{fb.name}</span>
                    <span className="text-xs text-muted-foreground">&bull; {format(new Date(fb.createdAt), "dd MMM yyyy, HH:mm", { locale: localeID })}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-1">{fb.message}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="outline" className={getCategoryColor(fb.category)}>{fb.category}</Badge>
                  {fb.isHandled ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : !fb.isRead ? (
                    <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detail Feedback
              {selectedFeedback?.isHandled && <Badge className="bg-green-500">Ditindaklanjuti</Badge>}
            </DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Pengirim</p>
                  <p className="font-medium">{selectedFeedback.name}</p>
                  <p className="text-slate-500">{selectedFeedback.email || "Tanpa Email"}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Waktu</p>
                  <p className="font-medium">{format(new Date(selectedFeedback.createdAt), "dd MMMM yyyy", { locale: localeID })}</p>
                  <p className="text-slate-500">{format(new Date(selectedFeedback.createdAt), "HH:mm", { locale: localeID })}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Pesan Lengkap:</p>
                <div className="p-3 bg-slate-50 border rounded-md text-sm whitespace-pre-wrap">
                  {selectedFeedback.message}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between items-center w-full sm:justify-between">
            <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedFeedback?.id)}>
              <Trash2 className="h-4 w-4 mr-2" /> Hapus
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Tutup</Button>
              {!selectedFeedback?.isHandled && (
                <Button onClick={() => handleStatusChange(selectedFeedback?.id, { isHandled: true })} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Tandai Selesai
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
