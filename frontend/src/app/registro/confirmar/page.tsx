'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { reenviarVerificacionCorreo } from '../../../lib/api';

function ConfirmarContenido() {
  const searchParams = useSearchParams();
  const correo = searchParams.get('correo') ?? '';
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const reenviar = async () => {
    if (!correo) return;
    setEnviando(true);
    setMensaje('');
    try {
      await reenviarVerificacionCorreo(correo);
      setMensaje('Te reenviamos el enlace. Revisa tu bandeja de entrada.');
    } catch {
      setMensaje('No se pudo reenviar. Intenta de nuevo en un momento.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{
      maxWidth: 480,
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: '40px 32px',
      textAlign: 'center',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>📩</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#146C94', margin: '0 0 12px' }}>
        ¡Ya casi! Confirma tu correo
      </h1>
      <p style={{ fontSize: 15, color: '#555', lineHeight: 1.5, margin: '0 0 8px' }}>
        Te enviamos un enlace de confirmación{correo ? <> a <strong>{correo}</strong></> : ''}.
        Ábrelo para activar tu prueba gratis de 3 días.
      </p>
      <p style={{ fontSize: 13, color: '#8a9aaa', margin: '0 0 28px' }}>
        Si no lo ves, revisa la carpeta de spam.
      </p>

      {mensaje && (
        <p style={{ fontSize: 13, color: '#146C94', marginBottom: 16 }}>{mensaje}</p>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={reenviar}
          disabled={enviando || !correo}
          style={{
            backgroundColor: '#146C94',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 700,
            cursor: enviando ? 'default' : 'pointer',
            opacity: enviando ? 0.7 : 1,
          }}
        >
          {enviando ? 'Enviando...' : 'Reenviar enlace'}
        </button>
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            border: '1.5px solid #AFD3E2',
            color: '#146C94',
            fontWeight: 700,
            fontSize: 14,
            padding: '12px 24px',
            borderRadius: 10,
            textDecoration: 'none',
          }}
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmarRegistroPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F6F1F1',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <Suspense fallback={null}>
        <ConfirmarContenido />
      </Suspense>
    </div>
  );
}