import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AreaIcfes,
  CalendarioTipo,
  Dificultad,
  RolUsuario,
  TipoInteractivo,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../common/constants';
import { generarCodigoConPrefijo } from '../institucion/utils/generar-codigo.util';

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

  async eliminarUsuario(usuarioId: string, solicitanteId: string) {
    if (usuarioId === solicitanteId) {
      throw new BadRequestException(
        'No puedes eliminar tu propia cuenta de administrador.',
      );
    }
    return this.prisma.usuario.delete({
      where: { id: usuarioId },
      select: { id: true, nombre: true, correo: true },
    });
  }

  async crearInstitucionDesdeLead(datos: {
    leadId: string;
    contrasenaTemporal: string;
    planActual?: string;
    limiteGrado10?: number;
    limiteGrado11?: number;
    calendarioIcfes?: CalendarioTipo;
    fechaVencimientoPlan?: Date;
  }) {
    if (datos.contrasenaTemporal.length < 8) {
      throw new BadRequestException(
        'La contraseña temporal debe tener al menos 8 caracteres.',
      );
    }

    const lead = await this.prisma.leadVentas.findUnique({
      where: { id: datos.leadId },
    });
    if (!lead) throw new BadRequestException('El lead no existe.');
    if (lead.atendido) {
      throw new BadRequestException(
        'Este lead ya fue convertido o marcado como atendido.',
      );
    }

    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { correo: lead.correo },
      select: { id: true },
    });
    if (usuarioExistente) {
      throw new BadRequestException(
        'El correo del contacto ya tiene una cuenta. Usa un correo distinto antes de crear la institución.',
      );
    }

    const contrasenaHash = await bcrypt.hash(
      datos.contrasenaTemporal,
      BCRYPT_SALT_ROUNDS,
    );
    const codigoUnico = await generarCodigoConPrefijo(
      'INST',
      async (codigo) =>
        (await this.prisma.institucion.findUnique({
          where: { codigoUnico: codigo },
        })) !== null,
    );

    const resultado = await this.prisma.$transaction(async (tx) => {
      const institucion = await tx.institucion.create({
        data: {
          nombre: lead.nombreColegio,
          codigoUnico,
          planActual: datos.planActual || lead.plan,
          limiteGrado10: datos.limiteGrado10,
          limiteGrado11: datos.limiteGrado11,
          calendarioIcfes: datos.calendarioIcfes ?? 'A',
          fechaVencimientoPlan: datos.fechaVencimientoPlan,
        },
      });
      const responsable = await tx.usuario.create({
        data: {
          nombre: lead.nombreContacto,
          correo: lead.correo,
          contrasenaHash,
          rol: 'PROFESOR',
          correoVerificado: true,
          institucionId: institucion.id,
          debeCambiarContrasena: true,
        },
        select: { id: true, nombre: true, correo: true },
      });
      await tx.leadVentas.update({
        where: { id: lead.id },
        data: { atendido: true },
      });
      return { institucion, responsable };
    });

    return {
      mensaje: 'Institución creada y lead marcado como atendido.',
      institucion: resultado.institucion,
      responsable: resultado.responsable,
    };
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
  // ─── PREGUNTAS ALEATORIAS (carga rápida por área) ────────────
  // No pide subtema: busca (o crea) un tema/subtema "Banco General"
  // para esa área y mete la pregunta ahí. Así el admin solo elige
  // el área, escribe la pregunta y las respuestas, y ya.
  async crearPreguntaAleatoria(
    area: AreaIcfes,
    enunciado: string,
    respuestas: { texto: string; esCorrecta: boolean }[],
    imagenUrl?: string,
  ) {
    let tema = await this.prisma.tema.findFirst({
      where: { nombre: 'Banco General', area },
    });
    if (!tema) {
      tema = await this.prisma.tema.create({
        data: { nombre: 'Banco General', area },
      });
    }

    let subtema = await this.prisma.subtema.findFirst({
      where: { nombre: 'Banco General', temaId: tema.id },
    });
    if (!subtema) {
      subtema = await this.prisma.subtema.create({
        data: { nombre: 'Banco General', temaId: tema.id },
      });
    }

    return this.crearPregunta(
      enunciado,
      subtema.id,
      'MEDIO',
      respuestas,
      imagenUrl,
    );
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
    const inicioDeHoy = new Date();
    inicioDeHoy.setHours(0, 0, 0, 0);

    const [
      totalUsuarios,
      totalPreguntas,
      totalTemas,
      totalSimulacros,
      totalEstudiantes,
      totalProfesores,
      totalInstituciones,
      estudiantesRegistradosHoy,
      simulacrosResueltosHoy,
    ] = await Promise.all([
      this.prisma.usuario.count(),
      this.prisma.pregunta.count(),
      this.prisma.tema.count(),
      this.prisma.resultadoSimulacro.count(),
      this.prisma.usuario.count({ where: { rol: 'ESTUDIANTE' } }),
      this.prisma.usuario.count({ where: { rol: 'PROFESOR' } }),
      this.prisma.institucion.count(),
      this.prisma.usuario.count({
        where: { rol: 'ESTUDIANTE', fechaCreacion: { gte: inicioDeHoy } },
      }),
      this.prisma.resultadoSimulacro.count({
        where: { fechaRealizado: { gte: inicioDeHoy } },
      }),
    ]);

    return {
      totalUsuarios,
      totalPreguntas,
      totalTemas,
      totalSimulacros,
      totalEstudiantes,
      totalProfesores,
      totalInstituciones,
      estudiantesRegistradosHoy,
      simulacrosResueltosHoy,
    };
  }
}
