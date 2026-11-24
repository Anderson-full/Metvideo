// app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: `Erro ao buscar alunos: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, turma, role, status } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        turma: turma || "T3",
        role: role || "ALUNO",
        status: status || "Ativo",
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao cadastrar aluno:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado no sistema." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Erro ao cadastrar aluno: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do aluno não informado." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir aluno:", error);
    return NextResponse.json(
      { error: `Erro ao excluir aluno: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}