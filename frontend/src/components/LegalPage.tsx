import Link from 'next/link';

export function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return <main style={{ minHeight: '100vh', background: '#F6F1F1', color: '#1a2a3a', fontFamily: 'system-ui, sans-serif' }}><header style={{ background: '#1a2a3a', padding: '18px 24px' }}><Link href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: 20 }}>Saber<span style={{ color: '#8DD8FF' }}>Plus</span></Link></header><article style={{ maxWidth: 850, margin: '0 auto', padding: '56px 24px 72px', lineHeight: 1.65 }}><Link href="/" style={{ color: '#146C94', fontWeight: 700 }}>← Volver al inicio</Link><h1 style={{ fontSize: 34, margin: '20px 0 6px' }}>{title}</h1><p style={{ color: '#64748b', marginBottom: 34 }}>Última actualización: 12 de agosto de 2026</p>{children}</article></main>;
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) { return <section style={{ marginTop: 28 }}><h2 style={{ fontSize: 20, marginBottom: 8 }}>{title}</h2>{children}</section>; }
