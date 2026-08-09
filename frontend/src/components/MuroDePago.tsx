'use client';

import Link from 'next/link';
import BotonPagoEpayco from './BotonPagoEpayco';

export default function MuroDePago() {
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
      <div style={{
        maxWidth: 480,
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: '40px 32px',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⏳</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#146C94', margin: '0 0 12px' }}>
          Tu prueba gratis de 3 días terminó
        </h1>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.5, margin: '0 0 24px' }}>
          Activa tu plan según tu grado para seguir practicando, viendo tus temas y presentando simulacros.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <BotonPagoEpayco grado="ONCE" etiqueta="Activar Grado 11" precio="$35.000" destacado />
          <BotonPagoEpayco grado="DECIMO" etiqueta="Activar Grado 10" precio="$25.000" />
        </div>

        <p style={{ fontSize: 12, color: '#999', margin: '0 0 8px' }}>
          Vas a pagar en la página segura de ePayco y volverás aquí automáticamente.
        </p>

        <Link
          href="/planes"
          style={{
            fontSize: 13,
            color: 'var(--color-primario, #146C94)',
            fontWeight: 600,
            textDecoration: 'underline',
          }}
        >
          Ver todos los planes
        </Link>
      </div>
    </div>
  );
}