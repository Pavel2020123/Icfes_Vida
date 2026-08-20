'use client';

import { useEffect, useState } from 'react';
import {
  crearInstitucionDesdeLeadAdmin,
  obtenerLeadsVentasAdmin,
} from '../../../lib/api';
import type { LeadVentasAdmin } from './tipos';

const control = {
  padding: '10px 11px',
  borderRadius: 8,
  border: '1px solid #AFD3E2',
  fontSize: 14,
};

export default function VentasTab({
  mostrarMensaje,
}: {
  mostrarMensaje: (mensaje: string) => void;
}) {
  const [leads, setLeads] = useState<LeadVentasAdmin[]>([]);
  const [lead, setLead] = useState<LeadVentasAdmin | null>(null);
  const [contrasena, setContrasena] = useState('');
  const [cupoTotal, setCupoTotal] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    try {
      setLeads(await obtenerLeadsVentasAdmin());
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar las solicitudes',
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;

    obtenerLeadsVentasAdmin()
      .then((solicitudes) => {
        if (activo) setLeads(solicitudes);
      })
      .catch(() => undefined)
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const abrir = (item: LeadVentasAdmin) => {
    setLead(item);
    setContrasena('');
    setCupoTotal('');
    setVencimiento('');
  };

  const crear = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lead) return;

    try {
      await crearInstitucionDesdeLeadAdmin({
        leadId: lead.id,
        contrasenaTemporal: contrasena,
        planActual: 'Institucional',
        limiteEstudiantes: cupoTotal ? Number(cupoTotal) : undefined,
        fechaVencimientoPlan: vencimiento || undefined,
      });
      mostrarMensaje(`Institución creada para ${lead.nombreColegio}`);
      setLead(null);
      await cargar();
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la institución',
      );
    }
  };

  return (
    <section style={{ padding: 24, border: '1.5px solid #AFD3E2', borderRadius: 8, backgroundColor: '#ffffff' }}>
      <h2 style={{ margin: '0 0 6px', color: '#1a2a3a' }}>
        Ventas e instituciones
      </h2>
      <p style={{ margin: '0 0 20px', color: '#4a5a6a' }}>
        Convierte una propuesta aceptada en una institución con un cupo total para todos sus estudiantes.
      </p>

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        leads.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: 14,
              marginTop: 10,
              border: '1px solid #D2E0FB',
              borderRadius: 8,
            }}
          >
            <span>
              <strong>{item.nombreColegio}</strong>
              <br />
              <small>{item.nombreContacto} · {item.correo}</small>
            </span>
            {item.atendido ? (
              <strong style={{ color: '#238761' }}>Atendido</strong>
            ) : (
              <button
                type="button"
                onClick={() => abrir(item)}
                style={{ ...control, border: 'none', backgroundColor: '#146C94', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
              >
                Crear institución
              </button>
            )}
          </div>
        ))
      )}

      {lead && (
        <div style={{ marginTop: 20, padding: 18, borderTop: '1px solid #D2E0FB' }}>
          <h3 style={{ margin: '0 0 14px' }}>Activar {lead.nombreColegio}</h3>
          <form onSubmit={crear} style={{ display: 'grid', gap: 12 }}>
            <label style={{ color: '#4a5a6a', fontSize: 13 }}>
              Responsable: {lead.nombreContacto} ({lead.correo})
            </label>
            <input
              required
              minLength={8}
              type="password"
              placeholder="Contraseña temporal (mínimo 8 caracteres)"
              value={contrasena}
              onChange={(event) => setContrasena(event.target.value)}
              style={control}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                min={1}
                type="number"
                placeholder="Cupo total de estudiantes"
                value={cupoTotal}
                onChange={(event) => setCupoTotal(event.target.value)}
                style={control}
              />
              <input
                type="date"
                aria-label="Vencimiento institucional"
                value={vencimiento}
                onChange={(event) => setVencimiento(event.target.value)}
                style={control}
              />
            </div>
            <div>
              <button type="button" onClick={() => setLead(null)} style={{ ...control, marginRight: 8, backgroundColor: '#ffffff' }}>
                Cancelar
              </button>
              <button type="submit" style={{ ...control, border: 'none', backgroundColor: '#146C94', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}>
                Crear y marcar atendido
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
