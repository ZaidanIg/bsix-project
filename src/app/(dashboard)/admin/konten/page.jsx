"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import TipTapEditor from "@/components/editor/TipTapEditor";
import { Edit, Plus, Trash2, ArrowLeft, Image as ImageIcon, CheckCircle, Clock, X } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";

export default function ManajemenKonten() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Editor View State
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null); // null = mode tambah baru
  const [formData, setFormData] = useState({ title: "", content: "", thumbnailUrl: "", status: "DRAFT" });
  const [isSaving, setIsSaving] = useState(false);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/articles");
      const __res = await res.json();
      if (!__res.success && __res.error) throw new Error(__res.error);
      const data = __res.data || __res;
      setArticles(data);
    } catch (e) {
      toast.error("Gagal memuat artikel");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const openEditor = (article = null) => {
    if (article) {
      setCurrentArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        thumbnailUrl: article.thumbnailUrl || "",
        status: article.status
      });
    } else {
      setCurrentArticle(null);
      setFormData({ title: "", content: "", thumbnailUrl: "", status: "DRAFT" });
    }
    setIsEditing(true);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setCurrentArticle(null);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || formData.content === "<p></p>") {
      return toast.error("Judul dan konten tidak boleh kosong");
    }

    setIsSaving(true);
    try {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const payload = { ...formData, slug };

      const url = currentArticle ? `/api/articles/${currentArticle.id}` : "/api/articles";
      const method = currentArticle ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      toast.success(`Artikel berhasil di${currentArticle ? 'perbarui' : 'simpan'}`);
      closeEditor();
      fetchArticles();
    } catch (e) {
      toast.error(e.message || "Gagal menyimpan artikel");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus artikel ini permanen?")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Artikel dihapus");
        fetchArticles();
      }
    } catch (e) {
      toast.error("Gagal menghapus");
    }
  };

  const handleToggleStatus = async (article) => {
    const newStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Artikel diubah menjadi ${newStatus}`);
        fetchArticles();
      }
    } catch (e) {
      toast.error("Gagal mengubah status");
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={closeEditor}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              {currentArticle ? "Edit Artikel" : "Tulis Artikel Baru"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.status === "PUBLISHED"} 
                onCheckedChange={(c) => setFormData({...formData, status: c ? "PUBLISHED" : "DRAFT"})} 
              />
              <Label className={formData.status === "PUBLISHED" ? "text-green-600 font-bold" : "text-slate-500"}>
                {formData.status === "PUBLISHED" ? "PUBLISH LGSG" : "SIMPAN DRAFT"}
              </Label>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan Artikel"}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Judul Artikel <span className="text-red-500">*</span></Label>
              <Input 
                placeholder="Contoh: Kegiatan Porseni B'Six Bina Harapan" 
                className="text-lg py-6"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">URL (Slug) akan otomatis dibuat berdasarkan judul ini.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-slate-500" />
                Thumbnail Artikel
              </Label>
              
              {formData.thumbnailUrl ? (
                <div className="relative w-full max-w-sm aspect-video rounded-lg overflow-hidden border">
                  <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={() => setFormData({...formData, thumbnailUrl: ""})}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-slate-50 dark:bg-slate-900/50">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      setFormData({...formData, thumbnailUrl: res[0].url});
                      toast.success("Gambar berhasil diunggah");
                    }}
                    onUploadError={(error) => {
                      toast.error(`Gagal unggah: ${error.message}`);
                    }}
                    appearance={{
                        button: "bg-primary text-white text-sm px-4 py-2 h-auto",
                        allowedContent: "text-xs text-slate-500"
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-2">Maksimal 4MB (JPG, PNG, WebP)</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Konten Artikel <span className="text-red-500">*</span></Label>
              <TipTapEditor 
                content={formData.content} 
                onChange={(html) => setFormData({...formData, content: html})} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Artikel</h1>
          <p className="text-muted-foreground">Kelola berita, pengumuman, atau konten profil B'Six.</p>
        </div>
        <Button onClick={() => openEditor()}><Plus className="mr-2 h-4 w-4" /> Tulis Artikel Baru</Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Memuat artikel...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-white border rounded-lg text-slate-500">
            <p className="font-medium text-lg text-slate-700">Belum ada artikel</p>
            <p className="text-sm mt-1">Mulai terbitkan berita sekolah pertama Anda.</p>
          </div>
        ) : (
          articles.map(article => (
            <Card key={article.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {article.thumbnailUrl ? (
                  <div className="sm:w-48 h-32 sm:h-auto shrink-0 bg-slate-100 border-r relative overflow-hidden">
                    <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="sm:w-48 h-12 sm:h-auto shrink-0 bg-slate-100 border-r flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-slate-300" />
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold text-slate-800 line-clamp-2">{article.title}</h3>
                      <Badge variant={article.status === "PUBLISHED" ? "default" : "secondary"} className={article.status === "PUBLISHED" ? "bg-green-100 text-green-800" : ""}>
                        {article.status === "PUBLISHED" ? (
                          <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Published</span>
                        ) : (
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Draft</span>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>Penulis: {article.author.name}</span>
                      <span>&bull;</span>
                      <span>Dibuat: {format(new Date(article.createdAt), "dd MMM yyyy", { locale: localeID })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => openEditor(article)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button 
                      variant={article.status === "PUBLISHED" ? "secondary" : "default"} 
                      size="sm" 
                      onClick={() => handleToggleStatus(article)}
                    >
                      {article.status === "PUBLISHED" ? "Unpublish" : "Publish Sekarang"}
                    </Button>
                    <Button variant="ghost" size="icon" className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(article.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
