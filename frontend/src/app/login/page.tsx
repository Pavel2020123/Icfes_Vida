'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUsuario, guardarToken } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const data = await loginUsuario(correo, contrasena);
      guardarToken(data.accessToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F6F1F1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#146C94' }}>
              Saber<span style={{ color: '#19A7CE' }}>Plus</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: '0 4px 24px rgba(20,108,148,0.10)',
          border: '1px solid #AFD3E2',
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2a3a', marginBottom: 28 }}>
            Iniciar sesión
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
                Correo electrónico
              </label>
              <input
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                placeholder="tu@correo.com"
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

            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#1a2a3a', display: 'block', marginBottom: 8 }}>
                Contraseña
              </label>
              <input
                type="password"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                placeholder="Tu contraseña"
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
                transition: 'background-color 0.2s',
              }}
            >
              {cargando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#4a5a6a' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/registro" style={{ color: '#146C94', fontWeight: 700, textDecoration: 'none' }}>
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}