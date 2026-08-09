export const AREAS = [
  { key: 'LECTURA_CRITICA', nombre: 'Lectura Crítica' },
  { key: 'MATEMATICAS', nombre: 'Matemáticas' },
  { key: 'CIENCIAS_NATURALES', nombre: 'Ciencias Naturales' },
  { key: 'SOCIALES_CIUDADANAS', nombre: 'Sociales y Ciudadanas' },
  { key: 'INGLES', nombre: 'Inglés' },
];

export const DIFICULTADES = ['BASICO', 'MEDIO', 'AVANZADO'];

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
}

export interface PreguntaAdmin {
  id: string;
  enunciado: string;
  imagenUrl: string | null;
  dificultad: string;
  respuestas: RespuestaAdmin[];
}

export type Pestana = 'stats' | 'temas' | 'preguntas' | 'aleatorias' | 'usuarios' | 'contenido' | 'interactivo' | 'calendario';

export interface FechaIcfes {
  id: string;
  anio: number;
  calendario: 'A' | 'B';
  fechaExamen: string;
}