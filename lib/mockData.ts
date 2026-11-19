// lib/mockData.ts
export interface Video {
  id: string;
  number: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  progress: number;
  thumbnail: string;
  videoUrl: string;
  materials: { name: string; size: string }[];
}

export interface Module {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  turmasPermitidas: string[]; // NOVO: Controla quem pode ver este módulo
  videos: Video[];
}

export const mockUsers = [
  // Anderson é da T3 e verá apenas o conteúdo liberado para T3
  { id: "1", name: "Anderson Bezerra", email: "aluno@mentoria.com", password: "123", role: "STUDENT", turma: "T3", status: "Ativo", avatar: "AB" },
  { id: "2", name: "Diretoria Executiva", email: "admin@mentoria.com", password: "admin", role: "ADMIN", turma: "ALL", status: "Ativo", avatar: "DE" },
  // Mariana é da T2
  { id: "3", name: "Mariana Costa", email: "mariana@empresa.com", password: "123", role: "STUDENT", turma: "T2", status: "Ativo", avatar: "MC" },
];

export const mockModules: Module[] = [
  {
    id: "m1",
    tag: "FASE 01",
    title: "Onboarding & Fundamentos (T3)",
    subtitle: "Módulo exclusivo para a Turma 3 com os direcionamentos atuais.",
    turmasPermitidas: ["T3"], // Apenas a T3 vê este módulo
    videos: [
      {
        id: "v1",
        number: "01",
        title: "Bem-vindo à Turma 3",
        description: "Regras do jogo e primeiros passos no ecossistema.",
        duration: "28:45",
        completed: false,
        progress: 10,
        thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        materials: [{ name: "Cronograma_T3.pdf", size: "2.1 MB" }]
      }
    ]
  },
  {
    id: "m2",
    tag: "ACERVO GERAL",
    title: "Gravações Históricas",
    subtitle: "Conteúdo liberado para todas as turmas.",
    turmasPermitidas: ["T1", "T2", "T3"], // Todas as turmas veem
    videos: [
      {
        id: "v2",
        number: "02",
        title: "Análise de Ofertas High-Ticket",
        description: "Gravação especial liberada para todos.",
        duration: "01:14:00",
        completed: false,
        progress: 0,
        thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        materials: [{ name: "Mapa_Ofertas.pdf", size: "3.0 MB" }]
      }
    ]
  }
];

export const mockCalendar = [
  {
    id: "c1",
    date: "14 NOV",
    dayOfWeek: "Sábado",
    time: "10:00 - 12:30",
    title: "Encontro Inaugural Turma 3",
    category: "Mentoria Ao Vivo",
    status: "Ao Vivo Agora",
    participants: 42,
    meetingUrl: "https://zoom.us"
  }
];