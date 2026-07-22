import { randomBytes } from 'crypto';

// ─── VERIFICACIÓN DE CORREO ──────────────────────────────────
// Punto 7: evita que alguien reinicie el gratis de 3 días con
// correos falsos. Solo aplica a la misma cuenta que recibe la
// prueba gratis en plan.util.ts: ESTUDIANTE individual (sin institución).
export const HORAS_VALIDEZ_TOKEN_VERIFICACION = 24;

export function generarTokenVerificacion(): string {
  return randomBytes(32).toString('hex');
}

export function calcularExpiracionToken(desde: Date = new Date()): Date {
  const expira = new Date(desde);
  expira.setHours(expira.getHours() + HORAS_VALIDEZ_TOKEN_VERIFICACION);
  return expira;
}

export interface UsuarioParaVerificacion {
  institucionId: string | null;
  rol: string | null;
  correoVerificado: boolean | null;
}

export function requiereVerificacionCorreo(
  usuario: UsuarioParaVerificacion,
): boolean {
  // Estudiante de institución: lo crea el profesor, ya es de confianza.
  if (usuario.institucionId) return false;

  // Solo el estudiante individual arranca la prueba gratis de 3 días.
  if (usuario.rol !== 'ESTUDIANTE') return false;

  return usuario.correoVerificado !== true;
}
