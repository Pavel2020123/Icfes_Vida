'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registrarUsuario, validarCodigoReferido } from '../../lib/api';

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
  const [codigoReferido, setCodigoReferido] = useState('');
  const [nombreReferidor, setNombreReferidor] = useState('');
  const [codigoValido, setCodigoValido] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const tieneMinimo = contrasena.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneNumero = /[0-9]/.test(contrasena);

  useEffect(() => {
    const codigoUrl = new URLSearchParams(window.location.search).get('ref');
    const codigoGuardado = localStorage.getItem('saberplus_ref');
    const codigo = (codigoUrl || codigoGuardado || '').trim().toUpperCase();
    if (!codigo) return;

    localStorage.setItem('saberplus_ref', codigo);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCodigoReferido(codigo);
    validarCodigoReferido(codigo)
      .then((resultado) => {
        setCodigoValido(resultado.valido);
        setNombreReferidor(resultado.nombreReferidor ?? '');
        if (!resultado.valido) localStorage.removeItem('saberplus_ref');
      })
      .catch(() => {
        setCodigoValido(false);
        localStorage.removeItem('saberplus_ref');
      });
  }, []);

  const comprobarCodigo = async () => {
    const codigo = codigoReferido.trim().toUpperCase();
    if (!codigo) {
      setCodigoValido(null);
      setNombreReferidor('');
      localStorage.removeItem('saberplus_ref');
      return;
    }

    try {
      const resultado = await validarCodigoReferido(codigo);
      setCodigoValido(resultado.valido);
      setNombreReferidor(resultado.nombreReferidor ?? '');
      if (resultado.valido) localStorage.setItem('saberplus_ref', codigo);
      else localStorage.removeItem('saberplus_ref');
    } catch {
      setCodigoValido(false);
      setNombreReferidor('');
    }
  };

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
      let codigoParaEnviar: string | undefined;
      if (codigoReferido.trim()) {
        const resultadoCodigo = await validarCodigoReferido(codigoReferido);
        if (!resultadoCodigo.valido) {
          setCodigoValido(false);
          setError('Revisa el código de referido antes de continuar.');
          return;
        }
        codigoParaEnviar = codigoReferido.trim().toUpperCase();
        setCodigoValido(true);
        setNombreReferidor(resultadoCodigo.nombreReferidor ?? '');
      }

      await registrarUsuario(
        nombre,
        correo,
        contrasena,
        codigoParaEnviar,
      );
      localStorage.removeItem('saberplus_ref');
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

          {codigoValido && (
            <div style={{ backgroundColor: '#E8F5EF', borderLeft: '4px solid #16805E', borderRadius: 6, padding: '12px 14px', marginBottom: 22, fontSize: 14, color: '#245647' }}>
              Invitación de <strong>{nombreReferidor}</strong> aplicada.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Código de referido (opcional)</label>
              <input
                type="text"
                value={codigoReferido}
                onChange={e => {
                  setCodigoReferido(e.target.value.toUpperCase());
                  setCodigoValido(null);
                  setNombreReferidor('');
                }}
                onBlur={() => void comprobarCodigo()}
                placeholder="Ej. A1B2C3D4E5"
                maxLength={12}
                style={{
                  ...inputStyle,
                  textTransform: 'uppercase',
                  borderColor: codigoValido === false ? '#BC7C7C' : codigoValido ? '#16805E' : '#AFD3E2',
                }}
              />
              {codigoValido === false && (
                <p style={{ fontSize: 12, color: '#BC7C7C', marginTop: 6 }}>Este código no es válido.</p>
              )}
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
