export interface RespuestaRevision {
  id: string;
  texto: string;
  explicacion: string | null;
  esCorrecta: boolean;
}

export interface DetalleRevision {
  preguntaId: string;
  enunciado: string;
  imagenUrl: string | null;
  esCorrecto: boolean;
  respuestaSeleccionadaId: string;
  respuestaCorrectaId: string;
  explicacion: string | null;
  respuestas: RespuestaRevision[];
}

export default function RevisionPreguntas({
  detalle,
}: {
  detalle: DetalleRevision[];
}) {
  if (detalle.length === 0) return null;

  return (
    <section style={{ marginTop: 32, textAlign: 'left' }}>
      <h2 style={{ margin: '0 0 6px', color: '#1a2a3a', fontSize: 22 }}>
        Revisa tus respuestas
      </h2>
      <p style={{ margin: '0 0 18px', color: '#687580', fontSize: 14 }}>
        Compara tu elección con la respuesta correcta y repasa el razonamiento.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {detalle.map((pregunta, indice) => (
          <article
            key={`${pregunta.preguntaId}-${indice}`}
            style={{
              padding: 22,
              border: `1.5px solid ${pregunta.esCorrecto ? '#A6D9B8' : '#E8B4B4'}`,
              borderRadius: 8,
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <span style={{ color: '#687580', fontSize: 12, fontWeight: 700 }}>
                Pregunta {indice + 1}
              </span>
              <span style={{ color: pregunta.esCorrecto ? '#2E7D4F' : '#A84B4B', fontSize: 12, fontWeight: 800 }}>
                {pregunta.esCorrecto ? 'Correcta' : 'Por revisar'}
              </span>
            </div>

            <p style={{ margin: '0 0 16px', color: '#1a2a3a', fontSize: 15, fontWeight: 650, lineHeight: 1.55 }}>
              {pregunta.enunciado}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pregunta.respuestas.map((respuesta, respuestaIndice) => {
                const seleccionada =
                  respuesta.id === pregunta.respuestaSeleccionadaId;
                const correcta = respuesta.id === pregunta.respuestaCorrectaId;
                const color = correcta
                  ? '#2E7D4F'
                  : seleccionada
                    ? '#A84B4B'
                    : '#4A5A64';
                const fondo = correcta
                  ? '#EEF8F1'
                  : seleccionada
                    ? '#FFF1F1'
                    : '#F7F9FA';

                return (
                  <div
                    key={respuesta.id}
                    style={{
                      padding: '11px 12px',
                      borderLeft: `3px solid ${correcta ? '#75BE8D' : seleccionada ? '#D78C8C' : '#D5DEE3'}`,
                      backgroundColor: fondo,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <strong style={{ color, fontSize: 13 }}>
                        {['A', 'B', 'C', 'D'][respuestaIndice] ?? respuestaIndice + 1}.
                      </strong>
                      <span style={{ flex: 1, color, fontSize: 14, lineHeight: 1.45 }}>
                        {respuesta.texto}
                      </span>
                      {(seleccionada || correcta) && (
                        <span style={{ color, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
                          {seleccionada && correcta
                            ? 'Tu respuesta · Correcta'
                            : seleccionada
                              ? 'Tu respuesta'
                              : 'Correcta'}
                        </span>
                      )}
                    </div>
                    {respuesta.explicacion && (
                      <p style={{ margin: '7px 0 0 22px', color: '#5D6C76', fontSize: 12, lineHeight: 1.5 }}>
                        {respuesta.explicacion}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {pregunta.explicacion && (
              <div style={{ marginTop: 15, paddingTop: 14, borderTop: '1px solid #DCE4E8' }}>
                <p style={{ margin: '0 0 5px', color: '#146C94', fontSize: 12, fontWeight: 800 }}>
                  Cómo se resuelve
                </p>
                <p style={{ margin: 0, color: '#3F4E58', fontSize: 13, lineHeight: 1.6 }}>
                  {pregunta.explicacion}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
