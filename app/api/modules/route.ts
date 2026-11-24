// app/api/modules/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const turma = searchParams.get("turma");
    const role = searchParams.get("role");

    const allModules = await prisma.module.findMany({
      include: {
        videos: {
          orderBy: { number: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Admin vê todos os módulos; Aluno vê apenas os liberados para sua turma
    if (role === "ADMIN" || !turma) {
      return NextResponse.json(allModules);
    }

    const filtered = allModules.filter(
      (m: any) =>
        m.turmasPermitidas.includes(turma) ||
        m.turmasPermitidas.includes("ALL")
    );

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error("Erro ao buscar módulos:", error);
    return NextResponse.json(
      { error: `Erro ao buscar módulos: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tag, title, subtitle, turmasPermitidas, turma } = body;

    if (!title) {
      return NextResponse.json(
        { error: "O título do módulo é obrigatório." },
        { status: 400 }
      );
    }

    const turmas = Array.isArray(turmasPermitidas)
      ? turmasPermitidas
      : [turma || "ALL"];

    const newModule = await prisma.module.create({
      data: {
        tag: tag || (turma ? `Turma ${turma}` : "Módulo"),
        title: title.trim(),
        subtitle: subtitle || "",
        turmasPermitidas: turmas,
      },
      include: { videos: true },
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar módulo:", error);
    return NextResponse.json(
      { error: `Erro ao criar módulo: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}