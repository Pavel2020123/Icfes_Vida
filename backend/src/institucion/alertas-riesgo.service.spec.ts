import { UnauthorizedException } from '@nestjs/common';
import { AreaIcfes } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AlertasRiesgoService } from './alertas-riesgo.service';

describe('AlertasRiesgoService', () => {
  const usuario = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  };
  const subtema = { count: jest.fn() };
  const historialRespuesta = { groupBy: jest.fn() };
  const prisma = {
    usuario,
    subtema,
    historialRespuesta,
  } as unknown as PrismaService;
  const service = new AlertasRiesgoService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-08-20T15:00:00Z'));
    usuario.findUnique.mockResolvedValue({
      rol: 'PROFESOR',
      institucionId: 'institucion-1',
    });
    subtema.count.mockResolvedValue(20);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('clasifica y ordena alertas usando diagnóstico, actividad y rendimiento', async () => {
    usuario.findMany.mockResolvedValue([
      {
        id: 'estudiante-critico',
        nombre: 'Andrea Riesgo',
        correo: 'andrea@colegio.com',
        fechaCreacion: new Date('2026-07-01T15:00:00Z'),
        ClaseEstudiante: [{ Clase: { id: 'grupo-1', nombre: 'Once A' } }],
        diagnosticoInicial: {
          completadoEn: new Date('2026-07-10T15:00:00Z'),
          porcentaje: 30,
          nivel: 'POR_REFORZAR',
          resultadosPorArea: [
            { area: AreaIcfes.MATEMATICAS, porcentaje: 20 },
            { area: AreaIcfes.LECTURA_CRITICA, porcentaje: 40 },
          ],
        },
        historialRespuestas: [
          { fechaRespuesta: new Date('2026-08-01T15:00:00Z') },
        ],
        resultados: [],
        progresotemas: [
          { completado: true, fechaVisto: new Date('2026-07-30T15:00:00Z') },
        ],
      },
      {
        id: 'estudiante-pendiente',
        nombre: 'Bruno Pendiente',
        correo: 'bruno@colegio.com',
        fechaCreacion: new Date('2026-08-16T15:00:00Z'),
        ClaseEstudiante: [],
        diagnosticoInicial: null,
        historialRespuestas: [
          { fechaRespuesta: new Date('2026-08-19T15:00:00Z') },
        ],
        resultados: [],
        progresotemas: [],
      },
      {
        id: 'estudiante-sin-riesgo',
        nombre: 'Carla Estable',
        correo: 'carla@colegio.com',
        fechaCreacion: new Date('2026-08-01T15:00:00Z'),
        ClaseEstudiante: [],
        diagnosticoInicial: {
          completadoEn: new Date('2026-08-02T15:00:00Z'),
          porcentaje: 80,
          nivel: 'FORTALEZA',
          resultadosPorArea: [{ area: AreaIcfes.MATEMATICAS, porcentaje: 80 }],
        },
        historialRespuestas: [
          { fechaRespuesta: new Date('2026-08-19T15:00:00Z') },
        ],
        resultados: [],
        progresotemas: [
          { completado: true, fechaVisto: new Date('2026-08-18T15:00:00Z') },
        ],
      },
    ]);
    historialRespuesta.groupBy.mockResolvedValue([
      {
        usuarioId: 'estudiante-critico',
        area: AreaIcfes.MATEMATICAS,
        esCorrecta: false,
        _count: { _all: 4 },
      },
      {
        usuarioId: 'estudiante-critico',
        area: AreaIcfes.MATEMATICAS,
        esCorrecta: true,
        _count: { _all: 1 },
      },
      {
        usuarioId: 'estudiante-sin-riesgo',
        area: AreaIcfes.MATEMATICAS,
        esCorrecta: false,
        _count: { _all: 2 },
      },
      {
        usuarioId: 'estudiante-sin-riesgo',
        area: AreaIcfes.MATEMATICAS,
        esCorrecta: true,
        _count: { _all: 8 },
      },
    ]);

    const resultado = await service.obtenerAlertas('profesor-1');

    expect(resultado.resumen).toEqual({
      totalEstudiantes: 3,
      enRiesgo: 2,
      criticas: 1,
      altas: 0,
      atencion: 1,
      sinAlertas: 1,
    });
    expect(resultado.alertas.map((alerta) => alerta.estudiante.id)).toEqual([
      'estudiante-critico',
      'estudiante-pendiente',
    ]);
    expect(resultado.alertas[0]).toEqual(
      expect.objectContaining({
        nivel: 'CRITICA',
        areaPrioritaria: AreaIcfes.MATEMATICAS,
        actividad: expect.objectContaining({
          porcentajeAciertosReciente: 20,
          respuestasUltimos30Dias: 5,
        }),
      }),
    );
    expect(resultado.alertas[0].razones.map((razon) => razon.codigo)).toEqual(
      expect.arrayContaining([
        'INACTIVIDAD',
        'DIAGNOSTICO_BAJO',
        'RENDIMIENTO_RECIENTE',
      ]),
    );
    expect(resultado.alertas[1].razones).toEqual([
      expect.objectContaining({ codigo: 'DIAGNOSTICO_PENDIENTE' }),
    ]);
  });

  it('devuelve un resumen vacío cuando la institución no tiene estudiantes', async () => {
    usuario.findMany.mockResolvedValue([]);

    const resultado = await service.obtenerAlertas('profesor-1');

    expect(resultado.resumen).toEqual({
      totalEstudiantes: 0,
      enRiesgo: 0,
      criticas: 0,
      altas: 0,
      atencion: 0,
      sinAlertas: 0,
    });
    expect(resultado.alertas).toEqual([]);
    expect(historialRespuesta.groupBy).not.toHaveBeenCalled();
  });

  it('impide que un estudiante consulte alertas de la institución', async () => {
    usuario.findUnique.mockResolvedValue({
      rol: 'ESTUDIANTE',
      institucionId: 'institucion-1',
    });

    await expect(service.obtenerAlertas('estudiante-1')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(usuario.findMany).not.toHaveBeenCalled();
  });
});
