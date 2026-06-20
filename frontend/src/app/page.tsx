'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const AREAS = [
  { nombre: 'Lectura Crítica', descripcion: 'Comprensión e interpretación de textos argumentativos y literarios.' },
  { nombre: 'Matemáticas', descripcion: 'Álgebra, geometría, estadística y razonamiento cuantitativo.' },
  { nombre: 'Ciencias Naturales', descripcion: 'Física, química y biología con enfoque en método científico.' },
  { nombre: 'Sociales y Ciudadanas', descripcion: 'Historia, geografía, constitución y competencias ciudadanas.' },
  { nombre: 'Inglés', descripcion: 'Comprensión lectora y uso del idioma en contextos reales.' },
];

const PASOS = [
  { numero: '01', titulo: 'Regístrate gratis', texto: 'Crea tu cuenta en segundos. Tienes acceso completo desde el primer día.' },
  { numero: '02', titulo: 'Elige tu área', texto: 'Practica por materia o lanza un simulacro completo tipo ICFES real.' },
  { numero: '03', titulo: 'Conoce tu puntaje', texto: 'Al terminar ves exactamente qué fallaste y por qué, pregunta por pregunta.' },
];

const INFO_ROL = {
  estudiante: {
    titulo: 'Esto es para ti, estudiante',
    puntos: [
      'Simulacros completos con preguntas reales tipo ICFES',
      'Retroalimentación inmediata — sabes qué fallaste y por qué',
      'Tu progreso guardado para que estudies a tu ritmo',
      'Disponible a cualquier hora — sin excusas para no practicar',
      'Acumula XP y sube de nivel mientras estudias',
    ],
  },
  profesor: {
    titulo: 'Esto es para ti, profe',
    puntos: [
      'Crea grupos y agrega a tus estudiantes con un código',
      'Asigna simulacros por materia o tema específico',
      'Monitorea el progreso de cada estudiante en tiempo real',
      'Identifica en qué temas tiene más dificultades tu grupo',
      'Genera reportes para compartir con padres o directivos',
    ],
  },
};

// ==========================================
// COMPONENTE PARA ANIMACIÓN AL HACER SCROLL
// ==========================================
const FadeInSection = ({ children, delay = '0s' }: { children: React.ReactNode, delay?: string }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (domRef.current) {
      observer.observe(domRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.8s ease-out ${delay}, transform 0.8s ease-out ${delay}`,
      }}
    >
      {children}
    </div>
  );
};

export default function LandingPage() {
  const [rolActivo, setRolActivo] = useState<'estudiante' | 'profesor'>('estudiante');
  const [fadeRole, setFadeRole] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Función para controlar la velocidad del desplazamiento suave (Scroll)
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    
    // ⏱️ Duración en milisegundos (1500 = 1.5 segundos). Súbelo si lo quieres más lento.
    const duration = 1500; 
    let start: number | null = null;

    // Fórmula matemática para aceleración y desaceleración suave (Atenuación)
    const ease = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  };

  // Animación suave para cambiar entre Estudiante y Profesor
  const handleRoleChange = (rol: 'estudiante' | 'profesor') => {
    if (rol === rolActivo) return;
    setFadeRole(true);
    setTimeout(() => {
      setRolActivo(rol);
      setFadeRole(false);
    }, 300);
  };

  const info = INFO_ROL[rolActivo];

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: '#F6F1F1', color: '#1a2a3a', fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }}>

      {/* NAVBAR */}
      <nav
        style={{
          backgroundColor: '#146C94',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            maxWidth: 1250,
            margin: '0 auto',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 72,
          }}
        >
          {/* LOGO */}
          <span style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
            Saber<span style={{ color: '#8DD8FF' }}>Plus</span>
          </span>

          {/* BOTONES */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link
              href="/login"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: 16,
                fontWeight: 500,
                padding: '8px 12px',
              }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              style={{
                backgroundColor: '#8DD8FF',
                color: '#1a2a3a',
                padding: '10px 24px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 16,
                fontWeight: 700,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Sombra normal sin brillo fosforescente
                transition: 'transform 0.2s',
              }}
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        style={{
          background: 'linear-gradient(135deg, #146C94 0%, #19A7CE 100%)',
          padding: '110px 24px',
          textAlign: 'center',
        }}
      >
        <FadeInSection>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <p
              style={{
                color: '#8DD8FF',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              Preparación para el Saber 11
            </p>
            <h1
              style={{
                fontSize: 'clamp(40px, 7vw, 72px)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.1,
                marginBottom: 24,
                letterSpacing: '-1px',
              }}
            >
              Sube tu puntaje ICFES.<br />
              <span style={{ color: '#8DD8FF' }}>Pregunta por pregunta.</span>
            </h1>
            <p
              style={{
                fontSize: 20,
                color: '#D2E0FB',
                lineHeight: 1.6,
                marginBottom: 48,
                maxWidth: 650,
                margin: '0 auto 48px',
              }}
            >
              Simulacros reales, teoría estructurada y tu progreso en tiempo real. Todo lo que necesitas para llegar preparado el día del examen.
            </p>

            {/* Botón con la función de scroll lento activada */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a
                href="#como-funciona"
                onClick={(e) => scrollToSection(e, 'como-funciona')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  padding: '16px 40px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  fontSize: 18,
                  fontWeight: 600,
                  border: '2px solid rgba(255,255,255,0.6)',
                  transition: 'all 0.3s ease',
                }}
              >
                Ver cómo funciona
              </a>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* ¿QUÉ ERES? */}
      <section id="que-eres" style={{ padding: '100px 24px', backgroundColor: '#F6F1F1' }}>
        <FadeInSection>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 48, color: '#1a2a3a' }}>
              ¿Qué eres?
            </h2>

            {/* Pestañas */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {(['estudiante', 'profesor'] as const).map((rol) => (
                <button
                  key={rol}
                  onClick={() => handleRoleChange(rol)}
                  style={{
                    padding: '16px 56px',
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '2px solid #146C94',
                    borderBottom: rolActivo === rol ? '2px solid #ffffff' : '2px solid #146C94',
                    backgroundColor: rolActivo === rol ? '#146C94' : '#ffffff',
                    color: rolActivo === rol ? '#ffffff' : '#146C94',
                    borderRadius: rol === 'estudiante' ? '12px 0 0 0' : '0 12px 0 0',
                    transition: 'all 0.3s ease',
                    textTransform: 'capitalize',
                  }}
                >
                  {rol.charAt(0).toUpperCase() + rol.slice(1)}
                </button>
              ))}
            </div>

            {/* Recuadro de info */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #146C94',
                borderRadius: rolActivo === 'estudiante' ? '0 12px 12px 12px' : '12px 0 12px 12px',
                padding: '48px 56px',
                minHeight: 300,
                boxShadow: '0 8px 30px rgba(20,108,148,0.08)',
                marginTop: '-2px',
                opacity: fadeRole ? 0 : 1,
                transform: fadeRole ? 'translateY(15px)' : 'translateY(0)',
                transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
              }}
            >
              <h3 style={{ fontSize: 26, fontWeight: 800, color: '#146C94', marginBottom: 28 }}>
                {info.titulo}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {info.puntos.map((punto, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      fontSize: 17,
                      color: '#3a4a5a',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: '#D2E0FB',
                        color: '#146C94',
                        fontWeight: 800,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {i + 1}
                    </span>
                    {punto}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" style={{ padding: '100px 24px', backgroundColor: '#D2E0FB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeInSection>
            <p
              style={{
                color: '#146C94',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              Simple y efectivo
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 64, color: '#1a2a3a' }}>
              Tres pasos para mejorar tu puntaje
            </h2>
          </FadeInSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            {PASOS.map((paso, index) => (
              <FadeInSection key={paso.numero} delay={`${index * 0.15}s`}>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    padding: 40,
                    border: '1px solid #AFD3E2',
                    boxShadow: '0 4px 20px rgba(20,108,148,0.08)',
                    height: '100%',
                  }}
                >
                  <span
                    style={{
                      fontSize: 56,
                      fontWeight: 900,
                      color: '#AFD3E2',
                      display: 'block',
                      marginBottom: 20,
                    }}
                  >
                    {paso.numero}
                  </span>
                  <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#146C94' }}>
                    {paso.titulo}
                  </h3>
                  <p style={{ fontSize: 16, color: '#4a5a6a', lineHeight: 1.7 }}>{paso.texto}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ÁREAS */}
      <section id="areas" style={{ padding: '100px 24px', backgroundColor: '#F6F1F1' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeInSection>
            <p
              style={{
                color: '#19A7CE',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              Contenido completo
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 64, color: '#1a2a3a' }}>
              Las 5 áreas del ICFES
            </h2>
          </FadeInSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {AREAS.map((area, index) => (
              <FadeInSection key={area.nombre} delay={`${index * 0.1}s`}>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    padding: '32px 24px',
                    border: '1px solid #AFD3E2',
                    height: '100%',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(20,108,148,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#146C94', marginBottom: 12 }}>
                    {area.nombre}
                  </h3>
                  <p style={{ fontSize: 15, color: '#4a5a6a', lineHeight: 1.6 }}>{area.descripcion}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        style={{
          background: 'linear-gradient(135deg, #146C94 0%, #19A7CE 100%)',
          padding: '100px 24px',
          textAlign: 'center',
        }}
      >
        <FadeInSection>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: '#ffffff', marginBottom: 16 }}>
            Tu puntaje no mejora solo.
          </h2>
          <p style={{ fontSize: 20, color: '#D2E0FB', marginBottom: 48 }}>
            Empieza hoy. Gratis. Sin excusas.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/registro"
              style={{
                backgroundColor: '#ffffff',
                color: '#146C94',
                padding: '18px 48px',
                borderRadius: 12,
                textDecoration: 'none',
                fontSize: 18,
                fontWeight: 800,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                display: 'inline-block',
              }}
            >
              Crear mi cuenta gratis
            </Link>
          </div>
        </FadeInSection>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#1a2a3a', padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ color: '#8DD8FF', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
          Saber<span style={{ color: '#ffffff' }}>Plus</span>
        </p>
        <p style={{ color: '#AFD3E2', fontSize: 14 }}>© 2026 SaberPlus. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}