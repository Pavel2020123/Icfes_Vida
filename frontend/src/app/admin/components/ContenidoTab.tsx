'use client';

import { useState } from 'react';
import { actualizarContenidoSubtemaAdmin } from '../../../lib/api';
import EditorBloquesContenido from '../../../components/EditorBloquesContenido';
import type { Tema } from './tipos';
import { inputStyle, btnStyle } from './estilos';

export default function ContenidoTab({
  temas,
  mostrarMensaje,
}: {
  temas: Tema[];
  mostrarMensaje: (msg: string) => void;
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
    await actualizarContenidoSubtemaAdmin(subtemaId, contenido, videoUrl, imagenUrl);
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