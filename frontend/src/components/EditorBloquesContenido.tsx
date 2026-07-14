'use client';

import { useState } from 'react';
import TarjetaBloqueContenido from './TarjetaBloqueContenido';
import { BloqueEditor, crearBloque, deserializarContenido, serializarBloques } from '../lib/contenidoLeccion';

interface EditorBloquesContenidoProps {
  contenidoInicial: string;
  alCambiarContenido: (contenido: string) => void;
}

export default function EditorBloquesContenido({ contenidoInicial, alCambiarContenido }: EditorBloquesContenidoProps) {
  const [bloques, setBloques] = useState<BloqueEditor[]>(() => deserializarContenido(contenidoInicial));

  const actualizarBloques = (siguientesBloques: BloqueEditor[]) => {
    setBloques(siguientesBloques);
    alCambiarContenido(serializarBloques(siguientesBloques));
  };

  return (
    <section aria-label="Editor visual de bloques" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a2a3a', marginBottom: 4 }}>Lección por bloques</h3>
          <p style={{ fontSize: 13, color: '#8a9aaa' }}>El contenido se convertirá automáticamente al formato de lectura de la plataforma.</p>
        </div>
        <button type="button" onClick={() => actualizarBloques([...bloques, crearBloque()])} style={{ backgroundColor: '#146C94', color: '#ffffff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>+ Agregar bloque</button>
      </div>

      {bloques.length === 0 ? (
        <p style={{ color: '#8a9aaa', fontSize: 14, textAlign: 'center', padding: 20, border: '1.5px dashed #AFD3E2', borderRadius: 12 }}>Agrega un bloque para comenzar la lección.</p>
      ) : (
        bloques.map((bloque, indice) => (
          <TarjetaBloqueContenido
            key={bloque.clave}
            bloque={bloque}
            indice={indice}
            alActualizar={cambios => actualizarBloques(bloques.map(item => item.clave === bloque.clave ? { ...item, ...cambios } : item))}
            alEliminar={() => actualizarBloques(bloques.filter(item => item.clave !== bloque.clave))}
          />
        ))
      )}
    </section>
  );
}
