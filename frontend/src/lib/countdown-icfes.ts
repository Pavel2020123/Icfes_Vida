const MILISEGUNDOS_DIA = 24 * 60 * 60 * 1_000;

export type EstadoCuentaIcfes = 'PENDIENTE' | 'HOY' | 'FINALIZADO';

export interface CuentaRegresivaIcfes {
  estado: EstadoCuentaIcfes;
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

// El modelo administrativo guarda una fecha, no una hora. Interpretamos ese
// dia desde medianoche en Colombia para evitar que un ISO UTC se vea como el
// dia anterior en el navegador.
export function obtenerInicioDiaIcfes(fechaIso: string): Date | null {
  const fecha = fechaIso.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;

  const resultado = new Date(`${fecha}T00:00:00-05:00`);
  return Number.isNaN(resultado.getTime()) ? null : resultado;
}

export function calcularCuentaRegresivaIcfes(
  fechaIso: string,
  ahora = new Date(),
): CuentaRegresivaIcfes {
  const inicio = obtenerInicioDiaIcfes(fechaIso);
  if (!inicio) {
    return { estado: 'FINALIZADO', dias: 0, horas: 0, minutos: 0, segundos: 0 };
  }

  const diferencia = inicio.getTime() - ahora.getTime();
  if (diferencia <= 0) {
    const estado = ahora.getTime() < inicio.getTime() + MILISEGUNDOS_DIA
      ? 'HOY'
      : 'FINALIZADO';
    return { estado, dias: 0, horas: 0, minutos: 0, segundos: 0 };
  }

  const totalSegundos = Math.floor(diferencia / 1_000);
  return {
    estado: 'PENDIENTE',
    dias: Math.floor(totalSegundos / 86_400),
    horas: Math.floor((totalSegundos % 86_400) / 3_600),
    minutos: Math.floor((totalSegundos % 3_600) / 60),
    segundos: totalSegundos % 60,
  };
}

export function formatearFechaIcfes(fechaIso: string) {
  const fecha = obtenerInicioDiaIcfes(fechaIso);
  if (!fecha) return 'Fecha por confirmar';

  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota',
  }).format(fecha);
}
