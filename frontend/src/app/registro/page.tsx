'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registrarUsuario } from '../../lib/api';

function validarContrasena(contrasena: string): string | null {
  if (contrasena.length < 8) return 'Debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(contrasena)) return 'Debe tener al menos una letra mayúscula';
  if (!/[0-9]/.test(contrasena)) return 'Debe tener al menos un número';
  return null;
}

function validarCorreo(correo: string): string | null {
  if (!correo.endsWith('@gmail.com')) return 'Solo se permiten correos @gmail.com';
  return null;
}

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [rol, setRol] = useState('ESTUDIANTE');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const tieneMinimo = contrasena.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneNumero = /[0-9]/.test(contrasena);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errorCorreo = validarCorreo(correo);
    if (errorCorreo) { setError(errorCorreo); return; }

    const errorPass = validarContrasena(contrasena);
    if (errorPass) { setError(errorPass); return; }

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      await registrarUsuario(nombre, correo, contrasena, rol);
      router.push(`/registro/confirmar?correo=${encodeURIComponent(correo)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: '1.5px solid #AFD3E2',
    fontSize: 15,
    color: '#1a2a3a',
    backgroundColor: '#F6F1F1',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    fontSize: 14,
    fontWeight: 600 as const,
    color: '#1a2a3a',
    display: 'block' as const,
    marginBottom: 8,
  };

  const indicador = (cumple: boolean, texto: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      <span style={{
        width: 18, height: 18, borderRadius: '50%',
        backgroundColor: cumple ? '#19A7CE' : '#D2E0FB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, color: cumple ? '#ffffff' : '#AFD3E2', fontWeight: 700, flexShrink: 0,
      }}>
        {cumple ? '✓' : '·'}
      </span>
      <span style={{ color: cumple ? '#146C94' : '#8a9aaa' }}>{texto}</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#146C94' }}>
              Saber<span style={{ color: '#19A7CE' }}>Plus</span>
            </span>
          </Link>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: '40px 36px', boxShadow: '0 4px 24px rgba(20,108,148,0.10)', border: '1px solid #AFD3E2' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2a3a', marginBottom: 28 }}>
            Crear cuenta
          </h1>

          {error && (
            <div style={{ backgroundColor: '#FCD8CD', border: '1px solid #BC7C7C', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14, color: '#7a2a2a' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Correo Gmail</label>
              <input
                type="email" value={correo} onChange={e => setCorreo(e.target.value)}
                placeholder="tucorreo@gmail.com" required
                style={{ ...inputStyle, borderColor: correo && !correo.endsWith('@gmail.com') ? '#BC7C7C' : '#AFD3E2' }}
              />
              {correo && !correo.endsWith('@gmail.com') && (
                <p style={{ fontSize: 12, color: '#BC7C7C', marginTop: 6 }}>Solo se permiten correos @gmail.com</p>
              )}
            </div>

            {/* ROL */}
            <div>
              <label style={labelStyle}>¿Qué eres?</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: 'ESTUDIANTE', label: 'Estudiante' },
                  { value: 'PROFESOR', label: 'Profesor' },
                ].map(opcion => (
                  <button
                    key={opcion.value}
                    type="button"
                    onClick={() => setRol(opcion.value)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 10,
                      border: `2px solid ${rol === opcion.value ? '#146C94' : '#AFD3E2'}`,
                      backgroundColor: rol === opcion.value ? '#D2E0FB' : '#ffffff',
                      color: rol === opcion.value ? '#146C94' : '#4a5a6a',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {opcion.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Contraseña</label>
              <input type="password" value={contrasena} onChange={e => setContrasena(e.target.value)} placeholder="Mínimo 8 caracteres" required style={inputStyle} />
              {contrasena && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                  {indicador(tieneMinimo, 'Mínimo 8 caracteres')}
                  {indicador(tieneMayuscula, 'Al menos una mayúscula')}
                  {indicador(tieneNumero, 'Al menos un número')}
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input
                type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
                placeholder="Repite tu contraseña" required
                style={{ ...inputStyle, borderColor: confirmar && confirmar !== contrasena ? '#BC7C7C' : '#AFD3E2' }}
              />
              {confirmar && confirmar !== contrasena && (
                <p style={{ fontSize: 12, color: '#BC7C7C', marginTop: 6 }}>Las contraseñas no coinciden</p>
              )}
            </div>

            <button
              type="submit" disabled={cargando}
              style={{
                backgroundColor: cargando ? '#AFD3E2' : '#146C94',
                color: '#ffffff', padding: '14px', borderRadius: 10, border: 'none',
                fontSize: 16, fontWeight: 700, cursor: cargando ? 'not-allowed' : 'pointer', marginTop: 4,
              }}
            >
              {cargando ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#4a5a6a' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" style={{ color: '#146C94', fontWeight: 700, textDecoration: 'none' }}>
              Inicia sesión
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#8a9aaa' }}>
          Al registrarte aceptas nuestros términos de uso y política de privacidad.
        </p>
      </div>
    </div>
  );
}