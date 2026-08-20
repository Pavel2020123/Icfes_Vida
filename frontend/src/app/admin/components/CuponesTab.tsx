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
  { value: '', label: 'Acceso completo' },
  { value: 'MENSUAL', label: 'Acceso completo' },
];

interface NuevoCupon {
  esAutomatica: boolean;
  codigo: string;
  titulo: string;
  porcentajeDescuento: number;
  tipoPlan: string;
  fechaExpiracion: string;
  usosMaximos: string;
}

const CUPON_VACIO: NuevoCupon = {
  esAutomatica: true,
  codigo: '',
  titulo: '',
  porcentajeDescuento: 20,
  tipoPlan: '',
  fechaExpiracion: '',
  usosMaximos: '',
};

function aFechaLocal(fecha: string) {
  const date = new Date(fecha);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function CuponesTab({
  mostrarMensaje,
}: {
  mostrarMensaje: (msg: string) => void;
}) {
  const [cupones, setCupones] = useState<CuponAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nuevo, setNuevo] = useState<NuevoCupon>(CUPON_VACIO);
  const [edicion, setEdicion] = useState<(NuevoCupon & { id: string }) | null>(null);
  const [ahora] = useState(() => Date.now());
  const [fechaMinima] = useState(() => aFechaLocal(new Date().toISOString()));

  const cargar = async () => {
    setCargando(true);
    try {
      setCupones(await obtenerCuponesAdmin());
    } catch {}
    setCargando(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { cargar(); }, []);

  const crear = async () => {
    if (!nuevo.esAutomatica && !nuevo.codigo.trim()) { mostrarMensaje('Escribe un código para el cupón'); return; }
    if (!nuevo.fechaExpiracion) { mostrarMensaje('Elige hasta cuándo dura la promoción'); return; }
    if (nuevo.porcentajeDescuento < 1 || nuevo.porcentajeDescuento > 99) {
      mostrarMensaje('El descuento debe estar entre 1% y 99%');
      return;
    }

    try {
      await crearCuponAdmin({
        esAutomatica: nuevo.esAutomatica,
        codigo: nuevo.esAutomatica ? undefined : nuevo.codigo.trim(),
        titulo: nuevo.esAutomatica ? nuevo.titulo.trim() || undefined : undefined,
        porcentajeDescuento: Number(nuevo.porcentajeDescuento),
        tipoPlan: 'MENSUAL',
        fechaExpiracion: new Date(nuevo.fechaExpiracion).toISOString(),
        usosMaximos: nuevo.usosMaximos ? Number(nuevo.usosMaximos) : undefined,
      });
    } catch (err) {
      mostrarMensaje(err instanceof Error ? err.message : 'No se pudo crear la promoción');
      return;
    }

    mostrarMensaje('Promoción creada');
    setNuevo(CUPON_VACIO);
    cargar();
  };

  const iniciarEdicion = (cupon: CuponAdmin) => {
    setEdicion({
      id: cupon.id,
      esAutomatica: cupon.esAutomatica,
      codigo: cupon.codigo ?? '',
      titulo: cupon.titulo ?? '',
      porcentajeDescuento: cupon.porcentajeDescuento,
      tipoPlan: cupon.tipoPlan ?? '',
      fechaExpiracion: aFechaLocal(cupon.fechaExpiracion),
      usosMaximos: cupon.usosMaximos?.toString() ?? '',
    });
  };

  const guardarEdicion = async () => {
    if (!edicion) return;
    if (edicion.porcentajeDescuento < 1 || edicion.porcentajeDescuento > 99) {
      mostrarMensaje('El descuento debe estar entre 1% y 99%');
      return;
    }
    if (!edicion.fechaExpiracion) {
      mostrarMensaje('Elige hasta cuándo dura la promoción');
      return;
    }
    try {
      await actualizarCuponAdmin(edicion.id, {
        titulo: edicion.esAutomatica ? edicion.titulo : undefined,
        porcentajeDescuento: Number(edicion.porcentajeDescuento),
        tipoPlan: 'MENSUAL',
        fechaExpiracion: new Date(edicion.fechaExpiracion).toISOString(),
        usosMaximos: edicion.usosMaximos ? Number(edicion.usosMaximos) : null,
      });
      setEdicion(null);
      mostrarMensaje('Promoción actualizada');
      cargar();
    } catch (err) {
      mostrarMensaje(err instanceof Error ? err.message : 'No se pudo actualizar la promoción');
    }
  };

  const alternarActivo = async (cupon: CuponAdmin) => {
    try {
      await actualizarCuponAdmin(cupon.id, { activo: !cupon.activo });
    } catch (err) {
      mostrarMensaje(err instanceof Error ? err.message : 'No se pudo actualizar la promoción');
      return;
    }
    mostrarMensaje(cupon.activo ? 'Promoción desactivada' : 'Promoción activada');
    cargar();
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta promoción? Ya no se podrá usar.')) return;
    try {
      await eliminarCuponAdmin(id);
    } catch (err) {
      mostrarMensaje(err instanceof Error ? err.message : 'No se pudo eliminar la promoción');
      return;
    }
    mostrarMensaje('Promoción eliminada');
    cargar();
  };

  const etiquetaPlan = (tipoPlan: CuponAdmin['tipoPlan']) => {
    const encontrado = PLANES.find(p => p.value === (tipoPlan ?? ''));
    return encontrado ? encontrado.label : tipoPlan;
  };

  const estaExpirado = (cupon: CuponAdmin) => new Date(cupon.fechaExpiracion).getTime() < ahora;
  const usosAgotados = (cupon: CuponAdmin) =>
    cupon.usosMaximos !== null && cupon.usosActuales >= cupon.usosMaximos;

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2' }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 6 }}>
        Cupones y promociones
      </h2>
      <p style={{ color: '#8a9aaa', fontSize: 13, marginBottom: 20 }}>
        Publica descuentos automáticos o crea códigos para el acceso completo.
        Puedes limitar cada promoción por fecha y cantidad de estudiantes.
      </p>

      {/* ─── FORMULARIO DE CREACIÓN ─── */}
      <div style={{ display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, marginBottom: 16, border: '1px solid #AFD3E2', borderRadius: 8 }}>
        <button
          type="button"
          onClick={() => setNuevo({ ...nuevo, esAutomatica: true })}
          style={{ padding: '9px 14px', border: 'none', borderRadius: 6, background: nuevo.esAutomatica ? '#146C94' : '#ffffff', color: nuevo.esAutomatica ? '#ffffff' : '#4a5a6a', fontWeight: 700, cursor: 'pointer' }}
        >
          Descuento automático
        </button>
        <button
          type="button"
          onClick={() => setNuevo({ ...nuevo, esAutomatica: false })}
          style={{ padding: '9px 14px', border: 'none', borderRadius: 6, background: !nuevo.esAutomatica ? '#146C94' : '#ffffff', color: !nuevo.esAutomatica ? '#ffffff' : '#4a5a6a', fontWeight: 700, cursor: 'pointer' }}
        >
          Código promocional
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24, alignItems: 'flex-end' }}>
        {nuevo.esAutomatica ? (
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8a9aaa', marginBottom: 4 }}>Título visible</label>
          <input
            type="text"
            maxLength={120}
            placeholder="Ej. 30% de descuento hoy"
            value={nuevo.titulo}
            onChange={e => setNuevo({ ...nuevo, titulo: e.target.value })}
            style={{ ...inputStyle, width: 230 }}
          />
        </div>
        ) : (
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
        )}

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8a9aaa', marginBottom: 4 }}>% Descuento</label>
          <input
            type="number"
            min={1}
            max={99}
            value={nuevo.porcentajeDescuento}
            onChange={e => setNuevo({ ...nuevo, porcentajeDescuento: Number(e.target.value) })}
            style={{ ...inputStyle, width: 100 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8a9aaa', marginBottom: 4 }}>Vence</label>
          <input
            type="datetime-local"
            value={nuevo.fechaExpiracion}
            onChange={e => setNuevo({ ...nuevo, fechaExpiracion: e.target.value })}
            min={fechaMinima}
            style={{ ...inputStyle, width: 200 }}
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

        <button onClick={crear} style={btnStyle}>Crear promoción</button>
      </div>

      {/* ─── LISTA ─── */}
      {cargando ? (
        <p style={{ color: '#8a9aaa' }}>Cargando...</p>
      ) : cupones.length === 0 ? (
        <p style={{ color: '#8a9aaa' }}>Todavía no has creado ninguna promoción.</p>
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
                    {c.esAutomatica
                      ? c.titulo || `${c.porcentajeDescuento}% de descuento`
                      : `${c.codigo} — ${c.porcentajeDescuento}% de descuento`}
                  </p>
                  <p style={{ color: '#8a9aaa', fontSize: 13 }}>
                    {c.esAutomatica ? 'Automática' : 'Código promocional'} · {etiquetaPlan(c.tipoPlan)} · Vence {new Date(c.fechaExpiracion).toLocaleString('es-CO')}
                    {' · '}
                    Usos: {c.usosActuales}{c.usosMaximos !== null ? ` / ${c.usosMaximos}` : ' (sin límite)'}
                    {vencido && ' · Expirado'}
                    {agotado && !vencido && ' · Cupo agotado'}
                    {!c.activo && ' · Desactivado'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => iniciarEdicion(c)}
                    style={{
                      background: 'none', border: '1.5px solid #AFD3E2', color: '#146C94',
                      borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Editar
                  </button>
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

                {edicion?.id === c.id && (
                  <div style={{
                    width: '100%', display: 'flex', gap: 10, flexWrap: 'wrap',
                    alignItems: 'flex-end', borderTop: '1px solid #D2E0FB', paddingTop: 12,
                  }}>
                    {edicion.esAutomatica && (
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#8a9aaa', marginBottom: 4 }}>Título visible</label>
                        <input
                          type="text"
                          maxLength={120}
                          value={edicion.titulo}
                          onChange={e => setEdicion({ ...edicion, titulo: e.target.value })}
                          style={{ ...inputStyle, width: 230 }}
                        />
                      </div>
                    )}
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#8a9aaa', marginBottom: 4 }}>Descuento</label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={edicion.porcentajeDescuento}
                        onChange={e => setEdicion({ ...edicion, porcentajeDescuento: Number(e.target.value) })}
                        style={{ ...inputStyle, width: 100 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#8a9aaa', marginBottom: 4 }}>Vence</label>
                      <input
                        type="datetime-local"
                        value={edicion.fechaExpiracion}
                        onChange={e => setEdicion({ ...edicion, fechaExpiracion: e.target.value })}
                        min={fechaMinima}
                        style={{ ...inputStyle, width: 200 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#8a9aaa', marginBottom: 4 }}>Máx. usos</label>
                      <input
                        type="number"
                        min={Math.max(1, c.usosActuales)}
                        placeholder="Sin límite"
                        value={edicion.usosMaximos}
                        onChange={e => setEdicion({ ...edicion, usosMaximos: e.target.value })}
                        style={{ ...inputStyle, width: 130 }}
                      />
                    </div>
                    <button onClick={guardarEdicion} style={btnStyle}>Guardar</button>
                    <button
                      onClick={() => setEdicion(null)}
                      style={{ ...btnStyle, backgroundColor: '#ffffff', color: '#4a5a6a', border: '1px solid #AFD3E2' }}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
