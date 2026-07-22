'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verificarCorreo } from '../../lib/api';

function VerificarCorreoContenido() {
  const searchParams = useSearchParams();
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    // ─── AQUÍ llega el token, siempre desde la URL del correo ───
    const token = searchParams.get('token');
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEstado('error');
      setMensaje('Falta el token de verificación en el enlace.');
      return;
    }

    verificarCorreo(token)
      .then((data) => {
        setEstado('ok');
        setMensaje(data.mensaje ?? '¡Correo confirmado!');
      })
      .catch((err: unknown) => {
        setEstado('error');
        setMensaje(err instanceof Error ? err.message : 'No se pudo confirmar el correo.');
      });
  }, [searchParams]);

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
      <div style={{ fontSize: 48, marginBottom: 8 }}>
        {estado === 'cargando' ? '⏳' : estado === 'ok' ? '✅' : '⚠️'}
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#146C94', margin: '0 0 12px' }}>
        {estado === 'cargando'
          ? 'Confirmando tu correo...'
          : estado === 'ok'
          ? '¡Correo confirmado!'
          : 'No pudimos confirmar tu correo'}
      </h1>
      <p style={{ fontSize: 15, color: '#555', lineHeight: 1.5, margin: '0 0 28px' }}>
        {mensaje}
      </p>
      {estado !== 'cargando' && (
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-primario, #146C94)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 15,
            padding: '12px 28px',
            borderRadius: 10,
            textDecoration: 'none',
          }}
        >
          Ir a iniciar sesión
        </Link>
      )}
    </div>
  );
}

export default function VerificarCorreoPage() {
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
        <VerificarCorreoContenido />
      </Suspense>
    </div>
  );
}