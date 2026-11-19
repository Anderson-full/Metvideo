// app/api/auth/definir-senha/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password, name, turma } = await request.json();
    const cleanEmail = email.toLowerCase();

    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        password,
        status: "Ativo",
      },
      create: {
        email: cleanEmail,
        name: name || "Aluno",
        turma: turma || "T3",
        password,
        role: "STUDENT",
        status: "Ativo",
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar a senha." }, { status: 500 });
  }
}