// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = email.toLowerCase();

    // Acesso mestre do Administrador
    if (cleanEmail === "admin@mentoria.com" && password === "admin") {
      return NextResponse.json({
        id: "admin-master",
        name: "Diretoria Executiva",
        email: "admin@mentoria.com",
        role: "ADMIN",
        turma: "ALL",
        status: "Ativo",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "E-mail não encontrado no sistema." }, { status: 404 });
    }

    // Se o aluno foi cadastrado mas ainda não definiu senha
    if (!user.password) {
      return NextResponse.json(
        { needsPassword: true, user },
        { status: 200 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno ao fazer login." }, { status: 500 });
  }
}