export const AREAS = [
  { key: "LECTURA_CRITICA", nombre: "Lectura Crítica" },
  { key: "MATEMATICAS", nombre: "Matemáticas" },
  { key: "CIENCIAS_NATURALES", nombre: "Ciencias Naturales" },
  { key: "SOCIALES_CIUDADANAS", nombre: "Sociales y Ciudadanas" },
  { key: "INGLES", nombre: "Inglés" },
];

export const DIFICULTADES = ["BASICO", "MEDIO", "AVANZADO"];

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  xpTotal: number;
  fechaCreacion: string;
}

export interface Subtema {
  id: string;
  nombre: string;
  contenido?: string | null;
  videoUrl?: string | null;
  imagenUrl?: string | null;
  _count: { preguntas: number };
}

export interface Tema {
  id: string;
  nombre: string;
  area: string;
  subtemas: Subtema[];
}

export interface Stats {
  totalUsuarios: number;
  totalPreguntas: number;
  totalTemas: number;
  totalSimulacros: number;
  totalEstudiantes: number;
  totalProfesores: number;
  totalInstituciones: number;
  estudiantesRegistradosHoy: number;
  simulacrosResueltosHoy: number;
}

export interface RespuestaAdmin {
  id: string;
  texto: string;
  esCorrecta: boolean;
  explicacion: string | null;
}

export interface PreguntaAdmin {
  id: string;
  enunciado: string;
  explicacion: string | null;
  imagenUrl: string | null;
  dificultad: string;
  casoId: string | null;
  ordenEnCaso: number | null;
  caso: {
    id: string;
    titulo: string | null;
    contexto: string;
    imagenUrl: string | null;
    area: string;
  } | null;
  respuestas: RespuestaAdmin[];
}

export type Pestana =
  | "stats"
  | "temas"
  | "casos"
  | "preguntas"
  | "aleatorias"
  | "usuarios"
  | "contenido"
  | "interactivo"
  | "calendario"
  | "ventas"
  | "cupones"
  | "anuncios"
  | "soporte";

export interface LeadVentasAdmin {
  id: string;
  nombreColegio: string;
  nombreContacto: string;
  correo: string;
  linea: "ONCE" | "BACHILLERATO";
  plan: string;
  atendido: boolean;
}

export interface FechaIcfes {
  id: string;
  anio: number;
  calendario: "A" | "B";
  fechaExamen: string;
  activo: boolean;
}
