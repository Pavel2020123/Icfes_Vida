'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerAnaliticasInstitucion, crearEstudianteInstitucion, agregarEstudianteExistenteInstitucion } from '../../../lib/api';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Modal from '../../../components/Modal';
import { IconoUsuarioMas, IconoVinculo, IconoUsuarios, IconoGrafico, IconoLlave } from '../../../components/Iconos';

interface EstudianteAnalitica {
  id: string;
  nombre: string;
  correo: string;
  xpTotal: number;
  grupos: string[];
  totalSimulacros: number;
  promedioPuntaje: number;
  ultimoSimulacro: string | null;
  temasCompletados: number;
  totalSubtemas: number;
  progresoPorcentaje: number;
  porArea: { area: string; promedio: number; cantidad: number }[];
}

interface AnaliticasInstitucion {
  institucion: { totalEstudiantes: number; promedioGeneral: number; totalSimulacros: number };
  estudiantes: EstudianteAnalitica[];
}

const estiloInput = { width: '100%', padding: '13px 14px', borderRadius: 12, border: '1.5px solid #DCE6ED', fontSize: 14.5, color: '#1a2a3a', boxSizing: 'border-box' as const };
const estiloLabel = { fontWeight: 700, fontSize: 13.5, color: '#1a2a3a', marginBottom: -8 };

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || '?';
}

export default function EstudiantesPage() {
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState<EstudianteAnalitica[]>([]);
  const [resumenInstitucion, setResumenInstitucion] = useState({ totalEstudiantes: 0, promedioGeneral: 0, totalSimulacros: 0 });
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  // Modal: crear estudiante
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Modal: agregar estudiante existente
  const [modalExistenteAbierto, setModalExistenteAbierto] = useState(false);
  const [correoExistente, setCorreoExistente] = useState('');
  const [guardandoExistente, setGuardandoExistente] = useState(false);
  const [errorExistente, setErrorExistente] = useState('');
  const [mensajeExistente, setMensajeExistente] = useState('');

  const cargarAnaliticas = async () => {
    const data: AnaliticasInstitucion = await obtenerAnaliticasInstitucion();
    setEstudiantes(data.estudiantes);
    setResumenInstitucion(data.institucion);
  };

  useEffect(() => {
    const token = window.localStorage.getItem('saberplus_token');
    if (!token) {
      router.push('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarAnaliticas()
      .catch((err: unknown) => setErrorCarga(err instanceof Error ? err.message : 'Error cargando estudiantes'))
      .finally(() => setCargando(false));
  }, [router]);

  const abrirModalCrear = () => {
    setError('');
    setMensaje('');
    setModalCrearAbierto(true);
  };

  const abrirModalExistente = () => {
    setErrorExistente('');
    setMensajeExistente('');
    setModalExistenteAbierto(true);
  };

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
      await cargarAnaliticas();
      setTimeout(() => {
        setModalCrearAbierto(false);
        setMensaje('');
      }, 1100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creando estudiante');
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarExistente = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorExistente('');
    setMensajeExistente('');
    setGuardandoExistente(true);
    try {
      await agregarEstudianteExistenteInstitucion(correoExistente.trim());
      setMensajeExistente('Estudiante agregado con éxito.');
      setCorreoExistente('');
      await cargarAnaliticas();
      setTimeout(() => {
        setModalExistenteAbierto(false);
        setMensajeExistente('');
      }, 1100);
    } catch (err: unknown) {
      setErrorExistente(err instanceof Error ? err.message : 'Error agregando el estudiante');
    } finally {
      setGuardandoExistente(false);
    }
  };

  return (
    <ProtectedRoute rolesPermitidos={['PROFESOR']}>
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', padding: 24 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gap: 20 }}>

          {/* Cabecera compacta con acciones y resumen en una sola tarjeta */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: '26px 28px', boxShadow: '0 10px 30px rgba(20,108,148,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1a2a3a', margin: 0 }}>Estudiantes</h1>
                <p style={{ color: '#6b7c8c', fontSize: 14.5, marginTop: 6 }}>Matrícula y desempeño de tu institución.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={abrirModalExistente}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#F0F7FC', color: '#146C94', border: '1.5px solid #CFE6F2', borderRadius: 12, padding: '11px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  <IconoVinculo size={16} /> Agregar existente
                </button>
                <button
                  onClick={abrirModalCrear}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#146C94', color: '#ffffff', border: 'none', borderRadius: 12, padding: '11px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 6px 16px rgba(20,108,148,0.25)' }}
                >
                  <IconoUsuarioMas size={16} /> Crear estudiante
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F8FAFC', padding: '12px 18px', borderRadius: 14, border: '1px solid #E5E7EB', flex: '1 1 160px' }}>
                <span style={{ color: '#146C94' }}><IconoUsuarios size={20} /></span>
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Estudiantes</div>
                  <div style={{ fontWeight: 800, color: '#1a2a3a', marginTop: 2 }}>{resumenInstitucion.totalEstudiantes}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F8FAFC', padding: '12px 18px', borderRadius: 14, border: '1px solid #E5E7EB', flex: '1 1 160px' }}>
                <span style={{ color: '#146C94' }}><IconoGrafico size={20} /></span>
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Promedio general</div>
                  <div style={{ fontWeight: 800, color: '#146C94', marginTop: 2 }}>{resumenInstitucion.promedioGeneral}%</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F8FAFC', padding: '12px 18px', borderRadius: 14, border: '1px solid #E5E7EB', flex: '1 1 160px' }}>
                <span style={{ color: '#146C94' }}><IconoLlave size={20} /></span>
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Simulacros realizados</div>
                  <div style={{ fontWeight: 800, color: '#1a2a3a', marginTop: 2 }}>{resumenInstitucion.totalSimulacros}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de estudiantes */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 26, boxShadow: '0 10px 30px rgba(20,108,148,0.07)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1a2a3a', marginBottom: 16 }}>Lista de estudiantes</h2>

            {errorCarga && <p style={{ color: '#C0392B', marginBottom: 16 }}>{errorCarga}</p>}

            {cargando ? (
              <p style={{ color: '#6b7c8c' }}>Cargando...</p>
            ) : estudiantes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px' }}>
                <p style={{ color: '#6b7c8c', fontSize: 15, marginBottom: 18 }}>Todavía no tienes estudiantes matriculados.</p>
                <button
                  onClick={abrirModalCrear}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#146C94', color: '#ffffff', border: 'none', borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >
                  <IconoUsuarioMas size={16} /> Crear tu primer estudiante
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {estudiantes.map((estudiante) => {
                  const colorPuntaje = estudiante.totalSimulacros === 0
                    ? '#8a9aaa'
                    : estudiante.promedioPuntaje >= 80 ? '#1C7C45'
                    : estudiante.promedioPuntaje >= 60 ? '#146C94'
                    : '#C0392B';

                  return (
                    <div
                      key={estudiante.id}
                      style={{ borderRadius: 16, border: '1px solid #EDF1F4', padding: '16px 18px', display: 'grid', gap: 12, transition: 'box-shadow 0.15s ease, border-color 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(20,108,148,0.08)'; e.currentTarget.style.borderColor = '#DCE6ED'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#EDF1F4'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#EAF3F8', color: '#146C94', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                            {iniciales(estudiante.nombre)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: '#1a2a3a' }}>{estudiante.nombre}</p>
                            <p style={{ color: '#6b7c8c', fontSize: 13, margin: 0 }}>{estudiante.correo}</p>
                          </div>
                        </div>
                        <span style={{ color: '#146C94', fontWeight: 800, fontSize: 13, backgroundColor: '#F0F7FC', padding: '6px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                          {estudiante.xpTotal} XP
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {estudiante.grupos.length === 0 ? (
                          <span style={{ backgroundColor: '#F6F1F1', color: '#8a9aaa', borderRadius: 10, padding: '5px 10px', fontSize: 12 }}>Sin grupo asignado</span>
                        ) : estudiante.grupos.map((g) => (
                          <span key={g} style={{ backgroundColor: '#F0F7FC', color: '#146C94', borderRadius: 10, padding: '5px 10px', fontSize: 12, fontWeight: 600 }}>
                            {g}
                          </span>
                        ))}
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11.5, color: '#8a9aaa' }}>Progreso de temas</span>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#146C94' }}>
                            {estudiante.temasCompletados} de {estudiante.totalSubtemas} · {estudiante.progresoPorcentaje}%
                          </span>
                        </div>
                        <div style={{ height: 6, backgroundColor: '#EDF1F4', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${estudiante.progresoPorcentaje}%`, backgroundColor: '#19A7CE', borderRadius: 4 }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontSize: 11.5, color: '#8a9aaa', margin: 0 }}>Simulacros</p>
                          <p style={{ fontWeight: 700, color: '#1a2a3a', margin: '2px 0 0' }}>{estudiante.totalSimulacros}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11.5, color: '#8a9aaa', margin: 0 }}>Promedio</p>
                          <p style={{ fontWeight: 700, color: colorPuntaje, margin: '2px 0 0' }}>
                            {estudiante.totalSimulacros === 0 ? 'Sin datos' : `${estudiante.promedioPuntaje}%`}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11.5, color: '#8a9aaa', margin: 0 }}>Última actividad</p>
                          <p style={{ fontWeight: 700, color: '#1a2a3a', margin: '2px 0 0' }}>
                            {estudiante.ultimoSimulacro ? new Date(estudiante.ultimoSimulacro).toLocaleDateString('es-CO') : 'Sin actividad'}
                          </p>
                        </div>
                      </div>

                      {estudiante.porArea.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {estudiante.porArea.map((a) => (
                            <span key={a.area} style={{ backgroundColor: '#F6F1F1', color: '#6b7c8c', borderRadius: 8, padding: '4px 9px', fontSize: 11.5 }}>
                              {a.area.replaceAll('_', ' ')}: <strong style={{ color: '#146C94' }}>{a.promedio}%</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: crear estudiante */}
      <Modal
        abierto={modalCrearAbierto}
        onCerrar={() => setModalCrearAbierto(false)}
        titulo="Crear estudiante"
        descripcion="Se crea una cuenta nueva ya vinculada a tu institución."
      >
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={estiloLabel}>Nombre completo</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Laura Méndez"
            required
            style={estiloInput}
          />
          <label style={estiloLabel}>Correo electrónico</label>
          <input
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            type="email"
            placeholder="laura@colegio.com"
            required
            style={estiloInput}
          />
          <label style={estiloLabel}>Contraseña temporal</label>
          <input
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            type="password"
            placeholder="Mínimo 6 caracteres"
            required
            style={estiloInput}
          />
          <button
            type="submit"
            disabled={guardando}
            style={{ backgroundColor: '#146C94', color: '#ffffff', border: 'none', borderRadius: 12, padding: '13px 18px', fontWeight: 700, fontSize: 14.5, cursor: guardando ? 'not-allowed' : 'pointer', marginTop: 4 }}
          >
            {guardando ? 'Creando...' : 'Crear estudiante'}
          </button>
          {mensaje && <p style={{ color: '#1C7C45', fontSize: 13.5, margin: 0 }}>{mensaje}</p>}
          {error && <p style={{ color: '#C0392B', fontSize: 13.5, margin: 0 }}>{error}</p>}
        </form>
      </Modal>

      {/* Modal: agregar estudiante existente */}
      <Modal
        abierto={modalExistenteAbierto}
        onCerrar={() => setModalExistenteAbierto(false)}
        titulo="Agregar estudiante existente"
        descripcion="Si el estudiante ya tiene su propia cuenta creada, vincúlalo a tu institución con su correo."
      >
        <form onSubmit={handleAgregarExistente} style={{ display: 'grid', gap: 16 }}>
          <label style={estiloLabel}>Correo del estudiante</label>
          <input
            value={correoExistente}
            onChange={(e) => setCorreoExistente(e.target.value)}
            type="email"
            placeholder="correo@estudiante.com"
            required
            style={estiloInput}
          />
          <button
            type="submit"
            disabled={guardandoExistente}
            style={{ backgroundColor: '#19A7CE', color: '#ffffff', border: 'none', borderRadius: 12, padding: '13px 18px', fontWeight: 700, fontSize: 14.5, cursor: guardandoExistente ? 'not-allowed' : 'pointer', marginTop: 4 }}
          >
            {guardandoExistente ? 'Agregando...' : 'Agregar estudiante'}
          </button>
          {mensajeExistente && <p style={{ color: '#1C7C45', fontSize: 13.5, margin: 0 }}>{mensajeExistente}</p>}
          {errorExistente && <p style={{ color: '#C0392B', fontSize: 13.5, margin: 0 }}>{errorExistente}</p>}
        </form>
      </Modal>
    </ProtectedRoute>
  );
}