'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerMiInstitucion, obtenerUrlLogo } from '../../lib/api';
import ProtectedRoute from '../../components/ProtectedRoute';
import { IconoUsuarios, IconoGrupo } from '../../components/Iconos';

interface Institucion {
  id: string;
  nombre: string;
  codigoUnico: string;
  planActual?: string;
  logoUrl?: string;
  mensajeBienvenida?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  Usuario?: { id: string; nombre: string; rol: string }[];
  Clase?: { id: string; nombre: string; codigoIngreso: string }[];
}

export default function InstitucionPage() {
  const router = useRouter();
  const [institucion, setInstitucion] = useState<Institucion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = window.localStorage.getItem('saberplus_token');
    if (!token) {
      router.push('/login');
      return;
    }

    obtenerMiInstitucion()
      .then(setInstitucion)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la institución');
      })
      .finally(() => setCargando(false));
  }, [router]);

  if (cargando) {
    return (
      <ProtectedRoute rolesPermitidos={['PROFESOR']}>
        <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#146C94', fontSize: 18, fontWeight: 600 }}>Cargando institución...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!institucion) {
    return (
      <ProtectedRoute rolesPermitidos={['PROFESOR']}>
        <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', padding: 24 }}>
          <div style={{ maxWidth: 640, margin: '64px auto 0', backgroundColor: '#ffffff', borderRadius: 20, padding: 36, boxShadow: '0 12px 40px rgba(20,108,148,0.08)', textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1a2a3a', marginBottom: 10 }}>Aún no tienes una institución</h1>
            <p style={{ color: '#6b7c8c', fontSize: 15, marginBottom: 26, lineHeight: 1.5 }}>
              Crea el espacio de tu colegio y comienza a matricular estudiantes y crear grupos.
            </p>
            <Link href="/institucion/crear" style={{ textDecoration: 'none' }}>
              <button style={{ backgroundColor: '#146C94', color: '#ffffff', padding: '13px 24px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Crear mi institución
              </button>
            </Link>
            {error && <p style={{ marginTop: 20, color: '#C0392B', fontSize: 13.5 }}>{error}</p>}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const colorPrimario = institucion.colorPrimario || '#146C94';
  const totalEstudiantes = institucion.Usuario?.filter((u) => u.rol === 'ESTUDIANTE').length ?? 0;
  const totalGrupos = institucion.Clase?.length ?? 0;

  return (
    <ProtectedRoute rolesPermitidos={['PROFESOR']}>
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', padding: 24 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gap: 20 }}>

          {/* Hero */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: '28px 30px', boxShadow: '0 10px 30px rgba(20,108,148,0.07)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 22 }}>

              <div style={{ width: 76, height: 76, borderRadius: 20, backgroundColor: colorPrimario, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 26, fontWeight: 800, flexShrink: 0, overflow: 'hidden' }}>
                {institucion.logoUrl ? (
                  <img src={obtenerUrlLogo(institucion.logoUrl) ?? undefined} alt="Logo de la institución" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  institucion.nombre.slice(0, 2).toUpperCase()
                )}
              </div>

              <div style={{ flex: 1, minWidth: 240 }}>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1a2a3a', marginBottom: 6 }}>{institucion.nombre}</h1>
                <p style={{ color: '#6b7c8c', fontSize: 14.5, marginBottom: 16, lineHeight: 1.5 }}>
                  {institucion.mensajeBienvenida || 'Tu espacio institucional está listo para crecer.'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ background: '#F8FAFC', padding: '10px 16px', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 11.5, color: '#8a9aaa' }}>Plan</div>
                    <div style={{ fontWeight: 800, color: colorPrimario, marginTop: 2, fontSize: 14 }}>{institucion.planActual || 'GRATIS'}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '10px 16px', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 11.5, color: '#8a9aaa' }}>Código de ingreso</div>
                    <div style={{ fontWeight: 800, color: colorPrimario, marginTop: 2, fontSize: 14 }}>{institucion.codigoUnico}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '10px 16px', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 11.5, color: '#8a9aaa' }}>Estudiantes</div>
                    <div style={{ fontWeight: 800, color: colorPrimario, marginTop: 2, fontSize: 14 }}>{totalEstudiantes}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '10px 16px', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 11.5, color: '#8a9aaa' }}>Grupos</div>
                    <div style={{ fontWeight: 800, color: colorPrimario, marginTop: 2, fontSize: 14 }}>{totalGrupos}</div>
                  </div>
                </div>
              </div>

              <Link href="/institucion/editar">
                <button
                  style={{ backgroundColor: '#F6F1F1', color: '#1a2a3a', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '11px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13.5 }}
                >
                  Editar identidad
                </button>
              </Link>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 24, boxShadow: '0 10px 30px rgba(20,108,148,0.07)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: '#EAF3F8', color: colorPrimario, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconoUsuarios size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: 15.5, fontWeight: 800, color: '#1a2a3a', margin: 0 }}>Estudiantes</h2>
                  <p style={{ color: '#8a9aaa', fontSize: 13, margin: 0 }}>{totalEstudiantes} vinculados</p>
                </div>
              </div>
              <Link href="/institucion/estudiantes" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', backgroundColor: colorPrimario, color: '#ffffff', padding: '11px 18px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
                  Ver estudiantes
                </button>
              </Link>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 24, boxShadow: '0 10px 30px rgba(20,108,148,0.07)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: '#EAF3F8', color: colorPrimario, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconoGrupo size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: 15.5, fontWeight: 800, color: '#1a2a3a', margin: 0 }}>Grupos</h2>
                  <p style={{ color: '#8a9aaa', fontSize: 13, margin: 0 }}>{totalGrupos} creados</p>
                </div>
              </div>
              <Link href="/institucion/grupos" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', backgroundColor: colorPrimario, color: '#ffffff', padding: '11px 18px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
                  Ver grupos
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}