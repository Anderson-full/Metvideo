// app/api/capa/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const capa = await prisma.banner.findUnique({
      where: { id: "principal" },
    });
    return NextResponse.json(capa || null);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar capa." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { titulo, descricao, imagemUrl, videoUrl } = await request.json();

    const capa = await prisma.banner.upsert({
      where: { id: "principal" },
      update: { titulo, descricao, imagemUrl, videoUrl },
      create: {
        id: "principal",
        titulo,
        descricao,
        imagemUrl,
        videoUrl,
      },
    });

    return NextResponse.json(capa);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar capa." }, { status: 500 });
  }
}