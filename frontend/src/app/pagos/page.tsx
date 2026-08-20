'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import PromocionPlanBanner from '../../components/PromocionPlanBanner';
import {
  crearOrdenPagoIndividual,
  obtenerCalendarioIcfesActivo,
  obtenerPromocionActiva,
  validarCupon,
  type CuponValidado,
  type CalendarioIcfes,
  type PromocionActiva,
} from '../../lib/api';

type PasoCodigo = 'inicio' | 'pregunta' | 'con_codigo' | 'sin_codigo';

interface WompiCheckoutConfig {
  currency: string;
  amountInCents: number;
  reference: string;
  publicKey: string;
  redirectUrl: string;
  customerData: { email: string; fullName: string };
}

interface WompiCheckoutResult {
  transaction: { status: string; id: string };
}

interface WompiCheckoutClass {
  new (config: WompiCheckoutConfig): {
    open: (callback: (result: WompiCheckoutResult) => void) => void;
  };
}

declare global {
  interface Window {
    WidgetCheckout?: WompiCheckoutClass;
  }
}

const PRECIO_ACCESO_COMPLETO = 45000;
const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function PagosPage() {
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cupon, setCupon] = useState<CuponValidado | null>(null);
  const [promocion, setPromocion] = useState<PromocionActiva | null>(null);
  const [calendario, setCalendario] = useState<CalendarioIcfes | null>(null);
  const [pasoCodigo, setPasoCodigo] = useState<PasoCodigo>('inicio');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      window.location.href = '/login';
      return;
    }

    let vigente = true;
    Promise.all([
      obtenerPromocionActiva('MENSUAL'),
      obtenerCalendarioIcfesActivo(),
    ])
      .then(([promocionActiva, calendarioActivo]) => {
        if (!vigente) return;
        setPromocion(promocionActiva);
        setCalendario(calendarioActivo);
      })
      .catch(() => {
        if (!vigente) return;
        setPromocion(null);
        setCalendario(null);
      });

    return () => {
      vigente = false;
    };
  }, []);

  const aplicarCodigo = async () => {
    if (!codigoCupon.trim()) {
      setError('Escribe un código promocional.');
      return;
    }

    setCargando(true);
    setError('');
    try {
      setCupon(await validarCupon(codigoCupon.trim(), 'MENSUAL'));
    } catch (err) {
      setCupon(null);
      setError(err instanceof Error ? err.message : 'No se pudo validar el cupón.');
    } finally {
      setCargando(false);
    }
  };

  const iniciarPago = async (codigo?: string) => {
    if (!window.WidgetCheckout) {
      setError('El widget de pago aún no está disponible. Intenta de nuevo.');
      return;
    }

    setCargando(true);
    setError('');
    try {
      const plan = await crearOrdenPagoIndividual(codigo);
      const checkout = new window.WidgetCheckout({
        currency: plan.currency,
        amountInCents: plan.amount * 100,
        reference: plan.factura,
        publicKey: plan.publicKey,
        redirectUrl: `${window.location.origin}/pagos/respuesta`,
        customerData: { email: plan.email, fullName: plan.nombre },
      });

      checkout.open(() => {
        window.location.href = '/dashboard';
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el pago.');
    } finally {
      setCargando(false);
    }
  };

  const continuar = () => {
    setError('');
    if (pasoCodigo === 'inicio') {
      setPasoCodigo('pregunta');
      return;
    }
    void iniciarPago(cupon?.codigo);
  };

  const elegirCodigo = (tieneCodigo: boolean) => {
    setError('');
    if (tieneCodigo) {
      setPasoCodigo('con_codigo');
      return;
    }

    setPasoCodigo('sin_codigo');
    setCodigoCupon('');
    setCupon(null);
    void iniciarPago();
  };

  const porcentaje = cupon?.porcentajeDescuento ?? promocion?.porcentajeDescuento;
  const precioFinal = porcentaje
    ? Math.round(PRECIO_ACCESO_COMPLETO * (1 - porcentaje / 100))
    : PRECIO_ACCESO_COMPLETO;

  return (
    <>
      <Script src="https://checkout.wompi.co/widget.js" strategy="lazyOnload" />
      <main
        style={{
          maxWidth: 460,
          margin: '60px auto',
          padding: 30,
          border: '1px solid #D4DEE3',
          borderRadius: 8,
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 24px rgba(30,55,70,0.08)',
        }}
      >
        <p style={{ margin: '0 0 6px', color: '#168BB3', fontSize: 12, fontWeight: 800 }}>
          PAGO ÚNICO
        </p>
        <h1 style={{ margin: '0 0 8px', color: '#1a2a3a', fontSize: 24, fontWeight: 850 }}>
          Acceso completo SaberPlus
        </h1>
        <p style={{ margin: '0 0 22px', color: '#66747D', fontSize: 14, lineHeight: 1.5 }}>
          Todas las áreas, preguntas y simulacros hasta la fecha de tu convocatoria.
        </p>

        {promocion && <PromocionPlanBanner promocion={promocion} />}

        {!calendario && (
          <p style={{ margin: '0 0 18px', color: '#A15C10', fontSize: 13 }}>
            La próxima convocatoria todavía no tiene una fecha activa.
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 22 }}>
          <strong style={{ color: '#146C94', fontSize: 34, fontWeight: 900 }}>
            {pesos.format(precioFinal)}
          </strong>
          {porcentaje && (
            <span style={{ color: '#84909A', fontSize: 14, textDecoration: 'line-through' }}>
              {pesos.format(PRECIO_ACCESO_COMPLETO)}
            </span>
          )}
        </div>

        {pasoCodigo === 'pregunta' && (
          <div style={{ padding: 14, marginBottom: 12, border: '1px solid #AFD3E2', borderRadius: 8, backgroundColor: '#F7FAFC' }}>
            <p style={{ margin: '0 0 10px', color: '#1a2a3a', fontSize: 14, fontWeight: 700 }}>
              ¿Quieres ingresar un código promocional?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button type="button" onClick={() => elegirCodigo(true)} style={{ padding: 10, border: '1px solid #146C94', borderRadius: 8, backgroundColor: '#ffffff', color: '#146C94', fontWeight: 700, cursor: 'pointer' }}>
                Sí, tengo uno
              </button>
              <button type="button" onClick={() => elegirCodigo(false)} style={{ padding: 10, border: 'none', borderRadius: 8, backgroundColor: '#146C94', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}>
                No, continuar
              </button>
            </div>
          </div>
        )}

        {pasoCodigo === 'con_codigo' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              aria-label="Código promocional"
              placeholder="Código promocional"
              value={codigoCupon}
              maxLength={50}
              onChange={(event) => {
                setCodigoCupon(event.target.value.toUpperCase());
                setCupon(null);
              }}
              style={{ flex: 1, minWidth: 0, padding: '11px 12px', border: '1.5px solid #AFD3E2', borderRadius: 8, textTransform: 'uppercase' }}
            />
            <button type="button" onClick={aplicarCodigo} disabled={cargando} style={{ padding: '10px 16px', border: 'none', borderRadius: 8, backgroundColor: '#D2E0FB', color: '#146C94', fontWeight: 700, cursor: 'pointer' }}>
              Aplicar
            </button>
          </div>
        )}

        {cupon && (
          <p style={{ margin: '0 0 16px', color: '#2F8F5B', fontSize: 13 }}>
            {cupon.codigo}: {cupon.porcentajeDescuento}% de descuento
          </p>
        )}

        {pasoCodigo !== 'pregunta' && (
          <button
            type="button"
            onClick={continuar}
            disabled={cargando || !calendario}
            style={{ width: '100%', padding: '14px 16px', border: 'none', borderRadius: 8, backgroundColor: '#146C94', color: '#ffffff', fontSize: 15, fontWeight: 800, cursor: cargando || !calendario ? 'default' : 'pointer', opacity: cargando || !calendario ? 0.62 : 1 }}
          >
            {cargando
              ? 'Un momento...'
              : calendario
                ? `Pagar ${pesos.format(precioFinal)}`
                : 'Fechas por confirmar'}
          </button>
        )}

        {error && <p style={{ margin: '12px 0 0', color: '#C0392B', fontSize: 13 }}>{error}</p>}
        <p style={{ margin: '15px 0 0', color: '#87939B', fontSize: 12, textAlign: 'center' }}>
          Pago seguro, sin renovaciones automáticas.
        </p>
      </main>
    </>
  );
}
