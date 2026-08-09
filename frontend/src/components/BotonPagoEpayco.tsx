'use client';

import { useState } from 'react';
import { API_URL, crearOrdenPagoIndividual } from '../lib/api';

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
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const pagar = async () => {
    setCargando(true);
    setError('');
    try {
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
        // "true" = checkout estándar con redirección (lo que el
        // estudiante quiere: sale de la página, paga, y vuelve).
        external: 'true',
        response: responseUrl,
        confirmation: `${API_URL}/pagos/confirmacion`,
        name_billing: datos.nombre,
        email_billing: datos.email,
      });
    } catch {
      setError('No se pudo iniciar el pago. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button
        onClick={pagar}
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
        {cargando ? 'Abriendo pago...' : `${etiqueta} · ${precio}`}
      </button>
      {error && <span style={{ fontSize: 13, color: '#c0392b' }}>{error}</span>}
    </div>
  );
}