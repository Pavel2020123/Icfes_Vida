'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AREA_NOMBRES: Record<string, string> = {
  LECTURA_CRITICA: 'Lectura Crítica',
  MATEMATICAS: 'Matemáticas',
  CIENCIAS_NATURALES: 'Ciencias Naturales',
  SOCIALES_CIUDADANAS: 'Sociales y Ciudadanas',
  INGLES: 'Inglés',
};

interface Resultado {
  area: string;
  resumen: {
    totalPreguntas: number;
    respuestasCorrectas: number;
    respuestasIncorrectas: number;
    puntaje: string;
    xpGanado: number;
  };
}

export default function ResultadosPage() {
  const router = useRouter();
  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('resultado_simulacro');
    if (!data) { router.push('/dashboard'); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResultado(JSON.parse(data));
    sessionStorage.removeItem('resultado_simulacro');
  }, [router]);

  if (!resultado) return null;

  const puntaje = parseFloat(resultado.resumen.puntaje);
  const colorPuntaje = puntaje >= 70 ? '#19A7CE' : puntaje >= 50 ? '#E4C087' : '#BC7C7C';
  const mensaje = puntaje >= 80 ? '¡Excelente resultado!' : puntaje >= 60 ? 'Buen trabajo, sigue así.' : 'Hay espacio para mejorar. ¡Sigue practicando!';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', fontFamily: 'system-ui, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#146C94', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
            Saber<span style={{ color: '#8DD8FF' }}>Plus</span>
          </span>
        </div>
      </nav>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '56px 24px' }}>

        {/* Puntaje principal */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: '48px 40px', border: '1.5px solid #AFD3E2', boxShadow: '0 4px 20px rgba(20,108,148,0.08)', textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#8a9aaa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
            {AREA_NOMBRES[resultado.area] ?? resultado.area}
          </p>
          <div style={{ fontSize: 88, fontWeight: 900, color: colorPuntaje, lineHeight: 1, marginBottom: 8 }}>
            {resultado.resumen.puntaje}
          </div>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#1a2a3a', marginBottom: 32 }}>
            {mensaje}
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Correctas', valor: resultado.resumen.respuestasCorrectas, color: '#19A7CE' },
              { label: 'Incorrectas', valor: resultado.resumen.respuestasIncorrectas, color: '#BC7C7C' },
              { label: 'XP ganado', valor: `+${resultado.resumen.xpGanado}`, color: '#8DD8FF' },
            ].map(stat => (
              <div key={stat.label} style={{ backgroundColor: '#F6F1F1', borderRadius: 12, padding: '20px 12px' }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.valor}</p>
                <p style={{ fontSize: 13, color: '#8a9aaa' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* XP Banner */}
          <div style={{ backgroundColor: '#D2E0FB', borderRadius: 12, padding: '16px 24px', marginBottom: 32 }}>
            <p style={{ color: '#146C94', fontWeight: 700, fontSize: 15 }}>
              Ganaste {resultado.resumen.xpGanado} XP en esta sesión
            </p>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={`/simulacro?area=${resultado.area}`}
              style={{ backgroundColor: '#146C94', color: '#ffffff', padding: '13px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}
            >
              Repetir simulacro
            </Link>
            <Link
              href="/dashboard"
              style={{ backgroundColor: '#ffffff', color: '#146C94', padding: '13px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15, border: '1.5px solid #146C94' }}
            >
              Ir al dashboard
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}