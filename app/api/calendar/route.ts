// app/api/calendar/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.calendarEvent.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar agenda." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { date, dayOfWeek, time, title, category, status, meetingUrl } =
      await request.json();

    const event = await prisma.calendarEvent.create({
      data: {
        date,
        dayOfWeek,
        time,
        title,
        category,
        status: status || "Confirmado",
        meetingUrl,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao agendar evento." }, { status: 500 });
  }
}