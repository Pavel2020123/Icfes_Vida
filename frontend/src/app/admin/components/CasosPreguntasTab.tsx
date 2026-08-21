"use client";

import { useEffect, useState } from "react";
import {
  actualizarCasoPreguntaAdmin,
  crearCasoPreguntaAdmin,
  eliminarCasoPreguntaAdmin,
  obtenerCasosPreguntasAdmin,
  type CasoPreguntaAdmin,
} from "../../../lib/api";
import { AREAS } from "./tipos";
import { btnStyle, inputStyle } from "./estilos";

const formularioInicial = {
  area: "LECTURA_CRITICA",
  titulo: "",
  contexto: "",
  imagenUrl: "",
};

export default function CasosPreguntasTab({
  mostrarMensaje,
}: {
  mostrarMensaje: (mensaje: string) => void;
}) {
  const [area, setArea] = useState("LECTURA_CRITICA");
  const [casos, setCasos] = useState<CasoPreguntaAdmin[]>([]);
  const [nuevo, setNuevo] = useState(formularioInicial);
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState({
    titulo: "",
    contexto: "",
    imagenUrl: "",
  });
  const [cargando, setCargando] = useState(true);

  const cargar = async (areaSeleccionada = area) => {
    setCargando(true);
    try {
      setCasos(await obtenerCasosPreguntasAdmin(areaSeleccionada));
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los casos",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;
    obtenerCasosPreguntasAdmin(area)
      .then((resultado) => {
        if (activo) setCasos(resultado);
      })
      .catch(() => undefined)
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [area]);

  const crear = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nuevo.contexto.trim()) {
      mostrarMensaje("Escribe el contexto que compartirán las preguntas");
      return;
    }
    try {
      await crearCasoPreguntaAdmin({
        area: nuevo.area,
        titulo: nuevo.titulo,
        contexto: nuevo.contexto,
        imagenUrl: nuevo.imagenUrl,
      });
      mostrarMensaje("Caso creado");
      setArea(nuevo.area);
      setNuevo({ ...formularioInicial, area: nuevo.area });
      await cargar(nuevo.area);
    } catch (error) {
      mostrarMensaje(
        error instanceof Error ? error.message : "No se pudo crear el caso",
      );
    }
  };

  const iniciarEdicion = (caso: CasoPreguntaAdmin) => {
    setEditando(caso.id);
    setBorrador({
      titulo: caso.titulo ?? "",
      contexto: caso.contexto,
      imagenUrl: caso.imagenUrl ?? "",
    });
  };

  const guardar = async (id: string) => {
    try {
      await actualizarCasoPreguntaAdmin(id, borrador);
      mostrarMensaje("Caso actualizado");
      setEditando(null);
      await cargar();
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el caso",
      );
    }
  };

  const eliminar = async (caso: CasoPreguntaAdmin) => {
    if (!confirm("¿Eliminar este caso?")) return;
    try {
      await eliminarCasoPreguntaAdmin(caso.id);
      mostrarMensaje("Caso eliminado");
      await cargar();
    } catch (error) {
      mostrarMensaje(
        error instanceof Error ? error.message : "No se pudo eliminar el caso",
      );
    }
  };

  return (
    <section style={{ maxWidth: 860 }}>
      <div
        style={{
          padding: 24,
          border: "1.5px solid #AFD3E2",
          borderRadius: 8,
          backgroundColor: "#ffffff",
        }}
      >
        <h2 style={{ margin: "0 0 6px", color: "#1a2a3a", fontSize: 18 }}>
          Casos y contextos
        </h2>
        <p
          style={{
            margin: "0 0 20px",
            color: "#687580",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          Crea una lectura, gráfica o situación común y luego vincula sus
          preguntas en el orden correcto.
        </p>

        <form onSubmit={crear} style={{ display: "grid", gap: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            <select
              value={nuevo.area}
              onChange={(event) =>
                setNuevo({ ...nuevo, area: event.target.value })
              }
              style={inputStyle}
            >
              {AREAS.map((opcion) => (
                <option key={opcion.key} value={opcion.key}>
                  {opcion.nombre}
                </option>
              ))}
            </select>
            <input
              value={nuevo.titulo}
              onChange={(event) =>
                setNuevo({ ...nuevo, titulo: event.target.value })
              }
              placeholder="Título del caso (opcional)"
              style={inputStyle}
            />
          </div>
          <textarea
            value={nuevo.contexto}
            onChange={(event) =>
              setNuevo({ ...nuevo, contexto: event.target.value })
            }
            placeholder="Texto, situación o contexto compartido"
            rows={7}
            style={{
              ...inputStyle,
              resize: "vertical",
              fontFamily: "system-ui, sans-serif",
            }}
          />
          <input
            value={nuevo.imagenUrl}
            onChange={(event) =>
              setNuevo({ ...nuevo, imagenUrl: event.target.value })
            }
            placeholder="Imagen opcional, por ejemplo: lectura-grafica.png"
            style={inputStyle}
          />
          <button type="submit" style={{ ...btnStyle, justifySelf: "start" }}>
            Crear caso
          </button>
        </form>
      </div>

      <div style={{ marginTop: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0, color: "#1a2a3a", fontSize: 16 }}>
            Casos creados
          </h3>
          <select
            value={area}
            onChange={(event) => {
              setCargando(true);
              setArea(event.target.value);
            }}
            style={{ ...inputStyle, width: 220, maxWidth: "100%" }}
          >
            {AREAS.map((opcion) => (
              <option key={opcion.key} value={opcion.key}>
                {opcion.nombre}
              </option>
            ))}
          </select>
        </div>

        {cargando ? (
          <p style={{ color: "#687580" }}>Cargando...</p>
        ) : casos.length === 0 ? (
          <p
            style={{
              padding: 18,
              color: "#687580",
              border: "1px dashed #AFD3E2",
            }}
          >
            Todavía no hay casos en esta área.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {casos.map((caso) => (
              <article
                key={caso.id}
                style={{
                  padding: 18,
                  border: "1px solid #D2E0FB",
                  borderRadius: 8,
                  backgroundColor: "#ffffff",
                }}
              >
                {editando === caso.id ? (
                  <div style={{ display: "grid", gap: 9 }}>
                    <input
                      value={borrador.titulo}
                      onChange={(event) =>
                        setBorrador({ ...borrador, titulo: event.target.value })
                      }
                      placeholder="Título"
                      style={inputStyle}
                    />
                    <textarea
                      value={borrador.contexto}
                      onChange={(event) =>
                        setBorrador({
                          ...borrador,
                          contexto: event.target.value,
                        })
                      }
                      rows={6}
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        fontFamily: "system-ui, sans-serif",
                      }}
                    />
                    <input
                      value={borrador.imagenUrl}
                      onChange={(event) =>
                        setBorrador({
                          ...borrador,
                          imagenUrl: event.target.value,
                        })
                      }
                      placeholder="Imagen opcional"
                      style={inputStyle}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => guardar(caso.id)}
                        style={btnStyle}
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditando(null)}
                        style={{
                          ...btnStyle,
                          backgroundColor: "#E8EEF1",
                          color: "#40515C",
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <h4
                          style={{
                            margin: "0 0 5px",
                            color: "#1a2a3a",
                            fontSize: 15,
                          }}
                        >
                          {caso.titulo || "Caso sin título"}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            color: "#50606A",
                            fontSize: 13,
                            lineHeight: 1.55,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {caso.contexto}
                        </p>
                        <p
                          style={{
                            margin: "9px 0 0",
                            color: "#146C94",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {caso._count.preguntas} pregunta(s) asociada(s)
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 7,
                          flexShrink: 0,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => iniciarEdicion(caso)}
                          style={{
                            ...btnStyle,
                            padding: "7px 11px",
                            backgroundColor: "#E8F3F8",
                            color: "#146C94",
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminar(caso)}
                          style={{
                            ...btnStyle,
                            padding: "7px 11px",
                            backgroundColor: "#FCE9E5",
                            color: "#A84B4B",
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
