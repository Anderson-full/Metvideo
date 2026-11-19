// app/dashboard/aulas/page.tsx
"use client";

import { useState, useEffect } from "react";
import { PlayCircle, ChevronDown, ChevronUp, Download, Loader2, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AulasPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadModules = async () => {
      const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      setUser(sessionUser);
      const turma = sessionUser.turma || "T3";
      const role = sessionUser.role || "STUDENT";

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

  const isAdmin = user?.role === "ADMIN";
  const subLabel = isAdmin
    ? "Diretoria • Todos os Módulos"
    : `Trilhas Liberadas • Turma ${user?.turma || "T3"}`;

  return (
    <div className="p-6 sm:p-12 max-w-6xl mx-auto pb-28">
      <div className="mb-10">
        <span className="text-[11px] uppercase tracking-[0.24em] text-[#E5C158] font-bold">
          {subLabel}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1">
          Módulos & Materiais de Apoio
        </h1>
      </div>

      {loading ? (
        <div className="py-16 text-center text-white/55 text-sm flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin text-luxury-gold" /> Carregando módulos...
        </div>
      ) : modules.length === 0 ? (
        <div className="surface-card rounded-3xl p-10 text-center text-sm text-white/55">
          Nenhum módulo cadastrado no momento.
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((module) => {
            const isOpen = openModule === module.id;
            const totalVideos = module.videos?.length || 0;

            return (
              <div key={module.id} className="surface-card rounded-3xl overflow-hidden">
                <button
                  onClick={() => setOpenModule(isOpen ? null : module.id)}
                  className="w-full p-6 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-luxury-gold/15 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold shrink-0 mt-0.5 sm:mt-0">
                      <FolderOpen size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#E5C158]">
                        <span>{module.tag}</span>
                        <span className="text-white/25">•</span>
                        <span className="text-white/60">
                          {module.turmasPermitidas?.join(", ")}
                        </span>
                        <span className="text-white/25">•</span>
                        <span className="text-white/60">
                          {totalVideos} {totalVideos === 1 ? "aula" : "aulas"}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                        {module.title}
                      </h2>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-white shrink-0">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/[0.07] bg-black/45 p-5 space-y-3"
                    >
                      {(module.videos || []).length === 0 ? (
                        <p className="text-xs text-white/45 py-2 px-2">
                          Nenhuma aula publicada neste módulo ainda.
                        </p>
                      ) : (
                        (module.videos || []).map((video: any) => (
                          <div
                            key={video.id}
                            className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <PlayCircle className="text-luxury-gold shrink-0" size={22} />
                              <div>
                                <span className="text-[10px] uppercase tracking-widest text-[#E5C158] font-bold">
                                  Aula {video.number}
                                </span>
                                <h3 className="text-sm sm:text-base font-semibold text-white">
                                  {video.title}
                                </h3>
                              </div>
                            </div>

                            {video.materialUrl && (
                              <a
                                href={video.materialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-luxury-gold text-xs font-semibold text-white transition-colors shrink-0"
                              >
                                <Download size={13} /> Baixar Material
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}