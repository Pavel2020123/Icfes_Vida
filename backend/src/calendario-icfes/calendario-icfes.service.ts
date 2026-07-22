import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarioTipo } from '@prisma/client';

// Cuántos días antes del examen real vence el plan, para que el
// estudiante llegue descansado. Ver "Vigencia de los planes" en el roadmap.
export const DIAS_ANTES_DEL_EXAMEN = 2;

@Injectable()
export class CalendarioIcfesService {
  constructor(private prisma: PrismaService) {}

  // ─── ADMIN: CRUD DE FECHAS OFICIALES ───────────────────────
  async crear(anio: number, calendario: CalendarioTipo, fechaExamen: Date) {
    const yaExiste = await this.prisma.calendarioIcfes.findUnique({
      where: { anio_calendario: { anio, calendario } },
    });
    if (yaExiste) {
      throw new BadRequestException(
        `Ya existe una fecha para el Calendario ${calendario} del año ${anio}. Edítala en vez de crear otra.`,
      );
    }

    return this.prisma.calendarioIcfes.create({
      data: { anio, calendario, fechaExamen },
    });
  }

  async listar() {
    return this.prisma.calendarioIcfes.findMany({
      orderBy: [{ anio: 'desc' }, { calendario: 'asc' }],
    });
  }

  async actualizar(id: string, fechaExamen: Date) {
    const registro = await this.prisma.calendarioIcfes.findUnique({
      where: { id },
    });
    if (!registro)
      throw new NotFoundException('Fecha de calendario no encontrada.');

    return this.prisma.calendarioIcfes.update({
      where: { id },
      data: { fechaExamen },
    });
  }

  async eliminar(id: string) {
    const registro = await this.prisma.calendarioIcfes.findUnique({
      where: { id },
    });
    if (!registro)
      throw new NotFoundException('Fecha de calendario no encontrada.');

    return this.prisma.calendarioIcfes.delete({ where: { id } });
  }

  // ─── USO GENERAL: PRÓXIMA FECHA DE EXAMEN ──────────────────
  // Devuelve la próxima fecha de presentación (hoy o futura) para el
  // calendario dado. La usan: el countdown (punto 26/81) y el cálculo
  // de vigencia de planes (puntos 9, 12, 13).
  async obtenerProximaFecha(calendario: CalendarioTipo) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const proxima = await this.prisma.calendarioIcfes.findFirst({
      where: { calendario, fechaExamen: { gte: hoy } },
      orderBy: { fechaExamen: 'asc' },
    });

    return proxima;
  }

  // ─── CÁLCULO DE VIGENCIA DEL PLAN ──────────────────────────
  // Fecha en la que debe vencer un plan (individual o institucional)
  // para ese calendario: DIAS_ANTES_DEL_EXAMEN antes del examen real.
  // Si no hay fecha oficial cargada todavía, devuelve null: quien
  // llama decide qué hacer (ej. no bloquear, o avisar al admin).
  async calcularVigencia(calendario: CalendarioTipo): Promise<Date | null> {
    const proximaFecha = await this.obtenerProximaFecha(calendario);
    if (!proximaFecha) return null;

    const vigencia = new Date(proximaFecha.fechaExamen);
    vigencia.setDate(vigencia.getDate() - DIAS_ANTES_DEL_EXAMEN);
    return vigencia;
  }
}
