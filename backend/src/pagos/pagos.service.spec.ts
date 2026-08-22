import { PrismaService } from '../prisma/prisma.service';
import { CalendarioIcfesService } from '../calendario-icfes/calendario-icfes.service';
import { CuponesService } from '../cupones/cupones.service';
import { PagosService } from './pagos.service';
import { PRECIO_ACCESO_COMPLETO_COP } from './wompi.util';
import { ReferidosService } from '../referidos/referidos.service';

describe('PagosService', () => {
  let llamadaCrearOrden: { data: Record<string, unknown> } | undefined;
  const usuarioRepositorio = { findUnique: jest.fn() };
  const pagoOrdenRepositorio = {
    create: jest.fn((argumento: unknown) => {
      llamadaCrearOrden = argumento as { data: Record<string, unknown> };
      return Promise.resolve({ id: 'orden-1' });
    }),
  };
  const transaccion = { pagoOrden: pagoOrdenRepositorio };
  const ejecutarTransaccion = jest.fn(
    (operacion: (tx: typeof transaccion) => unknown) =>
      Promise.resolve(operacion(transaccion)),
  );
  const prisma = {
    usuario: usuarioRepositorio,
    $transaction: ejecutarTransaccion,
  } as unknown as PrismaService;
  const calendarioService = {
    obtenerCalendarioActivo: jest.fn(),
    calcularFinDelExamen: jest.fn(),
  } as unknown as CalendarioIcfesService;
  const cuponesService = {
    aplicar: jest.fn(),
    aplicarAutomatica: jest.fn(),
  } as unknown as CuponesService;
  const referidosService = {
    reservarSaldo: jest.fn().mockResolvedValue(0),
    devolverSaldo: jest.fn(),
    recompensarPrimerPago: jest.fn(),
  } as unknown as ReferidosService;
  const service = new PagosService(
    prisma,
    calendarioService,
    cuponesService,
    referidosService,
  );
  const publicKeyAnterior = process.env.WOMPI_PUBLIC_KEY;
  const frontendUrlAnterior = process.env.FRONTEND_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    llamadaCrearOrden = undefined;
    process.env.WOMPI_PUBLIC_KEY = 'public-key-prueba';
    process.env.FRONTEND_URL = 'http://localhost:3001';
  });

  afterAll(() => {
    process.env.WOMPI_PUBLIC_KEY = publicKeyAnterior;
    process.env.FRONTEND_URL = frontendUrlAnterior;
  });

  it('crea un único acceso de $45.000 ligado al calendario activo', async () => {
    const fechaExamen = new Date('2099-08-15T12:00:00.000Z');
    const fechaVencimientoAcceso = new Date('2099-08-15T23:59:59.999Z');
    usuarioRepositorio.findUnique.mockResolvedValue({
      id: 'usuario-1',
      correo: 'estudiante@example.com',
      nombre: 'Estudiante',
      rol: 'ESTUDIANTE',
      institucionId: null,
      grado: null,
    });
    (calendarioService.obtenerCalendarioActivo as jest.Mock).mockResolvedValue({
      calendario: 'A',
      fechaExamen,
    });
    (calendarioService.calcularFinDelExamen as jest.Mock).mockReturnValue(
      fechaVencimientoAcceso,
    );
    (cuponesService.aplicarAutomatica as jest.Mock).mockResolvedValue(null);

    const resultado = await service.crearOrden('usuario-1');

    expect(PRECIO_ACCESO_COMPLETO_COP).toBe(45_000);
    expect(resultado).toEqual(
      expect.objectContaining({
        amount: 45_000,
        montoOriginal: 45_000,
        tipoPlan: 'MENSUAL',
        calendarioIcfes: 'A',
        fechaVencimientoAcceso,
        creditoReferidosUsado: 0,
      }),
    );
    expect(llamadaCrearOrden?.data).toEqual(
      expect.objectContaining({
        usuarioId: 'usuario-1',
        monto: 45_000,
        grado: null,
        tipoPlan: 'MENSUAL',
        calendarioIcfes: 'A',
        fechaVencimientoAcceso,
        creditoReferidosUsado: 0,
      }),
    );
  });
});
