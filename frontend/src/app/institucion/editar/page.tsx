'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  actualizarInstitucion,
  eliminarInstitucion,
  eliminarLogoInstitucion,
  guardarToken,
  obtenerMiInstitucion,
  obtenerUrlLogo,
  subirLogoInstitucion,
} from '../../../lib/api';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useBranding } from '../../../context/ThemeContext';

const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
const TAMANO_MAXIMO_BYTES = 3 * 1024 * 1024; // 3MB, igual que el backend
export default function EditarInstitucionPage() {
  const router = useRouter();
  const { refrescarBranding } = useBranding();
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [logoUrl, setLogoUrl] = useState(''); // ruta que devuelve el backend (o vacío si no hay logo)
  const [colorPrimario, setColorPrimario] = useState('#146C94');
  const [colorSecundario, setColorSecundario] = useState('#19A7CE');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Subida/eliminación del logo real (archivo, no URL de texto)
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [eliminandoLogo, setEliminandoLogo] = useState(false);
  const [errorLogo, setErrorLogo] = useState('');

  // Zona de peligro: eliminar institución
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [textoConfirmacion, setTextoConfirmacion] = useState('');
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  // PASO 4: Cargar los datos de la institución al iniciar
  useEffect(() => {
    obtenerMiInstitucion()
      .then((institucion) => {
        setNombre(institucion.nombre || '');
        setMensaje(institucion.mensajeBienvenida || '');
        setLogoUrl(institucion.logoUrl || '');
        setColorPrimario(institucion.colorPrimario || '#146C94');
        setColorSecundario(institucion.colorSecundario || '#19A7CE');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la institución');
      })
      .finally(() => {
        setCargandoDatos(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // PASO 5: Usar actualizarInstitucion. El logo ya no viaja acá: se
      // sube/elimina aparte con su propio endpoint (ver handlers de logo).
      await actualizarInstitucion(nombre.trim(), mensaje.trim(), undefined, colorPrimario, colorSecundario);
      await refrescarBranding();
      router.push('/institucion');
    } catch (err: unknown) {
      // PASO 6: Cambiar mensaje de error
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la institución');
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionarArchivo = () => {
    setErrorLogo('');
    inputArchivoRef.current?.click();
  };

  const handleArchivoElegido = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo después

    if (!archivo) return;

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      setErrorLogo('Solo se permiten imágenes en formato PNG, JPG, WEBP o GIF.');
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_BYTES) {
      setErrorLogo('La imagen no puede pesar más de 3MB.');
      return;
    }

    setErrorLogo('');
    setSubiendoLogo(true);
    try {
      const institucionActualizada = await subirLogoInstitucion(archivo);
      setLogoUrl(institucionActualizada.logoUrl || '');
      // Actualiza el navbar/sidebar de inmediato y avisa a otras pestañas.
      await refrescarBranding();
    } catch (err: unknown) {
      setErrorLogo(err instanceof Error ? err.message : 'No se pudo subir el logo');
    } finally {
      setSubiendoLogo(false);
    }
  };

  const handleEliminarLogo = async () => {
    setErrorLogo('');
    setEliminandoLogo(true);
    try {
      await eliminarLogoInstitucion();
      setLogoUrl('');
      await refrescarBranding();
    } catch (err: unknown) {
      setErrorLogo(err instanceof Error ? err.message : 'No se pudo eliminar el logo');
    } finally {
      setEliminandoLogo(false);
    }
  };

  const handleEliminarInstitucion = async () => {
    if (textoConfirmacion.trim() !== nombre.trim()) return;
    setErrorEliminar('');
    setEliminando(true);
    try {
      const respuesta = await eliminarInstitucion();
      guardarToken(respuesta.accessToken);
      await refrescarBranding();
      router.push('/dashboard');
    } catch (err: unknown) {
      setErrorEliminar(err instanceof Error ? err.message : 'No se pudo eliminar la institución');
      setEliminando(false);
    }
  };

  // PASO 8: Pantalla de carga mientras se obtienen los datos
  if (cargandoDatos) {
    return (
      <ProtectedRoute rolesPermitidos={['PROFESOR']}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h2>Cargando institución...</h2>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute rolesPermitidos={['PROFESOR']}>
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F1F1', padding: 24 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 24, padding: 32, boxShadow: '0 12px 40px rgba(20,108,148,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div>
              {/* Cambié el título a "Editar institución" por coherencia */}
              <h1 style={{ fontSize: 30, fontWeight: 900, color: '#1a2a3a', marginBottom: 8 }}>Editar institución</h1>
              <p style={{ color: '#4a5a6a', fontSize: 16 }}>Modifica el nombre de tu institución, su imagen y colores para que los estudiantes sientan que este espacio es suyo.</p>
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

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              gap: 30,
              alignItems: 'start',
            }}
          >
            {/* COLUMNA IZQUIERDA: Formulario */}
            <div style={{ display: 'grid', gap: 20 }}>
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
                <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 16,
                      border: '1.5px solid #AFD3E2',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#F6F1F1',
                      flexShrink: 0,
                    }}
                  >
                    {logoUrl ? (
                      <img
                        src={obtenerUrlLogo(logoUrl) ?? undefined}
                        alt="Logo actual"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: 24, fontWeight: 900, color: colorPrimario }}>
                        {nombre ? nombre.charAt(0).toUpperCase() : 'I'}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <input
                        ref={inputArchivoRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleArchivoElegido}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={handleSeleccionarArchivo}
                        disabled={subiendoLogo || eliminandoLogo}
                        style={{
                          backgroundColor: '#F0F7FC',
                          color: '#146C94',
                          border: '1.5px solid #AFD3E2',
                          borderRadius: 12,
                          padding: '10px 16px',
                          fontWeight: 700,
                          cursor: subiendoLogo || eliminandoLogo ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {subiendoLogo ? 'Subiendo...' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
                      </button>
                      {logoUrl && (
                        <button
                          type="button"
                          onClick={handleEliminarLogo}
                          disabled={subiendoLogo || eliminandoLogo}
                          style={{
                            backgroundColor: '#FDE8E4',
                            color: '#7A2A2A',
                            border: '1.5px solid #F1BCBC',
                            borderRadius: 12,
                            padding: '10px 16px',
                            fontWeight: 700,
                            cursor: subiendoLogo || eliminandoLogo ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {eliminandoLogo ? 'Eliminando...' : 'Eliminar logo'}
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: '#7a8a9a', margin: 0 }}>
                      PNG, JPG, WEBP o GIF · máximo 3MB. Se sube desde tu computador, no hace falta un enlace.
                    </p>
                    {errorLogo && (
                      <p style={{ fontSize: 13, color: '#C24B4B', margin: 0 }}>{errorLogo}</p>
                    )}
                  </div>
                </div>
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
            </div>

            {/* COLUMNA DERECHA: Vista previa en tiempo real */}
            <div
              style={{
                position: 'sticky',
                top: 24,
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  border: '1px solid #E5E7EB',
                }}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                    height: 120,
                  }}
                />

                <div
                  style={{
                    padding: 25,
                    marginTop: -50,
                    textAlign: 'center',
                  }}
                >
                  {logoUrl ? (
                    <img
                      src={obtenerUrlLogo(logoUrl) ?? undefined}
                      alt="Logo"
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        background: '#fff',
                        border: '4px solid white',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        background: '#F3F4F6',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 34,
                        fontWeight: 900,
                        color: colorPrimario,
                        border: '4px solid white',
                      }}
                    >
                      {nombre ? nombre.charAt(0).toUpperCase() : 'I'}
                    </div>
                  )}

                  <h2
                    style={{
                      marginTop: 18,
                      marginBottom: 8,
                      fontSize: 22,
                      fontWeight: 800,
                    }}
                  >
                    {nombre || 'Nombre de la institución'}
                  </h2>

                  <p
                    style={{
                      color: '#666',
                      fontSize: 14,
                      minHeight: 50,
                    }}
                  >
                    {mensaje ||
                      'Aquí aparecerá el mensaje de bienvenida para los estudiantes.'}
                  </p>

                  <button
                    type="button"
                    style={{
                      marginTop: 20,
                      background: colorPrimario,
                      color: '#fff',
                      border: 'none',
                      padding: '12px 22px',
                      borderRadius: 12,
                      fontWeight: 700,
                    }}
                  >
                    Vista previa del botón
                  </button>

                  <div
                    style={{
                      marginTop: 20,
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: colorPrimario,
                      }}
                    />

                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: colorSecundario,
                      }}
                    />
                  </div>

                  <p
                    style={{
                      marginTop: 20,
                      fontSize: 12,
                      color: '#888',
                    }}
                  >
                    Así verán tu institución los estudiantes.
                  </p>
                </div>
              </div>
            </div>

            {/* PASO 7: Botón de Guardar cambios */}
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
                marginTop: 10,
              }}
            >
              {cargando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>

          {/* Zona de peligro: eliminar institución */}
          <div style={{ marginTop: 40, borderTop: '1px solid #F1D9D9', paddingTop: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#7A2A2A', marginBottom: 8 }}>Zona de peligro</h3>
            <p style={{ color: '#4a5a6a', fontSize: 14, marginBottom: 16 }}>
              Eliminar la institución es una acción permanente. Se borrarán todos los grupos y se desvincularán todos los estudiantes y profesores.
            </p>

            {!mostrarEliminar ? (
              <button
                type="button"
                onClick={() => setMostrarEliminar(true)}
                style={{ backgroundColor: '#FDE8E4', color: '#7A2A2A', border: '1.5px solid #F1BCBC', borderRadius: 14, padding: '12px 20px', fontWeight: 700, cursor: 'pointer' }}
              >
                Eliminar institución
              </button>
            ) : (
              <div style={{ backgroundColor: '#FFF5F5', border: '1.5px solid #F1BCBC', borderRadius: 16, padding: 20 }}>
                <p style={{ fontSize: 14, color: '#7A2A2A', marginBottom: 12 }}>
                  Para confirmar, escribe el nombre de la institución (<strong>{nombre}</strong>) y presiona eliminar. Esta acción no se puede deshacer.
                </p>
                <input
                  value={textoConfirmacion}
                  onChange={(e) => setTextoConfirmacion(e.target.value)}
                  placeholder={nombre}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #F1BCBC', fontSize: 15, marginBottom: 12 }}
                />
                {errorEliminar && (
                  <p style={{ color: '#7A2A2A', fontSize: 13, marginBottom: 12 }}>{errorEliminar}</p>
                )}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={handleEliminarInstitucion}
                    disabled={textoConfirmacion.trim() !== nombre.trim() || eliminando}
                    style={{
                      backgroundColor: '#C24B4B',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '12px 20px',
                      fontWeight: 700,
                      cursor: textoConfirmacion.trim() === nombre.trim() && !eliminando ? 'pointer' : 'not-allowed',
                      opacity: textoConfirmacion.trim() === nombre.trim() && !eliminando ? 1 : 0.6,
                    }}
                  >
                    {eliminando ? 'Eliminando...' : 'Sí, eliminar definitivamente'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarEliminar(false);
                      setTextoConfirmacion('');
                      setErrorEliminar('');
                    }}
                    style={{ backgroundColor: '#F0F7FC', color: '#146C94', border: 'none', borderRadius: 12, padding: '12px 20px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}