// app/dashboard/aulas/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AulasPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [userTurma, setUserTurma] = useState("T3");
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  useEffect(() => {
    const loadModules = async () => {
      const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      const turma = sessionUser.turma || "T3";
      const role = sessionUser.role || "STUDENT";
      setUserTurma(turma);

      try {
        const res = await fetch(
          `/api/modules?turma=${encodeURIComponent(turma)}&role=${encodeURIComponent(role)}`
        );
        if (res.ok) {
          const data = await res.json();
          setModules(data);
          if (data.length > 0) setOpenModule(data[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  const isZoomLink = (url?: string) =>
    Boolean(url && url.toLowerCase().includes("zoom.us"));

  return (
    <div className="p-6 sm:p-12 max-w-6xl mx-auto pb-24">
      <div className="mb-10">
        <span className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-semibold">
          Trilhas Liberadas • Turma {userTurma}
        </span>
        <h1 className="text-3xl font-bold text-white mt-1">
          Módulos &amp; Materiais de Apoio
        </h1>
      </div>

      {loading ? (
        <div className="py-12 text-center text-luxury-muted text-sm flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin text-luxury-gold" /> Carregando módulos...
        </div>
      ) : modules.length === 0 ? (
        <div className="surface-card rounded-2xl p-8 text-center text-sm text-luxury-muted">
          Nenhum módulo cadastrado para {userTurma} ainda.
        </div>
      ) : (
        <div className="space-y-5">
          {modules.map((module) => {
            const isOpen = openModule === module.id;
            return (
              <div key={module.id} className="surface-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenModule(isOpen ? null : module.id)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-luxury-gold font-semibold">
                      {module.tag} • Turmas: {module.turmasPermitidas?.join(", ")}
                    </span>
                    <h2 className="text-xl font-semibold text-white mt-1">
                      {module.title}
                    </h2>
                    <p className="text-xs text-luxury-muted mt-1">{module.subtitle}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white shrink-0">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/40 p-5 space-y-3"
                    >
                      {(module.videos || []).map((video: any) => (
                        <div
                          key={video.id}
                          onClick={() => setSelectedVideo(video)}
                          className="p-4 rounded-xl bg-luxury-card border border-white/5 hover:border-luxury-gold/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <PlayCircle className="text-luxury-gold shrink-0" size={22} />
                            <div>
                              <span className="text-[11px] text-luxury-muted">
                                Aula {video.number} • {video.duration}
                                {isZoomLink(video.videoUrl) && " • Zoom"}
                              </span>
                              <h3 className="text-sm font-semibold text-white">
                                {video.title}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVideo(video);
                              }}
                              className="px-3.5 py-2 rounded-lg bg-luxury-gold/20 hover:bg-luxury-gold text-xs font-semibold text-white transition-colors cursor-pointer"
                            >
                              Assistir
                            </button>

                            {video.materialUrl && (
                              <a
                                href={video.materialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-luxury-gold text-xs font-medium text-white transition-colors"
                              >
                                <Download size={13} /> Baixar Material
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DO PLAYER */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#0D0D0D] border border-luxury-gold/30 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2.5 py-1 rounded-md bg-luxury-gold/20 text-luxury-gold text-[10px] font-bold uppercase tracking-wider shrink-0">
                    Aula {selectedVideo.number}
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                    {selectedVideo.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVideo(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5">
                {isZoomLink(selectedVideo.videoUrl) ? (
                  <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                    {selectedVideo.thumbnail && (
                      <img
                        src={selectedVideo.thumbnail}
                        alt={selectedVideo.title}
                        className="w-full h-full object-cover opacity-40"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/50">
                      <p className="text-sm text-white/85 mb-4 max-w-md">
                        Esta aula está hospedada no Zoom. Clique no botão abaixo para assistir à gravação.
                      </p>
                      <a
                        href={selectedVideo.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-luxury-gold hover:bg-luxury-goldLight text-white font-bold text-xs uppercase tracking-wider transition-colors"
                      >
                        Assistir Gravação no Zoom <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <video
                    src={selectedVideo.videoUrl}
                    poster={selectedVideo.thumbnail}
                    controls
                    autoPlay
                    className="w-full aspect-video bg-black rounded-xl"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}