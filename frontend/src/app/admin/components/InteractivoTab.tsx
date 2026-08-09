'use client';

import { useState } from 'react';
import { actualizarInteractivoSubtemaAdmin } from '../../../lib/api';
import type { Tema } from './tipos';
import { inputStyle, btnStyle } from './estilos';

export default function InteractivoTab({
  temas,
  mostrarMensaje,
}: {
  temas: Tema[];
  mostrarMensaje: (msg: string) => void;
}) {
  const [subtemaId, setSubtemaId] = useState('');
  const [textoConEspacios, setTextoConEspacios] = useState('');
  const [espacios, setEspacios] = useState<{ opciones: string[]; correctaIndex: number }[]>([]);
  const [guardando, setGuardando] = useState(false);

  const todosSubtemas = temas.flatMap(t =>
    t.subtemas.map(s => ({ ...s, temaNombre: t.nombre }))
  );

  // Detecta cuántos marcadores {0} {1} {2}... hay en el texto y sincroniza el array de espacios
  const sincronizarEspacios = (texto: string) => {
    setTextoConEspacios(texto);
    const matches = texto.match(/\{(\d+)\}/g) ?? [];
    const cantidad = matches.length;
    setEspacios(prev => {
      const nuevo = [...prev];
      while (nuevo.length < cantidad) nuevo.push({ opciones: ['', '', ''], correctaIndex: 0 });
      return nuevo.slice(0, cantidad);
    });
  };

  const actualizarOpcion = (espacioIdx: number, opcionIdx: number, valor: string) => {
    setEspacios(prev => prev.map((esp, i) =>
      i === espacioIdx ? { ...esp, opciones: esp.opciones.map((o, j) => j === opcionIdx ? valor : o) } : esp
    ));
  };

  const marcarCorrecta = (espacioIdx: number, opcionIdx: number) => {
    setEspacios(prev => prev.map((esp, i) =>
      i === espacioIdx ? { ...esp, correctaIndex: opcionIdx } : esp
    ));
  };

  const guardar = async () => {
    if (!subtemaId) { mostrarMensaje('Selecciona un subtema'); return; }
    if (!textoConEspacios.includes('{0}')) { mostrarMensaje('El texto debe tener al menos un espacio: {0}'); return; }
    if (espacios.some(e => e.opciones.some(o => !o.trim()))) { mostrarMensaje('Completa todas las opciones de cada espacio'); return; }

    setGuardando(true);
    await actualizarInteractivoSubtemaAdmin(subtemaId, { textoConEspacios, espacios });
    mostrarMensaje('Ejercicio interactivo guardado');
    setGuardando(false);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '28px 24px', border: '1.5px solid #AFD3E2', maxWidth: 700 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2a3a', marginBottom: 8 }}>
        Ejercicio interactivo (completar espacios)
      </h2>
      <p style={{ fontSize: 13, color: '#8a9aaa', marginBottom: 24 }}>
        Escribe el texto y marca cada espacio en blanco con {'{0}'}, {'{1}'}, {'{2}'}... en orden. Por cada espacio se generará un bloque de opciones abajo.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>Subtema</label>
          <select value={subtemaId} onChange={e => setSubtemaId(e.target.value)} style={inputStyle}>
            <option value="">Selecciona un subtema</option>
            {todosSubtemas.map(s => (
              <option key={s.id} value={s.id}>{s.temaNombre} → {s.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5a6a', display: 'block', marginBottom: 6 }}>
            Texto con espacios
          </label>
          <textarea
            value={textoConEspacios}
            onChange={e => sincronizarEspacios(e.target.value)}
            placeholder="The ozone layer is {0} the earth. It protects {1} from UV rays."
            rows={6}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6 }}
          />
        </div>

        {espacios.map((espacio, espacioIdx) => (
          <div key={espacioIdx} style={{ border: '1.5px solid #D2E0FB', borderRadius: 12, padding: '16px 18px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#146C94', marginBottom: 10 }}>
              Espacio {'{' + espacioIdx + '}'} — marca la opción correcta
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {espacio.opciones.map((opcion, opcionIdx) => (
                <div key={opcionIdx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="radio"
                    name={`correcta-${espacioIdx}`}
                    checked={espacio.correctaIndex === opcionIdx}
                    onChange={() => marcarCorrecta(espacioIdx, opcionIdx)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#146C94' }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#146C94', width: 16 }}>
                    {['A', 'B', 'C'][opcionIdx]}
                  </span>
                  <input
                    placeholder={`Opción ${['A', 'B', 'C'][opcionIdx]}`}
                    value={opcion}
                    onChange={e => actualizarOpcion(espacioIdx, opcionIdx, e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={guardar} disabled={guardando} style={{ ...btnStyle, padding: '13px', opacity: guardando ? 0.6 : 1 }}>
          {guardando ? 'Guardando...' : 'Guardar ejercicio interactivo'}
        </button>
      </div>
    </div>
  );
}