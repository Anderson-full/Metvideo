// app/definir-senha/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, CheckCircle2, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

function DefinirSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const turmaParam = searchParams.get("turma") || "T3";
  const nomeParam = searchParams.get("nome") || "Aluno";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 3) {
      setError("A senha deve ter pelo menos 3 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas digitadas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/definir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailParam,
          password,
          name: nomeParam,
          turma: turmaParam,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Erro ao salvar sua senha.");
        setLoading(false);
        return;
      }

      const user = await res.json();
      sessionStorage.setItem("user", JSON.stringify(user));
      setSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch {
      setError("Erro de conexão ao salvar senha.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md surface-card rounded-2xl p-8 sm:p-10 border border-white/10">
        <div className="mb-8">
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/50 block">
            Mentoria
          </span>
          <span className="font-serif-editorial text-xl font-bold tracking-tight text-white">
            Comunique com Autoridade<span className="text-luxury-gold">.</span>
          </span>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 size={42} className="text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Senha definida com sucesso!</h2>
            <p className="text-xs text-white/60">
              Liberando seu acesso à <strong className="text-white">Turma {turmaParam}</strong>...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-luxury-gold/15 border border-luxury-gold/30 text-luxury-gold text-[11px] font-semibold uppercase tracking-wider mb-3">
                <ShieldCheck size={13} /> Primeiro Acesso • {turmaParam}
              </span>
              <h1 className="text-2xl font-bold text-white">Crie sua senha de acesso</h1>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Olá <strong className="text-white">{nomeParam}</strong> ({emailParam}), defina sua senha pessoal para entrar na plataforma.
              </p>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs text-white/75 font-medium mb-1.5">Nova Senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha..."
                    className="w-full bg-[#0A0A0C] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/75 font-medium mb-1.5">Confirmar Senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha..."
                    className="w-full bg-[#0A0A0C] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-luxury-gold hover:bg-luxury-goldLight disabled:opacity-50 text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    Ativar Minha Conta <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function DefinirSenhaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <DefinirSenhaContent />
    </Suspense>
  );
}