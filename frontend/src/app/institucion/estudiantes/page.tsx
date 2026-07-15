'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerEstudiantesInstitucion, crearEstudianteInstitucion } from '../../../lib/api';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface Estudiante {
  id: string;
  nombre: string;
  correo: string;
  fechaCreacion: string;
  ClaseEstudiante: { Clase: { id: string; nombre: string } }[];
}

export default function EstudiantesPage() {
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const token = window.localStorage.getItem('saberplus_token');
    if (!token) {
      router.push('/login');
      return;
    }

    obtenerEstudiantesInstitucion()
      .then((data) => setEstudiantes(data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error cargando estudiantes'))
      .finally(() => setCargando(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGuardando(true);

    try {
      await crearEstudianteInstitucion(nombre.trim(), correo.trim(), contrasena);
      setMensaje('Estudiante creado con éxito.');
      setNombre('');
      setCorreo('');
      setContrasena('');
      const lista = await obtenerEstudiantesInstitucion();
      setEstudiantes(lista);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creando estudiante');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ProtectedRoute rolesPermitidos={['PROFESOR']}>
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 24 }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 32, boxShadow: '0 12px 40px rgba(20,108,148,0.08)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 10, color: '#1a2a3a' }}>Estudiantes</h1>
          <p style={{ color: '#4a5a6a', fontSize: 16 }}>Agrega estudiantes y comienza a ver la matrícula de tu institución.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 28, boxShadow: '0 10px 28px rgba(20,108,148,0.06)' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Crear estudiante</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
              <label style={{ fontWeight: 700 }}>Nombre completo</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Laura Méndez"
                required
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid #AFD3E2', fontSize: 15 }}
              />
              <label style={{ fontWeight: 700 }}>Correo electrónico</label>
              <input
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                type="email"
                placeholder="laura@colegio.com"
                required
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid #AFD3E2', fontSize: 15 }}
              />
              <label style={{ fontWeight: 700 }}>Contraseña temporal</label>
              <input
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                type="password"
                placeholder="contraseña123"
                required
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid #AFD3E2', fontSize: 15 }}
              />
              <button type="submit" disabled={guardando} style={{ backgroundColor: '#146C94', color: '#ffffff', border: 'none', borderRadius: 14, padding: '16px 18px', fontWeight: 700, cursor: guardando ? 'not-allowed' : 'pointer' }}>
                {guardando ? 'Creando...' : 'Crear estudiante'}
              </button>
            </form>
            {mensaje && <p style={{ marginTop: 16, color: '#1C5741' }}>{mensaje}</p>}
            {error && <p style={{ marginTop: 16, color: '#BC7C7C' }}>{error}</p>}
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 28, boxShadow: '0 10px 28px rgba(20,108,148,0.06)' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Resumen rápido</h2>
            <p style={{ color: '#4a5a6a', fontSize: 15, marginBottom: 18 }}>Tu institución puede crear estudiantes y más adelante asignarlos a grupos. Por ahora es importante comenzar con la matrícula.</p>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#1a2a3a', fontWeight: 700 }}>Total de estudiantes</span>
                <span style={{ fontWeight: 700 }}>{estudiantes.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#1a2a3a', fontWeight: 700 }}>Último agregado</span>
                <span style={{ color: '#4a5a6a' }}>{estudiantes[0]?.nombre ?? 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 28, boxShadow: '0 10px 28px rgba(20,108,148,0.06)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Lista de estudiantes</h2>
          {cargando ? (
            <p style={{ color: '#4a5a6a' }}>Cargando...</p>
          ) : estudiantes.length === 0 ? (
            <p style={{ color: '#4a5a6a' }}>No hay estudiantes registrados aún.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {estudiantes.map((estudiante) => (
                <div key={estudiante.id} style={{ borderRadius: 18, border: '1px solid #E2E8F0', padding: 18, display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{estudiante.nombre}</p>
                      <p style={{ color: '#4a5a6a' }}>{estudiante.correo}</p>
                    </div>
                    <span style={{ color: '#146C94', fontWeight: 700 }}>{new Date(estudiante.fechaCreacion).toLocaleDateString('es-CO')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {estudiante.ClaseEstudiante.length === 0 ? (
                      <span style={{ backgroundColor: '#F0F7FC', color: '#146C94', borderRadius: 12, padding: '8px 12px', fontSize: 13 }}>Sin grupo asignado</span>
                    ) : estudiante.ClaseEstudiante.map((relation) => (
                      <span key={relation.Clase.id} style={{ backgroundColor: '#F0F7FC', color: '#146C94', borderRadius: 12, padding: '8px 12px', fontSize: 13 }}>
                        {relation.Clase.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
