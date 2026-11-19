// app/dashboard/aulas/page.tsx
"use client";

import { useState, useEffect } from "react";
import { PlayCircle, ChevronDown, ChevronUp, Download, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AulasPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [userTurma, setUserTurma] = useState("T3");

  useEffect(() => {
    const loadModules = async () => {
      const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      const turma = sessionUser.turma || "T3";
      const role = sessionUser.role || "STUDENT";
      setUserTurma(turma);

      try {
        const res = await fetch(`/api/modules?turma=${encodeURIComponent(turma)}&role=${encodeURIComponent(role)}`);
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

  return (
    <div className="p-6 sm:p-12 max-w-6xl mx-auto pb-24">
      <div className="mb-10">
        <span className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-semibold">
          Trilhas Liberadas • Turma {userTurma}
        </span>
        <h1 className="text-3xl font-bold text-white mt-1">
          Módulos & Materiais de Apoio
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
                    <h2 className="text-xl font-semibold text-white mt-1">{module.title}</h2>
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
                          className="p-4 rounded-xl bg-luxury-card border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <PlayCircle className="text-luxury-gold shrink-0" size={22} />
                            <div>
                              <span className="text-[11px] text-luxury-muted">
                                Aula {video.number} • {video.duration}
                              </span>
                              <h3 className="text-sm font-semibold text-white">{video.title}</h3>
                            </div>
                          </div>

                          {video.materialUrl && (
                            <a
                              href={video.materialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-luxury-gold text-xs font-medium text-white transition-colors shrink-0"
                            >
                              <Download size={13} /> Baixar Material
                            </a>
                          )}
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
    </div>
  );
}