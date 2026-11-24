// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Search,
  X,
  Download,
  Loader2,
  ArrowLeft,
  Calendar,
  BookOpen,
  CheckCircle2,
  Circle,
  Award,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardStreaming() {
  const [modules, setModules] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [adminTurmaFilter, setAdminTurmaFilter] = useState<string>("TODAS");

  useEffect(() => {
    const loadData = async () => {
      const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      setUser(sessionUser);
      const turma = sessionUser.turma || "T3";
      const role = sessionUser.role || "STUDENT";

      try {
        const requests: Promise<Response>[] = [
          fetch(
            `/api/modules?turma=${encodeURIComponent(turma)}&role=${encodeURIComponent(role)}`
          ),
        ];

        if (sessionUser.id && sessionUser.id !== "admin-master") {
          requests.push(
            fetch(`/api/progress?userId=${encodeURIComponent(sessionUser.id)}`)
          );
        }

        const [modRes, progRes] = await Promise.all(requests);

        if (modRes.ok) {
          const data = await modRes.json();
          setModules(data);
        }
        if (progRes && progRes.ok) {
          const progData = await progRes.json();
          setCompletedIds(progData.completedIds || []);
        }
      } catch (err) {
        console.error("Erro ao carregar vitrine:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleVideoCompleted = async (videoId: string) => {
    const isAlreadyDone = completedIds.includes(videoId);
    const nextState = !isAlreadyDone;

    setCompletedIds((prev) =>
      nextState ? [...prev, videoId] : prev.filter((id) => id !== videoId)
    );

    if (!user?.id || user.id === "admin-master") return;

    setSavingProgress(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          videoId,
          completed: nextState,
        }),
      });
    } catch (err) {
      console.error("Erro ao salvar progresso:", err);
    } finally {
      setSavingProgress(false);
    }
  };

  const isZoomLink = (url?: string) =>
    Boolean(url && url.toLowerCase().includes("zoom.us"));

  const isAdmin = user?.role === "ADMIN";
  const firstName = user?.name ? user.name.split(" ")[0] : "Membro";
  const turmaBadge = isAdmin
    ? "Diretoria • Visão Geral"
    : `Turma ${user?.turma || "T3"}`;

  const allVideos = modules.flatMap((m) => m.videos || []);
  const nextVideoToWatch =
    allVideos.find((v: any) => !completedIds.includes(v.id)) ||
    allVideos[0] ||
    null;

  const totalCompletedAll = allVideos.filter((v: any) =>
    completedIds.includes(v.id)
  ).length;
  const overallPercent =
    allVideos.length > 0
      ? Math.round((totalCompletedAll / allVideos.length) * 100)
      : 0;

  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.videos || []).some((v: any) =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesAdminFilter =
      !isAdmin ||
      adminTurmaFilter === "TODAS" ||
      m.turmasPermitidas?.includes(adminTurmaFilter) ||
      m.turmasPermitidas?.includes("ALL");

    return matchesSearch && matchesAdminFilter;
  });

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (overallPercent / 100) * circumference;

  return (
    <div className="relative min-h-screen text-white pb-28 overflow-x-hidden">
      {/* LUZ AMBIENTE SUTIL NO FUNDO DA PÁGINA */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[42%] -left-40 w-[520px] h-[520px] rounded-full bg-[#E50914]/[0.06] blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full bg-[#D4AF37]/[0.05] blur-[150px]" />
      </div>

      {/* HERO CONTÍNUO (SEM FOTO DE FUNDO E SEM LINHA DE DIVISÃO) */}
      <section className="relative z-10 w-full overflow-hidden">
        <div className="absolute -top-28 left-1/4 w-[500px] h-[320px] rounded-full bg-[#E50914]/12 blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 pt-10 pb-8 sm:pt-14 sm:pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          {/* Esquerda: Saudação, Título e Botões */}
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-[#D4AF37]/30 backdrop-blur-md mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold shadow-[0_0_8px_#E50914]" />
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#F2D17B] font-bold">
                {turmaBadge}
              </span>
            </div>

            <p className="text-sm text-white/65 font-medium">
              Olá, <span className="text-white font-semibold">{firstName}</span>
            </p>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] mt-1">
              Comunique com{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#D4AF37]">
                Autoridade.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-white/65 mt-3 max-w-xl leading-relaxed">
              Acesse as gravações da mentoria, acompanhe seu avanço nos módulos e prepare-se para os encontros ao vivo.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-7">
              {nextVideoToWatch && (
                <button
                  onClick={() => setActiveVideo(nextVideoToWatch)}
                  className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-luxury-gold hover:bg-luxury-goldLight text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-[0_12px_35px_-10px_rgba(229,9,20,0.8)] cursor-pointer"
                >
                  <Play
                    fill="currentColor"
                    size={14}
                    className="group-hover:scale-110 transition-transform"
                  />
                  {totalCompletedAll > 0 && totalCompletedAll < allVideos.length
                    ? "Continuar Assistindo"
                    : "Assistir Agora"}
                </button>
              )}

              <Link
                href="/dashboard/calendario"
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md transition-all"
              >
                <Calendar size={14} className="text-[#D4AF37]" /> Agenda Ao Vivo
              </Link>

              <Link
                href="/dashboard/aulas"
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold uppercase tracking-wider text-white/85 hover:text-white backdrop-blur-md transition-all"
              >
                <BookOpen size={14} className="text-luxury-gold" /> Materiais
              </Link>
            </div>
          </div>

          {/* Direita: Card de Progresso em Vidro */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-5 shadow-2xl flex items-center gap-5">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    fill="none"
                    stroke="url(#progressGrad)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#E50914" />
                      <stop offset="100%" stopColor="#D4AF37" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute text-sm font-bold text-white">
                  {overallPercent}%
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
                  <Award size={12} /> Sua Jornada
                </div>
                <p className="text-base font-bold text-white mt-0.5">
                  {totalCompletedAll} de {allVideos.length}{" "}
                  {allVideos.length === 1 ? "aula concluída" : "aulas concluídas"}
                </p>
                <p className="text-xs text-white/55 mt-0.5 truncate">
                  {overallPercent === 100 && allVideos.length > 0
                    ? "Você completou todo o acervo liberado."
                    : "Continue avançando no seu ritmo."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRADE DE CAPAS DOS MÓDULOS */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {selectedModule ? (
              <button
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Voltar aos módulos
              </button>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="w-1 h-6 rounded-full bg-gradient-to-b from-[#E50914] to-[#D4AF37]" />
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Módulos da Mentoria
                  </h2>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] ml-0 sm:ml-2">
                    {["TODAS", "T1", "T2", "T3", "T4"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setAdminTurmaFilter(t)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          adminTurmaFilter === t
                            ? "bg-luxury-gold text-white"
                            : "text-white/55 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {!selectedModule && (
            <div className="relative w-full sm:w-80">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar aula ou módulo..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-luxury-gold backdrop-blur-md transition-colors"
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-white/50 flex items-center justify-center gap-2 text-sm">
            <Loader2 size={18} className="animate-spin text-luxury-gold" /> Carregando acervo...
          </div>
        ) : !selectedModule ? (
          filteredModules.length === 0 ? (
            <div className="rounded-2xl surface-card p-12 text-center text-sm text-white/55">
              Nenhum módulo disponível para esta visualização no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
              {filteredModules.map((module) => {
                const coverImage =
                  module.videos?.[0]?.thumbnail ||
                  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop";
                const modVideos = module.videos || [];
                const totalAulas = modVideos.length;
                const doneAulas = modVideos.filter((v: any) =>
                  completedIds.includes(v.id)
                ).length;
                const percent =
                  totalAulas > 0 ? Math.round((doneAulas / totalAulas) * 100) : 0;

                return (
                  <motion.div
                    key={module.id}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => setSelectedModule(module)}
                    className="group cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0E0E10] border border-white/12 group-hover:border-luxury-gold/80 transition-all duration-300 shadow-[0_18px_45px_-18px_rgba(0,0,0,0.95)] group-hover:shadow-[0_24px_55px_-16px_rgba(229,9,20,0.4)]">
                      <img
                        src={coverImage}
                        alt={module.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-55 group-hover:opacity-85 transition-opacity" />

                      <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-luxury-gold text-white flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                        <Play fill="currentColor" size={18} className="ml-0.5" />
                      </div>
                    </div>

                    <div className="pt-3.5 px-1">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold">
                        <span className="text-[#D4AF37]">
                          {module.turmasPermitidas?.join(" • ")} • {totalAulas}{" "}
                          {totalAulas === 1 ? "aula" : "aulas"}
                        </span>
                        <span className="text-white/65">{percent}%</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <h3 className="text-base font-bold text-white group-hover:text-luxury-gold transition-colors truncate">
                          {module.title}
                        </h3>
                        <ChevronRight
                          size={16}
                          className="text-white/30 group-hover:text-luxury-gold group-hover:translate-x-0.5 transition-all shrink-0"
                        />
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-2.5">
                        <div
                          className="h-full bg-gradient-to-r from-[#E50914] to-[#D4AF37] transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-8 pb-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-[0.22em] text-[#D4AF37] font-bold">
                  {selectedModule.tag}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {selectedModule.title}
                </h2>
              </div>
              <span className="text-xs text-white/55 font-medium">
                {selectedModule.videos?.length || 0}{" "}
                {(selectedModule.videos?.length || 0) === 1 ? "aula" : "aulas"}
              </span>
            </div>

            {(selectedModule.videos || []).length === 0 ? (
              <div className="surface-card rounded-2xl p-10 text-center text-sm text-white/55">
                Nenhuma aula publicada neste módulo ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedModule.videos.map((video: any) => {
                  const isDone = completedIds.includes(video.id);

                  return (
                    <div
                      key={video.id}
                      onClick={() => setActiveVideo(video)}
                      className="group cursor-pointer surface-card rounded-2xl p-3 flex flex-col"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/[0.08]">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        {isDone && (
                          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/95 text-black text-[10px] font-bold uppercase tracking-wider shadow">
                            <CheckCircle2 size={12} /> Concluída
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/15 group-hover:bg-black/45 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-luxury-gold text-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all shadow-lg">
                            <Play fill="currentColor" size={18} className="ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3.5 pb-1 px-1">
                        <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">
                          Aula {video.number}
                          {isZoomLink(video.videoUrl) && " • Zoom"}
                        </span>
                        <h4 className="text-base font-bold text-white group-hover:text-luxury-gold transition-colors mt-0.5">
                          {video.title}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* PLAYER MODAL */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="w-full max-w-5xl surface-card rounded-3xl overflow-hidden shadow-2xl my-auto"
            >
              <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-luxury-gold/15 text-luxury-gold text-[10px] font-bold uppercase tracking-wider">
                    Aula {activeVideo.number}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {activeVideo.title}
                  </span>
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                  {isZoomLink(activeVideo.videoUrl) ? (
                    <>
                      {activeVideo.thumbnail && (
                        <img
                          src={activeVideo.thumbnail}
                          alt={activeVideo.title}
                          className="w-full h-full object-cover opacity-40"
                        />
                      )}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/50">
                        <p className="text-sm sm:text-base text-white/85 mb-5 max-w-md">
                          Esta aula está hospedada no Zoom. Clique no botão abaixo para assistir à gravação.
                        </p>
                        <a
                          href={activeVideo.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-luxury-gold hover:bg-luxury-goldLight text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                        >
                          Assistir Gravação no Zoom <ExternalLink size={15} />
                        </a>
                      </div>
                    </>
                  ) : (
                    <video
                      src={activeVideo.videoUrl}
                      poster={activeVideo.thumbnail}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => toggleVideoCompleted(activeVideo.id)}
                    disabled={savingProgress}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      completedIds.includes(activeVideo.id)
                        ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30"
                        : "bg-white/[0.06] border border-white/15 text-white hover:border-luxury-gold"
                    }`}
                  >
                    {completedIds.includes(activeVideo.id) ? (
                      <>
                        <CheckCircle2 size={15} /> Aula Concluída
                      </>
                    ) : (
                      <>
                        <Circle size={15} /> Marcar como Concluída
                      </>
                    )}
                  </button>

                  {activeVideo.materialUrl && (
                    <a
                      href={activeVideo.materialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-luxury-gold hover:bg-luxury-goldLight text-white text-xs font-semibold"
                    >
                      <Download size={14} /> Baixar Material
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}