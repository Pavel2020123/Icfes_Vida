'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// ─── TIPOS DEL WIDGET WOMPI ───────────────────────────────────
interface WompiCheckoutConfig {
  currency: string;
  amountInCents: number;
  reference: string;
  publicKey: string;
  redirectUrl: string;
  customerData: {
    email: string;
    fullName: string;
  };
}

interface WompiTransaction {
  status: string;
  id: string;
}

interface WompiCheckoutResult {
  transaction: WompiTransaction;
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

// ─── TIPOS DE LA APP ──────────────────────────────────────────
interface PlanData {
  factura: string;
  publicKey: string;
  test: boolean;
  amount: number;
  currency: string;
  name: string;
  description: string;
  email: string;
  nombre: string;
  tipoPlan: string;
}

export default function PagosPage() {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'MENSUAL' | 'TEMPORADA_A' | 'TEMPORADA_B'>('MENSUAL');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetch('/api/pagos/crear-orden', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ grado: 'DECIMO', tipoPlan: selectedPlan }),
    })
      .then((r) => r.json())
      .then((data: PlanData) => {
        setPlan(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedPlan]);

  const handlePayment = () => {
    if (!plan) return;

    const WidgetCheckout = window.WidgetCheckout;
    if (!WidgetCheckout) {
      alert('El widget de Wompi no está disponible. Recarga la página.');
      return;
    }

    const checkout = new WidgetCheckout({
      currency: plan.currency,
      amountInCents: plan.amount * 100,
      reference: plan.factura,
      publicKey: plan.publicKey,
      redirectUrl: `${window.location.origin}/pagos/respuesta`,
      customerData: {
        email: plan.email,
        fullName: plan.nombre,
      },
    });

    checkout.open((result: WompiCheckoutResult) => {
      console.log('Wompi result:', result);
      window.location.href = '/dashboard';
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando...</div>;

  return (
    <>
      <Script
        src="https://checkout.wompi.co/widget.js"
        strategy="lazyOnload"
        onLoad={() => console.log('Wompi widget cargado')}
      />
      <div style={{ maxWidth: 480, margin: '60px auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2a3a', marginBottom: 8 }}>Elige tu plan</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>Acceso ilimitado a todos los simulacros y teoría.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => setSelectedPlan('MENSUAL')}
            style={{
              padding: 16, borderRadius: 12, border: selectedPlan === 'MENSUAL' ? '2px solid #146c94' : '2px solid #e5e5e5',
              background: selectedPlan === 'MENSUAL' ? '#f0f7ff' : '#fff', textAlign: 'left', cursor: 'pointer'
            }}
          >
            <div style={{ fontWeight: 700, color: '#1a2a3a' }}>Mensual — $12.900</div>
            <div style={{ fontSize: 13, color: '#888' }}>Cancela cuando quieras</div>
          </button>

          <button
            onClick={() => setSelectedPlan('TEMPORADA_B')}
            style={{
              padding: 16, borderRadius: 12, border: selectedPlan === 'TEMPORADA_B' ? '2px solid #146c94' : '2px solid #e5e5e5',
              background: selectedPlan === 'TEMPORADA_B' ? '#f0f7ff' : '#fff', textAlign: 'left', cursor: 'pointer'
            }}
          >
            <div style={{ fontWeight: 700, color: '#1a2a3a' }}>Temporada B — $49.900</div>
            <div style={{ fontSize: 13, color: '#888' }}>Abril - Julio (~4 meses)</div>
          </button>

          <button
            onClick={() => setSelectedPlan('TEMPORADA_A')}
            style={{
              padding: 16, borderRadius: 12, border: selectedPlan === 'TEMPORADA_A' ? '2px solid #146c94' : '2px solid #e5e5e5',
              background: selectedPlan === 'TEMPORADA_A' ? '#f0f7ff' : '#fff', textAlign: 'left', cursor: 'pointer'
            }}
          >
            <div style={{ fontWeight: 700, color: '#1a2a3a' }}>Temporada A — $79.900</div>
            <div style={{ fontSize: 13, color: '#888' }}>Agosto - Marzo (~8 meses)</div>
          </button>
        </div>

        <button
          onClick={handlePayment}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 12, background: '#146c94',
            color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer'
          }}
        >
          Pagar con Wompi
        </button>

        <p style={{ marginTop: 16, fontSize: 12, color: '#888', textAlign: 'center' }}>
          🔒 Pagos seguros procesados por Wompi (Bancolombia)
        </p>
      </div>
    </>
  );
}