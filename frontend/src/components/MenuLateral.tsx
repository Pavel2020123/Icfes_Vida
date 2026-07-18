'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cerrarSesion, obtenerToken } from '../lib/api';
import { decodificarToken, RolUsuario } from '../lib/auth';
import { useBranding } from '../context/ThemeContext';

const AREAS = [
  { key: 'LECTURA_CRITICA', nombre: 'Lectura Crítica' },
  { key: 'MATEMATICAS', nombre: 'Matemáticas' },
  { key: 'CIENCIAS_NATURALES', nombre: 'Ciencias Naturales' },
  { key: 'SOCIALES_CIUDADANAS', nombre: 'Sociales y Ciudadanas' },
  { key: 'INGLES', nombre: 'Inglés' },
];

interface Props {
  nombre: string;
  progresoGeneral: number;
  temasCompletados: number;
  totalSubtemas: number;
}

export default function MenuLateral({
  nombre,
  progresoGeneral,
  temasCompletados,
  totalSubtemas,
}: Props) {
  const router = useRouter();
  const { branding } = useBranding();
  const [abierto, setAbierto] = useState(false);
  const [areasAbierto, setAreasAbierto] = useState(false);
  const [rol, setRol] = useState<RolUsuario | null>(null);

  useEffect(() => {
    const token = obtenerToken();
    if (token) {
      const payload = decodificarToken(token);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRol(payload?.rol ?? null);
    }
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    router.push('/');
  };

  const linkStyle = {
    padding: '12px 16px',
    borderRadius: 10,
    color: '#1a2a3a',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    marginBottom: 4,
  };

  return (
    <>
      {/* BOTÓN HAMBURGUESA */}
      <button
        onClick={() => setAbierto(true)}
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 200,
          backgroundColor: 'var(--color-primario, #146C94)',
          border: 'none',
          borderRadius: 10,
          width: 42,
          height: 42,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <span style={{ width: 20, height: 2, backgroundColor: '#ffffff', borderRadius: 2 }} />
        <span style={{ width: 20, height: 2, backgroundColor: '#ffffff', borderRadius: 2 }} />
        <span style={{ width: 20, height: 2, backgroundColor: '#ffffff', borderRadius: 2 }} />
      </button>

      {/* OVERLAY */}
      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26,42,58,0.5)',
            zIndex: 300,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* MENÚ LATERAL */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: 300,
          backgroundColor: '#ffffff',
          zIndex: 400,
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
          transform: abierto ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* CABECERA */}
        <div style={{ backgroundColor: 'var(--color-primario, #146C94)', padding: '24px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            {branding.logoUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <img
                  src={branding.logoUrl}
                  alt={branding.nombre ?? 'Logo institución'}
                  style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', backgroundColor: '#ffffff', flexShrink: 0 }}
                />
                <span style={{
                  fontSize: 16, fontWeight: 800, color: '#ffffff',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {branding.nombre}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
                Saber<span style={{ color: 'var(--color-secundario, #19A7CE)' }}>Plus</span>
              </span>
            )}
            <button
              onClick={() => setAbierto(false)}
              style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          {/* Info usuario */}
          <p style={{ color: '#D2E0FB', fontSize: 13, marginBottom: 4 }}>Hola,</p>
          <p style={{ color: '#ffffff', fontSize: 17, fontWeight: 700, marginBottom: 16 }}>{nombre}</p>

          {/* Barra de progreso */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#D2E0FB', fontSize: 12 }}>Progreso general</span>
              <span style={{ color: 'var(--color-secundario, #19A7CE)', fontSize: 12, fontWeight: 700 }}>{progresoGeneral}%</span>
            </div>
            <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 }}>
              <div style={{
                height: '100%',
                backgroundColor: 'var(--color-secundario, #19A7CE)',
                borderRadius: 3,
                width: `${progresoGeneral}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <p style={{ color: '#D2E0FB', fontSize: 11, marginTop: 6 }}>
              {temasCompletados} de {totalSubtemas} temas completados
            </p>
          </div>
        </div>

        {/* LINKS */}
        <div style={{ padding: '16px 12px', flex: 1 }}>

          {/* Inicio */}
          <Link href="/dashboard" onClick={() => setAbierto(false)} style={{ textDecoration: 'none', display: 'block' }}>
            <div
              style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F6F1F1'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Inicio
            </div>
          </Link>

          {/* Mi perfil */}
          <Link href="/perfil" onClick={() => setAbierto(false)} style={{ textDecoration: 'none', display: 'block' }}>
            <div
              style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F6F1F1'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Mi perfil
            </div>
          </Link>
  
          {/* Sección PROFESOR: Institución */}
          {rol === 'PROFESOR' && (
            <>
              <div style={{ height: 1, backgroundColor: '#F0F0F0', margin: '8px 0' }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#8a9aaa', padding: '8px 16px 4px', margin: 0 }}>
                GESTIÓN DE INSTITUCIÓN
              </p>
              
              <Link href="/institucion" onClick={() => setAbierto(false)} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  style={linkStyle}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F6F1F1'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Mi institución
                </div>
              </Link>
      
              <Link href="/institucion/estudiantes" onClick={() => setAbierto(false)} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  style={linkStyle}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F6F1F1'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Estudiantes
                </div>
              </Link>
      
              <Link href="/institucion/grupos" onClick={() => setAbierto(false)} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  style={linkStyle}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F6F1F1'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Grupos
                </div>
              </Link>
            </>
          )}

          {/* Sección ADMIN */}
          {rol === 'ADMIN' && (
            <>
              <div style={{ height: 1, backgroundColor: '#F0F0F0', margin: '8px 0' }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#8a9aaa', padding: '8px 16px 4px', margin: 0 }}>
                ADMINISTRACIÓN
              </p>
              <Link href="/admin" onClick={() => setAbierto(false)} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  style={{ ...linkStyle, color: '#BC7C7C' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FCD8CD'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Panel Admin
                </div>
              </Link>
            </>
          )}

          {rol === 'ESTUDIANTE' && (
          <>
          {/* Divisor */}
          <div style={{ height: 1, backgroundColor: '#F0F0F0', margin: '8px 0' }} />

          {/* Áreas desplegable */}
          <button
            onClick={() => setAreasAbierto(!areasAbierto)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: 'transparent',
              color: '#1a2a3a',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F6F1F1'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span>Áreas</span>
            <span style={{
              fontSize: 12,
              color: '#8a9aaa',
              display: 'inline-block',
              transition: 'transform 0.2s',
              transform: areasAbierto ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>

          {areasAbierto && (
            <div style={{ paddingLeft: 12, marginBottom: 8 }}>
              {AREAS.map(area => (
                <Link
                  key={area.key}
                  href={`/estudiar/${area.key}`}
                  onClick={() => setAbierto(false)}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div
                    style={{
                      padding: '9px 16px',
                      borderRadius: 8,
                      color: '#4a5a6a',
                      fontSize: 14,
                      cursor: 'pointer',
                      borderLeft: '2px solid #D2E0FB',
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#D2E0FB';
                      e.currentTarget.style.color = '#146C94';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#4a5a6a';
                    }}
                  >
                    {area.nombre}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Divisor */}
          <div style={{ height: 1, backgroundColor: '#F0F0F0', margin: '8px 0' }} />

          {/* Preguntas aleatorias */}
          <Link href="/preguntas-aleatorias" onClick={() => setAbierto(false)} style={{ textDecoration: 'none', display: 'block' }}>
            <div
              style={{ ...linkStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F6F1F1'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>Preguntas aleatorias</span>
              <span style={{ fontSize: 16 }}>🎲</span>
            </div>
          </Link>

          {/* Unirse a una clase */}
          <Link href="/unirse-clase" onClick={() => setAbierto(false)} style={{ textDecoration: 'none', display: 'block' }}>
            <div
              style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F6F1F1'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Unirse a una clase
            </div>
          </Link>
          </>
          )}

        </div>

        {/* CERRAR SESIÓN */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #AFD3E2' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1.5px solid #AFD3E2',
              backgroundColor: 'transparent',
              color: '#BC7C7C',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}