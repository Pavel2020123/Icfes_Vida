'use client';

import { useEffect, useState } from 'react';
import {
  actualizarConfiguracionSoporteAdmin,
  obtenerConfiguracionSoporteAdmin,
} from '../../../lib/api';

interface Props {
  mostrarMensaje: (mensaje: string) => void;
}

export default function SoporteTab({ mostrarMensaje }: Props) {
  const [numeroWhatsapp, setNumeroWhatsapp] = useState('');
  const [mensajeWhatsapp, setMensajeWhatsapp] = useState('');
  const [activo, setActivo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    obtenerConfiguracionSoporteAdmin()
      .then((configuracion) => {
        setNumeroWhatsapp(configuracion.numeroWhatsapp ?? '');
        setMensajeWhatsapp(configuracion.mensajeWhatsapp);
        setActivo(configuracion.activo);
      })
      .catch((error: unknown) => {
        mostrarMensaje(
          error instanceof Error ? error.message : 'No se pudo cargar el soporte',
        );
      })
      .finally(() => setCargando(false));
  }, [mostrarMensaje]);

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setGuardando(true);
    try {
      const configuracion = await actualizarConfiguracionSoporteAdmin({
        numeroWhatsapp,
        mensajeWhatsapp,
        activo,
      });
      setNumeroWhatsapp(configuracion.numeroWhatsapp ?? '');
      setMensajeWhatsapp(configuracion.mensajeWhatsapp);
      setActivo(configuracion.activo);
      mostrarMensaje('Configuración de soporte guardada');
    } catch (error: unknown) {
      mostrarMensaje(
        error instanceof Error ? error.message : 'No se pudo guardar el soporte',
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <p style={{ color: '#5D6C76' }}>Cargando soporte...</p>;
  }

  const inputStyle = {
    width: '100%',
    padding: '11px 12px',
    border: '1px solid #B9CCD5',
    borderRadius: 6,
    backgroundColor: '#F8FAFB',
    color: '#1A2A3A',
    fontSize: 14,
    outline: 'none',
  };

  return (
    <section
      style={{
        maxWidth: 720,
        padding: 28,
        border: '1px solid #CCD8DE',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        boxShadow: '0 5px 18px rgba(30,55,70,0.07)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, marginBottom: 26 }}>
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: 21, color: '#1A2A3A' }}>
            Soporte por WhatsApp
          </h2>
          <p style={{ margin: 0, color: '#667680', fontSize: 14 }}>
            Canal de atención visible para estudiantes, profesores y visitantes.
          </p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 9, color: activo ? '#17694F' : '#687780', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={activo}
            onChange={(evento) => setActivo(evento.target.checked)}
            style={{ width: 18, height: 18, accentColor: '#16805E' }}
          />
          {activo ? 'Activo' : 'Inactivo'}
        </label>
      </div>

      <form onSubmit={guardar} style={{ display: 'grid', gap: 20 }}>
        <label style={{ display: 'grid', gap: 7, color: '#344956', fontSize: 13, fontWeight: 700 }}>
          Número de WhatsApp con indicativo de país
          <input
            type="tel"
            value={numeroWhatsapp}
            onChange={(evento) => setNumeroWhatsapp(evento.target.value)}
            placeholder="+57 300 123 4567"
            maxLength={25}
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: 7, color: '#344956', fontSize: 13, fontWeight: 700 }}>
          Mensaje inicial
          <textarea
            value={mensajeWhatsapp}
            onChange={(evento) => setMensajeWhatsapp(evento.target.value)}
            maxLength={300}
            rows={4}
            required
            style={{ ...inputStyle, resize: 'vertical', minHeight: 96 }}
          />
          <span style={{ justifySelf: 'end', color: '#7B8991', fontSize: 11, fontWeight: 500 }}>
            {mensajeWhatsapp.length}/300
          </span>
        </label>

        <button
          type="submit"
          disabled={guardando}
          style={{
            justifySelf: 'start',
            minWidth: 150,
            padding: '11px 18px',
            border: 'none',
            borderRadius: 6,
            backgroundColor: guardando ? '#AFC7D1' : '#146C94',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 800,
            cursor: guardando ? 'default' : 'pointer',
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </section>
  );
}
