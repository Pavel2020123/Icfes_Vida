'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerToken, API_URL } from '../../lib/api';
import EditorBloquesContenido from '../../components/EditorBloquesContenido';
import ProtectedRoute from '../../components/ProtectedRoute';

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
  contenido?: string | null;
  videoUrl?: string | null;
  imagenUrl?: string | null;
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
  totalEstudiantes: number;
  totalProfesores: number;
  totalInstituciones: number;
  estudiantesRegistradosHoy: number;
  simulacrosResueltosHoy: number;
}

interface RespuestaAdmin {
  id: string;
  texto: string;
  esCorrecta: boolean;
}

interface PreguntaAdmin {
  id: string;
  enunciado: string;
  imagenUrl: string | null;
  dificultad: string;
  respuestas: RespuestaAdmin[];
}

type Pestana = 'stats' | 'temas' | 'preguntas' | 'aleatorias' | 'usuarios' | 'contenido' | 'interactivo';

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

  const seleccionarSubtema = (id: string) => {
    const subtema = todosSubtemas.find(item => item.id === id);
    setSubtemaId(id);
    setContenido(subtema?.contenido ?? '');
    setVideoUrl(subtema?.videoUrl ?? '');
    setImagenUrl(subtema?.imagenUrl ?? '');
  };

  const guardar = async () => {
    if (!subtemaId) { mostrarMensaje('Selecciona un subtema'); return; }
    setGuardando(true);
    await fetch(`${API_URL}/admin/subtemas/${subtemaId}/contenido`, {
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
          <select value={subtemaId} onChange={e => seleccionarSubtema(e.target.value)} style={inputStyle}>
            <option value="">Selecciona un subtema</option>
            {todosSubtemas.map(s => (
              <option key={s.id} value={s.id}>{s.temaNombre} → {s.nombre}</option>
            ))}
          </select>
        </div>
        {subtemaId && (
          <EditorBloquesContenido
            key={subtemaId}
            contenidoInicial={contenido}
            alCambiarContenido={setContenido}
          />
        )}
        <textarea value={contenido} readOnly aria-hidden="true" tabIndex={-1} style={{ display: 'none' }} />
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

function InteractivoEditor({ temas, getHeaders, mostrarMensaje, inputStyle, btnStyle }: {
  temas: Tema[];
  getHeaders: () => Record<string, string>;
  mostrarMensaje: (msg: string) => void;
  inputStyle: React.CSSProperties;
  btnStyle: React.CSSProperties;
}) {
  const [subtemaId, setSubtemaId] = useState('');
  const [textoConEspacios, setTextoConEspacios] = useState('');
  const [espacios, setEspacios] = useState<{ opciones: string[]; correctaIndex: number }[]>([]);
  const [guardando, setGuardando] = useState(false);

  const todosSubtemas = temas.flatMap(t =>
    t.subtemas.map(s => ({ ...s, temaNombre: t.nombre }))
  );

  // Detecta cuántos marcadores {0} {1} {2}... hay en el texto y sincroniza el array de espacios
  const sincronizarEspacios = (texto: string) => {
    setTextoConEspacios(texto);
    const matches = texto.match(/\{(\d+)\}/g) ?? [];
    const cantidad = matches.length;
    setEspacios(prev => {
      const nuevo = [...prev];
      while (nuevo.length < cantidad) nuevo.push({ opciones: ['', '', ''], correctaIndex: 0 });
      return nuevo.slice(0, cantidad);
    });
  };

  const actualizarOpcion = (espacioIdx: number, opcionIdx: number, valor: string) => {
    setEspacios(prev => prev.map((esp, i) =>
      i === espacioIdx ? { ...esp, opciones: esp.opciones.map((o, j) => j === opcionIdx ? valor : o) } : esp
    ));
  };

  const marcarCorrecta = (espacioIdx: number, opcionIdx: number) => {
    setEspacios(prev => prev.map((esp, i) =>
      i === espacioIdx ? { ...esp, correctaIndex: opcionIdx } : esp
    ));
  };

  const guardar = async () => {
    if (!subtemaId) { mostrarMensaje('Selecciona un subtema'); return; }
    if (!textoConEspacios.includes('{0}')) { mostrarMensaje('El texto debe tener al menos un espacio: {0}'); return; }
    if (espacios.some(e => e.opciones.some(o => !o.trim()))) { mostrarMensaje('Completa todas las opciones de cada espacio'); return; }

    setGuardando(true);
    await fetch(`${API_URL}/admin/subtemas/${subtemaId}/interactivo`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        tipoInteractivo: 'CLOZE',
        datosInteractivo: { textoConEspacios, espacios },
      }),
    });
    mostrarMensaje('Ejercicio interactivo guardado');
    setGuardando(false);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2', maxWidth: 700 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 8 }}>
        Ejercicio interactivo (completar espacios)
      </h2>
      <p style={{ fontSize: 13, color: '#8a9aaa', marginBottom: 24 }}>
        Escribe el texto y marca cada espacio en blanco con {'{0}'}, {'{1}'}, {'{2}'}... en orden. Por cada espacio se generará un bloque de opciones abajo.
      </p>
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
            Texto con espacios
          </label>
          <textarea
            value={textoConEspacios}
            onChange={e => sincronizarEspacios(e.target.value)}
            placeholder="The ozone layer is {0} the earth. It protects {1} from UV rays."
            rows={6}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6 }}
          />
        </div>

        {espacios.map((espacio, espacioIdx) => (
          <div key={espacioIdx} style={{ border: '1.5px solid #D2E0FB', borderRadius: 12, padding: '16px 18px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#146C94', marginBottom: 10 }}>
              Espacio {'{' + espacioIdx + '}'} — marca la opción correcta
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {espacio.opciones.map((opcion, opcionIdx) => (
                <div key={opcionIdx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="radio"
                    name={`correcta-${espacioIdx}`}
                    checked={espacio.correctaIndex === opcionIdx}
                    onChange={() => marcarCorrecta(espacioIdx, opcionIdx)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#146C94' }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#146C94', width: 16 }}>
                    {['A', 'B', 'C'][opcionIdx]}
                  </span>
                  <input
                    placeholder={`Opción ${['A', 'B', 'C'][opcionIdx]}`}
                    value={opcion}
                    onChange={e => actualizarOpcion(espacioIdx, opcionIdx, e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={guardar} disabled={guardando} style={{ ...btnStyle, padding: '13px', opacity: guardando ? 0.6 : 1 }}>
          {guardando ? 'Guardando...' : 'Guardar ejercicio interactivo'}
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [pestana, setPestana] = useState<Pestana>('stats');

  const [stats, setStats] = useState<Stats | null>(null);
  const [miId, setMiId] = useState<string | null>(null);  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
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
  
  const [nuevaPreguntaAleatoria, setNuevaPreguntaAleatoria] = useState({
    area: 'MATEMATICAS',
    enunciado: '',
    imagenes: '',
    respuestas: [
      { texto: '', esCorrecta: true },
      { texto: '', esCorrecta: false },
      { texto: '', esCorrecta: false },
      { texto: '', esCorrecta: false },
    ],
  });

  const [mensaje, setMensaje] = useState('');
  const [preguntasSubtema, setPreguntasSubtema] = useState<PreguntaAdmin[]>([]);
  const [preguntasBanco, setPreguntasBanco] = useState<PreguntaAdmin[]>([]);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMiId(payload.sub);
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
          fetch(`${API_URL}/admin/estadisticas`, { headers }),
          fetch(`${API_URL}/admin/temas`, { headers }),
          fetch(`${API_URL}/admin/usuarios`, { headers }),
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
        fetch(`${API_URL}/admin/estadisticas`, { headers: getHeaders() }),
        fetch(`${API_URL}/admin/temas`, { headers: getHeaders() }),
        fetch(`${API_URL}/admin/usuarios`, { headers: getHeaders() }),
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

  // ─── LISTAR / ELIMINAR PREGUNTAS ────────────────────────────
  const cargarPreguntasDeSubtema = async (subtemaId: string) => {
    if (!subtemaId) { setPreguntasSubtema([]); return; }
    const res = await fetch(`${API_URL}/admin/preguntas/${subtemaId}`, { headers: getHeaders() });
    setPreguntasSubtema(await res.json());
  };

  const cargarPreguntasDelBanco = async (area: string) => {
    const temaBanco = temas.find(t => t.nombre === 'Banco General' && t.area === area);
    const subtemaBanco = temaBanco?.subtemas[0];
    if (!subtemaBanco) { setPreguntasBanco([]); return; }
    const res = await fetch(`${API_URL}/admin/preguntas/${subtemaBanco.id}`, { headers: getHeaders() });
    setPreguntasBanco(await res.json());
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPreguntasDeSubtema(subtemaSeleccionado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtemaSeleccionado]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPreguntasDelBanco(nuevaPreguntaAleatoria.area);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nuevaPreguntaAleatoria.area, temas]);

  const eliminarPreguntaSubtema = async (id: string) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    await fetch(`${API_URL}/admin/preguntas/${id}`, { method: 'DELETE', headers: getHeaders() });
    mostrarMensaje('Pregunta eliminada');
    cargarPreguntasDeSubtema(subtemaSeleccionado);
    cargarDatos();
  };

  const eliminarPreguntaBanco = async (id: string) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    await fetch(`${API_URL}/admin/preguntas/${id}`, { method: 'DELETE', headers: getHeaders() });
    mostrarMensaje('Pregunta eliminada');
    cargarPreguntasDelBanco(nuevaPreguntaAleatoria.area);
    cargarDatos();
  };

  const crearTema = async () => {
    if (!nuevoTema.nombre) return;
    await fetch(`${API_URL}/admin/temas`, {
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
    await fetch(`${API_URL}/admin/subtemas`, {
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
    await fetch(`${API_URL}/admin/temas/${id}`, { method: 'DELETE', headers: getHeaders() });
    mostrarMensaje('Tema eliminado');
    cargarDatos();
  };

  const eliminarSubtema = async (id: string) => {
    if (!confirm('¿Eliminar este subtema y sus preguntas?')) return;
    await fetch(`${API_URL}/admin/subtemas/${id}`, { method: 'DELETE', headers: getHeaders() });
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

    await fetch(`${API_URL}/admin/preguntas`, {
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
    cargarPreguntasDeSubtema(subtemaSeleccionado);
  };

  const crearPreguntaAleatoria = async () => {
    if (!nuevaPreguntaAleatoria.enunciado) {
      mostrarMensaje('Escribe el enunciado de la pregunta');
      return;
    }
    const correctas = nuevaPreguntaAleatoria.respuestas.filter(r => r.esCorrecta).length;
    if (correctas !== 1) {
      mostrarMensaje('Debe haber exactamente 1 respuesta correcta');
      return;
    }
    if (nuevaPreguntaAleatoria.respuestas.some(r => !r.texto)) {
      mostrarMensaje('Todas las opciones deben tener texto');
      return;
    }

    await fetch(`${API_URL}/admin/preguntas-aleatorias`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        area: nuevaPreguntaAleatoria.area,
        enunciado: nuevaPreguntaAleatoria.enunciado,
        imagenUrl: nuevaPreguntaAleatoria.imagenes || null,
        respuestas: nuevaPreguntaAleatoria.respuestas,
      }),
    });

    setNuevaPreguntaAleatoria({
      area: nuevaPreguntaAleatoria.area,
      enunciado: '',
      imagenes: '',
      respuestas: [
        { texto: '', esCorrecta: true },
        { texto: '', esCorrecta: false },
        { texto: '', esCorrecta: false },
        { texto: '', esCorrecta: false },
      ],
    });
    mostrarMensaje('Pregunta agregada al banco general de ' + (AREAS.find(a => a.key === nuevaPreguntaAleatoria.area)?.nombre ?? nuevaPreguntaAleatoria.area));
    cargarDatos();
  };

  const cambiarRol = async (usuarioId: string, rol: string) => {
    await fetch(`${API_URL}/admin/usuarios/${usuarioId}/rol`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ rol }),
    });
    mostrarMensaje('Rol actualizado');
    cargarDatos();
  };

  const eliminarUsuario = async (usuarioId: string, nombreUsuario: string) => {
    if (!confirm(`¿Eliminar la cuenta de ${nombreUsuario}? Esta acción no se puede deshacer.`)) {
      return;
    }
    const res = await fetch(`${API_URL}/admin/usuarios/${usuarioId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      mostrarMensaje(data.message || 'No se pudo eliminar el usuario');
      return;
    }
    mostrarMensaje('Usuario eliminado');
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
    <ProtectedRoute rolesPermitidos={['ADMIN']}>
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
            { key: 'aleatorias', label: '🎲 Preguntas aleatorias' },
            { key: 'usuarios', label: 'Usuarios' },
            { key: 'contenido', label: 'Contenido de temas' },
            { key: 'interactivo', label: 'Ejercicio interactivo' },
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
          <div style={{ display: 'grid', gap: 24 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#8a9aaa', marginBottom: 10, textTransform: 'uppercase' }}>Hoy</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                {[
                  { label: 'Estudiantes registrados hoy', valor: stats.estudiantesRegistradosHoy, color: '#1C5741' },
                  { label: 'Simulacros resueltos hoy', valor: stats.simulacrosResueltosHoy, color: '#146C94' },
                ].map(s => (
                  <div key={s.label} style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2', textAlign: 'center' }}>
                    <p style={{ fontSize: 44, fontWeight: 900, color: s.color, marginBottom: 8 }}>{s.valor}</p>
                    <p style={{ fontSize: 14, color: '#4a5a6a' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#8a9aaa', marginBottom: 10, textTransform: 'uppercase' }}>Totales</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                {[
                  { label: 'Estudiantes', valor: stats.totalEstudiantes, color: '#146C94' },
                  { label: 'Profesores', valor: stats.totalProfesores, color: '#19A7CE' },
                  { label: 'Instituciones', valor: stats.totalInstituciones, color: '#8DD8FF' },
                  { label: 'Preguntas en banco', valor: stats.totalPreguntas, color: '#AFD3E2' },
                  { label: 'Temas creados', valor: stats.totalTemas, color: '#146C94' },
                  { label: 'Simulacros realizados', valor: stats.totalSimulacros, color: '#19A7CE' },
                ].map(s => (
                  <div key={s.label} style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2', textAlign: 'center' }}>
                    <p style={{ fontSize: 44, fontWeight: 900, color: s.color, marginBottom: 8 }}>{s.valor}</p>
                    <p style={{ fontSize: 14, color: '#4a5a6a' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
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
                      // eslint-disable-next-line @next/next/no-img-element
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

        {/* LISTA DE PREGUNTAS DEL SUBTEMA SELECCIONADO */}
        {pestana === 'preguntas' && subtemaSeleccionado && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '24px', border: '1.5px solid #AFD3E2', maxWidth: 700, marginTop: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a2a3a', marginBottom: 16 }}>
              Preguntas en este subtema ({preguntasSubtema.length})
            </h3>
            {preguntasSubtema.length === 0 ? (
              <p style={{ color: '#8a9aaa', fontSize: 14 }}>Todavía no hay preguntas aquí.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {preguntasSubtema.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, border: '1px solid #D2E0FB', borderRadius: 10, padding: '12px 16px' }}>
                    <p style={{ fontSize: 14, color: '#1a2a3a', margin: 0 }}>{p.enunciado}</p>
                    <button
                      onClick={() => eliminarPreguntaSubtema(p.id)}
                      style={{ backgroundColor: '#FCD8CD', color: '#BC7C7C', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* PREGUNTAS ALEATORIAS */}
        {pestana === 'aleatorias' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2', maxWidth: 700 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 8 }}>
              🎲 Agregar pregunta al banco de aleatorias
            </h2>
            <p style={{ fontSize: 13, color: '#8a9aaa', marginBottom: 24 }}>
              Solo elige el área, escribe la pregunta y las respuestas. No hace falta crear temas ni subtemas: se guarda automáticamente en el &quot;Banco General&quot; de esa área.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Área</label>
                <select
                  value={nuevaPreguntaAleatoria.area}
                  onChange={e => setNuevaPreguntaAleatoria({ ...nuevaPreguntaAleatoria, area: e.target.value })}
                  style={inputStyle}
                >
                  {AREAS.map(a => <option key={a.key} value={a.key}>{a.nombre}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Enunciado de la pregunta</label>
                <textarea
                  value={nuevaPreguntaAleatoria.enunciado}
                  onChange={e => setNuevaPreguntaAleatoria({ ...nuevaPreguntaAleatoria, enunciado: e.target.value })}
                  placeholder="Escribe la pregunta aquí..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'system-ui, sans-serif' }}
                />
              </div>

              {/* IMÁGENES */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>
                  Imagen (opcional)
                </label>
                <input
                  placeholder="ej: grafica-001.png"
                  value={nuevaPreguntaAleatoria.imagenes}
                  onChange={e => setNuevaPreguntaAleatoria({ ...nuevaPreguntaAleatoria, imagenes: e.target.value })}
                  style={inputStyle}
                />
                <p style={{ fontSize: 12, color: '#8a9aaa', marginTop: 4 }}>
                  Coloca el archivo en frontend/public/imagenes/
                </p>
                {nuevaPreguntaAleatoria.imagenes && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/imagenes/${nuevaPreguntaAleatoria.imagenes.trim()}`}
                      alt="vista previa"
                      style={{ height: 80, borderRadius: 8, border: '1px solid #AFD3E2', objectFit: 'contain', backgroundColor: '#F6F1F1' }}
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 10 }}>
                  Opciones de respuesta — marca la correcta
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {nuevaPreguntaAleatoria.respuestas.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="radio"
                        name="correcta-aleatoria"
                        checked={r.esCorrecta}
                        onChange={() => setNuevaPreguntaAleatoria({
                          ...nuevaPreguntaAleatoria,
                          respuestas: nuevaPreguntaAleatoria.respuestas.map((resp, idx) => ({ ...resp, esCorrecta: idx === i })),
                        })}
                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#146C94' }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#146C94', width: 20 }}>
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      <input
                        placeholder={`Opción ${['A', 'B', 'C', 'D'][i]}`}
                        value={r.texto}
                        onChange={e => setNuevaPreguntaAleatoria({
                          ...nuevaPreguntaAleatoria,
                          respuestas: nuevaPreguntaAleatoria.respuestas.map((resp, idx) => idx === i ? { ...resp, texto: e.target.value } : resp),
                        })}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={crearPreguntaAleatoria} style={{ ...btnStyle, padding: '13px' }}>
                Guardar y agregar otra
              </button>
            </div>
          </div>
        )}

        {/* LISTA DE PREGUNTAS DEL BANCO GENERAL (ALEATORIAS) */}
        {pestana === 'aleatorias' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '24px', border: '1.5px solid #AFD3E2', maxWidth: 700, marginTop: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a2a3a', marginBottom: 16 }}>
              Preguntas cargadas en {AREAS.find(a => a.key === nuevaPreguntaAleatoria.area)?.nombre} ({preguntasBanco.length})
            </h3>
            {preguntasBanco.length === 0 ? (
              <p style={{ color: '#8a9aaa', fontSize: 14 }}>Todavía no hay preguntas en esta área.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {preguntasBanco.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, border: '1px solid #D2E0FB', borderRadius: 10, padding: '12px 16px' }}>
                    <p style={{ fontSize: 14, color: '#1a2a3a', margin: 0 }}>{p.enunciado}</p>
                    <button
                      onClick={() => eliminarPreguntaBanco(p.id)}
                      style={{ backgroundColor: '#FCD8CD', color: '#BC7C7C', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                    {u.id !== miId && (
                      <button
                        onClick={() => eliminarUsuario(u.id, u.nombre)}
                        title="Eliminar usuario"
                        style={{ background: 'none', border: '1.5px solid #FCD8CD', color: '#BC7C7C', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Eliminar
                      </button>
                    )}
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

          {/* EJERCICIO INTERACTIVO */}
          {pestana === 'interactivo' && (
            <InteractivoEditor
              temas={temas}
              getHeaders={getHeaders}
              mostrarMensaje={mostrarMensaje}
              inputStyle={inputStyle}
              btnStyle={btnStyle}
            />
          )}
      </div>
      </div>
    </ProtectedRoute>
  );
}
