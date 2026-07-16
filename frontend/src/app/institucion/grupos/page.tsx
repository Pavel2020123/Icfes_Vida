'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerGruposInstitucion, crearGrupoInstitucion, obtenerEstudiantesInstitucion, agregarEstudianteAGrupo, quitarEstudianteDeGrupo } from '../../../lib/api';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface Grupo {
  id: string;
  nombre: string;
  codigoIngreso: string;
  ClaseEstudiante: { usuarioId: string }[];
}

interface Estudiante {
  id: string;
  nombre: string;
  correo: string;
}

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [seleccionPorGrupo, setSeleccionPorGrupo] = useState<Record<string, string>>({});
  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null);
  const [errorGrupoId, setErrorGrupoId] = useState<string | null>(null);
  const [errorGrupoMsg, setErrorGrupoMsg] = useState('');

    const cargarDatos = async (isMounted: boolean = true) => {
    const [listaGrupos, listaEstudiantes] = await Promise.all([
      obtenerGruposInstitucion(),
      obtenerEstudiantesInstitucion(),
    ]);
    if (isMounted) {
      setGrupos(listaGrupos);
      setEstudiantes(listaEstudiantes);
    }
  };


    useEffect(() => {
    let mounted = true;

    const token = window.localStorage.getItem('saberplus_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const inicializar = async () => {
      try {
        if (mounted) setCargando(true);
        await cargarDatos(mounted);
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Error cargando grupos');
        }
      } finally {
        if (mounted) setCargando(false);
      }
    };

    inicializar();

    return () => {
      mounted = false;
    };
  }, [router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGuardando(true);

    try {
      await crearGrupoInstitucion(nombre.trim());
      setMensaje('Grupo creado con éxito.');
      setNombre('');
      await cargarDatos();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creando grupo');
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarAGrupo = async (grupoId: string) => {
    const estudianteId = seleccionPorGrupo[grupoId];
    if (!estudianteId) return;

    setErrorGrupoId(null);
    setErrorGrupoMsg('');
    setAccionEnCurso(`agregar-${grupoId}`);

    try {
      await agregarEstudianteAGrupo(grupoId, estudianteId);
      setSeleccionPorGrupo((prev) => ({ ...prev, [grupoId]: '' }));
      await cargarDatos();
    } catch (err: unknown) {
      setErrorGrupoId(grupoId);
      setErrorGrupoMsg(err instanceof Error ? err.message : 'Error agregando al grupo');
    } finally {
      setAccionEnCurso(null);
    }
  };

  const handleQuitarDeGrupo = async (grupoId: string, estudianteId: string) => {
    setErrorGrupoId(null);
    setErrorGrupoMsg('');
    setAccionEnCurso(`quitar-${grupoId}-${estudianteId}`);

    try {
      await quitarEstudianteDeGrupo(grupoId, estudianteId);
      await cargarDatos();
    } catch (err: unknown) {
      setErrorGrupoId(grupoId);
      setErrorGrupoMsg(err instanceof Error ? err.message : 'Error quitando del grupo');
    } finally {
      setAccionEnCurso(null);
    }
  };

  const estudiantesPorId = Object.fromEntries(estudiantes.map((e) => [e.id, e]));

  return (
    <ProtectedRoute rolesPermitidos={['PROFESOR']}>
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 24 }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 32, boxShadow: '0 12px 40px rgba(20,108,148,0.08)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 10, color: '#1a2a3a' }}>Grupos</h1>
          <p style={{ color: '#4a5a6a', fontSize: 16 }}>Crea los grupos de tu institución y asigna estudiantes a cada uno.</p>
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
            <div style={{ display: 'grid', gap: 16 }}>
              {grupos.map((grupo) => {
                const idsEnGrupo = new Set(grupo.ClaseEstudiante.map((ce) => ce.usuarioId));
                const disponibles = estudiantes.filter((e) => !idsEnGrupo.has(e.id));

                return (
                  <div key={grupo.id} style={{ borderRadius: 18, border: '1px solid #E2E8F0', padding: 18, display: 'grid', gap: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{grupo.nombre}</p>
                        <p style={{ color: '#4a5a6a' }}>Código de ingreso: {grupo.codigoIngreso}</p>
                      </div>
                      <span style={{ color: '#146C94', fontWeight: 700 }}>{grupo.ClaseEstudiante.length} estudiantes</span>
                    </div>

                    {grupo.ClaseEstudiante.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {grupo.ClaseEstudiante.map((ce) => {
                          const est = estudiantesPorId[ce.usuarioId];
                          const quitando = accionEnCurso === `quitar-${grupo.id}-${ce.usuarioId}`;
                          return (
                            <span key={ce.usuarioId} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#F0F7FC', color: '#146C94', borderRadius: 12, padding: '8px 8px 8px 12px', fontSize: 13 }}>
                              {est?.nombre ?? 'Estudiante'}
                              <button
                                onClick={() => handleQuitarDeGrupo(grupo.id, ce.usuarioId)}
                                disabled={quitando}
                                title="Quitar del grupo"
                                style={{ background: 'none', border: 'none', color: '#BC7C7C', fontWeight: 800, cursor: quitando ? 'not-allowed' : 'pointer', padding: '2px 6px' }}
                              >
                                {quitando ? '...' : '✕'}
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <select
                        value={seleccionPorGrupo[grupo.id] ?? ''}
                        onChange={(e) => setSeleccionPorGrupo((prev) => ({ ...prev, [grupo.id]: e.target.value }))}
                        style={{ flex: 1, minWidth: 200, padding: '10px 12px', borderRadius: 12, border: '1.5px solid #AFD3E2', fontSize: 14 }}
                      >
                        <option value="">
                          {disponibles.length === 0 ? 'No hay estudiantes disponibles' : 'Selecciona un estudiante...'}
                        </option>
                        {disponibles.map((e) => (
                          <option key={e.id} value={e.id}>{e.nombre} ({e.correo})</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAgregarAGrupo(grupo.id)}
                        disabled={!seleccionPorGrupo[grupo.id] || accionEnCurso === `agregar-${grupo.id}`}
                        style={{ backgroundColor: '#19A7CE', color: '#ffffff', border: 'none', borderRadius: 12, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {accionEnCurso === `agregar-${grupo.id}` ? 'Agregando...' : 'Agregar al grupo'}
                      </button>
                    </div>
                    {errorGrupoId === grupo.id && <p style={{ color: '#BC7C7C', fontSize: 13 }}>{errorGrupoMsg}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}