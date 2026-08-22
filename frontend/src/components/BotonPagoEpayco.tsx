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
      script.onerror = () =>
        reject(new Error('No se pudo cargar ePayco'));

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
  if (!correo.endsWith('@gmail.com')) {
    return 'Por ahora solo aceptamos correos @gmail.com.';
  }

  if (contrasena.length < 8) {
    return 'La contraseña debe tener mínimo 8 caracteres.';
  }

  if (!/[A-Z]/.test(contrasena)) {
    return 'Debe tener al menos una mayúscula.';
  }

  if (!/[0-9]/.test(contrasena)) {
    return 'Debe tener al menos un número.';
  }

  if (contrasena !== confirmar) {
    return 'Las contraseñas no coinciden.';
  }

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
type PasoCodigo = 'inicio' | 'pregunta' | 'con_codigo' | 'sin_codigo';

interface BotonPagoEpaycoProps {
  etiqueta: string;
  precio: string;
  destacado?: boolean;
  deshabilitado?: boolean;
}

export default function BotonPagoEpayco({
  etiqueta,
  precio,
  destacado = false,
  deshabilitado = false,
}: BotonPagoEpaycoProps) {
  // "destacado" ya no cambia el color del botón (ahora todos son iguales).
  // Se deja el prop para no romper a quienes ya lo pasan (planes/page.tsx,
  // MuroDePago.tsx), por si más adelante se vuelve a usar para otra cosa.
  void destacado;

  // Por defecto 'anonimo' para que el primer render en servidor y en
  // cliente coincida (sin esto, React se queja de hidratación). Si
  // resulta que sí hay sesión, lo actualizamos justo después de montar.
  const [sesion, setSesion] = useState<Sesion>('anonimo');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [codigoCupon, setCodigoCupon] = useState('');
  const [pasoCodigo, setPasoCodigo] = useState<PasoCodigo>('inicio');
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
  const irAEpayco = async (codigoPromocional?: string) => {
    const [datos] = await Promise.all([
      crearOrdenPagoIndividual(codigoPromocional),
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

      // "true" = checkout estándar con redirección
      // (el estudiante sale de la página, paga, y vuelve).
      external: 'true',

      response: responseUrl,
      confirmation: `${API_URL}/pagos/confirmacion`,
      name_billing: datos.nombre,
      email_billing: datos.email,
    });
  };

  const procesarPago = async (usarCodigo: boolean) => {
    setError('');

    if (usarCodigo && !codigoCupon.trim()) {
      setError('Escribe el código promocional o continúa sin código.');
      return;
    }

    // Visitante sin cuenta: primer clic solo abre el mini-formulario,
    // todavía no pagamos nada.
    if (sesion === 'anonimo' && !mostrarFormulario) {
      setMostrarFormulario(true);
      return;
    }

    setCargando(true);

    try {
      if (sesion === 'anonimo') {
        const errorValidacion = validarFormularioRapido(
          nombre,
          correo,
          contrasena,
          confirmar,
        );

        if (errorValidacion) {
          setError(errorValidacion);
          setCargando(false);
          return;
        }

        // Crea la cuenta y entra directo, SIN esperar a confirmar el
        // correo — esa espera es para la prueba gratis (punto 7), no
        // para alguien que ya va a pagar con su plata.
        const codigoReferido = localStorage.getItem('saberplus_ref') ?? undefined;
        await registrarUsuario(nombre, correo, contrasena, codigoReferido);
        localStorage.removeItem('saberplus_ref');

        const { accessToken } = await loginUsuario(
          correo,
          contrasena,
        );

        guardarToken(accessToken);
        setSesion('individual');
      }

      await irAEpayco(usarCodigo ? codigoCupon.trim() : undefined);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo continuar. Intenta de nuevo.',
      );
    } finally {
      setCargando(false);
    }
  };

  const manejarClick = () => {
    setError('');
    if (pasoCodigo === 'inicio') {
      setPasoCodigo('pregunta');
      return;
    }
    void procesarPago(pasoCodigo === 'con_codigo');
  };

  const elegirCodigo = (tieneCodigo: boolean) => {
    setError('');
    if (tieneCodigo) {
      setPasoCodigo('con_codigo');
      if (sesion === 'anonimo') setMostrarFormulario(true);
      return;
    }

    setCodigoCupon('');
    setPasoCodigo('sin_codigo');
    if (sesion === 'anonimo') {
      setMostrarFormulario(true);
    } else {
      void procesarPago(false);
    }
  };

  if (sesion === 'institucional') {
    return (
      <p
        style={{
          fontSize: 13,
          color: '#8a9aaa',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Tu colegio ya te dio acceso — no necesitas comprar esto.
      </p>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1.5px solid var(--marca-borde, #afd3e2)',
    fontSize: 14,
    color: '#1a2a3a',
    backgroundColor: '#F6F1F1',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {sesion === 'anonimo' && mostrarFormulario && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginBottom: 4,
          }}
        >
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

      {pasoCodigo === 'pregunta' && (
        <div
          style={{
            padding: 12,
            border: '1px solid var(--marca-borde, #afd3e2)',
            borderRadius: 8,
            backgroundColor: '#F7FAFC',
          }}
        >
          <p style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>
            ¿Quieres ingresar un código promocional?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => elegirCodigo(true)}
              style={{
                padding: '9px 10px',
                border: '1px solid var(--color-primario, #146c94)',
                borderRadius: 8,
                backgroundColor: '#ffffff',
                color: 'var(--color-primario, #146c94)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sí, tengo uno
            </button>
            <button
              type="button"
              onClick={() => elegirCodigo(false)}
              style={{
                padding: '9px 10px',
                border: 'none',
                borderRadius: 8,
                backgroundColor: 'var(--color-primario, #146c94)',
                color: 'var(--color-sobre-primario, #ffffff)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              No, continuar
            </button>
          </div>
        </div>
      )}

      {pasoCodigo === 'con_codigo' && (
        <input
          type="text"
          aria-label="Código promocional"
          placeholder="Código promocional"
          value={codigoCupon}
          maxLength={50}
          onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
          style={{ ...inputStyle, textTransform: 'uppercase' }}
        />
      )}

      {pasoCodigo !== 'pregunta' && (
        <button
          onClick={manejarClick}
          disabled={cargando || deshabilitado}
          className="btn-cta"
          style={{
            backgroundColor: 'var(--color-primario, #146c94)',
            color: 'var(--color-sobre-primario, #ffffff)',
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            fontSize: 15,
            fontWeight: 700,
            width: '100%',
            cursor: cargando || deshabilitado ? 'default' : 'pointer',
            opacity: cargando || deshabilitado ? 0.62 : 1,
          }}
        >
          {cargando
            ? 'Un momento...'
            : deshabilitado
              ? etiqueta
              : sesion === 'anonimo' && mostrarFormulario
                ? `Crear cuenta y pagar · ${precio}`
                : `${etiqueta} · ${precio}`}
        </button>
      )}

      {sesion === 'anonimo' && mostrarFormulario && (
        <p
          style={{
            fontSize: 12,
            color: '#8a9aaa',
            textAlign: 'center',
            margin: 0,
          }}
        >
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            style={{
              color: 'var(--color-primario, #146c94)',
              fontWeight: 600,
            }}
          >
            Inicia sesión
          </Link>
        </p>
      )}

      {error && (
        <span
          style={{
            fontSize: 13,
            color: '#c0392b',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
