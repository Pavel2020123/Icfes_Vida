'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerToken } from '../../lib/api';

const AREAS = [
  { key: 'LECTURA_CRITICA', nombre: 'Lectura Crítica', emoji: '📖' },
  { key: 'MATEMATICAS', nombre: 'Matemáticas', emoji: '🧮' },
  { key: 'CIENCIAS_NATURALES', nombre: 'Ciencias Naturales', emoji: '🔬' },
  { key: 'SOCIALES_CIUDADANAS', nombre: 'Sociales y Ciudadanas', emoji: '🌎' },
  { key: 'INGLES', nombre: 'Inglés', emoji: '🔤' },
];

const CANTIDADES = [10, 15, 20, 25, 30];



export default function PreguntasAleatoriasPage() {
  const router = useRouter();
  const [areasSeleccionadas, setAreasSeleccionadas] = useState<string[]>([]);
  const [cantidad, setCantidad] = useState(15);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const token = obtenerToken();
    if (!token) {
      router.push('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVerificando(false);
  }, [router]);

  const toggleArea = (key: string) => {
    setAreasSeleccionadas(prev =>
      prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]
    );
  };

  const seleccionarTodas = () => {
    setAreasSeleccionadas(prev =>
      prev.length === AREAS.length ? [] : AREAS.map(a => a.key)
    );
  };

 const empezar = () => {
    if (areasSeleccionadas.length === 0) return;
    const params = new URLSearchParams({
      areas: areasSeleccionadas.join(','),
      cantidad: String(cantidad),
    });
    router.push(`/simulacro-personalizado?${params.toString()}`);
  };

  if (verificando) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', fontFamily: 'system-ui, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#146C94', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: '#D2E0FB', fontSize: 14, fontWeight: 600 }}>
            ← Inicio
          </Link>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
            Saber<span style={{ color: '#8DD8FF' }}>Plus</span>
          </span>
        </div>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>

        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1a2a3a', marginBottom: 8 }}>
          Preguntas aleatorias
        </h1>
        <p style={{ color: '#4a5a6a', fontSize: 15, marginBottom: 36 }}>
          Elige las áreas que quieres practicar. Si eliges varias, las preguntas se mezclan entre ellas.
        </p>

        {/* SELECCIÓN DE ÁREAS */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px', border: '1.5px solid #AFD3E2', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#8a9aaa', textTransform: 'uppercase', letterSpacing: 1 }}>
              Áreas
            </p>
            <button
              onClick={seleccionarTodas}
              style={{ background: 'none', border: 'none', color: '#146C94', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              {areasSeleccionadas.length === AREAS.length ? 'Quitar todas' : 'Seleccionar todas'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {AREAS.map(area => {
              const marcada = areasSeleccionadas.includes(area.key);
              return (
                <button
                  key={area.key}
                  onClick={() => toggleArea(area.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px 18px',
                    borderRadius: 12,
                    border: marcada ? '2px solid #146C94' : '1.5px solid #D2E0FB',
                    backgroundColor: marcada ? '#D2E0FB' : '#F6F1F1',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border: `2px solid ${marcada ? '#146C94' : '#AFD3E2'}`,
                      backgroundColor: marcada ? '#146C94' : '#ffffff',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {marcada ? '✓' : ''}
                  </span>
                  <span style={{ fontSize: 20 }}>{area.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1a2a3a' }}>{area.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CANTIDAD DE PREGUNTAS */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px', border: '1.5px solid #AFD3E2', marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#8a9aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
            Cantidad de preguntas
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CANTIDADES.map(c => (
              <button
                key={c}
                onClick={() => setCantidad(c)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: `1.5px solid ${cantidad === c ? '#146C94' : '#D2E0FB'}`,
                  backgroundColor: cantidad === c ? '#146C94' : '#F6F1F1',
                  color: cantidad === c ? '#ffffff' : '#1a2a3a',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* DIFICULTAD */}
        

        {/* BOTÓN EMPEZAR */}
        <button
          onClick={empezar}
          disabled={areasSeleccionadas.length === 0}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 12,
            border: 'none',
            backgroundColor: areasSeleccionadas.length === 0 ? '#AFD3E2' : '#146C94',
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 800,
            cursor: areasSeleccionadas.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {areasSeleccionadas.length === 0
            ? 'Selecciona al menos un área'
            : `Empezar (${areasSeleccionadas.length} área${areasSeleccionadas.length > 1 ? 's' : ''})`}
        </button>
      </main>
    </div>
  );
}