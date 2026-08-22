'use client';

import { useEffect, useState } from 'react';
import type { CalendarioIcfes } from '../lib/api';
import {
  calcularCuentaRegresivaIcfes,
  formatearFechaIcfes,
  type CuentaRegresivaIcfes,
} from '../lib/countdown-icfes';

interface Props {
  calendario: CalendarioIcfes | null;
}

const UNIDADES: Array<{
  clave: keyof Pick<CuentaRegresivaIcfes, 'dias' | 'horas' | 'minutos' | 'segundos'>;
  etiqueta: string;
}> = [
  { clave: 'dias', etiqueta: 'Días' },
  { clave: 'horas', etiqueta: 'Horas' },
  { clave: 'minutos', etiqueta: 'Min' },
  { clave: 'segundos', etiqueta: 'Seg' },
];

export default function CountdownIcfes({ calendario }: Props) {
  const [cuenta, setCuenta] = useState<CuentaRegresivaIcfes | null>(null);

  useEffect(() => {
    if (!calendario) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCuenta(null);
      return;
    }

    const actualizar = () => {
      setCuenta(calcularCuentaRegresivaIcfes(calendario.fechaExamen));
    };

    actualizar();
    const intervalo = window.setInterval(actualizar, 1_000);
    return () => window.clearInterval(intervalo);
  }, [calendario]);

  const mensajeEstado = cuenta?.estado === 'HOY'
    ? 'El examen es hoy'
    : cuenta?.estado === 'FINALIZADO'
      ? 'Esta convocatoria terminó'
      : null;

  return (
    <section className="countdown-icfes">
      <div className="countdown-info">
        <span className="countdown-eyebrow">
          {calendario ? `ICFES Saber 11 · Calendario ${calendario.calendario}` : 'Próxima prueba ICFES'}
        </span>
        <strong className="countdown-title">
          {calendario ? formatearFechaIcfes(calendario.fechaExamen) : 'Fecha por confirmar'}
        </strong>
        <span className="countdown-subtitle">
          {calendario ? 'Cada sesión de estudio cuenta.' : 'La fecha aparecerá cuando el administrador active una convocatoria.'}
        </span>
      </div>

      <div className="countdown-time" aria-label={mensajeEstado ?? 'Tiempo restante para el examen ICFES'}>
        {!calendario || !cuenta ? (
          <span className="countdown-waiting">--</span>
        ) : mensajeEstado ? (
          <strong className="countdown-status">{mensajeEstado}</strong>
        ) : (
          <>
            <span className="countdown-prefix">Faltan</span>
            <div className="countdown-grid">
              {UNIDADES.map(({ clave, etiqueta }) => (
                <div className="countdown-unit" key={clave}>
                  <strong>{String(cuenta[clave]).padStart(2, '0')}</strong>
                  <span>{etiqueta}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .countdown-icfes {
          width: 100%;
          min-height: 132px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          padding: 22px 24px;
          border: 1px solid #b9d5df;
          border-left: 5px solid var(--color-primario, #146c94);
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 5px 18px rgba(20, 108, 148, 0.08);
        }
        .countdown-info {
          min-width: 220px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .countdown-eyebrow {
          color: var(--color-primario, #146c94);
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0;
          text-transform: uppercase;
        }
        .countdown-title {
          color: #1a2a3a;
          font-size: 20px;
          line-height: 1.25;
          letter-spacing: 0;
          text-transform: capitalize;
        }
        .countdown-subtitle {
          color: #64737d;
          font-size: 13px;
        }
        .countdown-time {
          min-width: 330px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 7px;
        }
        .countdown-prefix {
          color: #65737d;
          font-size: 12px;
          font-weight: 700;
        }
        .countdown-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(62px, 1fr));
          gap: 8px;
        }
        .countdown-unit {
          width: 62px;
          min-height: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid #d3e2e8;
          border-radius: 6px;
          background: #f5f9fa;
        }
        .countdown-unit strong {
          color: var(--marca-profunda, #123e52);
          font-size: 24px;
          line-height: 1;
          letter-spacing: 0;
          font-variant-numeric: tabular-nums;
        }
        .countdown-unit span {
          margin-top: 5px;
          color: #687781;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .countdown-status {
          color: #17694f;
          font-size: 21px;
          letter-spacing: 0;
        }
        .countdown-waiting {
          color: #7a8992;
          font-size: 26px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }
        @media (max-width: 700px) {
          .countdown-icfes {
            align-items: stretch;
            flex-direction: column;
            gap: 18px;
            padding: 20px;
          }
          .countdown-time {
            min-width: 0;
            align-items: flex-start;
          }
          .countdown-grid {
            width: 100%;
            grid-template-columns: repeat(4, minmax(52px, 1fr));
          }
          .countdown-unit {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
