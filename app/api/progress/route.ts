// app/api/progress/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Buscar lista de IDs de vídeos concluídos pelo aluno
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });
    }

    const completed = await prisma.videoProgress.findMany({
      where: { userId, completed: true },
      select: { videoId: true },
    });

    const completedIds = completed.map((p: { videoId: string }) => p.videoId);
    return NextResponse.json({ completedIds });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar progresso" }, { status: 500 });
  }
}

// Alternar status de conclusão (concluir / desmarcar)
export async function POST(request: Request) {
  try {
    const { userId, videoId, completed } = await request.json();

    if (!userId || !videoId) {
      return NextResponse.json({ error: "userId e videoId são obrigatórios" }, { status: 400 });
    }

    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: { userId, videoId },
      },
      update: { completed },
      create: { userId, videoId, completed },
    });

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar progresso" }, { status: 500 });
  }
}