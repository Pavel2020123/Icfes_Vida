'use client';

import { useState } from 'react';
import { crearTemaAdmin, crearSubtemaAdmin, eliminarTemaAdmin, eliminarSubtemaAdmin } from '../../../lib/api';
import { AREAS, type Tema } from './tipos';
import { inputStyle, btnStyle } from './estilos';

export default function TemasTab({
  temas,
  mostrarMensaje,
  cargarDatos,
}: {
  temas: Tema[];
  mostrarMensaje: (msg: string) => void;
  cargarDatos: () => Promise<void>;
}) {
  const [nuevoTema, setNuevoTema] = useState({ nombre: '', area: 'MATEMATICAS' });
  const [nuevoSubtema, setNuevoSubtema] = useState({ nombre: '', temaId: '' });

  const crearTema = async () => {
    if (!nuevoTema.nombre) return;
    await crearTemaAdmin(nuevoTema.nombre, nuevoTema.area);
    setNuevoTema({ nombre: '', area: 'MATEMATICAS' });
    mostrarMensaje('Tema creado');
    cargarDatos();
  };

  const crearSubtema = async () => {
    if (!nuevoSubtema.nombre || !nuevoSubtema.temaId) return;
    await crearSubtemaAdmin(nuevoSubtema.nombre, nuevoSubtema.temaId);
    setNuevoSubtema({ nombre: '', temaId: '' });
    mostrarMensaje('Subtema creado');
    cargarDatos();
  };

  const eliminarTema = async (id: string) => {
    if (!confirm('¿Eliminar este tema y todos sus subtemas y preguntas?')) return;
    await eliminarTemaAdmin(id);
    mostrarMensaje('Tema eliminado');
    cargarDatos();
  };

  const eliminarSubtema = async (id: string) => {
    if (!confirm('¿Eliminar este subtema y sus preguntas?')) return;
    await eliminarSubtemaAdmin(id);
    mostrarMensaje('Subtema eliminado');
    cargarDatos();
  };

  return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 20 }}>Nuevo tema</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  placeholder="Nombre del tema (ej: Álgebra)"
                  value={nuevoTema.nombre}
                  onChange={e => setNuevoTema({ ...nuevoTema, nombre: e.target.value })}
                  style={inputStyle}
                />
                <select
                  value={nuevoTema.area}
                  onChange={e => setNuevoTema({ ...nuevoTema, area: e.target.value })}
                  style={inputStyle}
                >
                  {AREAS.map(a => <option key={a.key} value={a.key}>{a.nombre}</option>)}
                </select>
                <button onClick={crearTema} style={btnStyle}>Crear tema</button>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 20 }}>Nuevo subtema</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  placeholder="Nombre del subtema (ej: Regla de 3)"
                  value={nuevoSubtema.nombre}
                  onChange={e => setNuevoSubtema({ ...nuevoSubtema, nombre: e.target.value })}
                  style={inputStyle}
                />
                <select
                  value={nuevoSubtema.temaId}
                  onChange={e => setNuevoSubtema({ ...nuevoSubtema, temaId: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Selecciona un tema</option>
                  {temas.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre} — {AREAS.find(a => a.key === t.area)?.nombre}</option>
                  ))}
                </select>
                <button onClick={crearSubtema} style={btnStyle}>Crear subtema</button>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 20 }}>Temas creados</h2>
              {temas.length === 0 ? (
                <p style={{ color: '#8a9aaa', fontSize: 14 }}>No hay temas todavía.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {temas.map(tema => (
                    <div key={tema.id} style={{ border: '1px solid #D2E0FB', borderRadius: 10, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div>
                          <span style={{ fontWeight: 700, color: '#1a2a3a', fontSize: 15 }}>{tema.nombre}</span>
                          <span style={{ marginLeft: 10, fontSize: 12, backgroundColor: '#D2E0FB', color: '#146C94', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                            {AREAS.find(a => a.key === tema.area)?.nombre}
                          </span>
                        </div>
                        <button
                          onClick={() => eliminarTema(tema.id)}
                          style={{ backgroundColor: '#FCD8CD', color: '#BC7C7C', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                        >
                          Eliminar
                        </button>
                      </div>
                      {tema.subtemas.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {tema.subtemas.map(sub => (
                            <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#F6F1F1', padding: '5px 10px', borderRadius: 8, fontSize: 13 }}>
                              <span style={{ color: '#4a5a6a' }}>{sub.nombre}</span>
                              <span style={{ color: '#19A7CE', fontWeight: 700 }}>({sub._count.preguntas})</span>
                              <button onClick={() => eliminarSubtema(sub.id)} style={{ background: 'none', border: 'none', color: '#BC7C7C', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 2px' }}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
  );
}