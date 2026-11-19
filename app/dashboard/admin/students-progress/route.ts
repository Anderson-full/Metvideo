// app/api/admin/students-progress/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [students, modules] = await Promise.all([
      prisma.user.findMany({
        where: { role: "STUDENT" },
        orderBy: { createdAt: "desc" },
        include: {
          progress: {
            where: { completed: true },
            select: { videoId: true, updatedAt: true },
          },
        },
      }),
      prisma.module.findMany({
        include: {
          videos: { select: { id: true } },
        },
      }),
    ]);

    const result = students.map((student: any) => {
      const availableVideoIds: string[] = modules
        .filter(
          (m: any) =>
            m.turmasPermitidas.includes(student.turma) ||
            m.turmasPermitidas.includes("ALL")
        )
        .flatMap((m: any) => m.videos.map((v: any) => v.id));

      const completedSet = new Set(
        student.progress.map((p: any) => p.videoId)
      );
      const completedCount = availableVideoIds.filter((id: string) =>
        completedSet.has(id)
      ).length;
      const totalCount = availableVideoIds.length;
      const percent =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const lastActivity =
        student.progress.length > 0
          ? student.progress.sort(
              (a: any, b: any) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            )[0].updatedAt
          : null;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        turma: student.turma,
        status: student.status,
        completedCount,
        totalCount,
        percent,
        lastActivity,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar progresso dos alunos:", error);
    return NextResponse.json(
      { error: "Erro ao carregar progresso dos alunos" },
      { status: 500 }
    );
  }
}