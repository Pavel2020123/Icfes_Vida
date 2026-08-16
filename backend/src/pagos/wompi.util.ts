import * as crypto from 'crypto';
import { Grado } from '@prisma/client';

// ─── PRECIOS SABERPLUS (actualizados 2026) ───────────────────
export const PRECIO_INDIVIDUAL_COP: Record<Grado, number> = {
  DECIMO: 12900,
  ONCE: 12900,
};

export const PRECIO_TEMPORADA_COP = {
  TEMPORADA_A: 79900,
  TEMPORADA_B: 49900,
};

// Precios institucionales por estudiante/mes
export const PRECIO_INSTITUCIONAL_COP = {
  RANGO_20_50: 4900,
  RANGO_51_100: 3900,
  RANGO_101_PLUS: 2900,
};

// ─── FIRMA DE SEGURIDAD DEL WEBHOOK DE WOMPI ────────────────
export interface DatosFirmaWompi {
  ref_payco: string;
  transaction_id: string;
  amount: string;
  currency: string;
}

export function calcularFirmaWompi(
  datos: DatosFirmaWompi,
  eventKey: string,
): string {
  const cadena = [
    datos.ref_payco,
    datos.transaction_id,
    datos.amount,
    datos.currency,
    eventKey,
  ].join('');

  return crypto.createHash('sha256').update(cadena).digest('hex');
}

export function firmaWompiValida(
  datos: DatosFirmaWompi & { signature: string },
  eventKey: string,
): boolean {
  const firmaCalculada = calcularFirmaWompi(datos, eventKey);
  const bufferCalculada = Buffer.from(firmaCalculada);
  const bufferRecibida = Buffer.from(datos.signature || '');

  if (bufferCalculada.length !== bufferRecibida.length) return false;
  return crypto.timingSafeEqual(bufferCalculada, bufferRecibida);
}

// ─── MAPEO DE RESPUESTA DE WOMPI → ESTADO INTERNO ───────────
export function estadoDesdeRespuestaWompi(
  status: string,
): 'APROBADA' | 'RECHAZADA' | 'PENDIENTE_BANCO' | 'FALLIDA' {
  switch (status) {
    case 'APPROVED':
      return 'APROBADA';
    case 'DECLINED':
      return 'RECHAZADA';
    case 'PENDING':
      return 'PENDIENTE_BANCO';
    case 'VOIDED':
    case 'ERROR':
    default:
      return 'FALLIDA';
  }
}
