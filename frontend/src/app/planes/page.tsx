'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logotipo from '../../components/Logotipo';
import BotonPagoEpayco from '../../components/BotonPagoEpayco';
import FormularioVentas from '../../components/FormularioVentas';
import CountdownIcfes from '../../components/CountdownIcfes';
import { formatearFechaIcfes } from '../../lib/countdown-icfes';
import {
  obtenerCalendarioIcfesActivo,
  obtenerPromocionActiva,
  type CalendarioIcfes,
  type PromocionActiva,
} from '../../lib/api';

type Audiencia = 'estudiante' | 'colegio';

const PRECIO_ACCESO_COMPLETO = 45000;

const RANGOS_INSTITUCIONALES = [
  { cantidad: '10 a 39', precio: '$35.000', detalle: 'por estudiante' },
  { cantidad: '40 a 99', precio: '$30.000', detalle: 'por estudiante' },
  { cantidad: '100 o más', precio: 'Cotización', detalle: 'acuerdo institucional' },
];

function formatearPrecio(valor: number) {
  return `$${valor.toLocaleString('es-CO')}`;
}

function precioConDescuento(valor: number, promocion: PromocionActiva | null) {
  if (!promocion) return valor;
  return Math.round(valor * (1 - promocion.porcentajeDescuento / 100));
}

function ListaIncluye() {
  return (
    <ul
      style={{
        display: 'grid',
        gap: 9,
        padding: 0,
        margin: '0 0 24px',
        listStyle: 'none',
        color: '#445763',
        fontSize: 13,
      }}
    >
      {[
        'Todas las áreas y simulacros',
        'Banco de preguntas y explicaciones',
        'Acceso hasta el día del examen',
      ].map((texto) => (
        <li key={texto} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            aria-hidden="true"
            style={{ color: '#238761', fontWeight: 900, fontSize: 15 }}
          >
            ✓
          </span>
          {texto}
        </li>
      ))}
    </ul>
  );
}

export default function PlanesPage() {
  const [audiencia, setAudiencia] = useState<Audiencia>('estudiante');
  const [formularioVentasAbierto, setFormularioVentasAbierto] = useState(false);
  const [promocion, setPromocion] = useState<PromocionActiva | null>(null);
  const [calendario, setCalendario] = useState<CalendarioIcfes | null>(null);

  useEffect(() => {
    let vigente = true;

    Promise.all([
      obtenerPromocionActiva('MENSUAL').catch(() => null),
      obtenerCalendarioIcfesActivo().catch(() => null),
    ]).then(([promocionActiva, calendarioActivo]) => {
      if (!vigente) return;
      setPromocion(promocionActiva);
      setCalendario(calendarioActivo);
    });

    return () => {
      vigente = false;
    };
  }, []);

  const precioFinal = precioConDescuento(PRECIO_ACCESO_COMPLETO, promocion);
  const colorCalendario = calendario?.calendario === 'B' ? '#F2B45B' : '#8DD8FF';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F6F7F8',
        color: '#1a2a3a',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#146C94',
          boxShadow: '0 2px 10px rgba(0,0,0,0.16)',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            height: 68,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Logotipo colorTexto="#ffffff" colorAcento="#8DD8FF" />
            </Link>
            {calendario && (
              <span
                style={{
                  padding: '5px 8px',
                  border: `1px solid ${colorCalendario}`,
                  borderRadius: 6,
                  color: colorCalendario,
                  fontSize: 11,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                Calendario {calendario.calendario}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link
              href="/login"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 10px',
              }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              style={{
                padding: '9px 14px',
                borderRadius: 8,
                backgroundColor: '#8DD8FF',
                color: '#173746',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              Probar gratis
            </Link>
          </div>
        </div>
      </nav>

      <header style={{ padding: '54px 24px 34px', textAlign: 'center' }}>
        <p
          style={{
            margin: '0 0 10px',
            color: '#168BB3',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0,
            textTransform: 'uppercase',
          }}
        >
          Un pago, una preparación completa
        </p>
        <h1
          style={{
            maxWidth: 620,
            margin: '0 auto 12px',
            color: '#172B38',
            fontSize: 40,
            lineHeight: 1.12,
            fontWeight: 900,
            letterSpacing: 0,
          }}
        >
          Prepárate hasta el día de tu ICFES
        </h1>
        <p
          style={{
            maxWidth: 540,
            margin: '0 auto 28px',
            color: '#5D6C76',
            fontSize: 16,
            lineHeight: 1.55,
          }}
        >
          El grado no cambia el precio. Tú eliges cuándo empezar y SaberPlus te acompaña durante toda la convocatoria.
        </p>

        <div
          style={{
            position: 'relative',
            display: 'inline-grid',
            gridTemplateColumns: 'repeat(2, minmax(110px, 1fr))',
            padding: 4,
            borderRadius: 8,
            backgroundColor: '#DCE8ED',
          }}
        >
          {(['estudiante', 'colegio'] as Audiencia[]).map((opcion) => (
            <button
              key={opcion}
              type="button"
              onClick={() => setAudiencia(opcion)}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '10px 18px',
                border: 'none',
                borderRadius: 6,
                backgroundColor: audiencia === opcion ? '#146C94' : 'transparent',
                color: audiencia === opcion ? '#ffffff' : '#40525E',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {opcion === 'estudiante' ? 'Estudiante' : 'Colegio'}
            </button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto 32px', padding: '0 24px' }}>
        <CountdownIcfes calendario={calendario} />
      </div>

      {audiencia === 'estudiante' ? (
        <main style={{ padding: '0 24px 80px' }}>
          <div
            style={{
              maxWidth: 680,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
              alignItems: 'stretch',
            }}
          >
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: 390,
                padding: '34px 28px 28px',
                border: '1px solid #CCD8DE',
                borderRadius: 8,
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 24px rgba(30,55,70,0.07)',
              }}
            >
              <p style={{ margin: '0 0 7px', color: '#168BB3', fontSize: 12, fontWeight: 800 }}>
                CONOCE SABERPLUS
              </p>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 850 }}>
                Prueba gratis
              </h2>
              <p style={{ minHeight: 42, margin: '0 0 22px', color: '#5D6C76', fontSize: 13, lineHeight: 1.5 }}>
                Explora la plataforma antes de tomar una decisión.
              </p>
              <strong style={{ color: '#146C94', fontSize: 36, lineHeight: 1.1, fontWeight: 900 }}>
                $0
              </strong>
              <span style={{ marginTop: 6, color: '#6E7D87', fontSize: 12 }}>
                3 días desde la verificación del correo
              </span>
              <div style={{ marginTop: 'auto' }}>
                <Link
                  href="/registro"
                  style={{
                    display: 'block',
                    padding: '13px 16px',
                    border: '1px solid #146C94',
                    borderRadius: 8,
                    color: '#146C94',
                    textAlign: 'center',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  Empezar prueba gratis
                </Link>
              </div>
            </section>

            <section
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 390,
                padding: '34px 28px 28px',
                border: '2px solid #146C94',
                borderRadius: 8,
                backgroundColor: '#ffffff',
                boxShadow: 'inset 0 4px 0 #146C94, 0 14px 30px rgba(20,108,148,0.15)',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '6px 15px',
                  borderRadius: 7,
                  backgroundColor: '#75CBEA',
                  color: '#173746',
                  fontSize: 12,
                  fontWeight: 850,
                  whiteSpace: 'nowrap',
                }}
              >
                Acceso completo
              </span>

              {promocion && (
                <span
                  style={{
                    position: 'absolute',
                    top: 24,
                    right: 18,
                    padding: '7px 9px',
                    borderRadius: 6,
                    backgroundColor: '#F26B5B',
                    boxShadow: '0 4px 10px rgba(198,72,57,0.2)',
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 900,
                  }}
                >
                  -{promocion.porcentajeDescuento}%
                </span>
              )}

              <p style={{ margin: '0 0 7px', color: '#168BB3', fontSize: 12, fontWeight: 800 }}>
                PAGO ÚNICO
              </p>
              <h2 style={{ margin: '0 0 8px', paddingRight: promocion ? 66 : 0, fontSize: 22, fontWeight: 850 }}>
                Preparación Saber 11
              </h2>
              <p style={{ minHeight: 42, margin: '0 0 18px', color: '#5D6C76', fontSize: 13, lineHeight: 1.5 }}>
                Sin mensualidades ni cobros posteriores.
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ color: '#146C94', fontSize: 36, lineHeight: 1.1, fontWeight: 900 }}>
                  {formatearPrecio(precioFinal)}
                </strong>
                {promocion && (
                  <span style={{ color: '#84909A', fontSize: 14, textDecoration: 'line-through' }}>
                    {formatearPrecio(PRECIO_ACCESO_COMPLETO)}
                  </span>
                )}
              </div>

              {calendario && (
                <time
                  dateTime={calendario.fechaExamen}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '9px 0 18px', color: '#687580', fontSize: 12 }}
                >
                  <span aria-hidden="true" style={{ fontSize: 16 }}>◷</span>
                  Acceso hasta {formatearFechaIcfes(calendario.fechaExamen)}
                </time>
              )}
              {!calendario && (
                <p style={{ margin: '9px 0 18px', color: '#687580', fontSize: 12 }}>
                  Convocatoria y fecha de acceso por confirmar
                </p>
              )}

              <ListaIncluye />

              <div style={{ marginTop: 'auto' }}>
                <BotonPagoEpayco
                  etiqueta={calendario ? 'Comprar acceso' : 'Fechas por confirmar'}
                  precio={formatearPrecio(precioFinal)}
                  destacado
                  deshabilitado={!calendario}
                />
              </div>
            </section>
          </div>
        </main>
      ) : (
        <main style={{ padding: '0 24px 80px' }}>
          <section style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ maxWidth: 620, margin: '0 auto 28px', textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 9px', fontSize: 25, fontWeight: 850 }}>
                Un solo acceso para todos tus estudiantes
              </h2>
              <p style={{ margin: 0, color: '#5D6C76', fontSize: 14, lineHeight: 1.55 }}>
                Los cupos pueden asignarse a estudiantes de cualquier grado. El colegio recibe la misma plataforma, seguimiento y convocatoria para todo el grupo.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 14,
              }}
            >
              {RANGOS_INSTITUCIONALES.map((rango, indice) => (
                <article
                  key={rango.cantidad}
                  style={{
                    padding: '24px 22px',
                    border: indice === 1 ? '2px solid #146C94' : '1px solid #CCD8DE',
                    borderRadius: 8,
                    backgroundColor: '#ffffff',
                    boxShadow: indice === 1 ? '0 10px 24px rgba(20,108,148,0.13)' : '0 6px 18px rgba(30,55,70,0.06)',
                  }}
                >
                  <p style={{ margin: '0 0 7px', color: '#5D6C76', fontSize: 12, fontWeight: 700 }}>
                    {rango.cantidad} estudiantes
                  </p>
                  <strong style={{ color: '#146C94', fontSize: 25, fontWeight: 900 }}>
                    {rango.precio}
                  </strong>
                  <p style={{ margin: '4px 0 0', color: '#77848D', fontSize: 12 }}>
                    {rango.detalle}
                  </p>
                </article>
              ))}
            </div>

            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setFormularioVentasAbierto(true)}
                style={{
                  padding: '14px 30px',
                  border: 'none',
                  borderRadius: 8,
                  backgroundColor: '#146C94',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(20,108,148,0.2)',
                }}
              >
                Solicitar propuesta institucional
              </button>
              <p style={{ margin: '12px 0 0', color: '#77848D', fontSize: 12 }}>
                La cantidad final, facturación y activación se acuerdan con el colegio.
              </p>
            </div>
          </section>
        </main>
      )}

      <footer style={{ padding: '28px 24px', backgroundColor: '#172B38', textAlign: 'center' }}>
        <p style={{ margin: '0 0 8px', color: '#8DD8FF', fontSize: 17, fontWeight: 850 }}>
          Saber<span style={{ color: '#ffffff' }}>Plus</span>
        </p>
        <Link href="/terminos" style={{ marginRight: 16, color: '#D5E3E9', fontSize: 12 }}>
          Términos
        </Link>
        <Link href="/privacidad" style={{ color: '#D5E3E9', fontSize: 12 }}>
          Privacidad
        </Link>
      </footer>

      <FormularioVentas
        abierto={formularioVentasAbierto}
        onCerrar={() => setFormularioVentasAbierto(false)}
      />
    </div>
  );
}
