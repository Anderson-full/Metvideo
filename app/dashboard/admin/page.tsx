// app/dashboard/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Mail,
  X,
  Send,
  Copy,
  ExternalLink,
  CheckCircle2,
  Tag,
  Loader2,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [turmas, setTurmas] = useState<string[]>(["T1", "T2", "T3", "T4"]);
  const [novaTurmaInput, setNovaTurmaInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [turmaFilter, setTurmaFilter] = useState("TODAS");
  const [showModal, setShowModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", turma: "T3" });
  const [inviteInfo, setInviteInfo] = useState<{
    name: string;
    email: string;
    turma: string;
    link: string;
  } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/students-progress");
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const savedTurmas = localStorage.getItem("argo_turmas");
    if (savedTurmas) setTurmas(JSON.parse(savedTurmas));
  }, []);

  const handleAddTurma = (e: React.FormEvent) => {
    e.preventDefault();
    const code = novaTurmaInput.trim().toUpperCase();
    if (!code || turmas.includes(code)) return;
    const updated = [...turmas, code];
    setTurmas(updated);
    localStorage.setItem("argo_turmas", JSON.stringify(updated));
    setNovaTurmaInput("");
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const inviteLink = `${window.location.origin}/definir-senha?email=${encodeURIComponent(
      newUser.email
    )}&turma=${encodeURIComponent(newUser.turma)}&nome=${encodeURIComponent(newUser.name)}`;

    try {
      // 1. Salva o aluno no Banco de Dados (PostgreSQL)
      const userRes = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          turma: newUser.turma,
        }),
      });

      if (!userRes.ok) {
        const errData = await userRes.json();
        alert(`Erro ao salvar no banco: ${errData.error}`);
        setIsSending(false);
        return;
      }

      // 2. Dispara o e-mail real via Resend
      const emailRes = await fetch("/api/enviar-convite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          turma: newUser.turma,
          inviteLink,
        }),
      });

      if (!emailRes.ok) {
        const errEmail = await emailRes.json();
        alert(`Aluno salvo no banco, mas houve erro no e-mail: ${errEmail.error}`);
      }

      // Recarrega a lista já com o total de aulas da turma calculado
      await fetchUsers();

      setShowModal(false);
      setInviteInfo({
        name: newUser.name,
        email: newUser.email,
        turma: newUser.turma,
        link: inviteLink,
      });
      setNewUser({ name: "", email: "", turma: "T3" });
    } catch (error) {
      alert("Falha de conexão com o servidor.");
    } finally {
      setIsSending(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.turma?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurma = turmaFilter === "TODAS" || u.turma === turmaFilter;
    return matchesSearch && matchesTurma;
  });

  const avgPercent =
    filteredUsers.length > 0
      ? Math.round(
          filteredUsers.reduce((acc, u) => acc + (u.percent || 0), 0) /
            filteredUsers.length
        )
      : 0;

  const completed100 = filteredUsers.filter(
    (u) => u.percent === 100 && (u.totalCount || 0) > 0
  ).length;

  return (
    <div className="p-6 sm:p-12 max-w-6xl mx-auto pb-24">
      {/* Cabeçalho */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-semibold">
            Administração • Comunique com Autoridade
          </span>
          <h1 className="text-3xl font-bold text-white font-serif-editorial mt-1">
            Gestão de Alunos & Progresso
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-luxury-gold hover:bg-luxury-goldLight text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
        >
          <Plus size={16} /> Cadastrar & Enviar E-mail
        </button>
      </div>

      {/* Cards de Métricas de Engajamento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="surface-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
            <Users size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{filteredUsers.length}</p>
            <p className="text-xs text-luxury-muted">Alunos listados</p>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-luxury-gold/15 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{avgPercent}%</p>
            <p className="text-xs text-luxury-muted">Média de conclusão</p>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#E5C158]">
            <Award size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{completed100}</p>
            <p className="text-xs text-luxury-muted">Concluíram 100%</p>
          </div>
        </div>
      </div>

      {/* Gerenciador de Turmas */}
      <div className="surface-card rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-luxury-muted flex items-center gap-1.5 mr-1">
            <Tag size={14} className="text-luxury-gold" /> Turmas:
          </span>
          <button
            onClick={() => setTurmaFilter("TODAS")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              turmaFilter === "TODAS"
                ? "bg-luxury-gold text-white"
                : "bg-white/[0.06] border border-white/10 text-white/70 hover:text-white"
            }`}
          >
            TODAS
          </button>
          {turmas.map((t) => (
            <button
              key={t}
              onClick={() => setTurmaFilter(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                turmaFilter === t
                  ? "bg-luxury-gold text-white"
                  : "bg-white/[0.06] border border-white/10 text-white/70 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleAddTurma} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={novaTurmaInput}
            onChange={(e) => setNovaTurmaInput(e.target.value)}
            placeholder="Nova turma (ex: T5)"
            className="bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-luxury-gold text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            + Criar Turma
          </button>
        </form>
      </div>

      {/* Banner de Confirmação */}
      {inviteInfo && (
        <div className="mb-8 p-6 rounded-xl bg-luxury-gold/10 border border-luxury-gold/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-luxury-gold font-semibold text-sm mb-1">
              <CheckCircle2 size={18} /> Aluno salvo no banco e convite enviado para {inviteInfo.email}
            </div>
            <p className="text-xs text-luxury-muted">
              Vinculado à <strong className="text-white">{inviteInfo.turma}</strong>. O link de criação de senha já está na caixa de entrada.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteInfo.link);
                alert("Link copiado!");
              }}
              className="px-3.5 py-2 rounded-lg bg-black border border-white/15 text-xs font-medium text-white hover:border-luxury-gold flex items-center gap-1.5 cursor-pointer"
            >
              <Copy size={13} /> Copiar Link
            </button>
            <a
              href={inviteInfo.link}
              className="px-4 py-2 rounded-lg bg-luxury-gold hover:bg-luxury-goldLight text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <ExternalLink size={13} /> Testar Link
            </a>
          </div>
        </div>
      )}

      {/* Tabela de Alunos com Progresso */}
      <div className="surface-card rounded-2xl p-6 sm:p-8">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar aluno por nome, e-mail ou turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-luxury-gold"
          />
        </div>

        <div className="overflow-x-auto">
          {loadingUsers ? (
            <div className="py-12 text-center text-luxury-muted text-sm flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin text-luxury-gold" /> Carregando alunos do banco...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-luxury-muted text-xs uppercase tracking-wider">
                  <th className="pb-4 pr-4">Aluno</th>
                  <th className="pb-4 pr-4">Turma</th>
                  <th className="pb-4 pr-4">Status do Acesso</th>
                  <th className="pb-4 w-56">Progresso nas Aulas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredUsers.map((u) => {
                  const percent = u.percent || 0;
                  const completedCount = u.completedCount || 0;
                  const totalCount = u.totalCount || 0;

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-luxury-surface border border-white/10 flex items-center justify-center text-luxury-gold font-bold text-xs shrink-0">
                            {u.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{u.name}</p>
                            <p className="text-xs text-luxury-muted flex items-center gap-1 mt-0.5">
                              <Mail size={12} /> {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-xs font-semibold text-[#E5C158] px-2.5 py-1 bg-white/[0.06] border border-white/10 rounded-md">
                          {u.turma}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`text-xs font-medium ${
                            u.status === "Ativo" ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-white/60">
                            {completedCount}/{totalCount}{" "}
                            {totalCount === 1 ? "aula" : "aulas"}
                          </span>
                          <span className="font-bold text-white">{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              percent === 100 && totalCount > 0
                                ? "bg-emerald-500"
                                : "bg-gradient-to-r from-[#E50914] to-[#D4AF37]"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-luxury-muted text-xs">
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md surface-card rounded-2xl p-8 border border-white/15">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white font-serif-editorial">
                Cadastrar Aluno
              </h3>
              <button
                onClick={() => setShowModal(false)}
                disabled={isSending}
                className="text-luxury-muted hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-luxury-muted mb-6 leading-relaxed">
              O aluno será salvo no banco de dados e receberá um e-mail da{" "}
              <strong>Mentoria Comunique com Autoridade</strong> para criar a própria senha.
            </p>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs text-luxury-muted mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rodrigo Santos"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm text-white focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-luxury-muted mb-1">E-mail do Cliente</label>
                <input
                  type="email"
                  required
                  placeholder="cliente@email.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm text-white focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-luxury-muted mb-1">Turma Liberada</label>
                <select
                  value={newUser.turma}
                  onChange={(e) => setNewUser({ ...newUser, turma: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm text-white focus:border-luxury-gold focus:outline-none"
                >
                  {turmas.map((t) => (
                    <option key={t} value={t}>
                      Turma {t} (Verá apenas aulas da {t})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full mt-2 py-3.5 rounded-lg bg-luxury-gold hover:bg-luxury-goldLight disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Salvando e Enviando...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Cadastrar e Enviar E-mail
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}