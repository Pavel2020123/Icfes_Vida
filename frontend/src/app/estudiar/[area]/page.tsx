'use client';

import { useEffect, useState } from 'react';
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
  totalPreguntas: number;
}

interface Tema {
  id: string;
  nombre: string;
  subtemas: Subtema[];
}

export default function AreaPage() {
  const router = useRouter();
  const params = useParams();
  const area = (params?.area as string ?? '').toUpperCase();

  const [temas, setTemas] = useState<Tema[]>([]);
  const [temaActivo, setTemaActivo] = useState<Tema | null>(null);
  const [subtemaActivo, setSubtemaActivo] = useState<Subtema | null>(null);
  const [cargando, setCargando] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState<string[]>([]);

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

  const toggleMenu = (temaId: string) => {
    setMenuAbierto(prev =>
      prev.includes(temaId) ? prev.filter(id => id !== temaId) : [...prev, temaId]
    );
  };

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#146C94', fontSize: 18, fontWeight: 600 }}>Cargando temas...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', fontFamily: 'system-ui, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#146C94', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/estudiar" style={{ textDecoration: 'none', color: '#D2E0FB', fontSize: 14, fontWeight: 600 }}>
              ← Áreas
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
              {AREA_NOMBRES[area] ?? area}
            </span>
          </div>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
              Saber<span style={{ color: '#8DD8FF' }}>Plus</span>
            </span>
          </Link>
        </div>
      </nav>

      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>

        {/* MENÚ IZQUIERDO */}
        <aside style={{
          width: 280,
          backgroundColor: '#ffffff',
          borderRight: '1.5px solid #AFD3E2',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
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
                  {/* Tema principal */}
                  <button
                    onClick={() => { toggleMenu(tema.id); setTemaActivo(tema); }}
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

                  {/* Subtemas */}
                  {menuAbierto.includes(tema.id) && tema.subtemas.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => { setSubtemaActivo(sub); setTemaActivo(tema); }}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 28px',
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
                          marginLeft: 8,
                          fontSize: 11,
                          backgroundColor: subtemaActivo?.id === sub.id ? 'rgba(255,255,255,0.2)' : '#D2E0FB',
                          color: subtemaActivo?.id === sub.id ? '#ffffff' : '#146C94',
                          padding: '2px 7px',
                          borderRadius: 10,
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
            <div>
              <p style={{ fontSize: 13, color: '#8a9aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                {temaActivo?.nombre}
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a2a3a', marginBottom: 32 }}>
                {subtemaActivo.nombre}
              </h1>

              {/* Contenido del tema — aquí irá la explicación */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: '32px',
                border: '1.5px solid #AFD3E2',
                marginBottom: 24,
                minHeight: 300,
              }}>
                <p style={{ color: '#8a9aaa', fontSize: 16, lineHeight: 1.7 }}>
                  El contenido explicativo de <strong style={{ color: '#146C94' }}>{subtemaActivo.nombre}</strong> irá aquí.
                  Podrás agregar texto, imágenes y ejemplos desde el panel de administración.
                </p>
              </div>

              {/* Botón de preguntas */}
              {subtemaActivo.totalPreguntas > 0 && (
                <div style={{
                  backgroundColor: '#D2E0FB',
                  borderRadius: 14,
                  padding: '24px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                }}>
                  <div>
                    <p style={{ fontWeight: 700, color: '#1a2a3a', fontSize: 16, marginBottom: 4 }}>
                      Practica este tema
                    </p>
                    <p style={{ color: '#4a5a6a', fontSize: 14 }}>
                      {subtemaActivo.totalPreguntas} {subtemaActivo.totalPreguntas === 1 ? 'pregunta disponible' : 'preguntas disponibles'}
                    </p>
                  </div>
                  <Link
                    href={`/simulacro?area=${area}&subtema=${subtemaActivo.id}`}
                    style={{
                      backgroundColor: '#146C94',
                      color: '#ffffff',
                      padding: '12px 28px',
                      borderRadius: 10,
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    Practicar tema
                  </Link>
                </div>
              )}

              {subtemaActivo.totalPreguntas === 0 && (
                <div style={{
                  backgroundColor: '#F6F1F1',
                  borderRadius: 14,
                  padding: '20px 24px',
                  border: '1.5px dashed #AFD3E2',
                }}>
                  <p style={{ color: '#8a9aaa', fontSize: 14, textAlign: 'center' }}>
                    Las preguntas de práctica de este tema se agregarán pronto.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <p style={{ color: '#8a9aaa', fontSize: 16 }}>
                Selecciona un tema del menú para empezar.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}