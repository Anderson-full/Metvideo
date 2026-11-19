// app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Buscar todos os alunos no banco
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar alunos." }, { status: 500 });
  }
}

// Cadastrar novo aluno no banco
export async function POST(request: Request) {
  try {
    const { name, email, turma } = await request.json();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        turma: turma || "T3",
        role: "STUDENT",
        status: "Convite Enviado (Sem Senha)",
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao cadastrar aluno no banco." }, { status: 500 });
  }
}