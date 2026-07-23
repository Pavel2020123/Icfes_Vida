'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { restablecerContrasena } from '../../lib/api';

function validarContrasena(contrasena: string): string | null {
  if (contrasena.length < 8) return 'Debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(contrasena)) return 'Debe tener al menos una letra mayúscula';
  if (!/[0-9]/.test(contrasena)) return 'Debe tener al menos un número';
  return null;
}

function RestablecerContrasenaContenido() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);
  const [cargando, setCargando] = useState(false);

  const tieneMinimo = contrasena.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneNumero = /[0-9]/.test(contrasena);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Falta el token de recuperación en el enlace.');
      return;
    }

    const errorPass = validarContrasena(contrasena);
    if (errorPass) { setError(errorPass); return; }

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      await restablecerContrasena(token, contrasena);
      setListo(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo restablecer la contraseña');
    } finally {
      setCargando(false);
    }
  };

  // ─── Sin token en la URL: no vino desde el correo ───
  if (!token) {
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
        <div style={{ fontSize: 48, marginBottom: 8 }}>⚠️</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#146C94', margin: '0 0 12px' }}>
          Enlace incompleto
        </h1>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.5, margin: '0 0 28px' }}>
          Falta el token de recuperación en el enlace. Pide uno nuevo desde &quot;¿Olvidaste tu contraseña?&quot;.
        </p>
        <Link
          href="/recuperar-contrasena"
          style={{
            display: 'inline-block',
            backgroundColor: '#146C94',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 15,
            padding: '12px 28px',
            borderRadius: 10,
            textDecoration: 'none',
          }}
        >
          Pedir un enlace nuevo
        </Link>
      </div>
    );
  }

  // ─── Contraseña ya cambiada con éxito ───
  if (listo) {
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
        <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#146C94', margin: '0 0 12px' }}>
          ¡Contraseña actualizada!
        </h1>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.5, margin: '0 0 28px' }}>
          Ya puedes iniciar sesión con tu nueva contraseña. Te llevamos al login...
        </p>
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            backgroundColor: '#146C94',
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
      </div>
    );
  }

  // ─── Formulario de nueva contraseña ───
  return (
    <div style={{
      width: '100%',
      maxWidth: 440,
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: '40px 36px',
      boxShadow: '0 4px 24px rgba(20,108,148,0.10)',
      border: '1px solid #AFD3E2',
    }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2a3a', marginBottom: 28 }}>
        Elige una nueva contraseña
      </h1>

      {error && (
        <div style={{
          backgroundColor: '#FCD8CD',
          border: '1px solid #BC7C7C',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 24,
          fontSize: 14,
          color: '#7a2a2a',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#1a2a3a', display: 'block', marginBottom: 8 }}>
            Nueva contraseña
          </label>
          <input
            type="password"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1.5px solid #AFD3E2',
              fontSize: 15,
              color: '#1a2a3a',
              backgroundColor: '#F6F1F1',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ marginTop: 8, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: tieneMinimo ? '#2e7d32' : '#4a5a6a' }}>{tieneMinimo ? '✓' : '○'} Mínimo 8 caracteres</span>
            <span style={{ color: tieneMayuscula ? '#2e7d32' : '#4a5a6a' }}>{tieneMayuscula ? '✓' : '○'} Una letra mayúscula</span>
            <span style={{ color: tieneNumero ? '#2e7d32' : '#4a5a6a' }}>{tieneNumero ? '✓' : '○'} Un número</span>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#1a2a3a', display: 'block', marginBottom: 8 }}>
            Confirmar contraseña
          </label>
          <input
            type="password"
            value={confirmar}
            onChange={e => setConfirmar(e.target.value)}
            placeholder="Repite la contraseña"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1.5px solid #AFD3E2',
              fontSize: 15,
              color: '#1a2a3a',
              backgroundColor: '#F6F1F1',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{
            backgroundColor: cargando ? '#AFD3E2' : '#146C94',
            color: '#ffffff',
            padding: '14px',
            borderRadius: 10,
            border: 'none',
            fontSize: 16,
            fontWeight: 700,
            cursor: cargando ? 'not-allowed' : 'pointer',
            marginTop: 4,
          }}
        >
          {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
        </button>
      </form>
    </div>
  );
}

export default function RestablecerContrasenaPage() {
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
        <RestablecerContrasenaContenido />
      </Suspense>
    </div>
  );
}