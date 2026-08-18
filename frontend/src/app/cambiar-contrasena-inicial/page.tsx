'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cambiarContrasenaInicial } from '../../lib/api';
import { decodificarToken, obtenerRol } from '../../lib/auth';
import Logotipo from '../../components/Logotipo';

// Punto 12 del roadmap: cuando el admin crea la institución/profesor
// desde el panel, la cuenta queda con debeCambiarContrasena=true y el
// login redirige aquí en lugar de al dashboard. Una vez que cambian la
// contraseña, el backend apaga la bandera y ya no vuelven a pasar por
// esta pantalla.
export default function CambiarContrasenaInicialPage() {
  const router = useRouter();
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (nuevaContrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nuevaContrasena !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      await cambiarContrasenaInicial(nuevaContrasena);
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('saberplus_token')
          : null;
      const payload = decodificarToken(token);
      const rol = payload?.rol ?? obtenerRol();
      router.push(rol === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la contraseña');
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

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <Logotipo size={38} colorTexto="#1a2a3a" colorAcento="#19A7CE" />
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: '0 4px 24px rgba(20,108,148,0.10)',
          border: '1px solid #AFD3E2',
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2a3a', marginBottom: 12 }}>
            Elige tu nueva contraseña
          </h1>
          <p style={{ fontSize: 14, color: '#4a5a6a', marginBottom: 28 }}>
            Tu cuenta se creó con una contraseña temporal. Por seguridad, elige
            una propia antes de continuar.
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
                Nueva contraseña
              </label>
              <input
                type="password"
                value={nuevaContrasena}
                onChange={e => setNuevaContrasena(e.target.value)}
                placeholder="Mínimo 6 caracteres"
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
                transition: 'background-color 0.2s',
              }}
            >
              {cargando ? 'Guardando...' : 'Guardar y continuar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}