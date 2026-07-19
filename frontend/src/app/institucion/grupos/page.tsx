'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerGruposInstitucion, crearGrupoInstitucion, actualizarGrupoInstitucion, eliminarGrupoInstitucion, obtenerEstudiantesInstitucion, agregarEstudianteAGrupo, quitarEstudianteDeGrupo } from '../../../lib/api';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Modal from '../../../components/Modal';
import { IconoGrupo, IconoMas, IconoUsuarios, IconoFlechaIzquierda, IconoLapiz, IconoBasura } from '../../../components/Iconos';

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

const estiloInput = { width: '100%', padding: '13px 14px', borderRadius: 12, border: '1.5px solid #DCE6ED', fontSize: 14.5, color: '#1a2a3a', boxSizing: 'border-box' as const };
const estiloLabel = { fontWeight: 700, fontSize: 13.5, color: '#1a2a3a', marginBottom: -8 };

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  // Modal: crear grupo
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [seleccionPorGrupo, setSeleccionPorGrupo] = useState<Record<string, string>>({});
  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null);
  const [errorGrupoId, setErrorGrupoId] = useState<string | null>(null);
  const [errorGrupoMsg, setErrorGrupoMsg] = useState('');

  // Renombrar grupo (edición en línea)
  const [editandoGrupoId, setEditandoGrupoId] = useState<string | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  // Eliminar grupo (modal de confirmación)
  const [grupoAEliminar, setGrupoAEliminar] = useState<Grupo | null>(null);
  const [eliminandoGrupo, setEliminandoGrupo] = useState(false);
  const [errorEliminarGrupo, setErrorEliminarGrupo] = useState('');

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
          setErrorCarga(err instanceof Error ? err.message : 'Error cargando grupos');
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

  const abrirModalCrear = () => {
    setError('');
    setMensaje('');
    setModalCrearAbierto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGuardando(true);

    try {
      await crearGrupoInstitucion(nombre.trim());
      setMensaje('Grupo creado con éxito.');
      setNombre('');
      await cargarDatos();
      setTimeout(() => {
        setModalCrearAbierto(false);
        setMensaje('');
      }, 1100);
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

  const iniciarEdicionNombre = (grupo: Grupo) => {
    setErrorGrupoId(null);
    setErrorGrupoMsg('');
    setEditandoGrupoId(grupo.id);
    setNombreEditado(grupo.nombre);
  };

  const cancelarEdicionNombre = () => {
    setEditandoGrupoId(null);
    setNombreEditado('');
  };

  const handleGuardarNombre = async (grupoId: string) => {
    const nombreLimpio = nombreEditado.trim();
    if (!nombreLimpio) return;

    setErrorGrupoId(null);
    setErrorGrupoMsg('');
    setGuardandoNombre(true);

    try {
      await actualizarGrupoInstitucion(grupoId, nombreLimpio);
      await cargarDatos();
      setEditandoGrupoId(null);
      setNombreEditado('');
    } catch (err: unknown) {
      setErrorGrupoId(grupoId);
      setErrorGrupoMsg(err instanceof Error ? err.message : 'Error renombrando el grupo');
    } finally {
      setGuardandoNombre(false);
    }
  };

  const abrirConfirmarEliminar = (grupo: Grupo) => {
    setErrorEliminarGrupo('');
    setGrupoAEliminar(grupo);
  };

  const handleEliminarGrupo = async () => {
    if (!grupoAEliminar) return;

    setErrorEliminarGrupo('');
    setEliminandoGrupo(true);

    try {
      await eliminarGrupoInstitucion(grupoAEliminar.id);
      await cargarDatos();
      setGrupoAEliminar(null);
    } catch (err: unknown) {
      setErrorEliminarGrupo(err instanceof Error ? err.message : 'Error eliminando el grupo');
    } finally {
      setEliminandoGrupo(false);
    }
  };

  const estudiantesPorId = Object.fromEntries(estudiantes.map((e) => [e.id, e]));
  const totalEnGrupos = grupos.reduce((acc, g) => acc + g.ClaseEstudiante.length, 0);
  const promedioPorGrupo = grupos.length === 0 ? 0 : Math.round((totalEnGrupos / grupos.length) * 10) / 10;

  return (
    <ProtectedRoute rolesPermitidos={['PROFESOR']}>
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', padding: 24 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gap: 20 }}>

          {/* Cabecera compacta */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: '26px 28px', boxShadow: '0 10px 30px rgba(20,108,148,0.07)' }}>
            <Link href="/institucion" style={{ textDecoration: 'none' }}>
              <button
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#F0F7FC', color: '#146C94', border: '1.5px solid #CFE6F2', borderRadius: 12, padding: '10px 16px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', marginBottom: 18 }}
              >
                <IconoFlechaIzquierda size={16} /> Volver a institución
              </button>
            </Link>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1a2a3a', margin: 0 }}>Grupos</h1>
                <p style={{ color: '#6b7c8c', fontSize: 14.5, marginTop: 6 }}>Organiza a tus estudiantes por salón o nivel.</p>
              </div>
              <button
                onClick={abrirModalCrear}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#146C94', color: '#ffffff', border: 'none', borderRadius: 12, padding: '11px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 6px 16px rgba(20,108,148,0.25)' }}
              >
                <IconoMas size={16} /> Crear grupo
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F8FAFC', padding: '12px 18px', borderRadius: 14, border: '1px solid #E5E7EB', flex: '1 1 160px' }}>
                <span style={{ color: '#146C94' }}><IconoGrupo size={20} /></span>
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Grupos creados</div>
                  <div style={{ fontWeight: 800, color: '#1a2a3a', marginTop: 2 }}>{grupos.length}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F8FAFC', padding: '12px 18px', borderRadius: 14, border: '1px solid #E5E7EB', flex: '1 1 160px' }}>
                <span style={{ color: '#146C94' }}><IconoUsuarios size={20} /></span>
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Estudiantes por grupo</div>
                  <div style={{ fontWeight: 800, color: '#146C94', marginTop: 2 }}>{promedioPorGrupo || '—'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F8FAFC', padding: '12px 18px', borderRadius: 14, border: '1px solid #E5E7EB', flex: '1 1 160px' }}>
                <span style={{ color: '#146C94' }}><IconoGrupo size={20} /></span>
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Último grupo</div>
                  <div style={{ fontWeight: 800, color: '#1a2a3a', marginTop: 2 }}>{grupos[0]?.nombre ?? '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de grupos */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 26, boxShadow: '0 10px 30px rgba(20,108,148,0.07)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1a2a3a', marginBottom: 16 }}>Lista de grupos</h2>

            {errorCarga && <p style={{ color: '#C0392B', marginBottom: 16 }}>{errorCarga}</p>}

            {cargando ? (
              <p style={{ color: '#6b7c8c' }}>Cargando...</p>
            ) : grupos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px' }}>
                <p style={{ color: '#6b7c8c', fontSize: 15, marginBottom: 18 }}>Todavía no has creado ningún grupo.</p>
                <button
                  onClick={abrirModalCrear}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#146C94', color: '#ffffff', border: 'none', borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  <IconoMas size={16} /> Crear tu primer grupo
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {grupos.map((grupo) => {
                  const idsEnGrupo = new Set(grupo.ClaseEstudiante.map((ce) => ce.usuarioId));
                  const disponibles = estudiantes.filter((e) => !idsEnGrupo.has(e.id));

                  return (
                    <div
                      key={grupo.id}
                      style={{ borderRadius: 16, border: '1px solid #EDF1F4', borderLeft: '4px solid #19A7CE', padding: '16px 18px', display: 'grid', gap: 14, transition: 'box-shadow 0.15s ease, border-color 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(20,108,148,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: 180 }}>
                          {editandoGrupoId === grupo.id ? (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <input
                                value={nombreEditado}
                                onChange={(e) => setNombreEditado(e.target.value)}
                                autoFocus
                                style={{ padding: '8px 10px', borderRadius: 10, border: '1.5px solid #AFD3E2', fontSize: 14.5, fontWeight: 700, color: '#1a2a3a' }}
                              />
                              <button
                                onClick={() => handleGuardarNombre(grupo.id)}
                                disabled={guardandoNombre || !nombreEditado.trim()}
                                style={{ backgroundColor: '#146C94', color: '#ffffff', border: 'none', borderRadius: 8, padding: '7px 12px', fontWeight: 700, fontSize: 12.5, cursor: guardandoNombre ? 'not-allowed' : 'pointer' }}
                              >
                                {guardandoNombre ? 'Guardando...' : 'Guardar'}
                              </button>
                              <button
                                onClick={cancelarEdicionNombre}
                                disabled={guardandoNombre}
                                style={{ backgroundColor: '#F6F1F1', color: '#4a5a6a', border: 'none', borderRadius: 8, padding: '7px 12px', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: '#1a2a3a' }}>{grupo.nombre}</p>
                              <button
                                onClick={() => iniciarEdicionNombre(grupo)}
                                title="Renombrar grupo"
                                style={{ background: 'none', border: 'none', color: '#8a9aaa', cursor: 'pointer', padding: 4, display: 'flex' }}
                              >
                                <IconoLapiz size={14} />
                              </button>
                            </div>
                          )}
                          <p style={{ color: '#6b7c8c', fontSize: 13, margin: '2px 0 0' }}>Código de ingreso: <strong style={{ color: '#146C94' }}>{grupo.codigoIngreso}</strong></p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ color: '#146C94', fontWeight: 800, fontSize: 13, backgroundColor: '#F0F7FC', padding: '6px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                            {grupo.ClaseEstudiante.length} estudiantes
                          </span>
                          <button
                            onClick={() => abrirConfirmarEliminar(grupo)}
                            title="Eliminar grupo"
                            style={{ background: '#FDE8E4', border: 'none', color: '#C0392B', cursor: 'pointer', padding: 8, borderRadius: 10, display: 'flex' }}
                          >
                            <IconoBasura size={15} />
                          </button>
                        </div>
                      </div>

                      {grupo.ClaseEstudiante.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {grupo.ClaseEstudiante.map((ce) => {
                            const est = estudiantesPorId[ce.usuarioId];
                            const quitando = accionEnCurso === `quitar-${grupo.id}-${ce.usuarioId}`;
                            return (
                              <span key={ce.usuarioId} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#F0F7FC', color: '#146C94', borderRadius: 10, padding: '6px 6px 6px 12px', fontSize: 12.5, fontWeight: 600 }}>
                                {est?.nombre ?? 'Estudiante'}
                                <button
                                  onClick={() => handleQuitarDeGrupo(grupo.id, ce.usuarioId)}
                                  disabled={quitando}
                                  title="Quitar del grupo"
                                  style={{ background: 'none', border: 'none', color: '#8a9aaa', fontWeight: 800, cursor: quitando ? 'not-allowed' : 'pointer', padding: '2px 4px', fontSize: 12 }}
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
                          style={{ flex: 1, minWidth: 200, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #DCE6ED', fontSize: 13.5, color: '#1a2a3a' }}
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
                          style={{ backgroundColor: '#19A7CE', color: '#ffffff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
                        >
                          {accionEnCurso === `agregar-${grupo.id}` ? 'Agregando...' : 'Agregar'}
                        </button>
                      </div>
                      {errorGrupoId === grupo.id && <p style={{ color: '#C0392B', fontSize: 13 }}>{errorGrupoMsg}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: crear grupo */}
      <Modal
        abierto={modalCrearAbierto}
        onCerrar={() => setModalCrearAbierto(false)}
        titulo="Crear grupo"
        descripcion="Se genera un código de ingreso único para que los estudiantes se unan solos."
      >
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={estiloLabel}>Nombre del grupo</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="11-A Matemáticas"
            required
            style={estiloInput}
          />
          <button
            type="submit"
            disabled={guardando}
            style={{ backgroundColor: '#146C94', color: '#ffffff', border: 'none', borderRadius: 12, padding: '13px 18px', fontWeight: 700, fontSize: 14.5, cursor: guardando ? 'not-allowed' : 'pointer', marginTop: 4 }}
          >
            {guardando ? 'Creando...' : 'Crear grupo'}
          </button>
          {mensaje && <p style={{ color: '#1C7C45', fontSize: 13.5, margin: 0 }}>{mensaje}</p>}
          {error && <p style={{ color: '#C0392B', fontSize: 13.5, margin: 0 }}>{error}</p>}
        </form>
      </Modal>

      {/* Modal: confirmar eliminación de grupo */}
      <Modal
        abierto={grupoAEliminar !== null}
        onCerrar={() => setGrupoAEliminar(null)}
        titulo="Eliminar grupo"
        descripcion={
          grupoAEliminar
            ? `¿Seguro que quieres eliminar "${grupoAEliminar.nombre}"? Los ${grupoAEliminar.ClaseEstudiante.length} estudiante(s) del grupo quedarán sin grupo asignado. Esta acción no se puede deshacer.`
            : undefined
        }
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={handleEliminarGrupo}
            disabled={eliminandoGrupo}
            style={{ backgroundColor: '#C24B4B', color: '#ffffff', border: 'none', borderRadius: 12, padding: '12px 20px', fontWeight: 700, cursor: eliminandoGrupo ? 'not-allowed' : 'pointer' }}
          >
            {eliminandoGrupo ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
          <button
            type="button"
            onClick={() => setGrupoAEliminar(null)}
            disabled={eliminandoGrupo}
            style={{ backgroundColor: '#F0F7FC', color: '#146C94', border: 'none', borderRadius: 12, padding: '12px 20px', fontWeight: 700, cursor: 'pointer' }}
          >
            Cancelar
          </button>
        </div>
        {errorEliminarGrupo && <p style={{ color: '#C0392B', fontSize: 13.5, marginTop: 12 }}>{errorEliminarGrupo}</p>}
      </Modal>
    </ProtectedRoute>
  );
}