'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { obtenerEstadoOrdenPago } from '../../../lib/api';

type Estado = 'cargando' | 'aprobada' | 'pendiente' | 'rechazada' | 'error';

// La página de respuesta de ePayco NO es confiable por sí sola (el
// usuario puede llegar aquí sin que el webhook de confirmación haya
// terminado de procesar). Por eso consultamos nuestro propio backend
// (que sí valida la firma del webhook) unas cuantas veces antes de
// darle un veredicto final al estudiante.
// Ver: https://docs.epayco.com/docs/checkout-respuesta-y-confirmacion
const INTENTOS_MAXIMOS = 8;
const INTERVALO_MS = 2500;

const CONTENIDO: Record<Estado, { icono: string; titulo: string; mensaje: string }> = {
  cargando: {
    icono: '⏳',
    titulo: 'Confirmando tu pago...',
    mensaje: 'Esto puede tardar unos segundos mientras ePayco nos confirma la transacción.',
  },
  aprobada: {
    icono: '✅',
    titulo: '¡Pago confirmado!',
    mensaje: 'Tu plan ya está activo. Puedes seguir estudiando sin límites.',
  },
  pendiente: {
    icono: '🕓',
    titulo: 'Tu pago está en proceso',
    mensaje:
      'Algunos medios de pago (como PSE) tardan más en confirmarse. Te avisaremos por correo apenas se confirme; no necesitas volver a pagar.',
  },
  rechazada: {
    icono: '⚠️',
    titulo: 'El pago no se pudo procesar',
    mensaje: 'La transacción fue rechazada. Puedes intentarlo de nuevo con otro medio de pago.',
  },
  error: {
    icono: '⚠️',
    titulo: 'No pudimos verificar tu pago',
    mensaje: 'Si ya pagaste, tu plan se activará apenas confirmemos con ePayco. Si el problema sigue, contáctanos.',
  },
};

function ResultadoPagoContenido() {
  const searchParams = useSearchParams();
  const [estado, setEstado] = useState<Estado>('cargando');
  const intentos = useRef(0);
  const detenido = useRef(false);

  useEffect(() => {
    const factura = searchParams.get('factura');
    if (!factura) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEstado('error');
      return;
    }

    const consultar = () => {
      obtenerEstadoOrdenPago(factura)
        .then((orden) => {
          if (detenido.current) return;

          if (orden.estado === 'APROBADA') {
            detenido.current = true;
            setEstado('aprobada');
            return;
          }
          if (orden.estado === 'RECHAZADA' || orden.estado === 'FALLIDA') {
            detenido.current = true;
            setEstado('rechazada');
            return;
          }

          // PENDIENTE o PENDIENTE_BANCO: seguimos reintentando un rato.
          intentos.current += 1;
          if (intentos.current >= INTENTOS_MAXIMOS) {
            detenido.current = true;
            setEstado('pendiente');
            return;
          }
          setTimeout(consultar, INTERVALO_MS);
        })
        .catch(() => {
          if (detenido.current) return;
          intentos.current += 1;
          if (intentos.current >= INTENTOS_MAXIMOS) {
            detenido.current = true;
            setEstado('error');
            return;
          }
          setTimeout(consultar, INTERVALO_MS);
        });
    };

    consultar();
    return () => {
      detenido.current = true;
    };
  }, [searchParams]);

  const { icono, titulo, mensaje } = CONTENIDO[estado];

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
      <div style={{ fontSize: 48, marginBottom: 8 }}>{icono}</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#146C94', margin: '0 0 12px' }}>
        {titulo}
      </h1>
      <p style={{ fontSize: 15, color: '#555', lineHeight: 1.5, margin: '0 0 28px' }}>
        {mensaje}
      </p>
      {estado !== 'cargando' && (
        <Link
          href={estado === 'aprobada' ? '/dashboard' : '/planes'}
          style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-primario, #146C94)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 15,
            padding: '12px 28px',
            borderRadius: 10,
            textDecoration: 'none',
          }}
        >
          {estado === 'aprobada' ? 'Ir a estudiar' : 'Ver planes'}
        </Link>
      )}
    </div>
  );
}

export default function ResultadoPagoPage() {
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
        <ResultadoPagoContenido />
      </Suspense>
    </div>
  );
}