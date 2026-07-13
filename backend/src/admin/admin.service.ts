import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AreaIcfes,
  Dificultad,
  RolUsuario,
  TipoInteractivo,
} from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── USUARIOS ───────────────────────────────────────────────
  async obtenerUsuarios() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        xpTotal: true,
        fechaCreacion: true,
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async cambiarRol(usuarioId: string, rol: RolUsuario) {
    return this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { rol },
      select: { id: true, nombre: true, rol: true },
    });
  }

  // ─── TEMAS ───────────────────────────────────────────────────
  async crearTema(nombre: string, area: AreaIcfes) {
    return this.prisma.tema.create({
      data: { nombre, area },
    });
  }

  async obtenerTemas() {
    return this.prisma.tema.findMany({
      include: {
        subtemas: {
          include: {
            _count: { select: { preguntas: true } },
          },
        },
      },
      orderBy: { area: 'asc' },
    });
  }

  async crearSubtema(nombre: string, temaId: string) {
    return this.prisma.subtema.create({
      data: { nombre, temaId },
    });
  }

  async eliminarTema(temaId: string) {
    const subtemas = await this.prisma.subtema.findMany({
      where: { temaId },
      select: { id: true },
    });

    const subtemaIds = subtemas.map((s) => s.id);

    await this.prisma.respuesta.deleteMany({
      where: { pregunta: { subtemaId: { in: subtemaIds } } },
    });

    await this.prisma.pregunta.deleteMany({
      where: { subtemaId: { in: subtemaIds } },
    });

    await this.prisma.progresoTema.deleteMany({
      where: { subtemaId: { in: subtemaIds } },
    });

    await this.prisma.subtema.deleteMany({
      where: { temaId },
    });

    return this.prisma.tema.delete({ where: { id: temaId } });
  }

  async eliminarSubtema(subtemaId: string) {
    await this.prisma.respuesta.deleteMany({
      where: { pregunta: { subtemaId } },
    });

    await this.prisma.pregunta.deleteMany({
      where: { subtemaId },
    });

    await this.prisma.progresoTema.deleteMany({
      where: { subtemaId },
    });

    return this.prisma.subtema.delete({ where: { id: subtemaId } });
  }

  async actualizarContenidoSubtema(
    subtemaId: string,
    contenido?: string,
    videoUrl?: string,
    imagenUrl?: string,
  ) {
    return this.prisma.subtema.update({
      where: { id: subtemaId },
      data: {
        ...(contenido !== undefined && { contenido }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(imagenUrl !== undefined && { imagenUrl }),
      },
    });
  }

  async actualizarInteractivoSubtema(
    subtemaId: string,
    tipoInteractivo: TipoInteractivo,
    datosInteractivo: {
      textoConEspacios: string;
      espacios: { opciones: string[]; correctaIndex: number }[];
    },
  ) {
    return this.prisma.subtema.update({
      where: { id: subtemaId },
      data: {
        tipoInteractivo,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        datosInteractivo: datosInteractivo as any,
      },
    });
  }

  // ─── PREGUNTAS ──────────────────────────────────────────────
  async crearPregunta(
    enunciado: string,
    subtemaId: string,
    dificultad: Dificultad,
    respuestas: { texto: string; esCorrecta: boolean }[],
    imagenUrl?: string,
  ) {
    return this.prisma.pregunta.create({
      data: {
        enunciado,
        subtemaId,
        dificultad,
        imagenUrl: imagenUrl || null,
        respuestas: {
          create: respuestas,
        },
      },
      include: { respuestas: true },
    });
  }

  async obtenerPreguntasPorSubtema(subtemaId: string) {
    return this.prisma.pregunta.findMany({
      where: { subtemaId },
      include: { respuestas: true },
      orderBy: { id: 'asc' },
    });
  }

  async eliminarPregunta(preguntaId: string) {
    await this.prisma.respuesta.deleteMany({
      where: { preguntaId },
    });
    return this.prisma.pregunta.delete({ where: { id: preguntaId } });
  }

  // ─── ESTADÍSTICAS GENERALES ─────────────────────────────────
  async obtenerEstadisticas() {
    const [totalUsuarios, totalPreguntas, totalTemas, totalSimulacros] =
      await Promise.all([
        this.prisma.usuario.count(),
        this.prisma.pregunta.count(),
        this.prisma.tema.count(),
        this.prisma.resultadoSimulacro.count(),
      ]);

    return { totalUsuarios, totalPreguntas, totalTemas, totalSimulacros };
  }
}
