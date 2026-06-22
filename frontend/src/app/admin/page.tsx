'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerToken } from '../../lib/api';

const AREAS = [
  { key: 'LECTURA_CRITICA', nombre: 'Lectura Crítica' },
  { key: 'MATEMATICAS', nombre: 'Matemáticas' },
  { key: 'CIENCIAS_NATURALES', nombre: 'Ciencias Naturales' },
  { key: 'SOCIALES_CIUDADANAS', nombre: 'Sociales y Ciudadanas' },
  { key: 'INGLES', nombre: 'Inglés' },
];

const DIFICULTADES = ['BASICO', 'MEDIO', 'AVANZADO'];

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  xpTotal: number;
  fechaCreacion: string;
}

interface Subtema {
  id: string;
  nombre: string;
  _count: { preguntas: number };
}

interface Tema {
  id: string;
  nombre: string;
  area: string;
  subtemas: Subtema[];
}

interface Stats {
  totalUsuarios: number;
  totalPreguntas: number;
  totalTemas: number;
  totalSimulacros: number;
}

type Pestana = 'stats' | 'temas' | 'preguntas' | 'usuarios' | 'contenido';

function ContenidoEditor({ temas, getHeaders, mostrarMensaje, inputStyle, btnStyle }: {
  temas: Tema[];
  getHeaders: () => Record<string, string>;
  mostrarMensaje: (msg: string) => void;
  inputStyle: React.CSSProperties;
  btnStyle: React.CSSProperties;
}) {
  const [subtemaId, setSubtemaId] = useState('');
  const [contenido, setContenido] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [guardando, setGuardando] = useState(false);

  const todosSubtemas = temas.flatMap(t =>
    t.subtemas.map(s => ({ ...s, temaNombre: t.nombre }))
  );

  const guardar = async () => {
    if (!subtemaId) { mostrarMensaje('Selecciona un subtema'); return; }
    setGuardando(true);
    await fetch(`http://localhost:3000/admin/subtemas/${subtemaId}/contenido`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ contenido, videoUrl, imagenUrl }),
    });
    mostrarMensaje('Contenido guardado');
    setGuardando(false);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2', maxWidth: 700 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 24 }}>
        Editar contenido de un subtema
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Subtema</label>
          <select value={subtemaId} onChange={e => setSubtemaId(e.target.value)} style={inputStyle}>
            <option value="">Selecciona un subtema</option>
            {todosSubtemas.map(s => (
              <option key={s.id} value={s.id}>{s.temaNombre} → {s.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>
            Explicación del tema
          </label>
          <textarea
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            placeholder="Escribe aquí la explicación del tema. Puedes usar saltos de línea para organizar el contenido."
            rows={10}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>
            Link del video de YouTube
          </label>
          <input
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            style={inputStyle}
          />
          <p style={{ fontSize: 12, color: '#8a9aaa', marginTop: 4 }}>
            Pega el link del video de YouTube que explica el tema.
          </p>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>
            Imagen de apoyo (nombre del archivo)
          </label>
          <input
            value={imagenUrl}
            onChange={e => setImagenUrl(e.target.value)}
            placeholder="ej: regla-de-tres.png"
            style={inputStyle}
          />
          <p style={{ fontSize: 12, color: '#8a9aaa', marginTop: 4 }}>
            Coloca el archivo en frontend/public/imagenes/
          </p>
        </div>
        <button onClick={guardar} disabled={guardando} style={{ ...btnStyle, padding: '13px', opacity: guardando ? 0.6 : 1 }}>
          {guardando ? 'Guardando...' : 'Guardar contenido'}
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [pestana, setPestana] = useState<Pestana>('stats');

  const [stats, setStats] = useState<Stats | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [cargando, setCargando] = useState(true);

  const [nuevoTema, setNuevoTema] = useState({ nombre: '', area: 'MATEMATICAS' });
  const [nuevoSubtema, setNuevoSubtema] = useState({ nombre: '', temaId: '' });
  const [subtemaSeleccionado, setSubtemaSeleccionado] = useState('');

  const [nuevaPregunta, setNuevaPregunta] = useState({
    enunciado: '',
    dificultad: 'MEDIO',
    imagenes: '',
    respuestas: [
      { texto: '', esCorrecta: true },
      { texto: '', esCorrecta: false },
      { texto: '', esCorrecta: false },
      { texto: '', esCorrecta: false },
    ],
  });

  const [mensaje, setMensaje] = useState('');

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1.5px solid #AFD3E2',
    fontSize: 14,
    color: '#1a2a3a',
    backgroundColor: '#F6F1F1',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const btnStyle = {
    backgroundColor: '#146C94',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  };

  useEffect(() => {
    const token = obtenerToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.rol !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
    } catch {
      router.push('/login');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const cargar = async () => {
      setCargando(true);
      try {
        const [statsRes, temasRes, usuariosRes] = await Promise.all([
          fetch('http://localhost:3000/admin/estadisticas', { headers }),
          fetch('http://localhost:3000/admin/temas', { headers }),
          fetch('http://localhost:3000/admin/usuarios', { headers }),
        ]);
        setStats(await statsRes.json());
        setTemas(await temasRes.json());
        setUsuarios(await usuariosRes.json());
      } catch {
      }
      setCargando(false);
    };

    cargar();
  }, [router]);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${obtenerToken()}`,
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [statsRes, temasRes, usuariosRes] = await Promise.all([
        fetch('http://localhost:3000/admin/estadisticas', { headers: getHeaders() }),
        fetch('http://localhost:3000/admin/temas', { headers: getHeaders() }),
        fetch('http://localhost:3000/admin/usuarios', { headers: getHeaders() }),
      ]);
      setStats(await statsRes.json());
      setTemas(await temasRes.json());
      setUsuarios(await usuariosRes.json());
    } catch {
    }
    setCargando(false);
  };

  const mostrarMensaje = (msg: string) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), 3000);
  };

  const crearTema = async () => {
    if (!nuevoTema.nombre) return;
    await fetch('http://localhost:3000/admin/temas', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nombre: nuevoTema.nombre, area: nuevoTema.area }),
    });
    setNuevoTema({ nombre: '', area: 'MATEMATICAS' });
    mostrarMensaje('Tema creado');
    cargarDatos();
  };

  const crearSubtema = async () => {
    if (!nuevoSubtema.nombre || !nuevoSubtema.temaId) return;
    await fetch('http://localhost:3000/admin/subtemas', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(nuevoSubtema),
    });
    setNuevoSubtema({ nombre: '', temaId: '' });
    mostrarMensaje('Subtema creado');
    cargarDatos();
  };

  const eliminarTema = async (id: string) => {
    if (!confirm('¿Eliminar este tema y todos sus subtemas y preguntas?')) return;
    await fetch(`http://localhost:3000/admin/temas/${id}`, { method: 'DELETE', headers: getHeaders() });
    mostrarMensaje('Tema eliminado');
    cargarDatos();
  };

  const eliminarSubtema = async (id: string) => {
    if (!confirm('¿Eliminar este subtema y sus preguntas?')) return;
    await fetch(`http://localhost:3000/admin/subtemas/${id}`, { method: 'DELETE', headers: getHeaders() });
    mostrarMensaje('Subtema eliminado');
    cargarDatos();
  };

  const crearPregunta = async () => {
    if (!nuevaPregunta.enunciado || !subtemaSeleccionado) {
      mostrarMensaje('Completa el enunciado y selecciona un subtema');
      return;
    }
    const correctas = nuevaPregunta.respuestas.filter(r => r.esCorrecta).length;
    if (correctas !== 1) {
      mostrarMensaje('Debe haber exactamente 1 respuesta correcta');
      return;
    }
    if (nuevaPregunta.respuestas.some(r => !r.texto)) {
      mostrarMensaje('Todas las opciones deben tener texto');
      return;
    }

    await fetch('http://localhost:3000/admin/preguntas', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        enunciado: nuevaPregunta.enunciado,
        subtemaId: subtemaSeleccionado,
        dificultad: nuevaPregunta.dificultad,
        imagenUrl: nuevaPregunta.imagenes || null,
        respuestas: nuevaPregunta.respuestas,
      }),
    });

    setNuevaPregunta({
      enunciado: '',
      dificultad: 'MEDIO',
      imagenes: '',
      respuestas: [
        { texto: '', esCorrecta: true },
        { texto: '', esCorrecta: false },
        { texto: '', esCorrecta: false },
        { texto: '', esCorrecta: false },
      ],
    });
    mostrarMensaje('Pregunta creada');
  };

  const cambiarRol = async (usuarioId: string, rol: string) => {
    await fetch(`http://localhost:3000/admin/usuarios/${usuarioId}/rol`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ rol }),
    });
    mostrarMensaje('Rol actualizado');
    cargarDatos();
  };

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#146C94', fontSize: 18, fontWeight: 600 }}>Cargando panel...</p>
      </div>
    );
  }

  const todosSubtemas = temas.flatMap(t =>
    t.subtemas.map(s => ({ ...s, temaNombre: t.nombre, area: t.area }))
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', fontFamily: 'system-ui, sans-serif' }}>
      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#1a2a3a', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
            Saber<span style={{ color: '#8DD8FF' }}>Plus</span>
            <span style={{ marginLeft: 12, fontSize: 13, backgroundColor: '#146C94', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
              Admin
            </span>
          </span>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            Salir del panel
          </button>
        </div>
      </nav>

      {mensaje && (
        <div style={{ backgroundColor: '#D2E0FB', color: '#146C94', padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
          {mensaje}
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* PESTAÑAS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            { key: 'stats', label: 'Estadísticas' },
            { key: 'temas', label: 'Temas y Subtemas' },
            { key: 'preguntas', label: 'Preguntas' },
            { key: 'usuarios', label: 'Usuarios' },
            { key: 'contenido', label: 'Contenido de temas' },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setPestana(p.key as Pestana)}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: pestana === p.key ? '#146C94' : '#ffffff',
                color: pestana === p.key ? '#ffffff' : '#4a5a6a',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ESTADÍSTICAS */}
        {pestana === 'stats' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { label: 'Usuarios registrados', valor: stats.totalUsuarios, color: '#146C94' },
              { label: 'Preguntas en banco', valor: stats.totalPreguntas, color: '#19A7CE' },
              { label: 'Temas creados', valor: stats.totalTemas, color: '#8DD8FF' },
              { label: 'Simulacros realizados', valor: stats.totalSimulacros, color: '#AFD3E2' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2', textAlign: 'center' }}>
                <p style={{ fontSize: 44, fontWeight: 900, color: s.color, marginBottom: 8 }}>{s.valor}</p>
                <p style={{ fontSize: 14, color: '#4a5a6a' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* TEMAS Y SUBTEMAS */}
        {pestana === 'temas' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 20 }}>Nuevo tema</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  placeholder="Nombre del tema (ej: Álgebra)"
                  value={nuevoTema.nombre}
                  onChange={e => setNuevoTema({ ...nuevoTema, nombre: e.target.value })}
                  style={inputStyle}
                />
                <select
                  value={nuevoTema.area}
                  onChange={e => setNuevoTema({ ...nuevoTema, area: e.target.value })}
                  style={inputStyle}
                >
                  {AREAS.map(a => <option key={a.key} value={a.key}>{a.nombre}</option>)}
                </select>
                <button onClick={crearTema} style={btnStyle}>Crear tema</button>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 20 }}>Nuevo subtema</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  placeholder="Nombre del subtema (ej: Regla de 3)"
                  value={nuevoSubtema.nombre}
                  onChange={e => setNuevoSubtema({ ...nuevoSubtema, nombre: e.target.value })}
                  style={inputStyle}
                />
                <select
                  value={nuevoSubtema.temaId}
                  onChange={e => setNuevoSubtema({ ...nuevoSubtema, temaId: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Selecciona un tema</option>
                  {temas.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre} — {AREAS.find(a => a.key === t.area)?.nombre}</option>
                  ))}
                </select>
                <button onClick={crearSubtema} style={btnStyle}>Crear subtema</button>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 20 }}>Temas creados</h2>
              {temas.length === 0 ? (
                <p style={{ color: '#8a9aaa', fontSize: 14 }}>No hay temas todavía.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {temas.map(tema => (
                    <div key={tema.id} style={{ border: '1px solid #D2E0FB', borderRadius: 10, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div>
                          <span style={{ fontWeight: 700, color: '#1a2a3a', fontSize: 15 }}>{tema.nombre}</span>
                          <span style={{ marginLeft: 10, fontSize: 12, backgroundColor: '#D2E0FB', color: '#146C94', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                            {AREAS.find(a => a.key === tema.area)?.nombre}
                          </span>
                        </div>
                        <button
                          onClick={() => eliminarTema(tema.id)}
                          style={{ backgroundColor: '#FCD8CD', color: '#BC7C7C', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                        >
                          Eliminar
                        </button>
                      </div>
                      {tema.subtemas.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {tema.subtemas.map(sub => (
                            <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#F6F1F1', padding: '5px 10px', borderRadius: 8, fontSize: 13 }}>
                              <span style={{ color: '#4a5a6a' }}>{sub.nombre}</span>
                              <span style={{ color: '#19A7CE', fontWeight: 700 }}>({sub._count.preguntas})</span>
                              <button onClick={() => eliminarSubtema(sub.id)} style={{ background: 'none', border: 'none', color: '#BC7C7C', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 2px' }}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PREGUNTAS */}
        {pestana === 'preguntas' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2', maxWidth: 700 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 24 }}>Agregar pregunta</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Subtema</label>
                <select value={subtemaSeleccionado} onChange={e => setSubtemaSeleccionado(e.target.value)} style={inputStyle}>
                  <option value="">Selecciona un subtema</option>
                  {todosSubtemas.map(s => (
                    <option key={s.id} value={s.id}>{s.temaNombre} → {s.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Dificultad</label>
                <select value={nuevaPregunta.dificultad} onChange={e => setNuevaPregunta({ ...nuevaPregunta, dificultad: e.target.value })} style={inputStyle}>
                  {DIFICULTADES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Enunciado de la pregunta</label>
                <textarea
                  value={nuevaPregunta.enunciado}
                  onChange={e => setNuevaPregunta({ ...nuevaPregunta, enunciado: e.target.value })}
                  placeholder="Escribe la pregunta aquí..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'system-ui, sans-serif' }}
                />
              </div>

              {/* IMÁGENES */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>
                  Imágenes (opcional) — nombres separados por coma
                </label>
                <input
                  placeholder="ej: grafica-001.png, tabla-002.png"
                  value={nuevaPregunta.imagenes}
                  onChange={e => setNuevaPregunta({ ...nuevaPregunta, imagenes: e.target.value })}
                  style={inputStyle}
                />
                <p style={{ fontSize: 12, color: '#8a9aaa', marginTop: 4 }}>
                  Coloca los archivos en frontend/public/imagenes/
                </p>
                {nuevaPregunta.imagenes && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {nuevaPregunta.imagenes.split(',').map((img, i) => (
                      <img
                        key={i}
                        src={`/imagenes/${img.trim()}`}
                        alt={`imagen ${i + 1}`}
                        style={{ height: 80, borderRadius: 8, border: '1px solid #AFD3E2', objectFit: 'contain', backgroundColor: '#F6F1F1' }}
                        onError={e => (e.currentTarget.style.display = 'none')}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 10 }}>
                  Opciones de respuesta — marca la correcta
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {nuevaPregunta.respuestas.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="radio"
                        name="correcta"
                        checked={r.esCorrecta}
                        onChange={() => setNuevaPregunta({
                          ...nuevaPregunta,
                          respuestas: nuevaPregunta.respuestas.map((resp, idx) => ({ ...resp, esCorrecta: idx === i })),
                        })}
                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#146C94' }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#146C94', width: 20 }}>
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      <input
                        placeholder={`Opción ${['A', 'B', 'C', 'D'][i]}`}
                        value={r.texto}
                        onChange={e => setNuevaPregunta({
                          ...nuevaPregunta,
                          respuestas: nuevaPregunta.respuestas.map((resp, idx) => idx === i ? { ...resp, texto: e.target.value } : resp),
                        })}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={crearPregunta} style={{ ...btnStyle, padding: '13px' }}>
                Guardar pregunta
              </button>
            </div>
          </div>
        )}

        {/* USUARIOS */}
        {pestana === 'usuarios' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 20 }}>
              Usuarios registrados — {usuarios.length}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {usuarios.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: '1px solid #D2E0FB', borderRadius: 10, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: '#1a2a3a', fontSize: 15, marginBottom: 2 }}>{u.nombre}</p>
                    <p style={{ color: '#8a9aaa', fontSize: 13 }}>{u.correo}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, color: '#19A7CE', fontWeight: 700 }}>{u.xpTotal} XP</span>
                    <select
                      value={u.rol ?? 'ESTUDIANTE'}
                      onChange={e => cambiarRol(u.id, e.target.value)}
                      style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #AFD3E2', fontSize: 13, fontWeight: 600, color: '#146C94', backgroundColor: '#F6F1F1', cursor: 'pointer' }}
                    >
                      <option value="ESTUDIANTE">Estudiante</option>
                      <option value="PROFESOR">Profesor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENIDO DE TEMAS */}
        {pestana === 'contenido' && (
          <ContenidoEditor
            temas={temas}
            getHeaders={getHeaders}
            mostrarMensaje={mostrarMensaje}
            inputStyle={inputStyle}
            btnStyle={btnStyle}
          />
        )}
      </div>
    </div>
  );
}