'use client';

import { BloqueEditor, TIPOS_BLOQUE, TipoBloque } from '../lib/contenidoLeccion';

interface TarjetaBloqueContenidoProps {
  bloque: BloqueEditor;
  indice: number;
  alActualizar: (cambios: Partial<BloqueEditor>) => void;
  alEliminar: () => void;
}

const NOMBRES_TIPO: Record<TipoBloque, string> = {
  lectura: 'Lectura',
  ejemplo: 'Ejemplo',
  consejo: 'Consejo',
  resumen: 'Resumen',
};

export default function TarjetaBloqueContenido({ bloque, indice, alActualizar, alEliminar }: TarjetaBloqueContenidoProps) {
  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #AFD3E2', fontSize: 14,
    color: '#1a2a3a', backgroundColor: '#F6F1F1', boxSizing: 'border-box' as const,
  };

  return (
    <article style={{ border: '1.5px solid #AFD3E2', borderRadius: 12, padding: 18, backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <p style={{ color: '#146C94', fontWeight: 800, fontSize: 14 }}>Bloque {indice + 1}</p>
        <button type="button" onClick={alEliminar} style={{ backgroundColor: '#FCD8CD', color: '#BC7C7C', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Eliminar</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Tipo</label>
          <select value={bloque.tipo} onChange={e => alActualizar({ tipo: e.target.value as TipoBloque })} style={inputStyle}>
            {TIPOS_BLOQUE.map(tipo => <option key={tipo} value={tipo}>{NOMBRES_TIPO[tipo]}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Título</label>
          <input value={bloque.titulo} onChange={e => alActualizar({ titulo: e.target.value })} placeholder="Ej. ¿Qué es la regla de tres?" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Contenido</label>
          <textarea value={bloque.contenido} onChange={e => alActualizar({ contenido: e.target.value })} placeholder="Escribe la explicación de este bloque..." rows={6} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }} />
        </div>
      </div>
    </article>
  );
}
