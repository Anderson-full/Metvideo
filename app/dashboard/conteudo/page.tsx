// app/dashboard/conteudo/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Video,
  FolderPlus,
  Calendar,
  Image as ImageIcon,
  Upload,
  Link2,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface ModuleItem {
  id: string;
  title: string;
  turma: string;
}

export default function ConteudoPage() {
  const [activeTab, setActiveTab] = useState<"aula" | "modulo" | "live">("aula");
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Estados: Nova Aula
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [videoSource, setVideoSource] = useState<"upload" | "zoom">("upload");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [zoomUrl, setZoomUrl] = useState("");

  // Estados: Novo Módulo
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleTurma, setModuleTurma] = useState("T3");
  const [moduleCoverFile, setModuleCoverFile] = useState<File | null>(null);

  // Estados: Agendar Live
  const [liveTitle, setLiveTitle] = useState("");
  const [liveDate, setLiveDate] = useState("");
  const [liveTurma, setLiveTurma] = useState("T3");
  const [liveLink, setLiveLink] = useState("");

  const fetchModules = async () => {
    try {
      const res = await fetch("/api/modules?role=ADMIN");
      if (res.ok) {
        const data = await res.json();
        setModules(data);
        if (data.length > 0 && !selectedModuleId) {
          setSelectedModuleId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar módulos:", err);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Erro ao fazer upload do arquivo.");
    const data = await res.json();
    return data.url;
  };

  // Publicar Nova Aula (Upload ou Link do Zoom)
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      if (!selectedModuleId) {
        alert("Selecione um módulo primeiro.");
        setLoading(false);
        return;
      }

      let thumbnailUrl = "";
      if (coverFile) {
        thumbnailUrl = await uploadFile(coverFile);
      }

      let finalVideoUrl = "";
      if (videoSource === "zoom") {
        if (!zoomUrl.trim()) {
          alert("Cole o link do Zoom da aula.");
          setLoading(false);
          return;
        }
        finalVideoUrl = zoomUrl.trim();
      } else {
        if (!videoFile) {
          alert("Selecione um arquivo de vídeo (.mp4 ou .mov).");
          setLoading(false);
          return;
        }
        finalVideoUrl = await uploadFile(videoFile);
      }

      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonTitle.trim(),
          moduleId: selectedModuleId,
          videoUrl: finalVideoUrl,
          thumbnailUrl,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao salvar aula.");
      }

      setLessonTitle("");
      setCoverFile(null);
      setVideoFile(null);
      setZoomUrl("");
      setFeedback("Aula publicada com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro ao publicar aula.");
    } finally {
      setLoading(false);
    }
  };

  // Criar Novo Módulo
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      let coverUrl = "";
      if (moduleCoverFile) {
        coverUrl = await uploadFile(moduleCoverFile);
      }

      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: moduleTitle.trim(),
          turma: moduleTurma,
          coverUrl,
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar módulo.");

      setModuleTitle("");
      setModuleCoverFile(null);
      setFeedback("Módulo criado com sucesso!");
      await fetchModules();
    } catch (err: any) {
      alert(err.message || "Erro ao criar módulo.");
    } finally {
      setLoading(false);
    }
  };

  // Agendar Live
  const handleCreateLive = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: liveTitle.trim(),
          date: liveDate,
          turma: liveTurma,
          link: liveLink.trim(),
        }),
      });

      if (!res.ok) throw new Error("Erro ao agendar live.");

      setLiveTitle("");
      setLiveDate("");
      setLiveLink("");
      setFeedback("Live agendada com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro ao agendar live.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-white">
      {/* Cabeçalho e Abas */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-luxury-gold font-bold block mb-1">
            Gestão de Conteúdo
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Publicar Aulas &amp; Módulos
          </h1>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
          <button
            type="button"
            onClick={() => {
              setActiveTab("aula");
              setFeedback("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "aula"
                ? "bg-luxury-gold text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Video size={14} /> Subir Aula
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("modulo");
              setFeedback("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "modulo"
                ? "bg-luxury-gold text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            <FolderPlus size={14} /> Novo Módulo
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("live");
              setFeedback("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "live"
                ? "bg-luxury-gold text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Calendar size={14} /> Agendar Live
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          {feedback}
        </div>
      )}

      {/* ABA 1: NOVA AULA */}
      {activeTab === "aula" && (
        <form
          onSubmit={handleCreateLesson}
          className="surface-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-5"
        >
          <h2 className="text-lg font-bold">Nova Aula</h2>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Módulo / Turma
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              required
              className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-luxury-gold"
            >
              {modules.length === 0 && (
                <option value="">Nenhum módulo cadastrado</option>
              )}
              {modules.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  [{mod.turma}] — {mod.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Título da Aula
            </label>
            <input
              type="text"
              required
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Ex: Encontro 01 - Oratória de Impacto"
              className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-luxury-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Foto da Capa
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/15 rounded-xl bg-[#0A0A0A] hover:border-luxury-gold/60 transition-colors cursor-pointer">
              <ImageIcon className="w-6 h-6 text-luxury-gold mb-2" />
              <span className="text-xs text-white/80 font-medium">
                {coverFile ? coverFile.name : "Clique para escolher a foto da capa"}
              </span>
              <span className="text-[11px] text-white/40 mt-1">
                PNG, JPG ou WEBP
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {/* VÍDEO DA AULA: UPLOAD OU LINK DO ZOOM */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">
              Vídeo da Aula
            </label>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setVideoSource("upload")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  videoSource === "upload"
                    ? "bg-luxury-gold/20 border-luxury-gold text-white"
                    : "bg-[#0A0A0A] border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <Upload size={14} /> Subir Vídeo (.mp4, .mov)
              </button>

              <button
                type="button"
                onClick={() => setVideoSource("zoom")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  videoSource === "zoom"
                    ? "bg-luxury-gold/20 border-luxury-gold text-white"
                    : "bg-[#0A0A0A] border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <Link2 size={14} /> Link do Zoom
              </button>
            </div>

            {videoSource === "upload" ? (
              <label className="flex items-center justify-between w-full bg-[#0A0A0A] border border-white/15 rounded-xl py-3 px-4 cursor-pointer hover:border-luxury-gold/60 transition-colors">
                <span className="text-xs text-white/70 truncate pr-3">
                  {videoFile
                    ? videoFile.name
                    : "Clique para selecionar o vídeo (.mp4, .mov)"}
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-semibold text-white shrink-0">
                  Escolher
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            ) : (
              <input
                type="url"
                required
                value={zoomUrl}
                onChange={(e) => setZoomUrl(e.target.value)}
                placeholder="https://us02web.zoom.us/rec/share/..."
                className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-luxury-gold"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-luxury-gold hover:bg-luxury-goldLight disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Publicando...
              </>
            ) : (
              <>
                <Upload size={16} /> Publicar Aula
              </>
            )}
          </button>
        </form>
      )}

      {/* ABA 2: NOVO MÓDULO */}
      {activeTab === "modulo" && (
        <form
          onSubmit={handleCreateModule}
          className="surface-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-5"
        >
          <h2 className="text-lg font-bold">Novo Módulo</h2>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Nome do Módulo
            </label>
            <input
              type="text"
              required
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="Ex: Aula 1 - Gabriele Bonet"
              className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-luxury-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Turma
            </label>
            <select
              value={moduleTurma}
              onChange={(e) => setModuleTurma(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-luxury-gold"
            >
              <option value="T1">Turma T1</option>
              <option value="T2">Turma T2</option>
              <option value="T3">Turma T3</option>
              <option value="ALL">Todas as Turmas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Capa do Módulo (opcional)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setModuleCoverFile(e.target.files?.[0] || null)}
              className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-luxury-gold hover:bg-luxury-goldLight disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Salvando...
              </>
            ) : (
              "Criar Módulo"
            )}
          </button>
        </form>
      )}

      {/* ABA 3: AGENDAR LIVE */}
      {activeTab === "live" && (
        <form
          onSubmit={handleCreateLive}
          className="surface-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-5"
        >
          <h2 className="text-lg font-bold">Agendar Live</h2>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Título do Encontro
            </label>
            <input
              type="text"
              required
              value={liveTitle}
              onChange={(e) => setLiveTitle(e.target.value)}
              placeholder="Ex: Mentoria Ao Vivo - Posicionamento"
              className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-luxury-gold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Data e Hora
              </label>
              <input
                type="datetime-local"
                required
                value={liveDate}
                onChange={(e) => setLiveDate(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Turma
              </label>
              <select
                value={liveTurma}
                onChange={(e) => setLiveTurma(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-luxury-gold"
              >
                <option value="T1">Turma T1</option>
                <option value="T2">Turma T2</option>
                <option value="T3">Turma T3</option>
                <option value="ALL">Todas as Turmas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Link do Zoom
            </label>
            <input
              type="url"
              required
              value={liveLink}
              onChange={(e) => setLiveLink(e.target.value)}
              placeholder="https://us02web.zoom.us/j/..."
              className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-luxury-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-luxury-gold hover:bg-luxury-goldLight disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Agendando...
              </>
            ) : (
              "Agendar Live"
            )}
          </button>
        </form>
      )}
    </div>
  );
}