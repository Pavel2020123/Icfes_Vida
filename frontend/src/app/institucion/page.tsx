'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerMiInstitucion } from '../../lib/api';
import ProtectedRoute from '../../components/ProtectedRoute';

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
          <div style={{ maxWidth: 720, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 24, padding: 32, boxShadow: '0 12px 40px rgba(20,108,148,0.08)' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a2a3a', marginBottom: 12 }}>Aún no tienes una institución</h1>
            <p style={{ color: '#4a5a6a', fontSize: 16, marginBottom: 24 }}>
              Crea el espacio de tu colegio y comienza a matricular estudiantes y crear grupos.
            </p>
            <Link href="/institucion/crear" style={{ textDecoration: 'none' }}>
              <button style={{ backgroundColor: '#146C94', color: '#ffffff', padding: '14px 22px', borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                Crear mi institución
              </button>
            </Link>
            {error && <p style={{ marginTop: 24, color: '#BC7C7C' }}>{error}</p>}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const colorPrimario = institucion.colorPrimario || '#146C94';
  const colorSecundario = institucion.colorSecundario || '#19A7CE';

  return (
    <ProtectedRoute rolesPermitidos={['PROFESOR']}>
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 24 }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 32, boxShadow: '0 12px 40px rgba(20,108,148,0.08)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 100, height: 100, borderRadius: 24, backgroundColor: colorPrimario, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 32, fontWeight: 800 }}>
              {institucion.logoUrl ? (
                <img src={institucion.logoUrl} alt="Logo de la institución" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 24 }} />
              ) : (
                institucion.nombre.slice(0, 2).toUpperCase()
              )}
            </div>
            <div style={{ flex: 1, minWidth: 250 }}>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1a2a3a', marginBottom: 8 }}>{institucion.nombre}</h1>
              <p style={{ color: '#4a5a6a', fontSize: 16, marginBottom: 14 }}>
                {institucion.mensajeBienvenida || 'Tu espacio institucional está listo para crecer.'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <span style={{ backgroundColor: '#F0F7FC', color: colorPrimario, padding: '10px 14px', borderRadius: 14, fontWeight: 700 }}>Plan: {institucion.planActual || 'GRATIS'}</span>
                <span style={{ backgroundColor: '#F0F7FC', color: colorPrimario, padding: '10px 14px', borderRadius: 14, fontWeight: 700 }}>Código: {institucion.codigoUnico}</span>
              </div>
            </div>
            <Link href="/institucion/crear" style={{ textDecoration: 'none' }}>
              <button style={{ backgroundColor: colorPrimario, color: '#ffffff', padding: '14px 22px', borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                Editar institución
              </button>
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 24, boxShadow: '0 10px 28px rgba(20,108,148,0.06)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Estudiantes</h2>
            <p style={{ color: '#4a5a6a', fontSize: 14, marginBottom: 18 }}>{institucion.Usuario?.filter((u) => u.rol === 'ESTUDIANTE').length ?? 0} estudiantes vinculados</p>
            <Link href="/institucion/estudiantes" style={{ textDecoration: 'none' }}>
              <button style={{ backgroundColor: colorSecundario, color: '#ffffff', padding: '12px 18px', borderRadius: 14, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Ver estudiantes
              </button>
            </Link>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 24, boxShadow: '0 10px 28px rgba(20,108,148,0.06)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Grupos</h2>
            <p style={{ color: '#4a5a6a', fontSize: 14, marginBottom: 18 }}>{institucion.Clase?.length ?? 0} grupos creados</p>
            <Link href="/institucion/grupos" style={{ textDecoration: 'none' }}>
              <button style={{ backgroundColor: colorSecundario, color: '#ffffff', padding: '12px 18px', borderRadius: 14, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
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