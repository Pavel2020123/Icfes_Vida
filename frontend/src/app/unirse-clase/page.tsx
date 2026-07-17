'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { unirseAClase, guardarToken } from '../../lib/api';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function UnirseClasePage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState<{ clase: string; institucion: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!codigo.trim()) return;

    setCargando(true);
    try {
      const data = await unirseAClase(codigo.trim());
      // El token cambia porque ahora incluye institucionId
      guardarToken(data.accessToken);
      setExito({ clase: data.clase?.nombre, institucion: data.institucion?.nombre });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al unirse a la clase');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ProtectedRoute rolesPermitidos={['ESTUDIANTE']}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F6F1F1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#146C94' }}>
              Saber<span style={{ color: '#19A7CE' }}>Plus</span>
            </span>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: '40px 36px',
            boxShadow: '0 4px 24px rgba(20,108,148,0.10)',
            border: '1px solid #AFD3E2',
          }}>
            {exito ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  backgroundColor: '#D2E0FB', color: '#146C94',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30, margin: '0 auto 20px',
                }}>
                  ✓
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a2a3a', marginBottom: 10 }}>
                  ¡Te uniste con éxito!
                </h1>
                <p style={{ color: '#4a5a6a', fontSize: 15, marginBottom: 28 }}>
                  Ahora eres parte de <strong style={{ color: '#146C94' }}>{exito.clase}</strong>
                  {exito.institucion && (
                    <> en <strong style={{ color: '#146C94' }}>{exito.institucion}</strong></>
                  )}.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  style={{
                    width: '100%', backgroundColor: '#146C94', color: '#ffffff',
                    padding: '14px', borderRadius: 10, border: 'none',
                    fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Ir al dashboard
                </button>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2a3a', marginBottom: 8 }}>
                  Unirse a una clase
                </h1>
                <p style={{ color: '#4a5a6a', fontSize: 14, marginBottom: 28 }}>
                  Ingresa el código que te compartió tu profesor para vincularte a su institución y su clase.
                </p>

                {error && (
                  <div style={{
                    backgroundColor: '#FCD8CD', border: '1px solid #BC7C7C',
                    borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                    fontSize: 14, color: '#7a2a2a',
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 600, color: '#1a2a3a', display: 'block', marginBottom: 8 }}>
                      Código de clase
                    </label>
                    <input
                      type="text"
                      value={codigo}
                      onChange={e => setCodigo(e.target.value.toUpperCase())}
                      placeholder="GRUPO-XXXXXX"
                      required
                      autoFocus
                      style={{
                        width: '100%', padding: '14px 16px', borderRadius: 10,
                        border: '1.5px solid #AFD3E2', fontSize: 16, fontWeight: 700,
                        letterSpacing: 1, color: '#1a2a3a', backgroundColor: '#F6F1F1',
                        outline: 'none', boxSizing: 'border-box', textAlign: 'center',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={cargando}
                    style={{
                      backgroundColor: cargando ? '#AFD3E2' : '#146C94',
                      color: '#ffffff', padding: '14px', borderRadius: 10, border: 'none',
                      fontSize: 16, fontWeight: 700, cursor: cargando ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {cargando ? 'Uniendo...' : 'Unirme a la clase'}
                  </button>
                </form>
              </>
            )}
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
            <Link href="/dashboard" style={{ color: '#146C94', fontWeight: 600, textDecoration: 'none' }}>
              ← Volver al dashboard
            </Link>
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}