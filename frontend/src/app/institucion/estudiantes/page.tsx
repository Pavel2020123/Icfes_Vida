'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerAnaliticasInstitucion, crearEstudianteInstitucion, agregarEstudianteExistenteInstitucion } from '../../../lib/api';
import ProtectedRoute from '../../../components/ProtectedRoute';

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

export default function EstudiantesPage() {
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState<EstudianteAnalitica[]>([]);
  const [resumenInstitucion, setResumenInstitucion] = useState({ totalEstudiantes: 0, promedioGeneral: 0, totalSimulacros: 0 });
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Nuevos estados para agregar estudiante existente
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
      await cargarAnaliticas();
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
    } catch (err: unknown) {
      setErrorExistente(err instanceof Error ? err.message : 'Error agregando el estudiante');
    } finally {
      setGuardandoExistente(false);
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

            <div style={{ height: 1, backgroundColor: '#E2E8F0', margin: '28px 0' }} />

            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Agregar estudiante existente</h2>
            <p style={{ color: '#4a5a6a', fontSize: 14, marginBottom: 18 }}>
              Si el estudiante ya tiene su propia cuenta creada, vincúlalo a tu institución con su correo.
            </p>
            <form onSubmit={handleAgregarExistente} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input
                value={correoExistente}
                onChange={(e) => setCorreoExistente(e.target.value)}
                type="email"
                placeholder="correo@estudiante.com"
                required
                style={{ flex: 1, minWidth: 220, padding: '14px 16px', borderRadius: 14, border: '1.5px solid #AFD3E2', fontSize: 15 }}
              />
              <button type="submit" disabled={guardandoExistente} style={{ backgroundColor: '#19A7CE', color: '#ffffff', border: 'none', borderRadius: 14, padding: '14px 22px', fontWeight: 700, cursor: guardandoExistente ? 'not-allowed' : 'pointer' }}>
                {guardandoExistente ? 'Agregando...' : 'Agregar'}
              </button>
            </form>
            {mensajeExistente && <p style={{ marginTop: 16, color: '#1C5741' }}>{mensajeExistente}</p>}
            {errorExistente && <p style={{ marginTop: 16, color: '#BC7C7C' }}>{errorExistente}</p>}
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 28, boxShadow: '0 10px 28px rgba(20,108,148,0.06)' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Resumen rápido</h2>
            <p style={{ color: '#4a5a6a', fontSize: 15, marginBottom: 18 }}>Así va el desempeño general de tu institución.</p>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#1a2a3a', fontWeight: 700 }}>Total de estudiantes</span>
                <span style={{ fontWeight: 700 }}>{resumenInstitucion.totalEstudiantes}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#1a2a3a', fontWeight: 700 }}>Promedio general</span>
                <span style={{ fontWeight: 700, color: '#146C94' }}>{resumenInstitucion.promedioGeneral}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#1a2a3a', fontWeight: 700 }}>Simulacros realizados</span>
                <span style={{ fontWeight: 700 }}>{resumenInstitucion.totalSimulacros}</span>
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
              {estudiantes.map((estudiante) => {
                const colorPuntaje = estudiante.totalSimulacros === 0
                  ? '#8a9aaa'
                  : estudiante.promedioPuntaje >= 80 ? '#1C5741'
                  : estudiante.promedioPuntaje >= 60 ? '#146C94'
                  : '#BC7C7C';

                return (
                  <div key={estudiante.id} style={{ borderRadius: 18, border: '1px solid #E2E8F0', padding: 18, display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{estudiante.nombre}</p>
                        <p style={{ color: '#4a5a6a' }}>{estudiante.correo}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#F0F7FC', padding: '6px 14px', borderRadius: 20, height: 'fit-content' }}>
                        <span style={{ color: '#146C94', fontWeight: 800, fontSize: 14 }}>{estudiante.xpTotal} XP</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {estudiante.grupos.length === 0 ? (
                        <span style={{ backgroundColor: '#F0F7FC', color: '#146C94', borderRadius: 12, padding: '8px 12px', fontSize: 13 }}>Sin grupo asignado</span>
                      ) : estudiante.grupos.map((g) => (
                        <span key={g} style={{ backgroundColor: '#F0F7FC', color: '#146C94', borderRadius: 12, padding: '8px 12px', fontSize: 13 }}>
                          {g}
                        </span>
                      ))}
                    </div>

                    {/* Barra de progreso de temas */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#4a5a6a' }}>Progreso de temas</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#146C94' }}>
                          {estudiante.temasCompletados} de {estudiante.totalSubtemas} ({estudiante.progresoPorcentaje}%)
                        </span>
                      </div>
                      <div style={{ height: 8, backgroundColor: '#D2E0FB', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${estudiante.progresoPorcentaje}%`, backgroundColor: '#19A7CE', borderRadius: 4 }} />
                      </div>
                    </div>

                    {/* Simulacros */}
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: 12, color: '#8a9aaa' }}>Simulacros realizados</p>
                        <p style={{ fontWeight: 700, color: '#1a2a3a' }}>{estudiante.totalSimulacros}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: '#8a9aaa' }}>Promedio en simulacros</p>
                        <p style={{ fontWeight: 700, color: colorPuntaje }}>
                          {estudiante.totalSimulacros === 0 ? 'Sin datos' : `${estudiante.promedioPuntaje}%`}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: '#8a9aaa' }}>Última actividad</p>
                        <p style={{ fontWeight: 700, color: '#1a2a3a' }}>
                          {estudiante.ultimoSimulacro ? new Date(estudiante.ultimoSimulacro).toLocaleDateString('es-CO') : 'Sin actividad'}
                        </p>
                      </div>
                    </div>

                    {/* Desglose por área */}
                    {estudiante.porArea.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {estudiante.porArea.map((a) => (
                          <span key={a.area} style={{ backgroundColor: '#F6F1F1', color: '#4a5a6a', borderRadius: 10, padding: '6px 10px', fontSize: 12 }}>
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
    </ProtectedRoute>
  );
}