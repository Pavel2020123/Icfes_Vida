import * as crypto from 'crypto';

// Un único pago cubre el acceso completo hasta la convocatoria activa.
export const PRECIO_ACCESO_COMPLETO_COP = 45000;

// Valores de referencia por estudiante y convocatoria.
export const PRECIO_INSTITUCIONAL_COP = {
  RANGO_10_39: 35000,
  RANGO_40_99: 30000,
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
