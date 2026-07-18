'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  descripcion?: string;
  anchoMaximo?: number;
  children: ReactNode;
}

// Ventana flotante reutilizable. Se usa para sacar formularios grandes
// (crear estudiante, agregar existente, crear grupo, etc.) de la página
// y que dejen de "ocupar media pantalla" cuando no se están usando.
export default function Modal({ abierto, onCerrar, titulo, descripcion, anchoMaximo = 460, children }: ModalProps) {
  // Controla la transición de entrada/salida sin depender de keyframes CSS.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!abierto) {
      const cuadro = requestAnimationFrame(() => setVisible(false));
      return () => cancelAnimationFrame(cuadro);
    }

    const cuadro = requestAnimationFrame(() => setVisible(true));

    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alPresionarTecla);

    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(cuadro);
      document.removeEventListener('keydown', alPresionarTecla);
      document.body.style.overflow = overflowOriginal;
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      onClick={onCerrar}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          width: '100%',
          maxWidth: anchoMaximo,
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(15,23,42,0.28)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '22px 22px 0' }}>
          <div>
            <h2 id="titulo-modal" style={{ fontSize: 19, fontWeight: 800, color: '#1a2a3a', margin: 0 }}>{titulo}</h2>
            {descripcion && <p style={{ color: '#4a5a6a', fontSize: 13.5, marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>{descripcion}</p>}
          </div>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            style={{
              background: '#F6F1F1',
              border: 'none',
              borderRadius: 10,
              width: 32,
              height: 32,
              flexShrink: 0,
              cursor: 'pointer',
              color: '#4a5a6a',
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 22 }}>
          {children}
        </div>
      </div>
    </div>
  );
}