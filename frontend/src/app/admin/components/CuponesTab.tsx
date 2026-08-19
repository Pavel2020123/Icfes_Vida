'use client';

import { useEffect, useState } from 'react';
import {
  obtenerCuponesAdmin,
  crearCuponAdmin,
  actualizarCuponAdmin,
  eliminarCuponAdmin,
  type CuponAdmin,
} from '../../../lib/api';
import { inputStyle, btnStyle } from './estilos';

const PLANES = [
  { value: '', label: 'Todos los planes' },
  { value: 'MENSUAL', label: 'Solo Mensual' },
  { value: 'TEMPORADA_A', label: 'Solo Temporada A' },
  { value: 'TEMPORADA_B', label: 'Solo Temporada B' },
];

interface NuevoCupon {
  codigo: string;
  porcentajeDescuento: number;
  tipoPlan: string;
  fechaExpiracion: string;
  usosMaximos: string;
}

const CUPON_VACIO: NuevoCupon = {
  codigo: '',
  porcentajeDescuento: 20,
  tipoPlan: '',
  fechaExpiracion: '',
  usosMaximos: '',
};

export default function CuponesTab({
  mostrarMensaje,
}: {
  mostrarMensaje: (msg: string) => void;
}) {
  const [cupones, setCupones] = useState<CuponAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nuevo, setNuevo] = useState<NuevoCupon>(CUPON_VACIO);

  const cargar = async () => {
    setCargando(true);
    try {
      setCupones(await obtenerCuponesAdmin());
    } catch {}
    setCargando(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const crear = async () => {
    if (!nuevo.codigo.trim()) { mostrarMensaje('Escribe un código para el cupón'); return; }
    if (!nuevo.fechaExpiracion) { mostrarMensaje('Elige hasta cuándo dura el cupón'); return; }

    try {
      await crearCuponAdmin({
        codigo: nuevo.codigo.trim(),
        porcentajeDescuento: Number(nuevo.porcentajeDescuento),
        tipoPlan: nuevo.tipoPlan ? (nuevo.tipoPlan as 'MENSUAL' | 'TEMPORADA_A' | 'TEMPORADA_B') : undefined,
        fechaExpiracion: new Date(nuevo.fechaExpiracion).toISOString(),
        usosMaximos: nuevo.usosMaximos ? Number(nuevo.usosMaximos) : undefined,
      });
    } catch (err) {
      mostrarMensaje(err instanceof Error ? err.message : 'No se pudo crear el cupón');
      return;
    }

    mostrarMensaje('Cupón creado');
    setNuevo(CUPON_VACIO);
    cargar();
  };

  const alternarActivo = async (cupon: CuponAdmin) => {
    try {
      await actualizarCuponAdmin(cupon.id, { activo: !cupon.activo });
    } catch (err) {
      mostrarMensaje(err instanceof Error ? err.message : 'No se pudo actualizar el cupón');
      return;
    }
    mostrarMensaje(cupon.activo ? 'Cupón desactivado' : 'Cupón activado');
    cargar();
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este cupón? Ya no se podrá usar.')) return;
    try {
      await eliminarCuponAdmin(id);
    } catch (err) {
      mostrarMensaje(err instanceof Error ? err.message : 'No se pudo eliminar el cupón');
      return;
    }
    mostrarMensaje('Cupón eliminado');
    cargar();
  };

  const etiquetaPlan = (tipoPlan: CuponAdmin['tipoPlan']) => {
    const encontrado = PLANES.find(p => p.value === (tipoPlan ?? ''));
    return encontrado ? encontrado.label : tipoPlan;
  };

  const estaExpirado = (cupon: CuponAdmin) => new Date(cupon.fechaExpiracion).getTime() < Date.now();
  const usosAgotados = (cupon: CuponAdmin) =>
    cupon.usosMaximos !== null && cupon.usosActuales >= cupon.usosMaximos;

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2' }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 6 }}>
        Cupones y promociones
      </h2>
      <p style={{ color: '#8a9aaa', fontSize: 13, marginBottom: 20 }}>
        Crea un código con un % de descuento. Puedes limitarlo a un plan específico, ponerle
        fecha de vencimiento y un cupo máximo de usos (ej. solo los primeros 10 o 90 estudiantes).
      </p>

      {/* ─── FORMULARIO DE CREACIÓN ─── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24, alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8a9aaa', marginBottom: 4 }}>Código</label>
          <input
            type="text"
            placeholder="Ej. VUELTAACLASES34"
            value={nuevo.codigo}
            onChange={e => setNuevo({ ...nuevo, codigo: e.target.value.toUpperCase() })}
            style={{ ...inputStyle, width: 200, textTransform: 'uppercase' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8a9aaa', marginBottom: 4 }}>% Descuento</label>
          <input
            type="number"
            min={1}
            max={100}
            value={nuevo.porcentajeDescuento}
            onChange={e => setNuevo({ ...nuevo, porcentajeDescuento: Number(e.target.value) })}
            style={{ ...inputStyle, width: 100 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8a9aaa', marginBottom: 4 }}>Aplica a</label>
          <select
            value={nuevo.tipoPlan}
            onChange={e => setNuevo({ ...nuevo, tipoPlan: e.target.value })}
            style={{ ...inputStyle, width: 170 }}
          >
            {PLANES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8a9aaa', marginBottom: 4 }}>Vence</label>
          <input
            type="date"
            value={nuevo.fechaExpiracion}
            onChange={e => setNuevo({ ...nuevo, fechaExpiracion: e.target.value })}
            style={{ ...inputStyle, width: 160 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8a9aaa', marginBottom: 4 }}>
            Máx. usos (opcional)
          </label>
          <input
            type="number"
            min={1}
            placeholder="Sin límite"
            value={nuevo.usosMaximos}
            onChange={e => setNuevo({ ...nuevo, usosMaximos: e.target.value })}
            style={{ ...inputStyle, width: 130 }}
          />
        </div>

        <button onClick={crear} style={btnStyle}>Crear cupón</button>
      </div>

      {/* ─── LISTA ─── */}
      {cargando ? (
        <p style={{ color: '#8a9aaa' }}>Cargando...</p>
      ) : cupones.length === 0 ? (
        <p style={{ color: '#8a9aaa' }}>Todavía no has creado ningún cupón.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cupones.map(c => {
            const vencido = estaExpirado(c);
            const agotado = usosAgotados(c);
            const inutilizable = vencido || agotado || !c.activo;

            return (
              <div
                key={c.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', border: '1px solid #D2E0FB', borderRadius: 10,
                  flexWrap: 'wrap', gap: 10,
                  opacity: inutilizable ? 0.6 : 1,
                }}
              >
                <div>
                  <p style={{ fontWeight: 800, color: '#1a2a3a', fontSize: 15, marginBottom: 2 }}>
                    {c.codigo} — {c.porcentajeDescuento}% de descuento
                  </p>
                  <p style={{ color: '#8a9aaa', fontSize: 13 }}>
                    {etiquetaPlan(c.tipoPlan)} · Vence {new Date(c.fechaExpiracion).toLocaleDateString('es-CO')}
                    {' · '}
                    Usos: {c.usosActuales}{c.usosMaximos !== null ? ` / ${c.usosMaximos}` : ' (sin límite)'}
                    {vencido && ' · Expirado'}
                    {agotado && !vencido && ' · Cupo agotado'}
                    {!c.activo && ' · Desactivado'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => alternarActivo(c)}
                    style={{
                      background: 'none',
                      border: `1.5px solid ${c.activo ? '#FCD8CD' : '#9BD8B8'}`,
                      color: c.activo ? '#BC7C7C' : '#2F8F5B',
                      borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    {c.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => eliminar(c.id)}
                    style={{
                      background: 'none', border: '1.5px solid #FCD8CD', color: '#BC7C7C',
                      borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
