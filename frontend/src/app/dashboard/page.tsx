'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerToken, API_URL, obtenerPerfilCompleto } from '../../lib/api';
import { RolUsuario } from '../../lib/auth';
import MenuLateral from '../../components/MenuLateral';
import MuroDePago from '../../components/MuroDePago';
import AvisoVerificarCorreo from '../../components/AvisoVerificarCorreo';
import { useBranding } from '../../context/ThemeContext';

const AREAS = [
  { key: 'LECTURA_CRITICA', nombre: 'Lectura Crítica' },
  { key: 'MATEMATICAS', nombre: 'Matemáticas' },
  { key: 'CIENCIAS_NATURALES', nombre: 'Ciencias Naturales' },
  { key: 'SOCIALES_CIUDADANAS', nombre: 'Sociales y Ciudadanas' },
  { key: 'INGLES', nombre: 'Inglés' },
];

interface Resultado {
  id: string;
  area: string;
  puntaje: number;
  respuestasCorrectas: number;
  totalPreguntas: number;
  xpGanado: number;
  fechaRealizado: string;
}

interface Progreso {
  porcentajeGeneral: number;
  temasCompletados: number;
  totalSubtemas: number;
  porArea: Record<string, { vistos: number; completados: number }>;
}

function areaLegible(area: string) {
  return AREAS.find(a => a.key === area)?.nombre ?? area;
}

function fechaLegible(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const { branding } = useBranding();
  const [nombre, setNombre] = useState('');
  const [institucionId, setInstitucionId] = useState<string | null>(null);
  const [rol, setRol] = useState<RolUsuario | null>(null);
  const [xp, setXp] = useState(0);
  const [historial, setHistorial] = useState<Resultado[]>([]);
  const [progreso, setProgreso] = useState<Progreso>({
    porcentajeGeneral: 0,
    temasCompletados: 0,
    totalSubtemas: 0,
    porArea: {},
  });
  const [cargando, setCargando] = useState(true);
  const [planVencido, setPlanVencido] = useState(false);
  const [correo, setCorreo] = useState('');
  const [requiereVerificacion, setRequiereVerificacion] = useState(false);

  useEffect(() => {
    const token = obtenerToken();
    if (!token) { router.push('/login'); return; }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNombre(payload.nombre ?? 'Estudiante');
      setInstitucionId(payload.institucionId ?? null);
      setRol(payload.rol ?? null);
      setCorreo(payload.correo ?? '');
    } catch {
      router.push('/login');
      return;
    }

    Promise.all([
      fetch(`${API_URL}/simulacros/historial`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch(`${API_URL}/simulacros/progreso`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      obtenerPerfilCompleto().catch(() => null),
    ])
      .then(([historialData, progresoData, perfil]) => {
        setHistorial(historialData.resultados ?? []);
        const totalXp = (historialData.resultados ?? []).reduce(
          (acc: number, r: Resultado) => acc + (r.xpGanado ?? 0), 0
        );
        setXp(totalXp);
        setProgreso(progresoData);
        setPlanVencido(Boolean(perfil?.planVencido));
        setRequiereVerificacion(Boolean(perfil?.requiereVerificacionCorreo));
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [router]);

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#146C94', fontSize: 18, fontWeight: 600 }}>Cargando...</p>
      </div>
    );
  }

  if (planVencido) {
    return <MuroDePago />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', fontFamily: 'system-ui, sans-serif' }}>

      {/* MENÚ LATERAL */}
      <MenuLateral
        nombre={nombre}
        progresoGeneral={progreso.porcentajeGeneral}
        temasCompletados={progreso.temasCompletados}
        totalSubtemas={progreso.totalSubtemas}
      />

      {/* NAVBAR */}
      <nav style={{ backgroundColor: 'var(--color-primario, #146C94)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 0 72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {branding.logoUrl ? (
              <>
                <img
                  src={branding.logoUrl}
                  alt={branding.nombre ?? 'Logo institución'}
                  style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', backgroundColor: '#ffffff', flexShrink: 0 }}
                />
                <span style={{
                  fontSize: 18, fontWeight: 800, color: '#ffffff',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220,
                }}>
                  {branding.nombre}
                </span>
              </>
            ) : (
              <span style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>
                Saber<span style={{ color: 'var(--color-secundario, #19A7CE)' }}>Plus</span>
              </span>
            )}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '6px 16px', borderRadius: 20 }}>
              <span style={{ color: 'var(--color-secundario, #19A7CE)', fontWeight: 800, fontSize: 15 }}>{xp} XP</span>
            </div>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

        {requiereVerificacion && <AvisoVerificarCorreo correo={correo} />}

        {rol === 'ESTUDIANTE' ? (
        <>
        {/* BARRA DE PROGRESO GRANDE */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          padding: '32px 36px',
          border: '1.5px solid #AFD3E2',
          boxShadow: '0 4px 20px rgba(20,108,148,0.08)',
          marginBottom: 48,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1a2a3a', marginBottom: 4 }}>
                Hola, {nombre.split(' ')[0]}
              </h1>
              <p style={{ color: '#4a5a6a', fontSize: 15 }}>
                Este es tu progreso general del curso
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: 'var(--color-primario, #146C94)' }}>
                {progreso.porcentajeGeneral}%
              </span>
              <p style={{ color: '#8a9aaa', fontSize: 13 }}>completado</p>
            </div>
          </div>

          {/* Barra principal */}
          <div style={{ height: 14, backgroundColor: '#D2E0FB', borderRadius: 7, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              backgroundColor: 'var(--color-primario, #146C94)',
              borderRadius: 7,
              width: `${progreso.porcentajeGeneral}%`,
              transition: 'width 1s ease',
              backgroundImage: 'linear-gradient(90deg, var(--color-primario, #146C94), var(--color-secundario, #19A7CE))',
            }} />
          </div>

          <p style={{ color: '#4a5a6a', fontSize: 14 }}>
            <strong style={{ color: 'var(--color-primario, #146C94)' }}>{progreso.temasCompletados}</strong> de{' '}
            <strong>{progreso.totalSubtemas}</strong> temas completados
          </p>
        </div>
        
        {/* BANNER: unirse a clase si aún no pertenece a ninguna institución */}
        {!institucionId && (
          <Link href="/unirse-clase" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#FFF3CD',
              border: '1.5px solid #F0D68A',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 24,
              cursor: 'pointer',
            }}>
              <strong style={{ color: '#7a5a00' }}>¿Tu profesor te dio un código de clase?</strong>{' '}
              <span style={{ color: '#7a5a00' }}>Únete aquí →</span>
            </div>
          </Link>
        )}

        {/* PREGUNTAS ALEATORIAS */}
        <Link href="/preguntas-aleatorias" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'var(--color-primario, #146C94)',
            backgroundImage: 'linear-gradient(120deg, var(--color-primario, #146C94), var(--color-secundario, #19A7CE))',
            borderRadius: 18,
            padding: '28px 32px',
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(20,108,148,0.25)',
          }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
                🎲 Preguntas aleatorias
              </h2>
              <p style={{ color: '#D2E0FB', fontSize: 14, maxWidth: 460 }}>
                Elige una o varias áreas y responde preguntas mezcladas al azar, a tu ritmo.
              </p>
            </div>
            <span style={{
              backgroundColor: '#ffffff', color: 'var(--color-primario, #146C94)', padding: '12px 24px',
              borderRadius: 10, fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap',
            }}>
              Empezar →
            </span>
          </div>
        </Link>
        
        {/* MÓDULOS DE ESTUDIO */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a2a3a', marginBottom: 8 }}>
            Módulos de estudio
          </h2>
          <p style={{ color: '#4a5a6a', fontSize: 14, marginBottom: 20 }}>
            Estudia cada área tema por tema antes de hacer el simulacro.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {AREAS.map(area => {
              const p = progreso.porArea[area.key];
              const pct = p && progreso.totalSubtemas > 0
                ? Math.round((p.completados / (progreso.totalSubtemas / 5)) * 100)
                : 0;

              return (
                <Link key={area.key} href={`/estudiar/${area.key}`} style={{ textDecoration: 'none' }}>
                  <div style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: '24px 20px', border: '1.5px solid #AFD3E2', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(20,108,148,0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primario, #146C94)', marginBottom: 12 }}>
                      {area.nombre}
                    </h3>
                    <div style={{ height: 5, backgroundColor: '#D2E0FB', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', backgroundColor: 'var(--color-secundario, #19A7CE)', borderRadius: 3, width: `${pct}%`, transition: 'width 0.5s ease' }} />
                    </div>
                    <p style={{ fontSize: 12, color: '#8a9aaa' }}>{pct}% completado</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        </>
        ) : (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: '32px 36px',
            border: '1.5px solid #AFD3E2',
            borderLeft: '6px solid var(--color-primario, #146C94)',
            boxShadow: '0 4px 20px rgba(20,108,148,0.08)',
          }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1a2a3a', marginBottom: 4 }}>
              Hola, {nombre.split(' ')[0]}
            </h1>
            <p style={{ color: '#4a5a6a', fontSize: 15, marginBottom: rol === 'PROFESOR' ? 20 : 0 }}>
              {rol === 'PROFESOR'
                ? 'Bienvenido a tu panel de profesor. Desde el menú puedes gestionar tu institución, estudiantes y grupos.'
                : 'Bienvenido al panel de administración.'}
            </p>
            {rol === 'PROFESOR' && (
              <Link href="/institucion" style={{ textDecoration: 'none' }}>
                <button style={{
                  backgroundColor: 'var(--color-primario, #146C94)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 20px',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}>
                  Ir a mi institución
                </button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
