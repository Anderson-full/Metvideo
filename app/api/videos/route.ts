// app/api/videos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const {
      number,
      title,
      description,
      duration,
      thumbnail,
      videoUrl,
      materialUrl,
      moduleId,
    } = await request.json();

    const video = await prisma.video.create({
      data: {
        number,
        title,
        description,
        duration,
        thumbnail,
        videoUrl,
        materialUrl: materialUrl || null,
        moduleId,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao publicar vídeo." }, { status: 500 });
  }
}