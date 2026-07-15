'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerGruposInstitucion, crearGrupoInstitucion } from '../../../lib/api';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface Grupo {
  id: string;
  nombre: string;
  codigoIngreso: string;
  ClaseEstudiante: { usuarioId: string }[];
}

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [nombre, setNombre] = useState('');
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

    obtenerGruposInstitucion()
      .then((data) => setGrupos(data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error cargando grupos'))
      .finally(() => setCargando(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGuardando(true);

    try {
      await crearGrupoInstitucion(nombre.trim());
      setMensaje('Grupo creado con éxito.');
      setNombre('');
      const lista = await obtenerGruposInstitucion();
      setGrupos(lista);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creando grupo');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ProtectedRoute rolesPermitidos={['PROFESOR']}>
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 24 }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 32, boxShadow: '0 12px 40px rgba(20,108,148,0.08)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 10, color: '#1a2a3a' }}>Grupos</h1>
          <p style={{ color: '#4a5a6a', fontSize: 16 }}>Crea los grupos de tu institución y prepara la organización de tus estudiantes.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 28, boxShadow: '0 10px 28px rgba(20,108,148,0.06)' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Crear grupo</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
              <label style={{ fontWeight: 700 }}>Nombre del grupo</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="11-A Matemáticas"
                required
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid #AFD3E2', fontSize: 15 }}
              />
              <button type="submit" disabled={guardando} style={{ backgroundColor: '#146C94', color: '#ffffff', border: 'none', borderRadius: 14, padding: '16px 18px', fontWeight: 700, cursor: guardando ? 'not-allowed' : 'pointer' }}>
                {guardando ? 'Creando...' : 'Crear grupo'}
              </button>
            </form>
            {mensaje && <p style={{ marginTop: 16, color: '#1C5741' }}>{mensaje}</p>}
            {error && <p style={{ marginTop: 16, color: '#BC7C7C' }}>{error}</p>}
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 28, boxShadow: '0 10px 28px rgba(20,108,148,0.06)' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Resumen rápido</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#1a2a3a', fontWeight: 700 }}>Total de grupos</span>
                <span style={{ fontWeight: 700 }}>{grupos.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#1a2a3a', fontWeight: 700 }}>Último grupo</span>
                <span style={{ color: '#4a5a6a' }}>{grupos[0]?.nombre ?? 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 28, boxShadow: '0 10px 28px rgba(20,108,148,0.06)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Lista de grupos</h2>
          {cargando ? (
            <p style={{ color: '#4a5a6a' }}>Cargando...</p>
          ) : grupos.length === 0 ? (
            <p style={{ color: '#4a5a6a' }}>No hay grupos registrados aún.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {grupos.map((grupo) => (
                <div key={grupo.id} style={{ borderRadius: 18, border: '1px solid #E2E8F0', padding: 18, display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{grupo.nombre}</p>
                      <p style={{ color: '#4a5a6a' }}>Código de ingreso: {grupo.codigoIngreso}</p>
                    </div>
                    <span style={{ color: '#146C94', fontWeight: 700 }}>{grupo.ClaseEstudiante.length} estudiantes</span>
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
