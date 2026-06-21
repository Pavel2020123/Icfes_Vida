'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerToken } from '../../lib/api';
import MenuLateral from '../../components/MenuLateral';

interface Perfil {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  xpTotal: number;
  fechaCreacion: string;
  fotoPerfil: string | null;
  descripcion: string | null;
}

interface Progreso {
  porcentajeGeneral: number;
  temasCompletados: number;
  totalSubtemas: number;
}

export default function PerfilPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [progreso, setProgreso] = useState<Progreso>({ porcentajeGeneral: 0, temasCompletados: 0, totalSubtemas: 0 });
  const [editando, setEditando] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = obtenerToken();
    if (!token) { router.push('/login'); return; }

    Promise.all([
      fetch('http://localhost:3000/auth/perfil', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch('http://localhost:3000/simulacros/progreso', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
    ])
      .then(([perfilData, progresoData]) => {
        setPerfil(perfilData);
        setDescripcion(perfilData.descripcion ?? '');
        setFotoPreview(perfilData.fotoPerfil ?? null);
        setProgreso(progresoData);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [router]);

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const guardarPerfil = async () => {
    const token = obtenerToken();
    if (!token) return;
    setGuardando(true);
    try {
      await fetch('http://localhost:3000/auth/perfil', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          descripcion,
          fotoPerfil: fotoPreview,
        }),
      });
      setMensaje('Perfil actualizado');
      setEditando(false);
      setTimeout(() => setMensaje(''), 3000);
    } catch {
      setMensaje('Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#146C94', fontSize: 18, fontWeight: 600 }}>Cargando...</p>
      </div>
    );
  }

  if (!perfil) return null;

  const iniciales = perfil.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', fontFamily: 'system-ui, sans-serif' }}>

      <MenuLateral
        nombre={perfil.nombre}
        progresoGeneral={progreso.porcentajeGeneral}
        temasCompletados={progreso.temasCompletados}
        totalSubtemas={progreso.totalSubtemas}
      />

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#146C94', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 0 72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>
              Saber<span style={{ color: '#8DD8FF' }}>Plus</span>
            </span>
          </Link>
          <Link href="/dashboard" style={{ color: '#D2E0FB', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            ← Volver al inicio
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>

        {/* Mensaje de éxito */}
        {mensaje && (
          <div style={{
            backgroundColor: '#D2E0FB',
            border: '1px solid #AFD3E2',
            borderRadius: 10,
            padding: '12px 20px',
            marginBottom: 24,
            color: '#146C94',
            fontWeight: 600,
            fontSize: 14,
            textAlign: 'center',
          }}>
            {mensaje}
          </div>
        )}

        {/* CARD PRINCIPAL */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1.5px solid #AFD3E2',
          boxShadow: '0 4px 20px rgba(20,108,148,0.08)',
          marginBottom: 24,
        }}>

          {/* Header azul */}
          <div style={{
            background: 'linear-gradient(135deg, #146C94 0%, #19A7CE 100%)',
            padding: '40px 36px 80px',
            position: 'relative',
          }} />

          {/* Foto y nombre */}
          <div style={{ padding: '0 36px 36px', marginTop: -60 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 24 }}>

              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: '4px solid #ffffff',
                  overflow: 'hidden',
                  backgroundColor: '#146C94',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}>
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 32, fontWeight: 900, color: '#ffffff' }}>{iniciales}</span>
                  )}
                </div>

                {editando && (
                  <>
                    <button
                      onClick={() => fileRef.current?.click()}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        backgroundColor: '#8DD8FF',
                        border: '2px solid #ffffff',
                        cursor: 'pointer',
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      +
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFoto}
                      style={{ display: 'none' }}
                    />
                  </>
                )}
              </div>

              <div style={{ paddingBottom: 8 }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1a2a3a', marginBottom: 4 }}>
                  {perfil.nombre}
                </h1>
                <p style={{ color: '#4a5a6a', fontSize: 14 }}>{perfil.correo}</p>
                <span style={{
                  fontSize: 12,
                  backgroundColor: '#D2E0FB',
                  color: '#146C94',
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontWeight: 700,
                  display: 'inline-block',
                  marginTop: 6,
                }}>
                  {perfil.rol === 'ESTUDIANTE' ? 'Estudiante' : 'Profesor'}
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#8a9aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Sobre mí
              </p>
              {editando ? (
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Escribe algo sobre ti... Por ejemplo: Estudiante de grado 11 del colegio San José, preparándome para el ICFES 2025."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1.5px solid #AFD3E2',
                    fontSize: 15,
                    color: '#1a2a3a',
                    backgroundColor: '#F6F1F1',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'system-ui, sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <p style={{ fontSize: 15, color: descripcion ? '#1a2a3a' : '#8a9aaa', lineHeight: 1.6 }}>
                  {descripcion || 'Todavía no has escrito nada sobre ti.'}
                </p>
              )}
            </div>

            {/* Botones */}
            {editando ? (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={guardarPerfil}
                  disabled={guardando}
                  style={{
                    backgroundColor: guardando ? '#AFD3E2' : '#146C94',
                    color: '#ffffff',
                    padding: '11px 28px',
                    borderRadius: 10,
                    border: 'none',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: guardando ? 'not-allowed' : 'pointer',
                  }}
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  onClick={() => { setEditando(false); setDescripcion(perfil.descripcion ?? ''); setFotoPreview(perfil.fotoPerfil ?? null); }}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#4a5a6a',
                    padding: '11px 28px',
                    borderRadius: 10,
                    border: '1.5px solid #AFD3E2',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditando(true)}
                style={{
                  backgroundColor: '#F6F1F1',
                  color: '#146C94',
                  padding: '11px 28px',
                  borderRadius: 10,
                  border: '1.5px solid #AFD3E2',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Editar perfil
              </button>
            )}
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'XP Total', valor: `${perfil.xpTotal ?? 0}`, sub: 'puntos de experiencia' },
            { label: 'Progreso', valor: `${progreso.porcentajeGeneral}%`, sub: 'del curso completado' },
            { label: 'Temas', valor: `${progreso.temasCompletados}/${progreso.totalSubtemas}`, sub: 'temas completados' },
          ].map(stat => (
            <div key={stat.label} style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: '24px 20px',
              border: '1.5px solid #AFD3E2',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(20,108,148,0.06)',
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#8a9aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 28, fontWeight: 900, color: '#146C94', marginBottom: 4 }}>
                {stat.valor}
              </p>
              <p style={{ fontSize: 12, color: '#8a9aaa' }}>{stat.sub}</p>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}