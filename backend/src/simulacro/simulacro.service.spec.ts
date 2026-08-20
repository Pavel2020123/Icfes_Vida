import { PrismaService } from '../prisma/prisma.service';
import { SimulacroService } from './simulacro.service';

describe('SimulacroService', () => {
  let ultimaConsultaPreguntas: unknown;
  let preguntasDevueltas: unknown[] = [];

  const preguntaRepositorio = {
    findMany: jest.fn((consulta: unknown) => {
      ultimaConsultaPreguntas = consulta;
      return Promise.resolve(preguntasDevueltas);
    }),
  };
  const resultadoRepositorio = {
    create: jest.fn().mockResolvedValue({ id: 'resultado-1' }),
    createMany: jest.fn(),
  };
  const usuarioRepositorio = {
    update: jest.fn().mockResolvedValue({ id: 'usuario-1' }),
  };
  const prisma = {
    pregunta: preguntaRepositorio,
    resultadoSimulacro: resultadoRepositorio,
    usuario: usuarioRepositorio,
  } as unknown as PrismaService;
  const service = new SimulacroService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    ultimaConsultaPreguntas = undefined;
    preguntasDevueltas = [];
  });

  it('no selecciona explicaciones ni respuestas correctas al generar', async () => {
    preguntasDevueltas = [
      {
        id: 'pregunta-1',
        enunciado: '¿Cuánto es 2 + 2?',
        imagenUrl: null,
        dificultad: 'BASICO',
        respuestas: [
          { id: 'respuesta-a', texto: '3' },
          { id: 'respuesta-b', texto: '4' },
        ],
        subtema: {
          nombre: 'Suma',
          tema: { nombre: 'Aritmética', area: 'MATEMATICAS' },
        },
      },
    ];

    const resultado = await service.generarSimulacro('MATEMATICAS', 1);
    const consultaSerializada = JSON.stringify(ultimaConsultaPreguntas);

    expect(resultado.preguntas).toHaveLength(1);
    expect(consultaSerializada).not.toContain('explicacion');
    expect(consultaSerializada).not.toContain('esCorrecta');
  });

  it('entrega la revisión explicada únicamente después de calificar', async () => {
    preguntasDevueltas = [
      {
        id: 'pregunta-1',
        enunciado: '¿Cuánto es 2 + 2?',
        imagenUrl: null,
        explicacion: 'Al sumar dos unidades con otras dos se obtienen cuatro.',
        respuestas: [
          {
            id: 'respuesta-a',
            texto: '3',
            explicacion: 'Falta una unidad.',
            esCorrecta: false,
          },
          {
            id: 'respuesta-b',
            texto: '4',
            explicacion: 'Es la suma correcta.',
            esCorrecta: true,
          },
        ],
      },
    ];

    const resultado = await service.calificarSimulacro(
      'usuario-1',
      'MATEMATICAS',
      [{ preguntaId: 'pregunta-1', respuestaId: 'respuesta-a' }],
    );

    expect(resultado.resumen.respuestasCorrectas).toBe(0);
    expect(resultado.detalle).toEqual([
      {
        preguntaId: 'pregunta-1',
        enunciado: '¿Cuánto es 2 + 2?',
        imagenUrl: null,
        esCorrecto: false,
        respuestaSeleccionadaId: 'respuesta-a',
        respuestaCorrectaId: 'respuesta-b',
        explicacion: 'Al sumar dos unidades con otras dos se obtienen cuatro.',
        respuestas: preguntasDevueltas[0]
          ? (preguntasDevueltas[0] as { respuestas: unknown[] }).respuestas
          : [],
      },
    ]);
    expect(JSON.stringify(ultimaConsultaPreguntas)).toContain('explicacion');
  });
});
