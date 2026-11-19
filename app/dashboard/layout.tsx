// app/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PlayCircle,
  BookOpen,
  Calendar,
  UploadCloud,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    router.push("/login");
  };

  const isAdmin = user?.role === "ADMIN";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "MC";

  const navItems = [
    { name: "Início", href: "/dashboard", icon: PlayCircle },
    { name: "Módulos", href: "/dashboard/aulas", icon: BookOpen },
    { name: "Agenda", href: "/dashboard/calendario", icon: Calendar },
    ...(isAdmin
      ? [
          { name: "Publicar", href: "/dashboard/conteudo", icon: UploadCloud },
          { name: "Alunos", href: "/dashboard/admin", icon: Users },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col relative cinema-grain">
      {/* HEADER FLUTUANTE TRANSPARENTE */}
      <header className="sticky top-0 z-40 w-full bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 h-20 flex items-center justify-between gap-4">
          {/* Assinatura Minimalista da Marca */}
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
            <img
    src="/logo.png"
    alt="Mentoria Comunique com Autoridade"
    className="h-20 sm:h-22 w-auto object-contain"
  />
          </Link>

          {/* Cápsula Flutuante de Navegação (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-white text-black shadow-md"
                      : "text-white/65 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon
                    size={14}
                    className={isActive ? "text-luxury-gold" : "text-white/45"}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Perfil Minimalista */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                <div className="text-right leading-tight">
                  <p className="text-[11px] font-semibold text-white">{user.name}</p>
                  <p className="text-[9px] text-luxury-gold font-bold uppercase tracking-widest">
                    {isAdmin ? "Admin" : `Turma ${user.turma || "T3"}`}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/15 to-white/5 border border-white/15 flex items-center justify-center text-[11px] font-bold text-white">
                  {initials}
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Sair"
              className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-luxury-gold/20 border border-white/[0.08] hover:border-luxury-gold/50 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <LogOut size={15} />
            </button>
          </div>

          {/* Botão Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#080808]/95 backdrop-blur-2xl border-b border-white/10 px-5 py-5 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold ${
                    isActive
                      ? "bg-white text-black"
                      : "text-white/75 hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-luxury-gold" : ""} />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-400 hover:bg-red-950/40 cursor-pointer"
            >
              <LogOut size={18} /> Sair da Conta
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}