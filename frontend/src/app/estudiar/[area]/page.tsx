'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { obtenerToken } from '../../../lib/api';

const AREA_NOMBRES: Record<string, string> = {
  LECTURA_CRITICA: 'Lectura Crítica',
  MATEMATICAS: 'Matemáticas',
  CIENCIAS_NATURALES: 'Ciencias Naturales',
  SOCIALES_CIUDADANAS: 'Sociales y Ciudadanas',
  INGLES: 'Inglés',
};

interface Subtema {
  id: string;
  nombre: string;
  contenido: string | null;
  videoUrl: string | null;
  imagenUrl: string | null;
  totalPreguntas: number;
}

interface Tema {
  id: string;
  nombre: string;
  subtemas: Subtema[];
}

interface Respuesta {
  id: string;
  texto: string;
}

interface Pregunta {
  id: string;
  enunciado: string;
  imagenUrl: string | null;
  respuestas: Respuesta[];
}

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function AreaPage() {
  const router = useRouter();
  const params = useParams();
  const area = (params?.area as string ?? '').toUpperCase();

  const [temas, setTemas] = useState<Tema[]>([]);
  const [temaActivo, setTemaActivo] = useState<Tema | null>(null);
  const [subtemaActivo, setSubtemaActivo] = useState<Subtema | null>(null);
  const [menuAbierto, setMenuAbierto] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  // Preguntas al final del tema
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestasEstudiante, setRespuestasEstudiante] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<{ correctas: number; total: number } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [cargandoPreguntas, setCargandoPreguntas] = useState(false);

  useEffect(() => {
    const token = obtenerToken();
    if (!token) { router.push('/login'); return; }

    fetch(`http://localhost:3000/simulacros/temas?area=${area}`)
      .then(r => r.json())
      .then(data => {
        setTemas(data.temas ?? []);
        if (data.temas?.length > 0) {
          setTemaActivo(data.temas[0]);
          setMenuAbierto([data.temas[0].id]);
          if (data.temas[0].subtemas?.length > 0) {
            setSubtemaActivo(data.temas[0].subtemas[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [area, router]);

  const cargarPreguntas = useCallback(async (subtemaId: string) => {
    setCargandoPreguntas(true);
    setPreguntas([]);
    setRespuestasEstudiante({});
    setResultado(null);
    try {
      const token = obtenerToken();
      const res = await fetch(`http://localhost:3000/admin/preguntas/${subtemaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Mezclar aleatoriamente y tomar máximo 5
      const mezcladas = [...(data ?? [])].sort(() => Math.random() - 0.5).slice(0, 5);
      setPreguntas(mezcladas);
    } catch { }
    setCargandoPreguntas(false);
  }, []);

  const seleccionarSubtema = (subtema: Subtema, tema: Tema) => {
    setSubtemaActivo(subtema);
    setTemaActivo(tema);
    cargarPreguntas(subtema.id);
  };

  const toggleMenu = (temaId: string) => {
    setMenuAbierto(prev =>
      prev.includes(temaId) ? prev.filter(id => id !== temaId) : [...prev, temaId]
    );
  };

  const calificarPreguntas = async () => {
    if (!subtemaActivo) return;
    setEnviando(true);
    try {
      const token = obtenerToken();
      const respuestasArray = Object.entries(respuestasEstudiante).map(([preguntaId, respuestaId]) => ({
        preguntaId,
        respuestaId,
      }));

      const res = await fetch('http://localhost:3000/simulacros/calificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          area,
          respuestas: respuestasArray,
        }),
      });

      const data = await res.json();
      const correctas = data.resumen?.respuestasCorrectas ?? 0;
      const total = data.resumen?.totalPreguntas ?? preguntas.length;
      setResultado({ correctas, total });

      // Marcar subtema como completado si sacó más del 60%
      const porcentaje = Math.round((correctas / total) * 100);
      await fetch('http://localhost:3000/simulacros/progreso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subtemaId: subtemaActivo.id,
          porcentaje,
        }),
      });
    } catch { }
    setEnviando(false);
  };

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#146C94', fontSize: 18, fontWeight: 600 }}>Cargando temas...</p>
      </div>
    );
  }

  const embedUrl = subtemaActivo?.videoUrl ? getYoutubeEmbedUrl(subtemaActivo.videoUrl) : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', fontFamily: 'system-ui, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#146C94', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/dashboard" style={{ textDecoration: 'none', color: '#D2E0FB', fontSize: 14, fontWeight: 600 }}>
              ← Inicio
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#ffffff' }}>
              {AREA_NOMBRES[area] ?? area}
            </span>
          </div>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
              Saber<span style={{ color: '#8DD8FF' }}>Plus</span>
            </span>
          </Link>
        </div>
      </nav>

      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>

        {/* MENÚ IZQUIERDO */}
        <aside style={{ width: 280, backgroundColor: '#ffffff', borderRight: '1.5px solid #AFD3E2', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '24px 16px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8a9aaa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
              Temas
            </p>

            {temas.length === 0 ? (
              <p style={{ fontSize: 14, color: '#8a9aaa', padding: '8px 4px' }}>
                No hay temas disponibles aún.
              </p>
            ) : (
              temas.map(tema => (
                <div key={tema.id} style={{ marginBottom: 4 }}>
                  <button
                    onClick={() => toggleMenu(tema.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: 'none',
                      backgroundColor: temaActivo?.id === tema.id ? '#D2E0FB' : 'transparent',
                      color: temaActivo?.id === tema.id ? '#146C94' : '#1a2a3a',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>{tema.nombre}</span>
                    <span style={{ fontSize: 12, color: '#8a9aaa' }}>
                      {menuAbierto.includes(tema.id) ? '▲' : '▼'}
                    </span>
                  </button>

                  {menuAbierto.includes(tema.id) && tema.subtemas.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => seleccionarSubtema(sub, tema)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 24px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: subtemaActivo?.id === sub.id ? '#146C94' : 'transparent',
                        color: subtemaActivo?.id === sub.id ? '#ffffff' : '#4a5a6a',
                        fontWeight: subtemaActivo?.id === sub.id ? 700 : 500,
                        fontSize: 13,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'block',
                        marginTop: 2,
                      }}
                    >
                      {sub.nombre}
                      {sub.totalPreguntas > 0 && (
                        <span style={{
                          marginLeft: 6,
                          fontSize: 11,
                          backgroundColor: subtemaActivo?.id === sub.id ? 'rgba(255,255,255,0.2)' : '#D2E0FB',
                          color: subtemaActivo?.id === sub.id ? '#ffffff' : '#146C94',
                          padding: '1px 6px',
                          borderRadius: 8,
                          fontWeight: 700,
                        }}>
                          {sub.totalPreguntas}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
          {subtemaActivo ? (
            <div style={{ maxWidth: 760, margin: '0 auto' }}>

              {/* Encabezado */}
              <p style={{ fontSize: 13, color: '#8a9aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                {temaActivo?.nombre}
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a2a3a', marginBottom: 32 }}>
                {subtemaActivo.nombre}
              </h1>

              {/* TEXTO EXPLICATIVO */}
              {subtemaActivo.contenido ? (
                <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 32px', border: '1.5px solid #AFD3E2', marginBottom: 28, lineHeight: 1.8, fontSize: 16, color: '#1a2a3a', whiteSpace: 'pre-wrap' }}>
                  {subtemaActivo.contenido}
                </div>
              ) : (
                <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 32px', border: '1.5px dashed #AFD3E2', marginBottom: 28, textAlign: 'center' }}>
                  <p style={{ color: '#8a9aaa', fontSize: 15 }}>El contenido de este tema se agregará pronto.</p>
                </div>
              )}

              {/* VIDEO */}
              {embedUrl && (
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#146C94', marginBottom: 12 }}>Video explicativo</p>
                  <div style={{ borderRadius: 16, overflow: 'hidden', border: '1.5px solid #AFD3E2', aspectRatio: '16/9' }}>
                    <iframe
                      src={embedUrl}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allowFullScreen
                      title={subtemaActivo.nombre}
                    />
                  </div>
                </div>
              )}

              {/* IMAGEN */}
              {subtemaActivo.imagenUrl && (
                <div style={{ marginBottom: 28 }}>
                  <img
                    src={`/imagenes/${subtemaActivo.imagenUrl}`}
                    alt={subtemaActivo.nombre}
                    style={{ width: '100%', borderRadius: 16, border: '1.5px solid #AFD3E2' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}

              {/* PREGUNTAS DE PRÁCTICA */}
              <div style={{ marginTop: 40 }}>
                <div style={{ height: 2, backgroundColor: '#D2E0FB', marginBottom: 32, borderRadius: 1 }} />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a2a3a', marginBottom: 8 }}>
                  Practica lo que aprendiste
                </h2>
                <p style={{ color: '#4a5a6a', fontSize: 14, marginBottom: 24 }}>
                  Responde estas preguntas para completar el tema.
                </p>

                {cargandoPreguntas ? (
                  <p style={{ color: '#8a9aaa', fontSize: 14 }}>Cargando preguntas...</p>
                ) : preguntas.length === 0 ? (
                  <div style={{ backgroundColor: '#F6F1F1', borderRadius: 14, padding: '24px', border: '1.5px dashed #AFD3E2', textAlign: 'center' }}>
                    <p style={{ color: '#8a9aaa', fontSize: 14 }}>Las preguntas de práctica de este tema se agregarán pronto.</p>
                  </div>
                ) : resultado ? (
                  // RESULTADO
                  <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '40px', border: '1.5px solid #AFD3E2', textAlign: 'center' }}>
                    <p style={{ fontSize: 56, fontWeight: 900, color: resultado.correctas >= resultado.total * 0.6 ? '#19A7CE' : '#BC7C7C', marginBottom: 8 }}>
                      {resultado.correctas}/{resultado.total}
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#1a2a3a', marginBottom: 8 }}>
                      {resultado.correctas >= resultado.total * 0.6 ? '¡Muy bien! Tema completado' : 'Sigue practicando'}
                    </p>
                    <p style={{ color: '#4a5a6a', fontSize: 14, marginBottom: 28 }}>
                      {resultado.correctas >= resultado.total * 0.6
                        ? 'Puedes continuar con el siguiente tema.'
                        : 'Repasa el tema y vuelve a intentarlo.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => { setResultado(null); setRespuestasEstudiante({}); cargarPreguntas(subtemaActivo.id); }}
                        style={{ backgroundColor: '#F6F1F1', color: '#146C94', border: '1.5px solid #AFD3E2', padding: '11px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                ) : (
                  // PREGUNTAS
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {preguntas.map((pregunta, idx) => (
                      <div key={pregunta.id} style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px', border: '1.5px solid #AFD3E2' }}>
                        <p style={{ fontSize: 13, color: '#8a9aaa', fontWeight: 600, marginBottom: 10 }}>Pregunta {idx + 1}</p>
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#1a2a3a', lineHeight: 1.6, marginBottom: 20 }}>
                          {pregunta.enunciado}
                        </p>
                        {pregunta.imagenUrl && (
                          <img
                            src={`/imagenes/${pregunta.imagenUrl}`}
                            alt="imagen pregunta"
                            style={{ maxWidth: '100%', borderRadius: 10, marginBottom: 16, border: '1px solid #AFD3E2' }}
                            onError={e => (e.currentTarget.style.display = 'none')}
                          />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {pregunta.respuestas.map((resp, i) => {
                            const seleccionada = respuestasEstudiante[pregunta.id] === resp.id;
                            return (
                              <button
                                key={resp.id}
                                onClick={() => setRespuestasEstudiante(prev => ({ ...prev, [pregunta.id]: resp.id }))}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 12,
                                  padding: '13px 18px', borderRadius: 10,
                                  border: seleccionada ? '2px solid #146C94' : '1.5px solid #AFD3E2',
                                  backgroundColor: seleccionada ? '#D2E0FB' : '#F6F1F1',
                                  cursor: 'pointer', textAlign: 'left', width: '100%',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <span style={{
                                  width: 28, height: 28, borderRadius: '50%',
                                  backgroundColor: seleccionada ? '#146C94' : '#ffffff',
                                  color: seleccionada ? '#ffffff' : '#146C94',
                                  border: `2px solid ${seleccionada ? '#146C94' : '#AFD3E2'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 800, fontSize: 13, flexShrink: 0,
                                }}>
                                  {['A', 'B', 'C', 'D'][i]}
                                </span>
                                <span style={{ fontSize: 15, color: '#1a2a3a', lineHeight: 1.5 }}>{resp.texto}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={calificarPreguntas}
                      disabled={enviando || Object.keys(respuestasEstudiante).length === 0}
                      style={{
                        backgroundColor: enviando ? '#AFD3E2' : '#146C94',
                        color: '#ffffff', border: 'none',
                        padding: '14px', borderRadius: 12,
                        fontSize: 16, fontWeight: 700,
                        cursor: enviando ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {enviando ? 'Calificando...' : 'Verificar respuestas'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <p style={{ color: '#8a9aaa', fontSize: 16 }}>Selecciona un tema del menú para empezar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}