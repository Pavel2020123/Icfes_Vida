'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  API_URL,
  crearOrdenPagoIndividual,
  loginUsuario,
  registrarUsuario,
  guardarToken,
} from '../lib/api';
import { obtenerInstitucionId, obtenerRol } from '../lib/auth';

// ─── CHECKOUT REDIRIGIDO DE EPAYCO (punto 9) ───────────────────
// El estudiante sale de la plataforma, paga en la página de ePayco y
// vuelve a /planes/resultado-pago. Ver:
// https://docs.epayco.com/docs/integracion-personalizada (external: "true")
// https://docs.epayco.com/docs/checkout-respuesta-y-confirmacion

declare global {
  interface Window {
    ePayco?: {
      checkout: {
        configure: (config: { key: string; test: boolean }) => {
          open: (data: Record<string, string>) => void;
        };
      };
    };
  }
}

const EPAYCO_SCRIPT_SRC = 'https://checkout.epayco.co/checkout.js';

let cargaScriptEpayco: Promise<void> | null = null;

function cargarScriptEpayco(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.ePayco) return Promise.resolve();

  if (!cargaScriptEpayco) {
    cargaScriptEpayco = new Promise((resolve, reject) => {
      const existente = document.querySelector(
        `script[src="${EPAYCO_SCRIPT_SRC}"]`,
      );
      if (existente) {
        existente.addEventListener('load', () => resolve());
        return;
      }
      const script = document.createElement('script');
      script.src = EPAYCO_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar ePayco'));
      document.body.appendChild(script);
    });
  }

  return cargaScriptEpayco;
}

function validarFormularioRapido(
  nombre: string,
  correo: string,
  contrasena: string,
  confirmar: string,
): string | null {
  if (!nombre.trim()) return 'Escribe tu nombre.';
  // Misma regla que /registro, para no tener dos políticas distintas.
  if (!correo.endsWith('@gmail.com')) return 'Por ahora solo aceptamos correos @gmail.com.';
  if (contrasena.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
  if (!/[A-Z]/.test(contrasena)) return 'Debe tener al menos una mayúscula.';
  if (!/[0-9]/.test(contrasena)) return 'Debe tener al menos un número.';
  if (contrasena !== confirmar) return 'Las contraseñas no coinciden.';
  return null;
}

// ─── SESIÓN ─────────────────────────────────────────────────────
// 'anonimo': nadie ha iniciado sesión → mostramos un mini-formulario
//   de cuenta antes de pagar (crea la cuenta y paga en el mismo paso,
//   SIN pasar por la prueba gratis de 3 días).
// 'individual': ya hay sesión de un estudiante individual → paga directo.
// 'institucional': el estudiante pertenece a un colegio → su acceso lo
//   gestiona la institución, no tiene sentido que pague aquí.
type Sesion = 'anonimo' | 'individual' | 'institucional';

interface BotonPagoEpaycoProps {
  grado: 'DECIMO' | 'ONCE';
  etiqueta: string;
  precio: string;
  destacado?: boolean;
}

export default function BotonPagoEpayco({
  grado,
  etiqueta,
  precio,
  destacado = false,
}: BotonPagoEpaycoProps) {
  // Por defecto 'anonimo' para que el primer render en servidor y en
  // cliente coincida (sin esto, React se queja de hidratación). Si
  // resulta que sí hay sesión, lo actualizamos justo después de montar.
  const [sesion, setSesion] = useState<Sesion>('anonimo');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const rol = obtenerRol();
    const institucionId = obtenerInstitucionId();
    const nuevaSesion: Sesion =
      rol === 'ESTUDIANTE' && institucionId
        ? 'institucional'
        : rol
        ? 'individual'
        : 'anonimo';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSesion(nuevaSesion);
  }, []);

  // ─── Una vez hay sesión (ya sea previa o recién creada), esto abre
  // el checkout de ePayco. ─────────────────────────────────────────
  const irAEpayco = async () => {
    const [datos] = await Promise.all([
      crearOrdenPagoIndividual(grado),
      cargarScriptEpayco(),
    ]);

    if (!window.ePayco) {
      throw new Error('No se pudo cargar la pasarela de pago');
    }

    const handler = window.ePayco.checkout.configure({
      key: datos.publicKey,
      test: datos.test,
    });

    const responseUrl = `${window.location.origin}/planes/resultado-pago?factura=${datos.factura}`;

    handler.open({
      name: datos.name,
      description: datos.description,
      invoice: datos.factura,
      currency: datos.currency,
      amount: String(datos.amount),
      country: datos.country,
      lang: 'es',
      // "true" = checkout estándar con redirección (el estudiante sale
      // de la página, paga, y vuelve).
      external: 'true',
      response: responseUrl,
      confirmation: `${API_URL}/pagos/confirmacion`,
      name_billing: datos.nombre,
      email_billing: datos.email,
    });
  };

  const manejarClick = async () => {
    setError('');

    // Visitante sin cuenta: primer clic solo abre el mini-formulario,
    // todavía no pagamos nada.
    if (sesion === 'anonimo' && !mostrarFormulario) {
      setMostrarFormulario(true);
      return;
    }

    setCargando(true);
    try {
      if (sesion === 'anonimo') {
        const errorValidacion = validarFormularioRapido(nombre, correo, contrasena, confirmar);
        if (errorValidacion) {
          setError(errorValidacion);
          setCargando(false);
          return;
        }
        // Crea la cuenta y entra directo, SIN esperar a confirmar el
        // correo — esa espera es para la prueba gratis (punto 7), no
        // para alguien que ya va a pagar con su plata.
        await registrarUsuario(nombre, correo, contrasena);
        const { accessToken } = await loginUsuario(correo, contrasena);
        guardarToken(accessToken);
        setSesion('individual');
      }

      await irAEpayco();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo continuar. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  if (sesion === 'institucional') {
    return (
      <p style={{ fontSize: 13, color: '#8a9aaa', textAlign: 'center', margin: 0 }}>
        Tu colegio ya te dio acceso — no necesitas comprar esto.
      </p>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1.5px solid #AFD3E2',
    fontSize: 14,
    color: '#1a2a3a',
    backgroundColor: '#F6F1F1',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sesion === 'anonimo' && mostrarFormulario && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="tucorreo@gmail.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Contraseña (mín. 8, 1 mayúscula, 1 número)"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Repite la contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            style={inputStyle}
          />
        </div>
      )}

      <button
        onClick={manejarClick}
        disabled={cargando}
        style={{
          backgroundColor: destacado ? 'var(--color-primario, #146C94)' : '#ffffff',
          color: destacado ? '#ffffff' : 'var(--color-primario, #146C94)',
          border: destacado ? 'none' : '1.5px solid var(--color-primario, #146C94)',
          borderRadius: 10,
          padding: '12px 24px',
          fontSize: 15,
          fontWeight: 700,
          cursor: cargando ? 'default' : 'pointer',
          opacity: cargando ? 0.7 : 1,
        }}
      >
        {cargando
          ? 'Un momento...'
          : sesion === 'anonimo' && mostrarFormulario
          ? `Crear cuenta y pagar · ${precio}`
          : `${etiqueta} · ${precio}`}
      </button>

      {sesion === 'anonimo' && mostrarFormulario && (
        <p style={{ fontSize: 12, color: '#8a9aaa', textAlign: 'center', margin: 0 }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: 'var(--color-primario, #146C94)', fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </p>
      )}

      {error && <span style={{ fontSize: 13, color: '#c0392b' }}>{error}</span>}
    </div>
  );
}