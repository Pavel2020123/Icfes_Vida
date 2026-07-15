'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { crearInstitucion } from '../../../lib/api';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function CrearInstitucionPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [colorPrimario, setColorPrimario] = useState('#146C94');
  const [colorSecundario, setColorSecundario] = useState('#19A7CE');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await crearInstitucion(nombre.trim(), mensaje.trim(), logoUrl.trim() || undefined, colorPrimario, colorSecundario);
      router.push('/institucion');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la institución');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ProtectedRoute rolesPermitidos={['PROFESOR']}>
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', padding: 24 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 24, padding: 32, boxShadow: '0 12px 40px rgba(20,108,148,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: '#1a2a3a', marginBottom: 8 }}>Crear institución</h1>
            <p style={{ color: '#4a5a6a', fontSize: 16 }}>Define el nombre de tu institución, su imagen y colores para que los estudiantes sientan que este espacio es suyo.</p>
          </div>
          <Link href="/institucion" style={{ textDecoration: 'none' }}>
            <button style={{ backgroundColor: '#F0F7FC', color: '#146C94', borderRadius: 14, padding: '12px 18px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Volver a institución
            </button>
          </Link>
        </div>

        {error && (
          <div style={{ marginBottom: 20, backgroundColor: '#FDE8E4', borderRadius: 14, padding: 16, color: '#7A2A2A' }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>Nombre de la institución</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Colegio Santa María"
              style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid #AFD3E2', fontSize: 15 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>Mensaje de bienvenida</label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Bienvenidos al espacio oficial de preparación ICFES"
              rows={4}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid #AFD3E2', fontSize: 15, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>Logo (URL opcional)</label>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid #AFD3E2', fontSize: 15 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>Color primario</label>
              <input
                type="color"
                value={colorPrimario}
                onChange={(e) => setColorPrimario(e.target.value)}
                style={{ width: '100%', height: 56, borderRadius: 14, border: '1.5px solid #AFD3E2', padding: 6, cursor: 'pointer' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>Color secundario</label>
              <input
                type="color"
                value={colorSecundario}
                onChange={(e) => setColorSecundario(e.target.value)}
                style={{ width: '100%', height: 56, borderRadius: 14, border: '1.5px solid #AFD3E2', padding: 6, cursor: 'pointer' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              backgroundColor: '#146C94',
              color: '#ffffff',
              borderRadius: 14,
              padding: '16px 20px',
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              cursor: cargando ? 'not-allowed' : 'pointer',
            }}
          >
            {cargando ? 'Creando...' : 'Crear institución'}
          </button>
        </form>
      </div>
    </div>
    </ProtectedRoute>
  );
}
