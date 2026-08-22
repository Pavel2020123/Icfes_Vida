import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AudienciaAnuncio, RolUsuario, TipoAnuncio } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnunciosService } from './anuncios.service';

describe('AnunciosService', () => {
  const anuncio = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const anuncioLectura = {
    upsert: jest.fn(),
    createMany: jest.fn(),
  };
  const prisma = { anuncio, anuncioLectura } as unknown as PrismaService;
  const service = new AnunciosService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('lista solo la audiencia del estudiante y calcula pendientes', async () => {
    anuncio.findMany.mockResolvedValue([
      {
        id: 'anuncio-1',
        titulo: 'Nuevo simulacro',
        lecturas: [],
      },
      {
        id: 'anuncio-2',
        titulo: 'Horario especial',
        lecturas: [{ fechaLectura: new Date('2026-08-21T15:00:00Z') }],
      },
    ]);

    const resultado = await service.listarParaUsuario(
      'usuario-1',
      RolUsuario.ESTUDIANTE,
    );

    expect(resultado.pendientes).toBe(1);
    expect(resultado.anuncios[0]).toMatchObject({
      id: 'anuncio-1',
      leido: false,
      fechaLectura: null,
    });
    const llamadas = anuncio.findMany.mock.calls as Array<
      [
        {
          where: {
            activo: boolean;
            audiencia: { in: AudienciaAnuncio[] };
          };
        },
      ]
    >;
    expect(llamadas[0][0].where.activo).toBe(true);
    expect(llamadas[0][0].where.audiencia.in).toEqual([
      AudienciaAnuncio.TODOS,
      AudienciaAnuncio.ESTUDIANTES,
    ]);
  });

  it('registra la lectura de forma idempotente', async () => {
    anuncio.findFirst.mockResolvedValue({ id: 'anuncio-1' });
    anuncioLectura.upsert.mockResolvedValue({
      fechaLectura: new Date('2026-08-21T15:00:00Z'),
    });

    const resultado = await service.marcarLeido(
      'anuncio-1',
      'usuario-1',
      RolUsuario.PROFESOR,
    );

    expect(resultado.leido).toBe(true);
    expect(anuncioLectura.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          anuncioId_usuarioId: {
            anuncioId: 'anuncio-1',
            usuarioId: 'usuario-1',
          },
        },
      }),
    );
  });

  it('rechaza marcar un anuncio vencido o ajeno a la audiencia', async () => {
    anuncio.findFirst.mockResolvedValue(null);

    await expect(
      service.marcarLeido('ausente', 'usuario-1', RolUsuario.ESTUDIANTE),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('valida que la finalizacion sea posterior al inicio', () => {
    expect(() =>
      service.crear({
        titulo: 'Aviso',
        contenido: 'Contenido',
        tipo: TipoAnuncio.INFORMACION,
        audiencia: AudienciaAnuncio.TODOS,
        fechaInicio: '2026-08-22T12:00:00.000Z',
        fechaFin: '2026-08-21T12:00:00.000Z',
        activo: true,
        destacado: false,
      }),
    ).toThrow(BadRequestException);
    expect(anuncio.create).not.toHaveBeenCalled();
  });

  it('marca en lote todos los anuncios visibles', async () => {
    anuncio.findMany.mockResolvedValue([{ id: 'a-1' }, { id: 'a-2' }]);
    anuncioLectura.createMany.mockResolvedValue({ count: 2 });

    await expect(
      service.marcarTodosLeidos('usuario-1', RolUsuario.ESTUDIANTE),
    ).resolves.toEqual({ marcados: 2 });
    expect(anuncioLectura.createMany).toHaveBeenCalledWith({
      data: [
        { anuncioId: 'a-1', usuarioId: 'usuario-1' },
        { anuncioId: 'a-2', usuarioId: 'usuario-1' },
      ],
      skipDuplicates: true,
    });
  });
});
