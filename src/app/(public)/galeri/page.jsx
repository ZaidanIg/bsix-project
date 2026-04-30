"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Video, User } from "lucide-react";

export default function GaleriPublic() {
  const [pilars, setPilars] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch Pilars for tabs
    fetch("/api/pilar")
      .then(res => res.json())
      .then(res => setPilars(res.success ? res.data : res))
      .catch(e => console.error("Error fetching pilars", e));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const url = activeTab === "ALL" ? "/api/bvoice/public" : `/api/bvoice/public?pilarId=${activeTab}`;
    fetch(url)
      .then(res => res.json())
      .then(res => setPortfolios(res.success ? res.data : res))
      .catch(e => console.error("Error fetching gallery", e))
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  const openLightbox = (url) => {
    setSelectedMedia(url);
    setIsModalOpen(true);
  };

  const isVideo = (url) => {
    return url.match(/\.(mp4|webm)$/i);
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* HEADER GALERI */}
      <div className="bg-slate-900 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Galeri Portofolio B'Voice</h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Karya, kegiatan, dan inovasi siswa-siswi BMSF Jatigede dalam menerapkan nilai-nilai pertanian modern dan karakter unggul.
        </p>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TABS (Filter) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua Kegiatan
          </button>
          {pilars.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border`}
              style={{
                backgroundColor: activeTab === p.id ? p.colorHex : 'transparent',
                color: activeTab === p.id ? '#fff' : p.colorHex,
                borderColor: p.colorHex
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* MASONRY GRID */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-500">Memuat galeri...</div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border text-slate-500">
            Tidak ada dokumentasi untuk pilar ini.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {portfolios.map(p => {
              const coverUrl = p.fileUrls?.[0]; // Ambil file pertama sebagai cover
              if (!coverUrl) return null; // Skip jika gaada gambar
              const _isVideo = isVideo(coverUrl);

              return (
                <div key={p.id} className="break-inside-avoid relative group bg-slate-100 rounded-xl overflow-hidden cursor-pointer" onClick={() => openLightbox(coverUrl)}>
                  {_isVideo ? (
                    <video src={coverUrl} className="w-full h-auto" />
                  ) : (
                    <img src={coverUrl} alt={p.title} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  )}
                  
                  {/* OVERLAY INFO */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <Badge style={{ backgroundColor: p.pilar.colorHex, color: 'white', border: 'none' }} className="w-fit mb-2 text-[10px]">
                      {p.pilar.name}
                    </Badge>
                    <h3 className="text-white font-semibold leading-snug line-clamp-2">{p.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-slate-300 text-xs">
                      <User className="h-3 w-3" /> <span>{p.student.name}</span>
                    </div>
                  </div>
                  
                  {/* TYPE ICON */}
                  <div className="absolute top-3 right-3 bg-black/50 p-1.5 rounded-md text-white backdrop-blur-sm">
                    {_isVideo ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none">
          <div className="relative rounded-lg overflow-hidden flex items-center justify-center bg-black/90 min-h-[50vh]">
            {selectedMedia && isVideo(selectedMedia) ? (
              <video src={selectedMedia} controls autoPlay className="max-w-full max-h-[85vh] object-contain" />
            ) : (
              <img src={selectedMedia} alt="Preview" className="max-w-full max-h-[85vh] object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
