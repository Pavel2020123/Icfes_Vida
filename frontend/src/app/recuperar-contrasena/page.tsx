'use client';

import { useState } from 'react';
import Link from 'next/link';
import { solicitarRecuperacionContrasena } from '../../lib/api';
import Logotipo from '../../components/Logotipo';

export default function RecuperarContrasenaPage() {
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      await solicitarRecuperacionContrasena(correo);
      setEnviado(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el correo');
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logotipo size={38} colorTexto="#1a2a3a" colorAcento="#19A7CE" />
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
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2a3a', marginBottom: 12 }}>
            Recuperar contraseña
          </h1>

          {enviado ? (
            <>
              <p style={{ fontSize: 15, color: '#4a5a6a', lineHeight: 1.5, marginBottom: 28 }}>
                Si <strong>{correo}</strong> está registrado, te enviamos un enlace para elegir una nueva contraseña. Revisa tu bandeja de entrada (y spam).
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
                Volver a iniciar sesión
              </Link>
            </>
          ) : (
            <>
              <p style={{ fontSize: 15, color: '#4a5a6a', lineHeight: 1.5, marginBottom: 28 }}>
                Escribe tu correo y te enviamos un enlace para elegir una nueva contraseña.
              </p>

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
                  {cargando ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#4a5a6a' }}>
            <Link href="/login" style={{ color: '#146C94', fontWeight: 700, textDecoration: 'none' }}>
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}