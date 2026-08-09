import * as crypto from 'crypto';
import { Grado } from '@prisma/client';

// ─── PRECIOS DEL ESTUDIANTE INDIVIDUAL (punto 9) ─────────────
// Tomados de la columna "Individual (Referencia)" de la tabla de
// precios del roadmap: $25.000 para grado 10, $35.000 para grado 11
// (igual sin importar si el estudiante viene de la línea Once o
// Bachillerato, porque un estudiante individual no elige línea).
export const PRECIO_INDIVIDUAL_COP: Record<Grado, number> = {
  DECIMO: 25000,
  ONCE: 35000,
};

// ─── FIRMA DE SEGURIDAD DEL WEBHOOK DE CONFIRMACIÓN ──────────
// ePayco firma cada notificación con:
//   SHA256(p_cust_id_cliente^p_key^x_ref_payco^x_transaction_id^x_amount^x_currency_code)
// Ver: https://docs.epayco.com/docs/checkout-respuesta-y-confirmacion
export interface DatosFirmaEpayco {
  x_ref_payco: string;
  x_transaction_id: string;
  x_amount: string;
  x_currency_code: string;
}

export function calcularFirmaEpayco(
  datos: DatosFirmaEpayco,
  custIdCliente: string,
  pKey: string,
): string {
  const cadena = [
    custIdCliente,
    pKey,
    datos.x_ref_payco,
    datos.x_transaction_id,
    datos.x_amount,
    datos.x_currency_code,
  ].join('^');

  return crypto.createHash('sha256').update(cadena).digest('hex');
}

export function firmaEpaycoValida(
  datos: DatosFirmaEpayco & { x_signature: string },
  custIdCliente: string,
  pKey: string,
): boolean {
  const firmaCalculada = calcularFirmaEpayco(datos, custIdCliente, pKey);
  // Comparación en tiempo constante para no filtrar la firma esperada
  // por temporización.
  const bufferCalculada = Buffer.from(firmaCalculada);
  const bufferRecibida = Buffer.from(datos.x_signature || '');

  if (bufferCalculada.length !== bufferRecibida.length) return false;
  return crypto.timingSafeEqual(bufferCalculada, bufferRecibida);
}

// ─── MAPEO DE RESPUESTA DE EPAYCO → ESTADO INTERNO ───────────
export function estadoDesdeRespuestaEpayco(
  xResponse: string,
): 'APROBADA' | 'RECHAZADA' | 'PENDIENTE_BANCO' | 'FALLIDA' {
  switch (xResponse) {
    case 'Aceptada':
      return 'APROBADA';
    case 'Rechazada':
      return 'RECHAZADA';
    case 'Pendiente':
      return 'PENDIENTE_BANCO';
    default:
      return 'FALLIDA';
  }
}
