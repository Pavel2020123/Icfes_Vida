'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logotipo from '../../components/Logotipo';
import BotonPagoEpayco from '../../components/BotonPagoEpayco';
import FormularioVentas from '../../components/FormularioVentas';

// ─── PUNTO 10 DEL ROADMAP ───────────────────────────────────────
// Página de planes rediseñada con los nombres/precios OFICIALES de
// la tabla del roadmap (19 jul 2026). Dos audiencias distintas:
//
//  1) Estudiante individual → paga directo con ePayco (punto 9),
//     precio fijo según su grado: $25.000 (g10) / $35.000 (g11).
//
//  2) Institución (colegio) → NO hay autoregistro (ver "Flujo de
//     cotización" del roadmap): el director habla con ventas, el
//     trato se cierra por fuera, y luego el admin crea la cuenta
//     manualmente (punto 12). El CTA "Hablar con ventas" abre el
//     formulario del punto 11, que guarda el lead en la base de
//     datos (antes era un mailto temporal).

type Audiencia = 'estudiante' | 'colegio';
type Linea = 'once' | 'bachillerato';

const AUDIENCIA_LABELS: Record<Audiencia, string> = {
  estudiante: 'Estudiante',
  colegio: 'Colegio',
};

const LINEA_LABELS: Record<Linea, string> = {
  once: 'Solo grado 11 (Once)',
  bachillerato: 'Grado 10 y 11 (Bachillerato)',
};

interface PlanInstitucional {
  nombre: 'Básico' | 'Plus' | 'Colegio';
  cupos: string;
  precio: string; // Once: precio único. Bachillerato: "$21.000 (g10) / $30.000 (g11)"
  cotizacionDirecta: boolean;
  destacado: boolean;
}

const PLANES_ONCE: PlanInstitucional[] = [
  { nombre: 'Básico', cupos: 'Hasta 25 estudiantes', precio: '$30.000 / estudiante', cotizacionDirecta: false, destacado: false },
  { nombre: 'Plus', cupos: 'Hasta 40 estudiantes', precio: '$28.000 / estudiante', cotizacionDirecta: false, destacado: true },
  { nombre: 'Colegio', cupos: 'Sin límite de cupos', precio: 'Cotización directa', cotizacionDirecta: true, destacado: false },
];

const PLANES_BACHILLERATO: PlanInstitucional[] = [
  { nombre: 'Básico', cupos: '15 cupos grado 10 + 15 cupos grado 11', precio: '$21.000 (g10) / $30.000 (g11)', cotizacionDirecta: false, destacado: false },
  { nombre: 'Plus', cupos: '50 cupos grado 10 + 50 cupos grado 11', precio: '$19.000 (g10) / $28.000 (g11)', cotizacionDirecta: false, destacado: true },
  { nombre: 'Colegio', cupos: 'Sin límite de cupos', precio: 'Cotización directa', cotizacionDirecta: true, destacado: false },
];

export default function PlanesPage() {
  const [audiencia, setAudiencia] = useState<Audiencia>('estudiante');
  const [linea, setLinea] = useState<Linea>('once');
  const [planVentasSeleccionado, setPlanVentasSeleccionado] = useState<
    PlanInstitucional['nombre'] | null
  >(null);

  const planesInstitucionales = linea === 'once' ? PLANES_ONCE : PLANES_BACHILLERATO;
  const audienciaIndex = Object.keys(AUDIENCIA_LABELS).indexOf(audiencia);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', color: '#1a2a3a', fontFamily: 'system-ui, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#146C94', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1250, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logotipo colorTexto="#ffffff" colorAcento="#8DD8FF" />
          </Link>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link href="/login" style={{ color: '#ffffff', textDecoration: 'none', fontSize: 16, fontWeight: 500, padding: '8px 12px' }}>
              Iniciar sesión
            </Link>
            <Link href="/registro" style={{ backgroundColor: '#8DD8FF', color: '#1a2a3a', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 16, fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER CON TOGGLE ANIMADO: ESTUDIANTE / COLEGIO */}
      <section style={{ padding: '64px 24px 48px', textAlign: 'center' }}>
        <p style={{ color: '#19A7CE', fontWeight: 600, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
          Sin sorpresas
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#1a2a3a', marginBottom: 16 }}>
          Un solo pago. Todo el calendario.
        </h1>
        <p style={{ fontSize: 17, color: '#4a5a6a', maxWidth: 520, margin: '0 auto 40px' }}>
          Tu plan vence 1-2 días antes de tu fecha real de presentación del ICFES, para que llegues descansado.
        </p>

        <div style={{
          position: 'relative',
          display: 'inline-grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          backgroundColor: '#D2E0FB',
          borderRadius: 50,
          padding: 4,
          margin: '0 auto',
        }}>
          <div style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: 4,
            width: 'calc((100% - 8px) / 2)',
            backgroundColor: '#146C94',
            borderRadius: 50,
            transform: `translateX(${audienciaIndex * 100}%)`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1,
          }} />
          {(Object.keys(AUDIENCIA_LABELS) as Audiencia[]).map((aud) => (
            <button
              key={aud}
              onClick={() => setAudiencia(aud)}
              style={{
                position: 'relative',
                zIndex: 2,
                padding: '10px 32px',
                borderRadius: 50,
                border: 'none',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: audiencia === aud ? '#ffffff' : '#4a5a6a',
                transition: 'color 0.3s ease',
              }}
            >
              {AUDIENCIA_LABELS[aud]}
            </button>
          ))}
        </div>
      </section>

      {/* ─── ESTUDIANTE INDIVIDUAL ─────────────────────────────── */}
      {audiencia === 'estudiante' && (
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, alignItems: 'start' }}>

            {/* Prueba gratis */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: '36px 28px', border: '1px solid #AFD3E2', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Prueba gratis</h2>
              <p style={{ fontSize: 13, color: '#4a5a6a', marginBottom: 20 }}>
                Conoce la plataforma sin compromiso.
              </p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#146C94' }}>$0</span>
                <span style={{ fontSize: 13, color: '#8a9aaa', display: 'block', marginTop: 4 }}>3 días de acceso</span>
              </div>
              <Link
                href="/registro"
                style={{ display: 'block', textAlign: 'center', backgroundColor: '#146C94', color: '#ffffff', padding: '13px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}
              >
                Registrarme gratis
              </Link>
            </div>

            {/* Grado 11 (destacado) */}
            <div style={{ backgroundColor: '#146C94', borderRadius: 20, padding: '36px 28px', boxShadow: '0 12px 32px rgba(20,108,148,0.30)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#8DD8FF', color: '#1a2a3a', fontSize: 12, fontWeight: 800, padding: '5px 18px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                Más popular
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>Grado 11</h2>
              <p style={{ fontSize: 13, color: '#D2E0FB', marginBottom: 20 }}>
                Todo lo que necesitas para presentar el ICFES.
              </p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#8DD8FF' }}>$35.000</span>
                <span style={{ fontSize: 13, color: '#D2E0FB', display: 'block', marginTop: 4 }}>hasta 1-2 días antes de tu examen</span>
              </div>
              <BotonPagoEpayco grado="ONCE" etiqueta="Comprar" precio="$35.000" destacado />
            </div>

            {/* Grado 10 */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: '36px 28px', border: '1px solid #AFD3E2', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Grado 10</h2>
              <p style={{ fontSize: 13, color: '#4a5a6a', marginBottom: 20 }}>
                Adelántate y llega listo a once.
              </p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#146C94' }}>$25.000</span>
                <span style={{ fontSize: 13, color: '#8a9aaa', display: 'block', marginTop: 4 }}>hasta 1-2 días antes de tu examen</span>
              </div>
              <BotonPagoEpayco grado="DECIMO" etiqueta="Comprar" precio="$25.000" />
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#8a9aaa', marginTop: 32 }}>
            ¿Eres profesor o director y quieres esto para todo tu curso?{' '}
            <button
              onClick={() => setAudiencia('colegio')}
              style={{ background: 'none', border: 'none', color: '#146C94', fontWeight: 700, cursor: 'pointer', fontSize: 13, textDecoration: 'underline', padding: 0 }}
            >
              Ver planes de colegio
            </button>
          </p>
        </section>
      )}

      {/* ─── COLEGIO / INSTITUCIÓN ──────────────────────────────── */}
      {audiencia === 'colegio' && (
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 40, flexWrap: 'wrap' }}>
            {(Object.keys(LINEA_LABELS) as Linea[]).map((l) => (
              <button
                key={l}
                onClick={() => setLinea(l)}
                style={{
                  padding: '9px 20px',
                  borderRadius: 30,
                  border: linea === l ? 'none' : '1.5px solid #AFD3E2',
                  backgroundColor: linea === l ? '#146C94' : '#ffffff',
                  color: linea === l ? '#ffffff' : '#4a5a6a',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {LINEA_LABELS[l]}
              </button>
            ))}
          </div>

          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, alignItems: 'start' }}>
            {planesInstitucionales.map((plan) => (
              <div
                key={plan.nombre}
                style={{
                  backgroundColor: plan.destacado ? '#146C94' : '#ffffff',
                  borderRadius: 20,
                  padding: '36px 28px',
                  border: plan.destacado ? 'none' : '1px solid #AFD3E2',
                  boxShadow: plan.destacado ? '0 12px 32px rgba(20,108,148,0.30)' : '0 2px 12px rgba(0,0,0,0.06)',
                  position: 'relative',
                }}
              >
                {plan.destacado && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#8DD8FF', color: '#1a2a3a', fontSize: 12, fontWeight: 800, padding: '5px 18px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    Más popular
                  </div>
                )}
                <h2 style={{ fontSize: 24, fontWeight: 800, color: plan.destacado ? '#ffffff' : '#1a2a3a', marginBottom: 6 }}>
                  {linea === 'once' ? 'Once' : 'Bachillerato'} {plan.nombre}
                </h2>
                <p style={{ fontSize: 13, color: plan.destacado ? '#D2E0FB' : '#4a5a6a', marginBottom: 20 }}>
                  {plan.cupos}
                </p>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: plan.cotizacionDirecta ? 22 : 28, fontWeight: 900, color: plan.destacado ? '#8DD8FF' : '#146C94' }}>
                    {plan.precio}
                  </span>
                </div>

                <button
                  onClick={() => setPlanVentasSeleccionado(plan.nombre)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    backgroundColor: plan.destacado ? '#8DD8FF' : '#146C94',
                    color: plan.destacado ? '#1a2a3a' : '#ffffff',
                    padding: '13px',
                    borderRadius: 10,
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  Hablar con ventas
                </button>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#8a9aaa', marginTop: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            El plan de colegio no es autoregistro: escríbenos, acordamos los detalles y nosotros creamos la cuenta
            de tu institución lista para usar.
          </p>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#1a2a3a', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: '#8DD8FF', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
          Saber<span style={{ color: '#ffffff' }}>Plus</span>
        </p>
        <p style={{ color: '#AFD3E2', fontSize: 13 }}>
          © 2026 SaberPlus. Todos los derechos reservados.
        </p>
      </footer>

      {/* ─── PUNTO 11: formulario "Hablar con ventas" ─────────── */}
      <FormularioVentas
        abierto={planVentasSeleccionado !== null}
        onCerrar={() => setPlanVentasSeleccionado(null)}
        linea={linea === 'once' ? 'ONCE' : 'BACHILLERATO'}
        lineaEtiqueta={linea === 'once' ? 'Once' : 'Bachillerato'}
        plan={planVentasSeleccionado ?? 'Básico'}
      />
    </div>
  );
}