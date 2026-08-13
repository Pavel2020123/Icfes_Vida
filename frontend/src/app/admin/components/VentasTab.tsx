'use client';

import { useEffect, useState } from 'react';
import { crearInstitucionDesdeLeadAdmin, obtenerLeadsVentasAdmin } from '../../../lib/api';
import type { LeadVentasAdmin } from './tipos';

const control = { padding: '9px', borderRadius: 8, border: '1px solid #AFD3E2', fontSize: 14 };

export default function VentasTab({ mostrarMensaje }: { mostrarMensaje: (mensaje: string) => void }) {
  const [leads, setLeads] = useState<LeadVentasAdmin[]>([]);
  const [lead, setLead] = useState<LeadVentasAdmin | null>(null);
  const [contrasena, setContrasena] = useState('');
  const [plan, setPlan] = useState('');
  const [cupo10, setCupo10] = useState('');
  const [cupo11, setCupo11] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = async () => { setCargando(true); try { setLeads(await obtenerLeadsVentasAdmin()); } catch (e) { mostrarMensaje(e instanceof Error ? e.message : 'No se pudieron cargar los leads'); } finally { setCargando(false); } };
  // Carga inicial de un recurso remoto; el estado se actualiza al resolver la petición.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void cargar(); }, []);
  const abrir = (item: LeadVentasAdmin) => { setLead(item); setContrasena(''); setPlan(item.plan); setCupo10(''); setCupo11(''); setVencimiento(''); };
  const crear = async (e: React.FormEvent) => { e.preventDefault(); if (!lead) return; try { await crearInstitucionDesdeLeadAdmin({ leadId: lead.id, contrasenaTemporal: contrasena, planActual: plan || undefined, limiteGrado10: cupo10 ? Number(cupo10) : undefined, limiteGrado11: cupo11 ? Number(cupo11) : undefined, fechaVencimientoPlan: vencimiento || undefined }); mostrarMensaje(`Institución creada para ${lead.nombreColegio}`); setLead(null); await cargar(); } catch (err) { mostrarMensaje(err instanceof Error ? err.message : 'No se pudo crear la institución'); } };

  return <section style={{ background: '#fff', border: '1.5px solid #AFD3E2', borderRadius: 16, padding: 24 }}>
    <h2 style={{ marginTop: 0, color: '#1a2a3a' }}>Ventas e instituciones</h2><p style={{ color: '#4a5a6a' }}>Convierte una cotización cerrada en una institución y crea al responsable como profesor.</p>
    {cargando ? <p>Cargando...</p> : leads.map(item => <div key={item.id} style={{ padding: 14, border: '1px solid #D2E0FB', borderRadius: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}><span><strong>{item.nombreColegio}</strong><br /><small>{item.nombreContacto} · {item.correo} · {item.linea} {item.plan}</small></span>{item.atendido ? <b style={{ color: '#198754' }}>Atendido</b> : <button onClick={() => abrir(item)} style={{ ...control, background: '#146C94', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Crear institución</button>}</div>)}
    {lead && <div style={{ marginTop: 20, padding: 18, background: '#F6F1F1', borderRadius: 10 }}><h3 style={{ marginTop: 0 }}>Activar {lead.nombreColegio}</h3><form onSubmit={crear} style={{ display: 'grid', gap: 10 }}><label>Responsable: {lead.nombreContacto} ({lead.correo})</label><input required minLength={8} type="password" placeholder="Contraseña temporal (mínimo 8 caracteres)" value={contrasena} onChange={e => setContrasena(e.target.value)} style={control} /><input placeholder="Plan acordado" value={plan} onChange={e => setPlan(e.target.value)} style={control} /><div style={{ display: 'flex', gap: 10 }}><input min="1" type="number" placeholder="Cupo grado 10" value={cupo10} onChange={e => setCupo10(e.target.value)} style={control} /><input min="1" type="number" placeholder="Cupo grado 11" value={cupo11} onChange={e => setCupo11(e.target.value)} style={control} /><input type="date" value={vencimiento} onChange={e => setVencimiento(e.target.value)} style={control} /></div><div><button type="button" onClick={() => setLead(null)} style={{ ...control, marginRight: 8 }}>Cancelar</button><button type="submit" style={{ ...control, background: '#146C94', color: '#fff', fontWeight: 700 }}>Crear y marcar atendido</button></div></form></div>}
  </section>;
}
