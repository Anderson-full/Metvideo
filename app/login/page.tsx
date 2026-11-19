// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciais inválidas.");
        setLoading(false);
        return;
      }

      if (data.needsPassword) {
        const u = data.user;
        router.push(
          `/definir-senha?email=${encodeURIComponent(u.email)}&turma=${encodeURIComponent(
            u.turma
          )}&nome=${encodeURIComponent(u.name)}`
        );
        return;
      }

      sessionStorage.setItem("user", JSON.stringify(data));
      router.push("/dashboard");
    } catch {
      setError("Erro de conexão com o servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col justify-between bg-black text-white overflow-hidden">
      {/* VÍDEO DE FUNDO EM TELA CHEIA */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2000&auto=format&fit=crop"
        className="absolute inset-0 w-full h-full object-cover opacity-45 scale-105 pointer-events-none"
      >
        <source src="/video-fundo.mp4" type="video/mp4" />
      </video>

      {/* Camadas escuras para contraste */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/95 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-black/80 pointer-events-none" />

      {/* CABEÇALHO COM A LOGO CENTRALIZADA E MAIOR */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 pt-10 pb-2 flex items-center justify-center">
        <img
          src="/logo.png"
          alt="Mentoria Comunique com Autoridade"
          className="h-20 sm:h-28 w-auto object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.12)]"
        />
      </header>

      {/* CONTEÚDO CENTRAL */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 py-8 my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Texto de Destaque */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/90 font-semibold">
              Área Exclusiva de Membros
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight max-w-2xl">
            Direcionamento estratégico e execução de{" "}
            <span className="text-luxury-gold">alto nível.</span>
          </h1>

          <p className="text-sm sm:text-base text-white/70 max-w-lg leading-relaxed hidden sm:block">
            Acesse o catálogo de aulas da sua turma, acompanhe o cronograma de sessões ao vivo e baixe os materiais operacionais.
          </p>
        </div>

        {/* Card de Login */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto lg:ml-auto lg:mr-0">
          <div className="surface-card p-6 sm:p-9 rounded-2xl shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Acessar Plataforma
              </h2>
              <p className="text-xs sm:text-sm text-luxury-muted mt-1">
                Entre com seu e-mail cadastrado pela nossa equipe.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl py-3.5 pl-10 pr-4 text-base sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-luxury-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (1º acesso: deixe vazio)"
                    className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl py-3.5 pl-10 pr-4 text-base sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-luxury-gold transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-luxury-gold hover:bg-luxury-goldLight disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-900/20 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Entrando...
                  </>
                ) : (
                  <>
                    Entrar na Plataforma <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* RODAPÉ */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 py-6 text-[11px] text-white/40 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Mentoria Comunique com Autoridade</span>
        <span>Acesso exclusivo para membros ativos</span>
      </footer>
    </div>
  );
}