'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface BloqueLeccion {
  id: string;
  tipo: string;
  contenido: string;
}

const PATRON_BLOQUE = /^\s*\[\[BLOQUE(?:\s+([^\]]*))?\]\]\s*$/gim;
const PATRON_ATRIBUTO = /(id|tipo)\s*=\s*"([^"]*)"/gi;

function leerAtributos(texto: string | undefined) {
  const atributos: Record<string, string> = {};

  for (const coincidencia of (texto ?? '').matchAll(PATRON_ATRIBUTO)) {
    atributos[coincidencia[1].toLowerCase()] = coincidencia[2];
  }

  return atributos;
}

/**
 * Convierte el formato SaberMarkdown v1 en pantallas de lectura.
 * Las directivas especiales se conservan como Markdown por ahora; este punto
 * de entrada permitirá interpretarlas en versiones posteriores.
 */
export function dividirEnBloques(contenido: string): BloqueLeccion[] {
  const contenidoNormalizado = contenido.replace(/\r\n?/g, '\n');
  const marcadores = Array.from(contenidoNormalizado.matchAll(PATRON_BLOQUE));

  if (marcadores.length === 0) {
    return [{ id: 'contenido', tipo: 'lectura', contenido }];
  }

  return marcadores.map((marcador, indice) => {
    const atributos = leerAtributos(marcador[1]);
    const inicio = (marcador.index ?? 0) + marcador[0].length;
    const final = marcadores[indice + 1]?.index ?? contenidoNormalizado.length;

    return {
      id: atributos.id || `bloque-${indice + 1}`,
      tipo: atributos.tipo || 'lectura',
      contenido: contenidoNormalizado.slice(inicio, final).trim(),
    };
  });
}

interface LectorContenidoProps {
  contenido: string;
}

export default function LectorContenido({ contenido }: LectorContenidoProps) {
  const bloques = useMemo(() => dividirEnBloques(contenido), [contenido]);
  const [estadoNavegacion, setEstadoNavegacion] = useState({
    contenido,
    indice: 0,
  });
  const indiceActual = estadoNavegacion.contenido === contenido
    ? Math.min(estadoNavegacion.indice, bloques.length - 1)
    : 0;
  const bloqueActual = bloques[indiceActual] ?? bloques[0];
  const progreso = Math.round(((indiceActual + 1) / bloques.length) * 100);

  const cambiarBloque = (indice: number) => {
    setEstadoNavegacion({ contenido, indice });
  };

  return (
    <section
      aria-label="Contenido de la lección"
      style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 32px', border: '1.5px solid #AFD3E2', marginBottom: 28 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span style={{ color: '#146C94', fontSize: 13, fontWeight: 800, textTransform: 'capitalize' }}>
          {bloqueActual.tipo}
        </span>
        <span style={{ color: '#4a5a6a', fontSize: 13, fontWeight: 600 }}>
          Bloque {indiceActual + 1} de {bloques.length}
        </span>
      </div>

      <div
        aria-label={`Progreso de lectura: ${progreso}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progreso}
        role="progressbar"
        style={{ height: 7, backgroundColor: '#D2E0FB', borderRadius: 4, marginBottom: 28, overflow: 'hidden' }}
      >
        <div style={{ width: `${progreso}%`, height: '100%', backgroundColor: '#19A7CE', borderRadius: 4, transition: 'width 0.2s ease' }} />
      </div>

      <div style={{ color: '#1a2a3a', fontSize: 16, lineHeight: 1.8 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 style={{ fontSize: 28, lineHeight: 1.25, fontWeight: 900, marginBottom: 20 }}>{children}</h1>,
            h2: ({ children }) => <h2 style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 800, margin: '24px 0 14px' }}>{children}</h2>,
            h3: ({ children }) => <h3 style={{ fontSize: 18, lineHeight: 1.35, fontWeight: 800, margin: '20px 0 10px' }}>{children}</h3>,
            p: ({ children }) => <p style={{ marginBottom: 16, whiteSpace: 'pre-wrap' }}>{children}</p>,
            ul: ({ children }) => <ul style={{ margin: '0 0 16px 24px' }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ margin: '0 0 16px 24px' }}>{children}</ol>,
            li: ({ children }) => <li style={{ marginBottom: 6 }}>{children}</li>,
            a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" style={{ color: '#146C94', fontWeight: 700 }}>{children}</a>,
            blockquote: ({ children }) => <blockquote style={{ borderLeft: '4px solid #19A7CE', paddingLeft: 16, color: '#4a5a6a', margin: '0 0 16px' }}>{children}</blockquote>,
            table: ({ children }) => <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>{children}</table>,
            th: ({ children }) => <th style={{ border: '1px solid #AFD3E2', backgroundColor: '#D2E0FB', padding: 10, textAlign: 'left' }}>{children}</th>,
            td: ({ children }) => <td style={{ border: '1px solid #AFD3E2', padding: 10 }}>{children}</td>,
          }}
        >
          {bloqueActual.contenido}
        </ReactMarkdown>
      </div>

      <nav aria-label="Navegación de la lección" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 28 }}>
        <button
          type="button"
          disabled={indiceActual === 0}
          onClick={() => cambiarBloque(Math.max(0, indiceActual - 1))}
          style={{ backgroundColor: '#ffffff', color: '#146C94', border: '1.5px solid #AFD3E2', padding: '10px 20px', borderRadius: 10, fontWeight: 700, cursor: indiceActual === 0 ? 'not-allowed' : 'pointer', opacity: indiceActual === 0 ? 0.5 : 1 }}
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={indiceActual === bloques.length - 1}
          onClick={() => cambiarBloque(Math.min(bloques.length - 1, indiceActual + 1))}
          style={{ backgroundColor: '#146C94', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, cursor: indiceActual === bloques.length - 1 ? 'not-allowed' : 'pointer', opacity: indiceActual === bloques.length - 1 ? 0.5 : 1 }}
        >
          Siguiente
        </button>
      </nav>
    </section>
  );
}
