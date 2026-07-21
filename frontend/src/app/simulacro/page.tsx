'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerToken, API_URL, esRespuestaPlanVencido } from '../../lib/api';

interface Respuesta {
  id: string;
  texto: string;
}

interface Pregunta {
  id: string;
  enunciado: string;
  respuestas: Respuesta[];
  subtema: {
    nombre: string;
    tema: { nombre: string; area: string };
  };
}

export default function SimulacroPage() {
  const router = useRouter();
  const [area, setArea] = useState('MATEMATICAS');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [actual, setActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const AREA_NOMBRES: Record<string, string> = {
    LECTURA_CRITICA: 'Lectura Crítica',
    MATEMATICAS: 'Matemáticas',
    CIENCIAS_NATURALES: 'Ciencias Naturales',
    SOCIALES_CIUDADANAS: 'Sociales y Ciudadanas',
    INGLES: 'Inglés',
  };

  useEffect(() => {
    const token = obtenerToken();
    if (!token) { router.push('/login'); return; }

    const query = new URLSearchParams(window.location.search);
    const selectedArea = query.get('area') ?? 'MATEMATICAS';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setArea(selectedArea);

    fetch(`${API_URL}/simulacros/generar?area=${selectedArea}`)
      .then(r => r.json())
      .then(data => {
        if (data.preguntas && data.preguntas.length > 0) {
          setPreguntas(data.preguntas);
        } else {
          setError('No hay preguntas disponibles para esta área todavía.');
        }
      })
      .catch(() => setError('Error conectando con el servidor.'))
      .finally(() => setCargando(false));
  }, [router]);

  const seleccionarRespuesta = (preguntaId: string, respuestaId: string) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: respuestaId }));
  };

  const enviarSimulacro = useCallback(async () => {
    const token = obtenerToken();
    if (!token) return;

    setEnviando(true);
    try {
      const respuestasArray = Object.entries(respuestas).map(([preguntaId, respuestaId]) => ({
        preguntaId,
        respuestaId,
      }));

      const res = await fetch(`${API_URL}/simulacros/calificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ area, respuestas: respuestasArray }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (esRespuestaPlanVencido(res.status, data)) {
          router.push('/planes?vencido=1');
          return;
        }
        setError(data.mensaje || data.message || 'No se pudo enviar el simulacro.');
        setEnviando(false);
        return;
      }

      // Guardar resultado en sessionStorage para mostrarlo en la página de resultados
      sessionStorage.setItem('resultado_simulacro', JSON.stringify({ ...data, area }));
      router.push('/resultados');
    } catch {
      setError('Error al enviar el simulacro. Intenta de nuevo.');
      setEnviando(false);
    }
  }, [respuestas, area, router]);

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '4px solid #D2E0FB', borderTop: '4px solid #146C94', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#146C94', fontSize: 16, fontWeight: 600 }}>Preparando tu simulacro...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 24 }}>
        <p style={{ color: '#BC7C7C', fontSize: 18, fontWeight: 600, textAlign: 'center' }}>{error}</p>
        <button onClick={() => router.push('/dashboard')} style={{ backgroundColor: '#146C94', color: '#fff', padding: '12px 28px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Volver al dashboard
        </button>
      </div>
    );
  }

  const preguntaActual = preguntas[actual];
  const totalPreguntas = preguntas.length;
  const respondidas = Object.keys(respuestas).length;
  const progreso = (actual / totalPreguntas) * 100;
  const esUltima = actual === totalPreguntas - 1;
  const yaRespondioActual = !!respuestas[preguntaActual?.id];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', fontFamily: 'system-ui, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#146C94', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
            Saber<span style={{ color: '#8DD8FF' }}>Plus</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#D2E0FB', fontSize: 14, fontWeight: 600 }}>
              {AREA_NOMBRES[area] ?? area}
            </span>
            <span style={{ color: '#8DD8FF', fontSize: 14, fontWeight: 700 }}>
              {respondidas}/{totalPreguntas} respondidas
            </span>
          </div>
        </div>
        {/* Barra de progreso */}
        <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <div style={{ height: '100%', backgroundColor: '#8DD8FF', width: `${progreso}%`, transition: 'width 0.4s ease' }} />
        </div>
      </nav>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>

        {/* Contador de pregunta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#8a9aaa', textTransform: 'uppercase', letterSpacing: 1 }}>
            Pregunta {actual + 1} de {totalPreguntas}
          </span>
          <span style={{ fontSize: 13, color: '#4a5a6a' }}>
            {preguntaActual?.subtema?.tema?.nombre ?? ''}
          </span>
        </div>

        {/* Tarjeta de pregunta */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 18, padding: '36px 32px', border: '1.5px solid #AFD3E2', boxShadow: '0 4px 20px rgba(20,108,148,0.08)', marginBottom: 24 }}>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#1a2a3a', lineHeight: 1.6, marginBottom: 32 }}>
            {preguntaActual?.enunciado}
          </p>

          {/* Opciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {preguntaActual?.respuestas.map((respuesta, idx) => {
              const seleccionada = respuestas[preguntaActual.id] === respuesta.id;
              const letras = ['A', 'B', 'C', 'D'];
              return (
                <button
                  key={respuesta.id}
                  onClick={() => seleccionarRespuesta(preguntaActual.id, respuesta.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: seleccionada ? '2px solid #146C94' : '1.5px solid #AFD3E2',
                    backgroundColor: seleccionada ? '#D2E0FB' : '#F6F1F1',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    width: '100%',
                  }}
                >
                  <span style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    backgroundColor: seleccionada ? '#146C94' : '#ffffff',
                    color: seleccionada ? '#ffffff' : '#146C94',
                    border: `2px solid ${seleccionada ? '#146C94' : '#AFD3E2'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 13,
                    flexShrink: 0,
                  }}>
                    {letras[idx]}
                  </span>
                  <span style={{ fontSize: 15, color: '#1a2a3a', lineHeight: 1.5, paddingTop: 4 }}>
                    {respuesta.texto}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navegación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setActual(prev => Math.max(0, prev - 1))}
            disabled={actual === 0}
            style={{
              backgroundColor: '#ffffff',
              color: actual === 0 ? '#AFD3E2' : '#146C94',
              border: `1.5px solid ${actual === 0 ? '#D2E0FB' : '#146C94'}`,
              padding: '12px 28px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: actual === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Anterior
          </button>

          {/* Puntos de navegación */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 400 }}>
            {preguntas.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActual(i)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: i === actual ? '#146C94' : respuestas[p.id] ? '#19A7CE' : '#D2E0FB',
                  color: i === actual || respuestas[p.id] ? '#ffffff' : '#8a9aaa',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {esUltima ? (
            <button
              onClick={enviarSimulacro}
              disabled={enviando || respondidas === 0}
              style={{
                backgroundColor: enviando ? '#AFD3E2' : '#146C94',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: enviando || respondidas === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {enviando ? 'Enviando...' : 'Terminar'}
            </button>
          ) : (
            <button
              onClick={() => setActual(prev => Math.min(totalPreguntas - 1, prev + 1))}
              style={{
                backgroundColor: '#146C94',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Siguiente
            </button>
          )}
        </div>

      </main>
    </div>
  );
}



