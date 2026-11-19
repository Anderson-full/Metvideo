// app/dashboard/conteudo/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Video, UploadCloud, CheckCircle2, Calendar, FolderPlus, Loader2, Image as ImageIcon } from "lucide-react";

export default function ConteudoPage() {
  const [activeTab, setActiveTab] = useState<"video" | "module" | "event">("video");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<string[]>(["T1", "T2", "T3", "T4"]);

  // Estados enxutos para Subir Aula
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Estados enxutos para Criar Módulo
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleTurma, setModuleTurma] = useState("T3");

  // Estados para Agendar Live
  const [eventForm, setEventForm] = useState({
    date: "",
    dayOfWeek: "",
    time: "",
    title: "",
    category: "Mentoria Ao Vivo",
    status: "Confirmado",
    meetingUrl: "",
  });

  const fetchModules = async () => {
    try {
      const res = await fetch("/api/modules?role=ADMIN");
      if (res.ok) {
        const data = await res.json();
        setModules(data);
        if (data.length > 0 && !moduleId) {
          setModuleId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar módulos:", err);
    }
  };

  useEffect(() => {
    fetchModules();
    const savedTurmas = localStorage.getItem("argo_turmas");
    if (savedTurmas) setTurmas(JSON.parse(savedTurmas));
  }, []);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Falha ao enviar arquivo.");
    const data = await res.json();
    return data.url;
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag: moduleTurma === "ALL" ? "TODAS AS TURMAS" : `TURMA ${moduleTurma}`,
          title: moduleTitle,
          subtitle: "",
          turmasPermitidas: moduleTurma === "ALL" ? ["ALL"] : [moduleTurma],
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setModules([...modules, created]);
        setModuleId(created.id);
        setModuleTitle("");
        setSuccessMsg(`Módulo "${created.title}" criado com sucesso!`);
        setActiveTab("video");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId) {
      alert("Crie um módulo primeiro.");
      return;
    }
    if (!coverFile || !videoFile) {
      alert("Selecione a foto da capa e o arquivo de vídeo da aula.");
      return;
    }

    setLoading(true);
    try {
      // 1. Faz upload real da foto da capa e do vídeo
      const [thumbnailUrl, videoUrl] = await Promise.all([
        uploadFile(coverFile),
        uploadFile(videoFile),
      ]);

      // Calcula automaticamente o número da aula no módulo
      const currentMod = modules.find((m) => m.id === moduleId);
      const nextNumber = String((currentMod?.videos?.length || 0) + 1).padStart(2, "0");

      // 2. Salva a aula no banco
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          number: nextNumber,
          title,
          description: "",
          duration: "HD",
          thumbnail: thumbnailUrl,
          videoUrl,
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Aula "${title}" publicada com sucesso!`);
        setTitle("");
        setCoverFile(null);
        setCoverPreview("");
        setVideoFile(null);
        fetchModules();
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        alert("Erro ao salvar a aula no banco.");
      }
    } catch (err) {
      alert("Erro ao fazer upload dos arquivos.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });

      if (res.ok) {
        setSuccessMsg("Sessão ao vivo agendada!");
        setEventForm({
          date: "",
          dayOfWeek: "",
          time: "",
          title: "",
          category: "Mentoria Ao Vivo",
          status: "Confirmado",
          meetingUrl: "",
        });
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-12 max-w-5xl mx-auto pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-semibold">
            Gestão de Conteúdo
          </span>
          <h1 className="text-3xl font-bold text-white mt-1">
            Publicar Aulas & Módulos
          </h1>
        </div>

        <div className="flex flex-wrap p-1 rounded-xl bg-luxury-card border border-white/10 gap-1">
          <button
            onClick={() => setActiveTab("video")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "video" ? "bg-luxury-gold text-white" : "text-luxury-muted hover:text-white"
            }`}
          >
            <Video size={14} /> Subir Aula
          </button>
          <button
            onClick={() => setActiveTab("module")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "module" ? "bg-luxury-gold text-white" : "text-luxury-muted hover:text-white"
            }`}
          >
            <FolderPlus size={14} /> Novo Módulo
          </button>
          <button
            onClick={() => setActiveTab("event")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "event" ? "bg-luxury-gold text-white" : "text-luxury-muted hover:text-white"
            }`}
          >
            <Calendar size={14} /> Agendar Live
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-8 p-4 rounded-xl bg-luxury-gold/15 border border-luxury-gold text-white flex items-center gap-3 text-sm font-medium">
          <CheckCircle2 size={18} className="text-luxury-gold" /> {successMsg}
        </div>
      )}

      {/* ABA 1: SUBIR AULA (ENXUTA E DIRETA) */}
      {activeTab === "video" && (
        <form onSubmit={handlePublishVideo} className="surface-card rounded-2xl p-6 sm:p-8 max-w-2xl space-y-6">
          <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-3">
            Nova Aula
          </h2>

          {modules.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-amber-400">
                Crie primeiro um módulo para organizar suas aulas.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("module")}
                className="px-4 py-2.5 rounded-lg bg-luxury-gold text-white text-xs font-semibold cursor-pointer"
              >
                + Criar Módulo Agora
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs text-white/70 font-medium mb-1.5">
                  Módulo / Turma
                </label>
                <select
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl p-3 text-sm text-white focus:border-luxury-gold focus:outline-none"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.turmasPermitidas?.join(", ")}] — {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/70 font-medium mb-1.5">
                  Título da Aula
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Encontro 01 - Oratória de Impacto"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl p-3 text-sm text-white focus:border-luxury-gold focus:outline-none"
                />
              </div>

              {/* Upload da Foto da Capa */}
              <div>
                <label className="block text-xs text-white/70 font-medium mb-1.5">
                  Foto da Capa
                </label>
                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-white/15 hover:border-luxury-gold rounded-xl p-5 cursor-pointer bg-black/50 transition-colors">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Prévia da capa"
                      className="w-full max-h-52 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center py-4">
                      <ImageIcon size={28} className="text-luxury-gold mx-auto mb-2" />
                      <span className="text-xs text-white/80 font-medium block">
                        Clique para escolher a foto da capa
                      </span>
                      <span className="text-[11px] text-white/40">PNG, JPG ou WEBP</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Upload do Vídeo da Aula */}
              <div>
                <label className="block text-xs text-white/70 font-medium mb-1.5">
                  Vídeo da Aula
                </label>
                <label className="flex items-center justify-between w-full border border-white/15 hover:border-luxury-gold rounded-xl p-4 cursor-pointer bg-black/50 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Video size={20} className="text-luxury-gold shrink-0" />
                    <span className="text-sm text-white/80 truncate">
                      {videoFile ? videoFile.name : "Clique para selecionar o vídeo (.mp4, .mov)"}
                    </span>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-semibold text-white shrink-0">
                    Escolher
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-luxury-gold hover:bg-luxury-goldLight disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Enviando capa e vídeo...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} /> Publicar Aula
                  </>
                )}
              </button>
            </>
          )}
        </form>
      )}

      {/* ABA 2: NOVO MÓDULO (ENXUTA) */}
      {activeTab === "module" && (
        <form onSubmit={handleCreateModule} className="surface-card rounded-2xl p-6 sm:p-8 max-w-xl space-y-5">
          <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-3">
            Criar Novo Módulo
          </h2>

          <div>
            <label className="block text-xs text-white/70 font-medium mb-1.5">
              Turma com Acesso
            </label>
            <select
              value={moduleTurma}
              onChange={(e) => setModuleTurma(e.target.value)}
              className="w-full bg-black border border-white/15 rounded-xl p-3 text-sm text-white focus:border-luxury-gold focus:outline-none"
            >
              {turmas.map((t) => (
                <option key={t} value={t}>
                  Somente Turma {t}
                </option>
              ))}
              <option value="ALL">Todas as Turmas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/70 font-medium mb-1.5">
              Nome do Módulo
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Gravações Turma 3"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="w-full bg-black border border-white/15 rounded-xl p-3 text-sm text-white focus:border-luxury-gold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-luxury-gold hover:bg-luxury-goldLight disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FolderPlus size={16} />}
            Criar Módulo
          </button>
        </form>
      )}

      {/* ABA 3: AGENDAR LIVE */}
      {activeTab === "event" && (
        <form onSubmit={handlePublishEvent} className="surface-card rounded-2xl p-6 sm:p-8 max-w-2xl space-y-5">
          <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-3">
            Agendar Sessão Ao Vivo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              required
              placeholder="Data (ex: 28 NOV)"
              value={eventForm.date}
              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              className="bg-black border border-white/15 rounded-xl p-3 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder="Dia (ex: Sábado)"
              value={eventForm.dayOfWeek}
              onChange={(e) => setEventForm({ ...eventForm, dayOfWeek: e.target.value })}
              className="bg-black border border-white/15 rounded-xl p-3 text-sm text-white"
            />
            <input
              type="text"
              required
              placeholder="Horário (ex: 10:00)"
              value={eventForm.time}
              onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
              className="bg-black border border-white/15 rounded-xl p-3 text-sm text-white"
            />
          </div>
          <input
            type="text"
            required
            placeholder="Título do Encontro Ao Vivo"
            value={eventForm.title}
            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
            className="w-full bg-black border border-white/15 rounded-xl p-3 text-sm text-white"
          />
          <input
            type="url"
            required
            placeholder="Link da reunião (Zoom / Google Meet)"
            value={eventForm.meetingUrl}
            onChange={(e) => setEventForm({ ...eventForm, meetingUrl: e.target.value })}
            className="w-full bg-black border border-white/15 rounded-xl p-3 text-sm text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-luxury-gold hover:bg-luxury-goldLight disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />} Publicar na Agenda
          </button>
        </form>
      )}
    </div>
  );
}