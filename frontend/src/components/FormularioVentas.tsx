'use client';

import { useState } from 'react';
import Modal from './Modal';
import { crearLeadVentas } from '../lib/api';

// ─── PUNTO 11 DEL ROADMAP ───────────────────────────────────────
// Reemplaza el mailto temporal de /planes. Solo recolecta el contacto:
// el trato (cuántos estudiantes, a qué precio) se sigue cerrando por
// fuera, y luego el admin crea la institución desde el panel (punto 12).

interface FormularioVentasProps {
  abierto: boolean;
  onCerrar: () => void;
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1.5px solid #AFD3E2',
  fontSize: 14,
  color: '#1a2a3a',
  backgroundColor: '#F6F1F1',
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#4a5a6a',
  marginBottom: 6,
  display: 'block',
};

export default function FormularioVentas({
  abierto,
  onCerrar,
}: FormularioVentasProps) {
  const [nombreColegio, setNombreColegio] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [numeroEstudiantesAprox, setNumeroEstudiantesAprox] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  const limpiarYCerrar = () => {
    setNombreColegio('');
    setNombreContacto('');
    setCorreo('');
    setTelefono('');
    setCiudad('');
    setNumeroEstudiantesAprox('');
    setMensaje('');
    setError('');
    setEnviado(false);
    onCerrar();
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombreColegio.trim() || !nombreContacto.trim() || !correo.trim()) {
      setError('Completa el nombre del colegio, tu nombre y tu correo.');
      return;
    }

    setCargando(true);
    try {
      await crearLeadVentas({
        nombreColegio: nombreColegio.trim(),
        nombreContacto: nombreContacto.trim(),
        correo: correo.trim(),
        telefono: telefono.trim() || undefined,
        ciudad: ciudad.trim() || undefined,
        linea: 'BACHILLERATO',
        plan: 'Institucional',
        numeroEstudiantesAprox: numeroEstudiantesAprox
          ? Number(numeroEstudiantesAprox)
          : undefined,
        mensaje: mensaje.trim() || undefined,
      });
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar tu solicitud.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={limpiarYCerrar}
      titulo="Propuesta institucional"
      descripcion={
        enviado
          ? undefined
          : 'Cuéntanos de tu colegio y te contactamos para acordar los detalles.'
      }
      anchoMaximo={480}
    >
      {enviado ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <p style={{ fontSize: 15, color: '#1a2a3a', fontWeight: 600, marginBottom: 8 }}>
            ¡Listo! Ya recibimos tu solicitud.
          </p>
          <p style={{ fontSize: 13.5, color: '#4a5a6a', marginBottom: 20 }}>
            Nuestro equipo te va a escribir pronto a {correo || 'tu correo'} para acordar los detalles.
          </p>
          <button
            onClick={limpiarYCerrar}
            style={{
              backgroundColor: '#146C94',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '11px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nombre del colegio *</label>
            <input
              type="text"
              value={nombreColegio}
              onChange={(e) => setNombreColegio(e.target.value)}
              style={inputStyle}
              placeholder="Colegio San José"
            />
          </div>

          <div>
            <label style={labelStyle}>Tu nombre *</label>
            <input
              type="text"
              value={nombreContacto}
              onChange={(e) => setNombreContacto(e.target.value)}
              style={inputStyle}
              placeholder="Nombre del director o profesor"
            />
          </div>

          <div>
            <label style={labelStyle}>Tu correo *</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              style={inputStyle}
              placeholder="tucorreo@colegio.edu.co"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                style={inputStyle}
                placeholder="300 000 0000"
              />
            </div>
            <div>
              <label style={labelStyle}>Ciudad</label>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                style={inputStyle}
                placeholder="Valledupar"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Número aproximado de estudiantes</label>
            <input
              type="number"
              min={1}
              value={numeroEstudiantesAprox}
              onChange={(e) => setNumeroEstudiantesAprox(e.target.value)}
              style={inputStyle}
              placeholder="120"
            />
          </div>

          <div>
            <label style={labelStyle}>Mensaje (opcional)</label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
              placeholder="Cuéntanos algo más si quieres"
            />
          </div>

          {error && <span style={{ fontSize: 13, color: '#c0392b' }}>{error}</span>}

          <button
            type="submit"
            disabled={cargando}
            style={{
              backgroundColor: '#146C94',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '13px',
              fontSize: 15,
              fontWeight: 700,
              cursor: cargando ? 'default' : 'pointer',
              opacity: cargando ? 0.7 : 1,
            }}
          >
            {cargando ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </form>
      )}
    </Modal>
  );
}
