import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AreaIcfes } from '@prisma/client';

@Injectable()
export class SimulacroService {
  constructor(private prisma: PrismaService) {}

  async generarSimulacro(area: AreaIcfes, cantidad: number = 25) {
    const preguntas = await this.prisma.pregunta.findMany({
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
          },
        },
      },
      take: cantidad,
    });

    return {
      mensaje: `Simulacro de ${area} generado con éxito`,
      totalPreguntas: preguntas.length,
      preguntas: preguntas,
    };
  }
  async poblarBaseDeDatos() {
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
}
