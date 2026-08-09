import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Grado } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarioIcfesService } from '../calendario-icfes/calendario-icfes.service';
import {
  PRECIO_INDIVIDUAL_COP,
  estadoDesdeRespuestaEpayco,
  firmaEpaycoValida,
} from './epayco.util';

// Fallback si todavía no se ha cargado la fecha oficial del ICFES para
// el calendario del estudiante (punto 6). No debería pasar en
// producción una vez el admin cargue las fechas, pero preferimos darle
// un año de acceso a quien ya pagó antes que dejarlo bloqueado por un
// dato administrativo que falta. Se registra como advertencia para
// que el admin lo revise.
const DIAS_VIGENCIA_RESPALDO = 365;

interface DatosWebhookEpayco {
  x_ref_payco?: string;
  ref_payco?: string;
  x_id_invoice?: string;
  x_transaction_id?: string;
  x_amount?: string;
  x_currency_code?: string;
  x_response?: string;
  x_response_reason_text?: string;
  x_signature?: string;
  [clave: string]: unknown;
}

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);

  constructor(
    private prisma: PrismaService,
    private calendarioIcfesService: CalendarioIcfesService,
  ) {}

  // ─── CREAR ORDEN (antes de mandar al estudiante a ePayco) ────
  async crearOrden(usuarioId: string, grado: Grado) {
    const publicKey = process.env.EPAYCO_PUBLIC_KEY;
    if (!publicKey) {
      // No tumbamos el resto de la app por esto (a diferencia de
      // JWT_SECRET): solo este flujo queda inhabilitado hasta que se
      // configuren las llaves de ePayco.
      this.logger.error(
        'EPAYCO_PUBLIC_KEY no está configurada. No se puede crear la orden de pago.',
      );
      throw new ServiceUnavailableException(
        'La pasarela de pago no está disponible en este momento. Intenta más tarde.',
      );
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        correo: true,
        nombre: true,
        rol: true,
        institucionId: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // Igual que el muro de pago (plan.util.ts): esto es solo para el
    // estudiante individual. Los de institución no pagan aquí.
    if (usuario.institucionId) {
      throw new BadRequestException(
        'Tu acceso lo gestiona tu institución; no necesitas pagar individualmente.',
      );
    }

    if (usuario.rol !== 'ESTUDIANTE') {
      throw new BadRequestException(
        'Este plan de pago es para estudiantes individuales.',
      );
    }

    const monto = PRECIO_INDIVIDUAL_COP[grado];
    const factura = this.generarFactura();

    await this.prisma.$transaction([
      this.prisma.pagoOrden.create({
        data: {
          factura,
          usuarioId: usuario.id,
          grado,
          monto,
          moneda: 'COP',
          estado: 'PENDIENTE',
        },
      }),
      // Guardamos el grado ya desde aquí para que quede consistente en
      // el perfil, aunque el plan solo se active cuando ePayco confirme
      // el pago (ver confirmarPago).
      this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { grado },
      }),
    ]);

    const nombreGrado = grado === 'DECIMO' ? '10' : '11';

    return {
      factura,
      publicKey,
      test: process.env.EPAYCO_TEST_MODE !== 'false',
      amount: monto,
      currency: 'cop',
      country: 'co',
      name: `Plan individual ICFES Vida — Grado ${nombreGrado}`,
      description: `Acceso a la plataforma ICFES Vida para grado ${nombreGrado}`,
      email: usuario.correo,
      nombre: usuario.nombre,
    };
  }

  // ─── WEBHOOK DE CONFIRMACIÓN (servidor a servidor) ───────────
  // IMPORTANTE: siempre responder 2xx cuando ya se pudo leer y
  // procesar la notificación (aunque el pago haya sido rechazado), o
  // ePayco seguirá reintentando. Solo se lanza error cuando la firma
  // no es válida: ahí SÍ queremos que quede registrado como sospechoso.
  async confirmarPago(datos: DatosWebhookEpayco) {
    const custId = process.env.EPAYCO_CUSTOMER_ID;
    const pKey = process.env.EPAYCO_P_KEY;

    if (!custId || !pKey) {
      this.logger.error(
        'EPAYCO_CUSTOMER_ID / EPAYCO_P_KEY no configuradas. No se puede validar el webhook de ePayco.',
      );
      throw new ServiceUnavailableException('Pasarela de pago no configurada.');
    }

    const xRefPayco = datos.x_ref_payco ?? datos.ref_payco ?? '';
    const xTransactionId = datos.x_transaction_id ?? '';
    const xAmount = datos.x_amount ?? '';
    const xCurrencyCode = datos.x_currency_code ?? '';
    const xSignature = datos.x_signature ?? '';
    const factura = datos.x_id_invoice;

    if (!factura || !xTransactionId || !xSignature) {
      this.logger.warn('Webhook de ePayco con datos incompletos.');
      throw new BadRequestException('Datos de la notificación incompletos.');
    }

    const firmaValida = firmaEpaycoValida(
      {
        x_ref_payco: xRefPayco,
        x_transaction_id: xTransactionId,
        x_amount: xAmount,
        x_currency_code: xCurrencyCode,
        x_signature: xSignature,
      },
      custId,
      pKey,
    );

    if (!firmaValida) {
      this.logger.error(
        `Firma inválida en webhook de ePayco para la factura ${factura}. Posible intento de fraude.`,
      );
      throw new ForbiddenException('Firma inválida.');
    }

    const orden = await this.prisma.pagoOrden.findUnique({
      where: { factura },
    });

    if (!orden) {
      // No hay nada que actualizar. Registramos y respondemos OK para
      // que ePayco no siga reintentando una factura que no es nuestra.
      this.logger.warn(
        `Webhook de ePayco para una factura que no existe: ${factura}`,
      );
      return { mensaje: 'Factura no encontrada, notificación ignorada.' };
    }

    // Idempotencia: si ya procesamos esta misma transacción aprobada,
    // no la volvemos a aplicar (ePayco puede reintentar el webhook).
    if (orden.estado === 'APROBADA' && orden.transaccionId === xTransactionId) {
      return { mensaje: 'Transacción ya procesada.' };
    }

    const nuevoEstado = estadoDesdeRespuestaEpayco(datos.x_response ?? '');

    await this.prisma.pagoOrden.update({
      where: { id: orden.id },
      data: {
        estado: nuevoEstado,
        refPayco: xRefPayco || null,
        transaccionId: xTransactionId,
        motivoRespuesta: datos.x_response_reason_text ?? null,
      },
    });

    if (nuevoEstado === 'APROBADA') {
      await this.activarPlanPagado(orden.usuarioId, orden.grado);
    }

    return { mensaje: 'Notificación procesada.' };
  }

  // ─── ACTIVAR EL PLAN TRAS UN PAGO APROBADO ───────────────────
  private async activarPlanPagado(usuarioId: string, grado: Grado) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { calendarioIcfes: true },
    });
    if (!usuario) return;

    const calendario = usuario.calendarioIcfes ?? 'A';
    let vigencia =
      await this.calendarioIcfesService.calcularVigencia(calendario);

    if (!vigencia) {
      this.logger.warn(
        `No hay fecha oficial de ICFES cargada para el Calendario ${calendario}. ` +
          `Usando ${DIAS_VIGENCIA_RESPALDO} días de respaldo para el usuario ${usuarioId}. ` +
          'Carga las fechas oficiales en /calendario-icfes cuanto antes.',
      );
      vigencia = new Date();
      vigencia.setDate(vigencia.getDate() + DIAS_VIGENCIA_RESPALDO);
    }

    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { fechaVencimientoPlan: vigencia, grado },
    });
  }

  // ─── CONSULTA DE ESTADO (para la página de respuesta) ────────
  async obtenerEstadoOrden(usuarioId: string, factura: string) {
    const orden = await this.prisma.pagoOrden.findUnique({
      where: { factura },
      select: {
        factura: true,
        usuarioId: true,
        estado: true,
        monto: true,
        grado: true,
        fechaActualizacion: true,
      },
    });

    if (!orden || orden.usuarioId !== usuarioId) {
      throw new NotFoundException('Orden no encontrada.');
    }

    return {
      factura: orden.factura,
      estado: orden.estado,
      monto: orden.monto,
      grado: orden.grado,
      fechaActualizacion: orden.fechaActualizacion,
    };
  }

  private generarFactura(): string {
    const sufijo = crypto.randomBytes(4).toString('hex');
    return `IND-${Date.now()}-${sufijo}`;
  }
}
