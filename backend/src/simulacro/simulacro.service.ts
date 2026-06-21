import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AreaIcfes } from '@prisma/client';

interface RespuestaEstudiante {
  preguntaId: string;
  respuestaId: string;
}

@Injectable()
export class SimulacroService {
  constructor(private prisma: PrismaService) {}

  // ─── GENERAR SIMULACRO ──────────────────────────────────────
  // Genera N preguntas aleatorias de un área, SIN enviar esCorrecta al cliente
  async generarSimulacro(area: AreaIcfes, cantidad: number = 25) {
    const todasLasPreguntas = await this.prisma.pregunta.findMany({
      where: {
        subtema: {
          tema: {
            area: area,
          },
        },
      },
      include: {
        respuestas: {
          select: {
            id: true,
            texto: true,
            // ⚠️ SEGURIDAD: esCorrecta NUNCA viaja al cliente
          },
        },
        subtema: {
          include: {
            tema: {
              select: { nombre: true, area: true },
            },
          },
        },
      },
    });

    if (todasLasPreguntas.length === 0) {
      throw new NotFoundException(
        `No hay preguntas disponibles para el área ${area}. Usa POST /simulacros/poblar para agregar preguntas de prueba.`,
      );
    }

    // Mezcla aleatoria (Fisher-Yates shuffle)
    const mezcladas = [...todasLasPreguntas].sort(() => Math.random() - 0.5);
    const seleccionadas = mezcladas.slice(0, cantidad);

    return {
      mensaje: `Simulacro de ${area} generado con éxito`,
      totalPreguntas: seleccionadas.length,
      preguntas: seleccionadas,
    };
  }

  // ─── CALIFICAR SIMULACRO ────────────────────────────────────
  // Recibe las respuestas del estudiante y devuelve el puntaje
  async calificarSimulacro(
    usuarioId: string,
    area: AreaIcfes,
    respuestasEstudiante: RespuestaEstudiante[],
  ) {
    if (!respuestasEstudiante || respuestasEstudiante.length === 0) {
      throw new NotFoundException(
        'No se recibieron respuestas para calificar.',
      );
    }

    const preguntaIds = respuestasEstudiante.map((r) => r.preguntaId);

    // Traemos las preguntas con sus respuestas CORRECTAS desde la BD (nunca salieron al cliente)
    const preguntasConRespuestas = await this.prisma.pregunta.findMany({
      where: { id: { in: preguntaIds } },
      include: {
        respuestas: {
          select: { id: true, esCorrecta: true },
        },
      },
    });

    let correctas = 0;
    const detalle: Array<{
      preguntaId: string;
      esCorrecto: boolean;
      respuestaCorrectaId: string;
    }> = [];

    for (const respuestaAlumno of respuestasEstudiante) {
      const preguntaEnBD = preguntasConRespuestas.find(
        (p) => p.id === respuestaAlumno.preguntaId,
      );

      if (!preguntaEnBD) continue;

      const respuestaCorrecta = preguntaEnBD.respuestas.find(
        (r) => r.esCorrecta === true,
      );

      const esCorrecto = respuestaCorrecta?.id === respuestaAlumno.respuestaId;

      if (esCorrecto) correctas++;

      detalle.push({
        preguntaId: respuestaAlumno.preguntaId,
        esCorrecto,
        respuestaCorrectaId: respuestaCorrecta?.id ?? '',
      });
    }

    const totalPreguntas = respuestasEstudiante.length;
    const puntaje = Math.round((correctas / totalPreguntas) * 100 * 10) / 10;

    // XP: 10 puntos base por respuesta correcta + bonus por puntaje alto
    const xpGanado =
      correctas * 10 + (puntaje >= 80 ? 50 : puntaje >= 60 ? 25 : 0);

    // Guardar resultado en la BD para estadísticas futuras
    if (usuarioId) {
      await this.prisma.resultadoSimulacro.create({
        data: {
          usuarioId,
          area,
          totalPreguntas,
          respuestasCorrectas: correctas,
          puntaje,
          xpGanado,
        },
      });

      // Sumar XP al usuario
      await this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { xpTotal: { increment: xpGanado } },
      });
    }

    return {
      mensaje: '¡Simulacro calificado!',
      resumen: {
        totalPreguntas,
        respuestasCorrectas: correctas,
        respuestasIncorrectas: totalPreguntas - correctas,
        puntaje: `${puntaje}%`,
        xpGanado,
      },
      detalle,
    };
  }

  // ─── HISTORIAL DE UN ESTUDIANTE ─────────────────────────────
  async obtenerHistorial(usuarioId: string) {
    const resultados = await this.prisma.resultadoSimulacro.findMany({
      where: { usuarioId },
      orderBy: { fechaRealizado: 'desc' },
      take: 20,
    });

    return {
      totalSimulacros: resultados.length,
      resultados,
    };
  }

  // ─── POBLAR BD CON DATOS DE PRUEBA ─────────────────────────
  async poblarBaseDeDatos() {
    // Evitar duplicados
    const temaExiste = await this.prisma.tema.findFirst({
      where: { nombre: 'Álgebra', area: 'MATEMATICAS' },
    });
    if (temaExiste) {
      return {
        mensaje: 'La BD ya tiene datos de prueba. No se insertó nada nuevo.',
      };
    }

    const temaNuevo = await this.prisma.tema.create({
      data: {
        nombre: 'Álgebra',
        area: 'MATEMATICAS',
        subtemas: {
          create: {
            nombre: 'Ecuaciones de primer grado',
            preguntas: {
              create: {
                enunciado:
                  'Si Juan compra 3 manzanas y paga con un billete de $10.000, recibiendo $4.000 de cambio, ¿cuál es el precio de cada manzana?',
                dificultad: 'BASICO',
                respuestas: {
                  create: [
                    { texto: '$1.500', esCorrecta: false },
                    { texto: '$2.000', esCorrecta: true },
                    { texto: '$2.500', esCorrecta: false },
                    { texto: '$3.000', esCorrecta: false },
                  ],
                },
              },
            },
          },
        },
      },
    });

    return {
      mensaje: '¡Pregunta de Matemáticas inyectada con éxito!',
      datos: temaNuevo,
    };
  }
  async obtenerTemasPorArea(area: AreaIcfes) {
    const temas = await this.prisma.tema.findMany({
      where: { area },
      include: {
        subtemas: {
          include: {
            preguntas: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return {
      area,
      temas: temas.map((t) => ({
        id: t.id,
        nombre: t.nombre,
        subtemas: t.subtemas.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          totalPreguntas: s.preguntas.length,
        })),
      })),
    };
  }

  // ─── MARCAR TEMA COMO VISTO/COMPLETADO ─────────────────────
  async actualizarProgresoTema(
    usuarioId: string,
    subtemaId: string,
    porcentaje: number,
  ) {
    const completado = porcentaje >= 100;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.prisma.progresoTema.upsert({
      where: {
        usuarioId_subtemaId: { usuarioId, subtemaId },
      },
      update: { porcentaje, completado },
      create: { usuarioId, subtemaId, porcentaje, completado },
    });

    return { mensaje: 'Progreso actualizado', porcentaje, completado };
  }

  // ─── OBTENER PROGRESO GENERAL DEL ESTUDIANTE ───────────────
  async obtenerProgresoGeneral(usuarioId: string) {
    const todoLosSubtemas = await this.prisma.subtema.count();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const progresos = await this.prisma.progresoTema.findMany({
      where: { usuarioId },
      include: {
        subtema: {
          include: {
            tema: { select: { area: true, nombre: true } },
          },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const temasVistos = progresos.length;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    const temasCompletados = progresos.filter((p) => p.completado).length;
    const porcentajeGeneral =
      todoLosSubtemas > 0
        ? Math.round((temasCompletados / todoLosSubtemas) * 100)
        : 0;

    // Progreso por área
    const porArea: Record<
      string,
      { vistos: number; completados: number; total: number }
    > = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    progresos.forEach((p) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const area = p.subtema.tema.area;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!porArea[area])
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        porArea[area] = { vistos: 0, completados: 0, total: 0 };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      porArea[area].vistos++;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (p.completado) porArea[area].completados++;
    });

    // Progreso por subtema (para el menú lateral)
    const porSubtema: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    progresos.forEach((p) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      porSubtema[p.subtemaId] = p.porcentaje;
    });

    return {
      totalSubtemas: todoLosSubtemas,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      temasVistos,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      temasCompletados,
      porcentajeGeneral,
      porArea,
      porSubtema,
    };
  }
}
