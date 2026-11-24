// app/api/videos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      number,
      title,
      description,
      duration,
      thumbnail,
      thumbnailUrl,
      videoUrl,
      materialUrl,
      moduleId,
    } = body;

    if (!title || !videoUrl || !moduleId) {
      return NextResponse.json(
        { error: "Título, vídeo e módulo são obrigatórios." },
        { status: 400 }
      );
    }

    // Calcula automaticamente o próximo número da aula no módulo se não for enviado
    const existingCount = await prisma.video.count({
      where: { moduleId },
    });
    const lessonNumber =
      number || String(existingCount + 1).padStart(2, "0");

    const video = await prisma.video.create({
      data: {
        number: lessonNumber,
        title: title.trim(),
        description: description || "",
        duration: duration || "00:00",
        thumbnail: thumbnail || thumbnailUrl || "",
        videoUrl: videoUrl.trim(),
        materialUrl: materialUrl || null,
        moduleId,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao publicar vídeo:", error);
    return NextResponse.json(
      { error: `Erro ao publicar vídeo: ${error?.message || String(error)}` },
      { status: 500 }
    );
  }
}