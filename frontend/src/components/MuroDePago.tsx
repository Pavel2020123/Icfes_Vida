'use client';

import Link from 'next/link';

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
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.5, margin: '0 0 28px' }}>
          Activa un plan para seguir practicando, viendo tus temas y presentando simulacros.
        </p>
        <Link
          href="/planes"
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
          Ver planes
        </Link>
      </div>
    </div>
  );
}