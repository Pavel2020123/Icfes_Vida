'use client';

import { useEffect, useState } from 'react';
import {
  obtenerCalendarioIcfesAdmin,
  crearFechaCalendarioIcfesAdmin,
  actualizarFechaCalendarioIcfesAdmin,
  activarCalendarioIcfesAdmin,
  eliminarFechaCalendarioIcfesAdmin,
} from '../../../lib/api';
import type { FechaIcfes } from './tipos';
import { inputStyle, btnStyle } from './estilos';

export default function CalendarioTab({
  mostrarMensaje,
}: {
  mostrarMensaje: (msg: string) => void;
}) {
  const [fechas, setFechas] = useState<FechaIcfes[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nueva, setNueva] = useState({ anio: new Date().getFullYear() + 1, calendario: 'A', fechaExamen: '' });

  const cargar = async () => {
    setCargando(true);
    try {
      setFechas(await obtenerCalendarioIcfesAdmin());
    } catch {}
    setCargando(false);
  };

  useEffect(() => {
    let activo = true;

    obtenerCalendarioIcfesAdmin()
      .then((calendarios) => {
        if (activo) setFechas(calendarios);
      })
      .catch(() => undefined)
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const crear = async () => {
    if (!nueva.fechaExamen) { mostrarMensaje('Elige una fecha de examen'); return; }
    try {
      await crearFechaCalendarioIcfesAdmin(nueva);
    } catch (err) {
      mostrarMensaje(err instanceof Error ? err.message : 'No se pudo guardar la fecha');
      return;
    }
    mostrarMensaje('Fecha de examen guardada');
    setNueva({ ...nueva, fechaExamen: '' });
    cargar();
  };

  const actualizar = async (id: string, fechaExamen: string) => {
    try {
      await actualizarFechaCalendarioIcfesAdmin(id, fechaExamen);
      mostrarMensaje('Fecha actualizada');
    } catch (err) {
      mostrarMensaje(
        err instanceof Error ? err.message : 'No se pudo actualizar la fecha',
      );
    } finally {
      await cargar();
    }
  };

  const eliminar = async (fecha: FechaIcfes) => {
    if (fecha.activo) {
      mostrarMensaje(
        'Activa otra convocatoria antes de eliminar la actual.',
      );
      return;
    }
    if (!confirm('¿Eliminar esta fecha de examen?')) return;
    try {
      await eliminarFechaCalendarioIcfesAdmin(fecha.id);
      mostrarMensaje('Fecha eliminada');
    } catch (err) {
      mostrarMensaje(
        err instanceof Error ? err.message : 'No se pudo eliminar la fecha',
      );
    } finally {
      await cargar();
    }
  };

  const activar = async (id: string) => {
    try {
      await activarCalendarioIcfesAdmin(id);
      mostrarMensaje('Calendario activo actualizado');
    } catch (err) {
      mostrarMensaje(err instanceof Error ? err.message : 'No se pudo activar el calendario');
    } finally {
      await cargar();
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2' }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 6 }}>
        Calendario oficial ICFES
      </h2>
      <p style={{ color: '#8a9aaa', fontSize: 13, marginBottom: 20 }}>
        El calendario activo aparece en la plataforma y se guarda en cada compra nueva.
        El acceso se mantiene hasta finalizar el día del examen.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <input
          type="number"
          placeholder="Año"
          value={nueva.anio}
          onChange={e => setNueva({ ...nueva, anio: Number(e.target.value) })}
          style={{ ...inputStyle, width: 100 }}
        />
        <select
          value={nueva.calendario}
          onChange={e => setNueva({ ...nueva, calendario: e.target.value })}
          style={{ ...inputStyle, width: 140 }}
        >
          <option value="A">Calendario A</option>
          <option value="B">Calendario B</option>
        </select>
        <input
          type="date"
          value={nueva.fechaExamen}
          onChange={e => setNueva({ ...nueva, fechaExamen: e.target.value })}
          style={{ ...inputStyle, width: 180 }}
        />
        <button onClick={crear} style={btnStyle}>Agregar fecha</button>
      </div>

      {cargando ? (
        <p style={{ color: '#8a9aaa' }}>Cargando...</p>
      ) : fechas.length === 0 ? (
        <p style={{ color: '#8a9aaa' }}>Todavía no hay fechas cargadas.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fechas.map(f => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: f.activo ? '2px solid #146C94' : '1px solid #D2E0FB', borderRadius: 8, flexWrap: 'wrap', gap: 10, backgroundColor: f.activo ? '#F3F9FC' : '#ffffff' }}>
              <div>
                <p style={{ fontWeight: 700, color: '#1a2a3a', fontSize: 15, margin: 0 }}>
                  {f.anio} — Calendario {f.calendario}
                  {f.activo && <span style={{ marginLeft: 8, color: '#238761', fontSize: 12 }}>Activo</span>}
                </p>
                <p style={{ color: '#8a9aaa', fontSize: 13, margin: '4px 0 0' }}>
                  Acceso vigente hasta el día del examen.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="date"
                  defaultValue={f.fechaExamen.slice(0, 10)}
                  onBlur={e => e.target.value && actualizar(f.id, e.target.value)}
                  style={{ ...inputStyle, width: 170 }}
                />
                {!f.activo && (
                  <button
                    onClick={() => activar(f.id)}
                    style={{ backgroundColor: '#146C94', border: 'none', color: '#ffffff', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Activar
                  </button>
                )}
                <button
                  onClick={() => eliminar(f)}
                  disabled={f.activo}
                  title={f.activo ? 'Activa otra convocatoria antes de eliminar esta' : 'Eliminar fecha'}
                  style={{ background: 'none', border: '1.5px solid #FCD8CD', color: '#BC7C7C', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: f.activo ? 'not-allowed' : 'pointer', opacity: f.activo ? 0.5 : 1 }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
