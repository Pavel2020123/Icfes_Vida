'use client';

import { useState } from 'react';
import Link from 'next/link';

type Categoria = 'grado10' | 'grado11' | 'profesor';

const PLANES = {
  grado10: [
    {
      nombre: 'Gratis',
      precio: '$0',
      detalle: '3 días de prueba',
      descripcion: 'Para que conozcas la plataforma sin compromiso.',
      items: [
        'Acceso por 3 días',
        '2 simulacros de prueba',
        'Resultados básicos',
        'Una sola área',
      ],
      destacado: false,
      boton: 'Empezar gratis',
      href: '/registro',
    },
    {
      nombre: 'Grado 10',
      precio: '$25.000',
      detalle: 'pago único · calendario académico',
      descripcion: 'Todo lo que necesitas para prepararte en décimo.',
      items: [
        'Simulacros ilimitados',
        'Todas las áreas ICFES',
        'Material exclusivo grado 10',
        'Progreso detallado por tema',
        'XP y niveles',
        'Acceso 24/7',
      ],
      destacado: true,
      boton: 'Obtener Grado 10',
      href: '/registro',
    },
  ],
  grado11: [
    {
      nombre: 'Gratis',
      precio: '$0',
      detalle: '3 días de prueba',
      descripcion: 'Para que conozcas la plataforma sin compromiso.',
      items: [
        'Acceso por 3 días',
        '2 simulacros de prueba',
        'Resultados básicos',
        'Una sola área',
      ],
      destacado: false,
      boton: 'Empezar gratis',
      href: '/registro',
    },
    {
      nombre: 'Plus',
      precio: '$35.000',
      detalle: 'pago único · calendario académico',
      descripcion: 'La opción más popular entre estudiantes de once.',
      items: [
        'Simulacros ilimitados',
        'Todas las áreas ICFES',
        'Progreso detallado por tema',
        'XP y niveles',
        'Acceso 24/7',
      ],
      destacado: false,
      boton: 'Obtener Plus',
      href: '/registro',
    },
    {
      nombre: 'Pro',
      precio: '$50.000',
      detalle: 'pago único · calendario académico',
      descripcion: 'Para el estudiante que va en serio con su puntaje.',
      items: [
        'Todo lo del Plus',
        'Modo examen cronometrado',
        'Estadísticas avanzadas',
        'Análisis por pregunta',
        'Recomendaciones personalizadas',
        'Soporte prioritario',
      ],
      destacado: true,
      boton: 'Obtener Pro',
      href: '/registro',
    },
  ],
  profesor: [
    {
      nombre: 'Plus',
      precio: '$45.000',
      detalle: 'pago único · calendario académico',
      descripcion: 'Para el profe que quiere llevar el control de su salón.',
      items: [
        '1 institución',
        'Hasta 40 estudiantes',
        'Asignación de simulacros',
        'Progreso por estudiante',
        'Código de acceso para el grupo',
      ],
      destacado: false,
      boton: 'Obtener Plus',
      href: '/registro',
    },
    {
      nombre: 'Pro',
      precio: '$65.000',
      detalle: 'pago único · calendario académico',
      descripcion: 'Para coordinar varios grupos o instituciones.',
      items: [
        '2 instituciones',
        'Hasta 120 estudiantes',
        'Múltiples profesores',
        'Reportes por grupo',
        'Estadísticas comparativas',
        'Soporte prioritario',
      ],
      destacado: true,
      boton: 'Obtener Pro',
      href: '/registro',
    },
    {
      nombre: 'Ultra',
      precio: '$99.000',
      detalle: 'pago único · calendario académico',
      descripcion: 'Sin límites. Para instituciones que van en serio.',
      items: [
        'Instituciones ilimitadas',
        'Estudiantes ilimitados',
        'Profesores ilimitados',
        'Panel administrativo completo',
        'Reportes para directivos',
        'Soporte dedicado',
      ],
      destacado: false,
      boton: 'Obtener Ultra',
      href: '/registro',
    },
  ],
};

const LABELS: Record<Categoria, string> = {
  grado10: 'Grado 10',
  grado11: 'Grado 11',
  profesor: 'Profesor',
};

export default function PlanesPage() {
  const [categoria, setCategoria] = useState<Categoria>('grado11');
  const planes = PLANES[categoria];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', color: '#1a2a3a', fontFamily: 'system-ui, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#146C94', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1250, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
              Saber<span style={{ color: '#8DD8FF' }}>Plus</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link href="/login" style={{ color: '#ffffff', textDecoration: 'none', fontSize: 16, fontWeight: 500, padding: '8px 12px' }}>
              Iniciar sesión
            </Link>
            <Link href="/registro" style={{ backgroundColor: '#8DD8FF', color: '#1a2a3a', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 16, fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section style={{ padding: '64px 24px 48px', textAlign: 'center' }}>
        <p style={{ color: '#19A7CE', fontWeight: 600, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
          Sin sorpresas
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#1a2a3a', marginBottom: 16 }}>
          Un solo pago. Todo el año.
        </h1>
        <p style={{ fontSize: 17, color: '#4a5a6a', maxWidth: 480, margin: '0 auto 40px' }}>
          Paga una vez por el calendario académico y practica sin límites hasta el día del examen.
        </p>

        <div style={{ display: 'inline-flex', backgroundColor: '#D2E0FB', borderRadius: 50, padding: 4, gap: 4 }}>
          {(Object.keys(LABELS) as Categoria[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              style={{
                padding: '10px 28px',
                borderRadius: 50,
                border: 'none',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: categoria === cat ? '#146C94' : 'transparent',
                color: categoria === cat ? '#ffffff' : '#4a5a6a',
                transition: 'all 0.2s ease',
              }}
            >
              {LABELS[cat]}
            </button>
          ))}
        </div>
      </section>

      {/* PLANES */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{
          maxWidth: 1000,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: `repeat(${planes.length}, minmax(240px, 1fr))`,
          gap: 24,
          alignItems: 'start',
        }}>
          {planes.map(plan => (
            <div
              key={plan.nombre}
              style={{
                backgroundColor: plan.destacado ? '#146C94' : '#ffffff',
                borderRadius: 20,
                padding: '36px 28px',
                border: plan.destacado ? 'none' : '1px solid #AFD3E2',
                boxShadow: plan.destacado ? '0 12px 32px rgba(20,108,148,0.30)' : '0 2px 12px rgba(0,0,0,0.06)',
                position: 'relative' as const,
              }}
            >
              {plan.destacado && (
                <div style={{
                  position: 'absolute' as const,
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#8DD8FF',
                  color: '#1a2a3a',
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '5px 18px',
                  borderRadius: 20,
                  whiteSpace: 'nowrap' as const,
                }}>
                  Más popular
                </div>
              )}

              <h2 style={{ fontSize: 24, fontWeight: 800, color: plan.destacado ? '#ffffff' : '#1a2a3a', marginBottom: 6 }}>
                {plan.nombre}
              </h2>
              <p style={{ fontSize: 13, color: plan.destacado ? '#D2E0FB' : '#4a5a6a', marginBottom: 20 }}>
                {plan.descripcion}
              </p>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: plan.destacado ? '#8DD8FF' : '#146C94' }}>
                  {plan.precio}
                </span>
                <span style={{ fontSize: 13, color: plan.destacado ? '#D2E0FB' : '#8a9aaa', display: 'block', marginTop: 4 }}>
                  {plan.detalle}
                </span>
              </div>

              <Link
                href={plan.href}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  backgroundColor: plan.destacado ? '#8DD8FF' : '#146C94',
                  color: plan.destacado ? '#1a2a3a' : '#ffffff',
                  padding: '13px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: 28,
                }}
              >
                {plan.boton}
              </Link>

              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plan.items.map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: plan.destacado ? '#D2E0FB' : '#4a5a6a' }}>
                    <span style={{ color: plan.destacado ? '#8DD8FF' : '#19A7CE', fontWeight: 900, fontSize: 16, lineHeight: 1.2, flexShrink: 0 }}>
                      —
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#1a2a3a', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: '#8DD8FF', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
          Saber<span style={{ color: '#ffffff' }}>Plus</span>
        </p>
        <p style={{ color: '#AFD3E2', fontSize: 13 }}>
          © 2025 SaberPlus. Todos los derechos reservados.
        </p>
      </footer>

    </div>
  );
}