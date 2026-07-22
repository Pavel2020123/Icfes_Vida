'use client';

import { useState } from 'react';
import { reenviarVerificacionCorreo } from '../lib/api';

export default function AvisoVerificarCorreo({ correo }: { correo?: string | null }) {
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const reenviar = async () => {
    if (!correo) return;
    setEnviando(true);
    setMensaje('');
    try {
      await reenviarVerificacionCorreo(correo);
      setMensaje('Enlace reenviado. Revisa tu correo.');
    } catch {
      setMensaje('No se pudo reenviar. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#FFF4E5',
      border: '1.5px solid #F5C99B',
      borderRadius: 12,
      padding: '14px 20px',
      marginBottom: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      <p style={{ margin: 0, fontSize: 14, color: '#8a5a1a', fontWeight: 600 }}>
        📩 Confirma tu correo para activar tu prueba gratis de 3 días.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {mensaje && <span style={{ fontSize: 13, color: '#8a5a1a' }}>{mensaje}</span>}
        <button
          onClick={reenviar}
          disabled={enviando}
          style={{
            backgroundColor: '#146C94',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: enviando ? 'default' : 'pointer',
            opacity: enviando ? 0.7 : 1,
          }}
        >
          {enviando ? 'Enviando...' : 'Reenviar enlace'}
        </button>
      </div>
    </div>
  );
}