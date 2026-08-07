import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AreaIcfes, Dificultad } from '@prisma/client';

interface RespuestaEstudiante {
  preguntaId: string;
  respuestaId: string;
}

@Injectable()
export class SimulacroService {
  constructor(private prisma: PrismaService) {}

  private mezclarPreguntas<T>(elementos: T[]): T[] {
    const copia = [...elementos];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

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

    const seleccionadas = this.mezclarPreguntas(todasLasPreguntas).slice(0, cantidad);

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

    const preguntaCorrectaPorId = new Map(
      preguntasConRespuestas.map((pregunta) => [
        pregunta.id,
        pregunta.respuestas.find((r) => r.esCorrecta === true)?.id ?? null,
      ]),
    );

    let correctas = 0;
    const detalle: Array<{
      preguntaId: string;
      esCorrecto: boolean;
      respuestaCorrectaId: string;
    }> = [];

    for (const respuestaAlumno of respuestasEstudiante) {
      const respuestaCorrectaId = preguntaCorrectaPorId.get(
        respuestaAlumno.preguntaId,
      );
      if (!respuestaCorrectaId) {
        detalle.push({
          preguntaId: respuestaAlumno.preguntaId,
          esCorrecto: false,
          respuestaCorrectaId: '',
        });
        continue;
      }

      const esCorrecto = respuestaCorrectaId === respuestaAlumno.respuestaId;
      if (esCorrecto) correctas++;

      detalle.push({
        preguntaId: respuestaAlumno.preguntaId,
        esCorrecto,
        respuestaCorrectaId,
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

  // ─── GENERAR SIMULACRO PERSONALIZADO (PREGUNTAS ALEATORIAS) ─
  // El estudiante elige una o varias áreas (y opcionalmente una dificultad)
  // y recibe preguntas aleatorias mezcladas de esas áreas.
  async generarSimulacroPersonalizado(
    areas: AreaIcfes[],
    cantidad: number = 20,
    dificultad?: Dificultad,
  ) {
    if (!areas || areas.length === 0) {
      throw new NotFoundException(
        'Selecciona al menos un área para generar preguntas aleatorias.',
      );
    }

    const todasLasPreguntas = await this.prisma.pregunta.findMany({
      where: {
        subtema: {
          tema: {
            area: { in: areas },
          },
        },
        ...(dificultad ? { dificultad } : {}),
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
        'No hay preguntas disponibles para las áreas seleccionadas todavía.',
      );
    }

    const seleccionadas = this.mezclarPreguntas(todasLasPreguntas).slice(0, cantidad);

    return {
      mensaje: 'Simulacro personalizado generado con éxito',
      areasSeleccionadas: areas,
      totalPreguntas: seleccionadas.length,
      preguntas: seleccionadas,
    };
  }

  // ─── CALIFICAR SIMULACRO PERSONALIZADO ──────────────────────
  // No recibe un área única: la calcula por pregunta y guarda un
  // ResultadoSimulacro por cada área presente en el intento, para
  // que las estadísticas por área del dashboard sigan funcionando.
  async calificarSimulacroPersonalizado(
    usuarioId: string,
    respuestasEstudiante: RespuestaEstudiante[],
  ) {
    if (!respuestasEstudiante || respuestasEstudiante.length === 0) {
      throw new NotFoundException(
        'No se recibieron respuestas para calificar.',
      );
    }

    const preguntaIds = respuestasEstudiante.map((r) => r.preguntaId);

    const preguntasConRespuestas = await this.prisma.pregunta.findMany({
      where: { id: { in: preguntaIds } },
      include: {
        respuestas: { select: { id: true, esCorrecta: true } },
        subtema: { include: { tema: { select: { area: true } } } },
      },
    });

    const preguntaInfoPorId = new Map(
      preguntasConRespuestas.map((pregunta) => [
        pregunta.id,
        {
          area: pregunta.subtema.tema.area,
          respuestaCorrectaId:
            pregunta.respuestas.find((r) => r.esCorrecta === true)?.id ?? null,
        },
      ]),
    );

    let correctas = 0;
    const detalle: Array<{
      preguntaId: string;
      esCorrecto: boolean;
      respuestaCorrectaId: string;
    }> = [];
    const porArea: Record<string, { total: number; correctas: number }> = {};

    for (const respuestaAlumno of respuestasEstudiante) {
      const preguntaInfo = preguntaInfoPorId.get(respuestaAlumno.preguntaId);
      if (!preguntaInfo) continue;

      const esCorrecto =
        preguntaInfo.respuestaCorrectaId === respuestaAlumno.respuestaId;
      if (esCorrecto) correctas++;

      if (!porArea[preguntaInfo.area])
        porArea[preguntaInfo.area] = { total: 0, correctas: 0 };
      porArea[preguntaInfo.area].total++;
      if (esCorrecto) porArea[preguntaInfo.area].correctas++;

      detalle.push({
        preguntaId: respuestaAlumno.preguntaId,
        esCorrecto,
        respuestaCorrectaId: preguntaInfo.respuestaCorrectaId ?? '',
      });
    }

    const totalPreguntas = respuestasEstudiante.length;
    const puntaje = Math.round((correctas / totalPreguntas) * 100 * 10) / 10;

    const xpGanado =
      correctas * 10 + (puntaje >= 80 ? 50 : puntaje >= 60 ? 25 : 0);

    const desglose: Array<{
      area: string;
      total: number;
      correctas: number;
      puntaje: number;
    }> = [];

    if (usuarioId) {
      const resultados = Object.entries(porArea).map(([area, stats]) => {
        const puntajeArea =
          Math.round((stats.correctas / stats.total) * 100 * 10) / 10;
        const xpArea = Math.round(xpGanado * (stats.total / totalPreguntas));

        return {
          usuarioId,
          area: area as AreaIcfes,
          totalPreguntas: stats.total,
          respuestasCorrectas: stats.correctas,
          puntaje: puntajeArea,
          xpGanado: xpArea,
        };
      });

      if (resultados.length > 0) {
        await this.prisma.resultadoSimulacro.createMany({ data: resultados });
      }

      desglose.push(
        ...resultados.map((resultado) => ({
          area: resultado.area,
          total: resultado.totalPreguntas,
          correctas: resultado.respuestasCorrectas,
          puntaje: resultado.puntaje,
        })),
      );

      // Sumar XP al usuario
      await this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { xpTotal: { increment: xpGanado } },
      });
    }

    return {
      mensaje: '¡Simulacro personalizado calificado!',
      resumen: {
        totalPreguntas,
        respuestasCorrectas: correctas,
        respuestasIncorrectas: totalPreguntas - correctas,
        puntaje: `${puntaje}%`,
        xpGanado,
      },
      desglose,
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

  async obtenerPreguntasPorSubtema(subtemaId: string) {
    return this.prisma.pregunta.findMany({
      where: { subtemaId },
      include: {
        respuestas: {
          select: { id: true, texto: true },
        },
        subtema: {
          include: {
            tema: {
              select: { nombre: true, area: true },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });
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
          contenido: s.contenido,
          videoUrl: s.videoUrl,
          imagenUrl: s.imagenUrl,
          tipoInteractivo: s.tipoInteractivo,
          datosInteractivo: s.datosInteractivo,
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

    const temasVistos = progresos.length;

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

    progresos.forEach((p) => {
      const area = p.subtema.tema.area;

      if (!porArea[area])
        porArea[area] = { vistos: 0, completados: 0, total: 0 };

      porArea[area].vistos++;

      if (p.completado) porArea[area].completados++;
    });

    // Progreso por subtema (para el menú lateral)
    const porSubtema: Record<string, number> = {};

    progresos.forEach((p) => {
      porSubtema[p.subtemaId] = p.porcentaje;
    });

    return {
      totalSubtemas: todoLosSubtemas,

      temasVistos,

      temasCompletados,
      porcentajeGeneral,
      porArea,
      porSubtema,
    };
  }
}
