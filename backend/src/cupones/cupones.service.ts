import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TipoPlan } from '@prisma/client';

export interface ResultadoCupon {
  cuponId: string;
  codigo: string;
  porcentajeDescuento: number;
  montoOriginal: number;
  montoConDescuento: number;
}

@Injectable()
export class CuponesService {
  constructor(private prisma: PrismaService) {}

  // ─── ADMIN: CRUD ────────────────────────────────────────────
  async crear(datos: {
    codigo: string;
    porcentajeDescuento: number;
    tipoPlan?: TipoPlan;
    fechaExpiracion: Date;
    usosMaximos?: number;
  }) {
    const codigo = datos.codigo.trim().toUpperCase();

    const yaExiste = await this.prisma.cupon.findUnique({
      where: { codigo },
    });
    if (yaExiste) {
      throw new BadRequestException(
        `Ya existe un cupón con el código "${codigo}".`,
      );
    }

    return this.prisma.cupon.create({
      data: {
        codigo,
        porcentajeDescuento: datos.porcentajeDescuento,
        tipoPlan: datos.tipoPlan,
        fechaExpiracion: datos.fechaExpiracion,
        usosMaximos: datos.usosMaximos,
      },
    });
  }

  async listar() {
    return this.prisma.cupon.findMany({
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  // Punto 13: el admin también puede apagar el cupón antes de tiempo
  // (ej. si se le fue la mano con el 34% de descuento), o reajustar
  // vigencia/cupo sin tener que borrarlo y perder el historial de uso.
  async actualizar(
    id: string,
    datos: {
      activo?: boolean;
      porcentajeDescuento?: number;
      fechaExpiracion?: Date;
      usosMaximos?: number | null;
    },
  ) {
    const cupon = await this.prisma.cupon.findUnique({ where: { id } });
    if (!cupon) throw new NotFoundException('Cupón no encontrado.');

    return this.prisma.cupon.update({
      where: { id },
      data: datos,
    });
  }

  async eliminar(id: string) {
    const cupon = await this.prisma.cupon.findUnique({ where: { id } });
    if (!cupon) throw new NotFoundException('Cupón no encontrado.');

    return this.prisma.cupon.delete({ where: { id } });
  }

  // ─── VALIDAR SIN CONSUMIR (para mostrarle el descuento antes de pagar) ─
  async validar(codigo: string, tipoPlan: TipoPlan): Promise<ResultadoCupon> {
    const cupon = await this.buscarCuponUtilizable(codigo, tipoPlan);

    // montoOriginal no se conoce todavía en la validación previa (el
    // frontend puede llamarla antes de elegir el plan exacto), así que
    // aquí solo confirmamos que el cupón es válido y su porcentaje.
    return {
      cuponId: cupon.id,
      codigo: cupon.codigo,
      porcentajeDescuento: cupon.porcentajeDescuento,
      montoOriginal: 0,
      montoConDescuento: 0,
    };
  }

  // ─── APLICAR: consume un uso de forma atómica y devuelve el precio ──
  // Se llama justo antes de crear la orden de pago (pagos.service). El
  // UPDATE con `usosActuales: { lt: usosMaximos }` es atómico a nivel de
  // base de datos, así que dos personas usando el último cupo al mismo
  // tiempo no pueden "robarse" el mismo uso (condición de carrera).
  async aplicar(
    codigo: string,
    tipoPlan: TipoPlan,
    montoOriginal: number,
  ): Promise<ResultadoCupon> {
    const cupon = await this.buscarCuponUtilizable(codigo, tipoPlan);

    if (cupon.usosMaximos !== null) {
      const resultado = await this.prisma.cupon.updateMany({
        where: { id: cupon.id, usosActuales: { lt: cupon.usosMaximos } },
        data: { usosActuales: { increment: 1 } },
      });

      if (resultado.count === 0) {
        throw new BadRequestException(
          'Este cupón ya alcanzó su límite de usos.',
        );
      }
    } else {
      await this.prisma.cupon.update({
        where: { id: cupon.id },
        data: { usosActuales: { increment: 1 } },
      });
    }

    const montoConDescuento = Math.round(
      montoOriginal * (1 - cupon.porcentajeDescuento / 100),
    );

    return {
      cuponId: cupon.id,
      codigo: cupon.codigo,
      porcentajeDescuento: cupon.porcentajeDescuento,
      montoOriginal,
      montoConDescuento,
    };
  }

  // ─── REGLAS COMPARTIDAS: existe, está activo, no expiró, aplica al plan ─
  private async buscarCuponUtilizable(codigo: string, tipoPlan: TipoPlan) {
    const cupon = await this.prisma.cupon.findUnique({
      where: { codigo: codigo.trim().toUpperCase() },
    });

    if (!cupon) {
      throw new BadRequestException('Ese cupón no existe.');
    }

    if (!cupon.activo) {
      throw new BadRequestException('Ese cupón ya no está activo.');
    }

    if (cupon.fechaExpiracion.getTime() < Date.now()) {
      throw new BadRequestException('Ese cupón ya expiró.');
    }

    // tipoPlan null en el cupón = aplica a cualquier plan individual.
    if (cupon.tipoPlan && cupon.tipoPlan !== tipoPlan) {
      throw new BadRequestException(
        'Ese cupón no aplica al plan que elegiste.',
      );
    }

    if (cupon.usosMaximos !== null && cupon.usosActuales >= cupon.usosMaximos) {
      throw new BadRequestException(
        'Este cupón ya alcanzó su límite de usos.',
      );
    }

    return cupon;
  }
}
