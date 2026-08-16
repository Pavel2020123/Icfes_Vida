import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Grado, TipoPlan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarioIcfesService } from '../calendario-icfes/calendario-icfes.service';
import {
  PRECIO_INDIVIDUAL_COP,
  PRECIO_TEMPORADA_COP,
  estadoDesdeRespuestaWompi,
  firmaWompiValida,
} from './wompi.util';

// Fallback si todavía no se ha cargado la fecha oficial del ICFES para
// el calendario del estudiante (punto 6). No debería pasar en
// producción una vez el admin cargue las fechas, pero preferimos darle
// un año de acceso a quien ya pagó antes que dejarlo bloqueado por un
// dato administrativo que falta. Se registra como advertencia para
// que el admin lo revise.
const DIAS_VIGENCIA_RESPALDO = 365;

interface DatosWebhookWompi {
  ref_payco?: string;
  transaction_id?: string;
  x_id_invoice?: string;
  amount?: string;
  currency?: string;
  status?: string;
  response_reason_text?: string;
  signature?: string;
  [clave: string]: unknown;
}

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);

  constructor(
    private prisma: PrismaService,
    private calendarioIcfesService: CalendarioIcfesService,
  ) {}

  // ─── CREAR ORDEN ──────────────────────────────────────────────
  async crearOrden(
    usuarioId: string,
    grado: Grado,
    tipoPlan: TipoPlan = 'MENSUAL',
  ) {
    const publicKey = process.env.WOMPI_PUBLIC_KEY;

    if (!publicKey) {
      this.logger.error(
        'WOMPI_PUBLIC_KEY no está configurada. No se puede crear la orden de pago.',
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

    let monto: number;
    let nombrePlan: string;

    if (tipoPlan === 'TEMPORADA_A') {
      monto = PRECIO_TEMPORADA_COP.TEMPORADA_A;
      nombrePlan = 'Temporada Calendario A';
    } else if (tipoPlan === 'TEMPORADA_B') {
      monto = PRECIO_TEMPORADA_COP.TEMPORADA_B;
      nombrePlan = 'Temporada Calendario B';
    } else {
      monto = PRECIO_INDIVIDUAL_COP[grado];
      nombrePlan = 'Plan Mensual';
    }

    const factura = this.generarFactura();

    await this.prisma.$transaction([
      this.prisma.pagoOrden.create({
        data: {
          factura,
          usuarioId: usuario.id,
          grado,
          tipoPlan,
          monto,
          moneda: 'COP',
          estado: 'PENDIENTE',
        },
      }),
      // Guardamos el grado ya desde aquí para que quede consistente en
      // el perfil, aunque el plan solo se active cuando Wompi confirme
      // el pago.
      this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { grado },
      }),
    ]);

    const nombreGrado = grado === 'DECIMO' ? '10' : '11';

    return {
      factura,
      publicKey,
      test: process.env.WOMPI_TEST_MODE !== 'false',
      amount: monto,
      currency: 'COP',
      country: 'co',
      name: `SaberPlus — ${nombrePlan}`,
      description: `Acceso ilimitado a SaberPlus. ${nombrePlan} — ${nombreGrado}`,
      email: usuario.correo,
      nombre: usuario.nombre,
      redirectUrl: `${process.env.FRONTEND_URL}/pagos/respuesta`,
      tipoPlan,
    };
  }

  // ─── WEBHOOK DE CONFIRMACIÓN ─────────────────────────────────
  async confirmarPago(datos: DatosWebhookWompi) {
    const eventKey = process.env.WOMPI_EVENT_KEY;

    if (!eventKey) {
      this.logger.error(
        'WOMPI_EVENT_KEY no configurada. No se puede validar el webhook de Wompi.',
      );

      throw new ServiceUnavailableException('Pasarela de pago no configurada.');
    }

    const refPayco = datos.ref_payco ?? '';
    const transactionId = datos.transaction_id ?? '';
    const amount = datos.amount ?? '';
    const currency = datos.currency ?? '';
    const signature = datos.signature ?? '';
    const factura = datos.x_id_invoice;

    if (!factura || !transactionId || !signature) {
      this.logger.warn('Webhook de Wompi con datos incompletos.');

      throw new BadRequestException('Datos de la notificación incompletos.');
    }

    const firmaValida = firmaWompiValida(
      {
        ref_payco: refPayco,
        transaction_id: transactionId,
        amount,
        currency,
        signature,
      },
      eventKey,
    );

    if (!firmaValida) {
      this.logger.error(
        `Firma inválida en webhook de Wompi para la factura ${factura}. Posible intento de fraude.`,
      );

      throw new ForbiddenException('Firma inválida.');
    }

    const orden = await this.prisma.pagoOrden.findUnique({
      where: { factura },
    });

    if (!orden) {
      this.logger.warn(
        `Webhook de Wompi para una factura que no existe: ${factura}`,
      );

      return {
        mensaje: 'Factura no encontrada, notificación ignorada.',
      };
    }

    // Idempotencia
    if (orden.estado === 'APROBADA' && orden.transaccionId === transactionId) {
      return {
        mensaje: 'Transacción ya procesada.',
      };
    }

    const nuevoEstado = estadoDesdeRespuestaWompi(datos.status ?? '');

    await this.prisma.pagoOrden.update({
      where: { id: orden.id },
      data: {
        estado: nuevoEstado,
        refPayco: refPayco || null,
        transaccionId: transactionId,
        motivoRespuesta: datos.response_reason_text ?? null,
      },
    });

    if (nuevoEstado === 'APROBADA') {
      await this.activarPlanPagado(orden.usuarioId, orden.grado);
    }

    return {
      mensaje: 'Notificación procesada.',
    };
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
      data: {
        fechaVencimientoPlan: vigencia,
        grado,
      },
    });
  }

  // ─── CONSULTA DE ESTADO ─────────────────────────────────────
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
