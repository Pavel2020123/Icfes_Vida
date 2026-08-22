'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MenuLateral from '../../components/MenuLateral';
import {
  obtenerProgresoSimulacros,
  obtenerResumenReferidos,
  obtenerToken,
  type ResumenReferidos,
} from '../../lib/api';
import { decodificarToken } from '../../lib/auth';

const moneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const fecha = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

interface Progreso {
  porcentajeGeneral: number;
  temasCompletados: number;
  totalSubtemas: number;
}

export default function ReferidosPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('Estudiante');
  const [resumen, setResumen] = useState<ResumenReferidos | null>(null);
  const [progreso, setProgreso] = useState<Progreso>({
    porcentajeGeneral: 0,
    temasCompletados: 0,
    totalSubtemas: 0,
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const token = obtenerToken();
    const usuario = decodificarToken(token);
    if (!usuario) {
      router.push('/login');
      return;
    }
    if (usuario.rol !== 'ESTUDIANTE') {
      router.push('/dashboard');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNombre(usuario.nombre || 'Estudiante');
    Promise.all([
      obtenerResumenReferidos(),
      obtenerProgresoSimulacros().catch(() => null),
    ])
      .then(([datos, progresoDatos]) => {
        setResumen(datos);
        if (progresoDatos) setProgreso(progresoDatos);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la informacion.');
      })
      .finally(() => setCargando(false));
  }, [router]);

  const copiarEnlace = async () => {
    if (!resumen) return;
    try {
      await navigator.clipboard.writeText(resumen.enlace);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1800);
    } catch {
      setError('No se pudo copiar el enlace. Selecciónalo y cópialo manualmente.');
    }
  };

  if (cargando) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: '#F6F1F1', color: 'var(--color-primario, #146c94)', fontWeight: 700 }}>Cargando...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', color: '#1a2a3a', fontFamily: 'system-ui, sans-serif' }}>
      <MenuLateral nombre={nombre} progresoGeneral={progreso.porcentajeGeneral} temasCompletados={progreso.temasCompletados} totalSubtemas={progreso.totalSubtemas} />

      <nav style={{ height: 64, backgroundColor: 'var(--color-primario, #146c94)', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1020, margin: '0 auto', padding: '0 24px 0 72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <strong style={{ color: 'var(--color-sobre-primario, #ffffff)', fontSize: 20 }}>Invitar y ganar</strong>
          <Link href="/dashboard" style={{ color: 'var(--marca-superficie-fuerte, #d2e0fb)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Volver al inicio</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 1020, margin: '0 auto', padding: '36px 24px 56px' }}>
        {error ? (
          <div style={{ padding: 16, backgroundColor: '#FCD8CD', border: '1px solid #BC7C7C', borderRadius: 6, color: '#762F2F' }}>{error}</div>
        ) : resumen && (
          <>
            <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(220px, 0.7fr)', gap: 20, alignItems: 'stretch' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--marca-borde, #afd3e2)', borderRadius: 8, padding: 24 }}>
                <p style={{ margin: 0, color: '#5A6A78', fontSize: 14 }}>Tu enlace personal</p>
                <h1 style={{ margin: '6px 0 8px', fontSize: 24, letterSpacing: 0 }}>Invita a estudiar contigo</h1>
                <p style={{ margin: '0 0 20px', color: '#5A6A78', lineHeight: 1.55 }}>
                  Recibes {moneda.format(resumen.recompensaPorReferidoCop)} cuando la persona invitada completa su primer pago aprobado.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 260px', minWidth: 0, border: '1px solid var(--marca-borde, #afd3e2)', backgroundColor: 'var(--marca-superficie, #f0f7fc)', borderRadius: 6, padding: '12px 14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>{resumen.enlace}</div>
                  <button onClick={() => void copiarEnlace()} style={{ border: 'none', borderRadius: 6, padding: '0 18px', minHeight: 44, backgroundColor: copiado ? '#16805E' : 'var(--color-primario, #146c94)', color: copiado ? '#ffffff' : 'var(--color-sobre-primario, #ffffff)', fontWeight: 700, cursor: 'pointer' }}>
                    {copiado ? 'Copiado' : 'Copiar enlace'}
                  </button>
                </div>
                <p style={{ margin: '14px 0 0', fontSize: 13, color: '#5A6A78' }}>Código: <strong style={{ color: '#1a2a3a', letterSpacing: 0 }}>{resumen.codigo}</strong></p>
              </div>

              <div style={{ backgroundColor: 'var(--marca-profunda, #123e52)', color: '#ffffff', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--marca-borde, #afd3e2)', fontSize: 14 }}>Saldo disponible</span>
                <strong style={{ fontSize: 32, letterSpacing: 0 }}>{moneda.format(resumen.saldoReferidosCop)}</strong>
                <span style={{ color: 'var(--marca-borde, #afd3e2)', fontSize: 13, lineHeight: 1.45 }}>Se descuenta automáticamente en tu próxima compra individual.</span>
              </div>
            </section>

            <section style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', border: '1px solid var(--marca-borde, #afd3e2)', borderRadius: 8, overflow: 'hidden', backgroundColor: '#ffffff' }}>
              {[
                ['Invitados', resumen.totalReferidos],
                ['Pendientes de pago', resumen.referidosPendientes],
                ['Recompensados', resumen.referidosRecompensados],
              ].map(([etiqueta, valor], indice) => (
                <div key={String(etiqueta)} style={{ padding: 20, borderLeft: indice ? '1px solid var(--marca-borde, #afd3e2)' : 'none' }}>
                  <strong style={{ display: 'block', fontSize: 25 }}>{valor}</strong>
                  <span style={{ color: '#5A6A78', fontSize: 13 }}>{etiqueta}</span>
                </div>
              ))}
            </section>

            <section style={{ marginTop: 30 }}>
              <h2 style={{ fontSize: 19, margin: '0 0 12px', letterSpacing: 0 }}>Actividad de tus invitaciones</h2>
              {resumen.referidos.length === 0 ? (
                <div style={{ padding: 28, backgroundColor: '#ffffff', border: '1px solid var(--marca-borde, #afd3e2)', borderRadius: 8, color: '#5A6A78', textAlign: 'center' }}>Todavía no has compartido una invitación.</div>
              ) : (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--marca-borde, #afd3e2)', borderRadius: 8, overflow: 'hidden' }}>
                  {resumen.referidos.map((item, indice) => (
                    <div key={item.id} style={{ minHeight: 68, padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center', borderTop: indice ? '1px solid #E6EEF1' : 'none' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: 14 }}>{item.nombre}</strong>
                        <span style={{ color: '#6A7884', fontSize: 12 }}>Se registró el {fecha.format(new Date(item.fechaRegistro))}</span>
                      </div>
                      <span style={{ color: item.estado === 'RECOMPENSADO' ? '#16805E' : '#8A6500', backgroundColor: item.estado === 'RECOMPENSADO' ? '#E8F5EF' : '#FFF6D8', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 700 }}>
                        {item.estado === 'RECOMPENSADO' ? `+${moneda.format(item.recompensaCop)}` : 'Pago pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <style jsx>{`
        @media (max-width: 720px) {
          section { grid-template-columns: 1fr !important; }
          section > div { border-left: none !important; }
        }
      `}</style>
    </div>
  );
}
