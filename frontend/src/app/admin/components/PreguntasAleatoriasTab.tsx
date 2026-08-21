"use client";

import { useEffect, useState } from "react";
import {
  asignarCasoPreguntaAdmin,
  crearPreguntaAleatoriaAdmin,
  eliminarPreguntaAdmin,
  obtenerCasosPreguntasAdmin,
  obtenerPreguntasAdmin,
  type CasoPreguntaAdmin,
} from "../../../lib/api";
import { AREAS, type Tema, type PreguntaAdmin } from "./tipos";
import { inputStyle, btnStyle } from "./estilos";

export default function PreguntasAleatoriasTab({
  temas,
  mostrarMensaje,
  cargarDatos,
}: {
  temas: Tema[];
  mostrarMensaje: (msg: string) => void;
  cargarDatos: () => Promise<void>;
}) {
  const [nuevaPreguntaAleatoria, setNuevaPreguntaAleatoria] = useState({
    area: "MATEMATICAS",
    enunciado: "",
    explicacion: "",
    casoId: "",
    ordenEnCaso: "",
    imagenes: "",
    respuestas: [
      { texto: "", esCorrecta: true, explicacion: "" },
      { texto: "", esCorrecta: false, explicacion: "" },
      { texto: "", esCorrecta: false, explicacion: "" },
      { texto: "", esCorrecta: false, explicacion: "" },
    ],
  });
  const [preguntasBanco, setPreguntasBanco] = useState<PreguntaAdmin[]>([]);
  const [casos, setCasos] = useState<CasoPreguntaAdmin[]>([]);
  const casosDelArea = casos.filter(
    (caso) => caso.area === nuevaPreguntaAleatoria.area,
  );

  const cargarPreguntasDelBanco = async (area: string) => {
    const temaBanco = temas.find(
      (t) => t.nombre === "Banco General" && t.area === area,
    );
    const subtemaBanco = temaBanco?.subtemas[0];
    if (!subtemaBanco) {
      setPreguntasBanco([]);
      return;
    }
    setPreguntasBanco(await obtenerPreguntasAdmin(subtemaBanco.id));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPreguntasDelBanco(nuevaPreguntaAleatoria.area);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nuevaPreguntaAleatoria.area, temas]);

  useEffect(() => {
    let activo = true;
    obtenerCasosPreguntasAdmin()
      .then((resultado) => {
        if (activo) setCasos(resultado);
      })
      .catch(() => undefined);
    return () => {
      activo = false;
    };
  }, []);

  const eliminarPreguntaBanco = async (id: string) => {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    await eliminarPreguntaAdmin(id);
    mostrarMensaje("Pregunta eliminada");
    cargarPreguntasDelBanco(nuevaPreguntaAleatoria.area);
    cargarDatos();
  };

  const crearPreguntaAleatoria = async () => {
    if (!nuevaPreguntaAleatoria.enunciado) {
      mostrarMensaje("Escribe el enunciado de la pregunta");
      return;
    }
    const correctas = nuevaPreguntaAleatoria.respuestas.filter(
      (r) => r.esCorrecta,
    ).length;
    if (correctas !== 1) {
      mostrarMensaje("Debe haber exactamente 1 respuesta correcta");
      return;
    }
    if (nuevaPreguntaAleatoria.respuestas.some((r) => !r.texto)) {
      mostrarMensaje("Todas las opciones deben tener texto");
      return;
    }

    await crearPreguntaAleatoriaAdmin(
      nuevaPreguntaAleatoria.area,
      nuevaPreguntaAleatoria.enunciado,
      nuevaPreguntaAleatoria.imagenes || null,
      nuevaPreguntaAleatoria.respuestas,
      nuevaPreguntaAleatoria.explicacion,
      nuevaPreguntaAleatoria.casoId || undefined,
      nuevaPreguntaAleatoria.casoId && nuevaPreguntaAleatoria.ordenEnCaso
        ? Number(nuevaPreguntaAleatoria.ordenEnCaso)
        : undefined,
    );

    setNuevaPreguntaAleatoria({
      area: nuevaPreguntaAleatoria.area,
      enunciado: "",
      explicacion: "",
      casoId: "",
      ordenEnCaso: "",
      imagenes: "",
      respuestas: [
        { texto: "", esCorrecta: true, explicacion: "" },
        { texto: "", esCorrecta: false, explicacion: "" },
        { texto: "", esCorrecta: false, explicacion: "" },
        { texto: "", esCorrecta: false, explicacion: "" },
      ],
    });
    mostrarMensaje(
      "Pregunta agregada al banco general de " +
        (AREAS.find((a) => a.key === nuevaPreguntaAleatoria.area)?.nombre ??
          nuevaPreguntaAleatoria.area),
    );
    cargarDatos();
  };

  const asignarCaso = async (
    preguntaId: string,
    casoId: string | null,
    ordenEnCaso?: number,
  ) => {
    try {
      await asignarCasoPreguntaAdmin(preguntaId, casoId, ordenEnCaso);
      mostrarMensaje(
        casoId ? "Pregunta vinculada al caso" : "Pregunta retirada del caso",
      );
      await cargarPreguntasDelBanco(nuevaPreguntaAleatoria.area);
    } catch (error) {
      mostrarMensaje(
        error instanceof Error ? error.message : "No se pudo asignar el caso",
      );
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: "28px 24px",
          border: "1.5px solid #AFD3E2",
          maxWidth: 700,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#1a2a3a",
            marginBottom: 8,
          }}
        >
          🎲 Agregar pregunta al banco de aleatorias
        </h2>
        <p style={{ fontSize: 13, color: "#8a9aaa", marginBottom: 24 }}>
          Solo elige el área, escribe la pregunta y las respuestas. No hace
          falta crear temas ni subtemas: se guarda automáticamente en el
          &quot;Banco General&quot; de esa área.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#4a5a6a",
                display: "block",
                marginBottom: 6,
              }}
            >
              Área
            </label>
            <select
              value={nuevaPreguntaAleatoria.area}
              onChange={(e) =>
                setNuevaPreguntaAleatoria({
                  ...nuevaPreguntaAleatoria,
                  area: e.target.value,
                  casoId: "",
                  ordenEnCaso: "",
                })
              }
              style={inputStyle}
            >
              {AREAS.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#4a5a6a",
                display: "block",
                marginBottom: 6,
              }}
            >
              Enunciado de la pregunta
            </label>
            <textarea
              value={nuevaPreguntaAleatoria.enunciado}
              onChange={(e) =>
                setNuevaPreguntaAleatoria({
                  ...nuevaPreguntaAleatoria,
                  enunciado: e.target.value,
                })
              }
              placeholder="Escribe la pregunta aquí..."
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "system-ui, sans-serif",
              }}
            />
          </div>

          {/* IMÁGENES */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#4a5a6a",
                display: "block",
                marginBottom: 6,
              }}
            >
              Imagen (opcional)
            </label>
            <input
              placeholder="ej: grafica-001.png"
              value={nuevaPreguntaAleatoria.imagenes}
              onChange={(e) =>
                setNuevaPreguntaAleatoria({
                  ...nuevaPreguntaAleatoria,
                  imagenes: e.target.value,
                })
              }
              style={inputStyle}
            />
            <p style={{ fontSize: 12, color: "#8a9aaa", marginTop: 4 }}>
              Coloca el archivo en frontend/public/imagenes/
            </p>
            {nuevaPreguntaAleatoria.imagenes && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 10,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/imagenes/${nuevaPreguntaAleatoria.imagenes.trim()}`}
                  alt="vista previa"
                  style={{
                    height: 80,
                    borderRadius: 8,
                    border: "1px solid #AFD3E2",
                    objectFit: "contain",
                    backgroundColor: "#F6F1F1",
                  }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#4a5a6a",
                display: "block",
                marginBottom: 10,
              }}
            >
              Opciones de respuesta — marca la correcta
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {nuevaPreguntaAleatoria.respuestas.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "18px 20px minmax(0, 1fr)",
                    alignItems: "start",
                    gap: 10,
                  }}
                >
                  <input
                    type="radio"
                    name="correcta-aleatoria"
                    checked={r.esCorrecta}
                    onChange={() =>
                      setNuevaPreguntaAleatoria({
                        ...nuevaPreguntaAleatoria,
                        respuestas: nuevaPreguntaAleatoria.respuestas.map(
                          (resp, idx) => ({ ...resp, esCorrecta: idx === i }),
                        ),
                      })
                    }
                    style={{
                      width: 18,
                      height: 18,
                      marginTop: 11,
                      cursor: "pointer",
                      accentColor: "#146C94",
                    }}
                  />
                  <span
                    style={{
                      marginTop: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#146C94",
                      width: 20,
                    }}
                  >
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <input
                      placeholder={`Opción ${["A", "B", "C", "D"][i]}`}
                      value={r.texto}
                      onChange={(e) =>
                        setNuevaPreguntaAleatoria({
                          ...nuevaPreguntaAleatoria,
                          respuestas: nuevaPreguntaAleatoria.respuestas.map(
                            (resp, idx) =>
                              idx === i
                                ? { ...resp, texto: e.target.value }
                                : resp,
                          ),
                        })
                      }
                      style={inputStyle}
                    />
                    <textarea
                      placeholder="Explicación de esta opción (opcional)"
                      aria-label={`Explicación de la opción ${["A", "B", "C", "D"][i]}`}
                      value={r.explicacion}
                      onChange={(e) =>
                        setNuevaPreguntaAleatoria({
                          ...nuevaPreguntaAleatoria,
                          respuestas: nuevaPreguntaAleatoria.respuestas.map(
                            (resp, idx) =>
                              idx === i
                                ? { ...resp, explicacion: e.target.value }
                                : resp,
                          ),
                        })
                      }
                      rows={2}
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        fontFamily: "system-ui, sans-serif",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 130px",
              gap: 10,
            }}
          >
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#4a5a6a",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Caso o contexto (opcional)
              </label>
              <select
                value={nuevaPreguntaAleatoria.casoId}
                onChange={(e) =>
                  setNuevaPreguntaAleatoria({
                    ...nuevaPreguntaAleatoria,
                    casoId: e.target.value,
                    ordenEnCaso: "",
                  })
                }
                style={inputStyle}
              >
                <option value="">Pregunta independiente</option>
                {casosDelArea.map((caso) => (
                  <option key={caso.id} value={caso.id}>
                    {caso.titulo || caso.contexto.slice(0, 60)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#4a5a6a",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Orden
              </label>
              <input
                type="number"
                min={1}
                value={nuevaPreguntaAleatoria.ordenEnCaso}
                onChange={(e) =>
                  setNuevaPreguntaAleatoria({
                    ...nuevaPreguntaAleatoria,
                    ordenEnCaso: e.target.value,
                  })
                }
                disabled={!nuevaPreguntaAleatoria.casoId}
                placeholder="Auto"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#4a5a6a",
                display: "block",
                marginBottom: 6,
              }}
            >
              Explicación general (opcional)
            </label>
            <textarea
              value={nuevaPreguntaAleatoria.explicacion}
              onChange={(e) =>
                setNuevaPreguntaAleatoria({
                  ...nuevaPreguntaAleatoria,
                  explicacion: e.target.value,
                })
              }
              placeholder="Describe el procedimiento, concepto o razonamiento correcto."
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "system-ui, sans-serif",
              }}
            />
          </div>

          <button
            onClick={crearPreguntaAleatoria}
            style={{ ...btnStyle, padding: "13px" }}
          >
            Guardar y agregar otra
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: "24px",
          border: "1.5px solid #AFD3E2",
          maxWidth: 700,
          marginTop: 20,
        }}
      >
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#1a2a3a",
            marginBottom: 16,
          }}
        >
          Preguntas cargadas en{" "}
          {AREAS.find((a) => a.key === nuevaPreguntaAleatoria.area)?.nombre} (
          {preguntasBanco.length})
        </h3>
        {preguntasBanco.length === 0 ? (
          <p style={{ color: "#8a9aaa", fontSize: 14 }}>
            Todavía no hay preguntas en esta área.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {preguntasBanco.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  border: "1px solid #D2E0FB",
                  borderRadius: 10,
                  padding: "12px 16px",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, color: "#1a2a3a", margin: 0 }}>
                    {p.enunciado}
                  </p>
                  {p.explicacion && (
                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#5D6C76",
                        fontSize: 12,
                        lineHeight: 1.45,
                      }}
                    >
                      Explicación: {p.explicacion}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                      marginTop: 9,
                      flexWrap: "wrap",
                    }}
                  >
                    <select
                      value={p.casoId ?? ""}
                      onChange={(event) =>
                        void asignarCaso(p.id, event.target.value || null)
                      }
                      aria-label="Caso de la pregunta"
                      style={{
                        ...inputStyle,
                        width: 230,
                        padding: "7px 9px",
                        fontSize: 12,
                      }}
                    >
                      <option value="">Sin caso</option>
                      {casosDelArea.map((caso) => (
                        <option key={caso.id} value={caso.id}>
                          {caso.titulo || caso.contexto.slice(0, 45)}
                        </option>
                      ))}
                    </select>
                    {p.casoId && (
                      <input
                        type="number"
                        min={1}
                        defaultValue={p.ordenEnCaso ?? 1}
                        aria-label="Orden dentro del caso"
                        onBlur={(event) =>
                          void asignarCaso(
                            p.id,
                            p.casoId,
                            Number(event.target.value),
                          )
                        }
                        style={{
                          ...inputStyle,
                          width: 78,
                          padding: "7px 9px",
                          fontSize: 12,
                        }}
                      />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => eliminarPreguntaBanco(p.id)}
                  style={{
                    backgroundColor: "#FCD8CD",
                    color: "#BC7C7C",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
