'use client';

import { useEffect, useState } from 'react';
import { obtenerPreguntasAdmin, crearPreguntaAdmin, eliminarPreguntaAdmin } from '../../../lib/api';
import { DIFICULTADES, type Tema, type PreguntaAdmin } from './tipos';
import { inputStyle, btnStyle } from './estilos';

export default function PreguntasTab({
  temas,
  mostrarMensaje,
  cargarDatos,
}: {
  temas: Tema[];
  mostrarMensaje: (msg: string) => void;
  cargarDatos: () => Promise<void>;
}) {
  const [subtemaSeleccionado, setSubtemaSeleccionado] = useState('');
  const [nuevaPregunta, setNuevaPregunta] = useState({
    enunciado: '',
    explicacion: '',
    dificultad: 'MEDIO',
    imagenes: '',
    respuestas: [
      { texto: '', esCorrecta: true, explicacion: '' },
      { texto: '', esCorrecta: false, explicacion: '' },
      { texto: '', esCorrecta: false, explicacion: '' },
      { texto: '', esCorrecta: false, explicacion: '' },
    ],
  });
  const [preguntasSubtema, setPreguntasSubtema] = useState<PreguntaAdmin[]>([]);

  const todosSubtemas = temas.flatMap(t =>
    t.subtemas.map(s => ({ ...s, temaNombre: t.nombre }))
  );

  const cargarPreguntasDeSubtema = async (subtemaId: string) => {
    if (!subtemaId) { setPreguntasSubtema([]); return; }
    setPreguntasSubtema(await obtenerPreguntasAdmin(subtemaId));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPreguntasDeSubtema(subtemaSeleccionado);
  }, [subtemaSeleccionado]);

  const eliminarPreguntaSubtema = async (id: string) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    await eliminarPreguntaAdmin(id);
    mostrarMensaje('Pregunta eliminada');
    cargarPreguntasDeSubtema(subtemaSeleccionado);
    cargarDatos();
  };

  const crearPregunta = async () => {
    if (!nuevaPregunta.enunciado || !subtemaSeleccionado) {
      mostrarMensaje('Completa el enunciado y selecciona un subtema');
      return;
    }
    const correctas = nuevaPregunta.respuestas.filter(r => r.esCorrecta).length;
    if (correctas !== 1) {
      mostrarMensaje('Debe haber exactamente 1 respuesta correcta');
      return;
    }
    if (nuevaPregunta.respuestas.some(r => !r.texto)) {
      mostrarMensaje('Todas las opciones deben tener texto');
      return;
    }

    await crearPreguntaAdmin(
      nuevaPregunta.enunciado,
      subtemaSeleccionado,
      nuevaPregunta.dificultad,
      nuevaPregunta.imagenes || null,
      nuevaPregunta.respuestas,
      nuevaPregunta.explicacion,
    );

    setNuevaPregunta({
      enunciado: '',
      explicacion: '',
      dificultad: 'MEDIO',
      imagenes: '',
      respuestas: [
        { texto: '', esCorrecta: true, explicacion: '' },
        { texto: '', esCorrecta: false, explicacion: '' },
        { texto: '', esCorrecta: false, explicacion: '' },
        { texto: '', esCorrecta: false, explicacion: '' },
      ],
    });
    mostrarMensaje('Pregunta creada');
    cargarPreguntasDeSubtema(subtemaSeleccionado);
  };

  return (
    <>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2', maxWidth: 700 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 24 }}>Agregar pregunta</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Subtema</label>
                <select value={subtemaSeleccionado} onChange={e => setSubtemaSeleccionado(e.target.value)} style={inputStyle}>
                  <option value="">Selecciona un subtema</option>
                  {todosSubtemas.map(s => (
                    <option key={s.id} value={s.id}>{s.temaNombre} → {s.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Dificultad</label>
                <select value={nuevaPregunta.dificultad} onChange={e => setNuevaPregunta({ ...nuevaPregunta, dificultad: e.target.value })} style={inputStyle}>
                  {DIFICULTADES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Enunciado de la pregunta</label>
                <textarea
                  value={nuevaPregunta.enunciado}
                  onChange={e => setNuevaPregunta({ ...nuevaPregunta, enunciado: e.target.value })}
                  placeholder="Escribe la pregunta aquí..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'system-ui, sans-serif' }}
                />
              </div>

              {/* IMÁGENES */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>
                  Imágenes (opcional) — nombres separados por coma
                </label>
                <input
                  placeholder="ej: grafica-001.png, tabla-002.png"
                  value={nuevaPregunta.imagenes}
                  onChange={e => setNuevaPregunta({ ...nuevaPregunta, imagenes: e.target.value })}
                  style={inputStyle}
                />
                <p style={{ fontSize: 12, color: '#8a9aaa', marginTop: 4 }}>
                  Coloca los archivos en frontend/public/imagenes/
                </p>
                {nuevaPregunta.imagenes && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {nuevaPregunta.imagenes.split(',').map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={`/imagenes/${img.trim()}`}
                        alt={`imagen ${i + 1}`}
                        style={{ height: 80, borderRadius: 8, border: '1px solid #AFD3E2', objectFit: 'contain', backgroundColor: '#F6F1F1' }}
                        onError={e => (e.currentTarget.style.display = 'none')}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 10 }}>
                  Opciones de respuesta — marca la correcta
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {nuevaPregunta.respuestas.map((r, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '18px 20px minmax(0, 1fr)', alignItems: 'start', gap: 10 }}>
                      <input
                        type="radio"
                        name="correcta"
                        checked={r.esCorrecta}
                        onChange={() => setNuevaPregunta({
                          ...nuevaPregunta,
                          respuestas: nuevaPregunta.respuestas.map((resp, idx) => ({ ...resp, esCorrecta: idx === i })),
                        })}
                        style={{ width: 18, height: 18, marginTop: 11, cursor: 'pointer', accentColor: '#146C94' }}
                      />
                      <span style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: '#146C94', width: 20 }}>
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <input
                          placeholder={`Opción ${['A', 'B', 'C', 'D'][i]}`}
                          value={r.texto}
                          onChange={e => setNuevaPregunta({
                            ...nuevaPregunta,
                            respuestas: nuevaPregunta.respuestas.map((resp, idx) => idx === i ? { ...resp, texto: e.target.value } : resp),
                          })}
                          style={inputStyle}
                        />
                        <textarea
                          placeholder="Explicación de esta opción (opcional)"
                          aria-label={`Explicación de la opción ${['A', 'B', 'C', 'D'][i]}`}
                          value={r.explicacion}
                          onChange={e => setNuevaPregunta({
                            ...nuevaPregunta,
                            respuestas: nuevaPregunta.respuestas.map((resp, idx) => idx === i ? { ...resp, explicacion: e.target.value } : resp),
                          })}
                          rows={2}
                          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'system-ui, sans-serif' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>
                  Explicación general (opcional)
                </label>
                <textarea
                  value={nuevaPregunta.explicacion}
                  onChange={e => setNuevaPregunta({ ...nuevaPregunta, explicacion: e.target.value })}
                  placeholder="Describe el procedimiento, concepto o razonamiento correcto."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'system-ui, sans-serif' }}
                />
              </div>

              <button onClick={crearPregunta} style={{ ...btnStyle, padding: '13px' }}>
                Guardar pregunta
              </button>
            </div>
          </div>

      {subtemaSeleccionado && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '24px', border: '1.5px solid #AFD3E2', maxWidth: 700, marginTop: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a2a3a', marginBottom: 16 }}>
              Preguntas en este subtema ({preguntasSubtema.length})
            </h3>
            {preguntasSubtema.length === 0 ? (
              <p style={{ color: '#8a9aaa', fontSize: 14 }}>Todavía no hay preguntas aquí.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {preguntasSubtema.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, border: '1px solid #D2E0FB', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, color: '#1a2a3a', margin: 0 }}>{p.enunciado}</p>
                      {p.explicacion && (
                        <p style={{ margin: '6px 0 0', color: '#5D6C76', fontSize: 12, lineHeight: 1.45 }}>
                          Explicación: {p.explicacion}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => eliminarPreguntaSubtema(p.id)}
                      style={{ backgroundColor: '#FCD8CD', color: '#BC7C7C', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
      )}
    </>
  );
}


