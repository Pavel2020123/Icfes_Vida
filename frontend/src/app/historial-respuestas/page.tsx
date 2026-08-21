"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  obtenerHistorialRespuestas,
  obtenerToken,
  type HistorialRespuestaItem,
  type HistorialRespuestas,
} from "../../lib/api";

const AREAS = [
  { key: "", nombre: "Todas las áreas" },
  { key: "LECTURA_CRITICA", nombre: "Lectura Crítica" },
  { key: "MATEMATICAS", nombre: "Matemáticas" },
  { key: "CIENCIAS_NATURALES", nombre: "Ciencias Naturales" },
  { key: "SOCIALES_CIUDADANAS", nombre: "Sociales y Ciudadanas" },
  { key: "INGLES", nombre: "Inglés" },
];

const ORIGENES: Record<HistorialRespuestaItem["origen"], string> = {
  SIMULACRO: "Simulacro por área",
  PERSONALIZADO: "Preguntas aleatorias",
  PRACTICA: "Práctica de tema",
  DIAGNOSTICO: "Diagnóstico inicial",
};

const VACIO: HistorialRespuestas = {
  resumen: { total: 0, correctas: 0, incorrectas: 0, porcentajeAciertos: 0 },
  respuestas: [],
};

function fechaLegible(fecha: string) {
  return new Date(fecha).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function areaLegible(area: string) {
  return AREAS.find((opcion) => opcion.key === area)?.nombre ?? area;
}

export default function HistorialRespuestasPage() {
  const router = useRouter();
  const [area, setArea] = useState("");
  const [resultado, setResultado] = useState<"" | "correctas" | "incorrectas">(
    "",
  );
  const [historial, setHistorial] = useState<HistorialRespuestas>(VACIO);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!obtenerToken()) {
      router.push("/login");
      return;
    }

    let activo = true;
    obtenerHistorialRespuestas({
      area: area || undefined,
      resultado: resultado || undefined,
      limite: 100,
    })
      .then((datos) => {
        if (activo) {
          setHistorial(datos);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el historial",
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [area, resultado, router]);

  const cambiarArea = (valor: string) => {
    setCargando(true);
    setArea(valor);
  };

  const cambiarResultado = (valor: "" | "correctas" | "incorrectas") => {
    setCargando(true);
    setResultado(valor);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F6F1F1",
        color: "#1a2a3a",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header
        style={{
          backgroundColor: "#146C94",
          borderBottom: "4px solid #19A7CE",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            minHeight: 68,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link
            href="/dashboard"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Saber<span style={{ color: "#8DD8FF" }}>Plus</span>
          </Link>
          <Link
            href="/dashboard"
            style={{ color: "#ffffff", textDecoration: "none", fontSize: 14 }}
          >
            Volver al inicio
          </Link>
        </div>
      </header>

      <main
        style={{ maxWidth: 980, margin: "0 auto", padding: "38px 24px 64px" }}
      >
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 27, letterSpacing: 0 }}>
            Historial de respuestas
          </h1>
          <p style={{ margin: 0, color: "#687580", fontSize: 14 }}>
            Consulta tus intentos y reconoce qué temas necesitan otra vuelta.
          </p>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            border: "1px solid #AFD3E2",
            backgroundColor: "#ffffff",
            marginBottom: 18,
          }}
        >
          {[
            {
              etiqueta: "Respondidas",
              valor: historial.resumen.total,
              color: "#1a2a3a",
            },
            {
              etiqueta: "Correctas",
              valor: historial.resumen.correctas,
              color: "#2E7D4F",
            },
            {
              etiqueta: "Incorrectas",
              valor: historial.resumen.incorrectas,
              color: "#A84B4B",
            },
            {
              etiqueta: "Acierto",
              valor: `${historial.resumen.porcentajeAciertos}%`,
              color: "#146C94",
            },
          ].map(({ etiqueta, valor, color }) => (
            <div
              key={etiqueta}
              style={{ padding: "17px 18px", borderRight: "1px solid #E2E9ED" }}
            >
              <strong style={{ display: "block", color, fontSize: 22 }}>
                {valor}
              </strong>
              <span style={{ color: "#687580", fontSize: 12 }}>{etiqueta}</span>
            </div>
          ))}
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <select
            value={area}
            onChange={(event) => cambiarArea(event.target.value)}
            aria-label="Filtrar por área"
            style={{
              padding: "11px 12px",
              border: "1px solid #AFC5D0",
              background: "#fff",
            }}
          >
            {AREAS.map((opcion) => (
              <option key={opcion.key} value={opcion.key}>
                {opcion.nombre}
              </option>
            ))}
          </select>
          <select
            value={resultado}
            onChange={(event) =>
              cambiarResultado(
                event.target.value as "" | "correctas" | "incorrectas",
              )
            }
            aria-label="Filtrar por resultado"
            style={{
              padding: "11px 12px",
              border: "1px solid #AFC5D0",
              background: "#fff",
            }}
          >
            <option value="">Todos los resultados</option>
            <option value="correctas">Solo correctas</option>
            <option value="incorrectas">Solo incorrectas</option>
          </select>
        </div>

        {cargando ? (
          <p style={{ color: "#687580" }}>Cargando respuestas...</p>
        ) : error ? (
          <p
            style={{
              padding: 16,
              color: "#A84B4B",
              borderLeft: "4px solid #D78C8C",
            }}
          >
            {error}
          </p>
        ) : historial.respuestas.length === 0 ? (
          <div
            style={{
              padding: "32px 20px",
              border: "1px dashed #AFC5D0",
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 12px", color: "#50606A" }}>
              Aún no hay respuestas para estos filtros.
            </p>
            <Link
              href="/preguntas-aleatorias"
              style={{ color: "#146C94", fontWeight: 700 }}
            >
              Practicar ahora
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {historial.respuestas.map((respuesta) => (
              <article
                key={respuesta.id}
                style={{
                  padding: 20,
                  border: `1px solid ${respuesta.esCorrecta ? "#A6D9B8" : "#E8B4B4"}`,
                  borderLeft: `5px solid ${respuesta.esCorrecta ? "#4FA46D" : "#C96B6B"}`,
                  borderRadius: 8,
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <span
                      style={{
                        color: "#146C94",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {areaLegible(respuesta.area)} · {respuesta.tema}
                    </span>
                    <p
                      style={{
                        margin: "3px 0 0",
                        color: "#7A8790",
                        fontSize: 11,
                      }}
                    >
                      {ORIGENES[respuesta.origen]} ·{" "}
                      {fechaLegible(respuesta.fechaRespuesta)}
                      {respuesta.tiempoRespuestaSegundos !== null
                        ? ` · ${respuesta.tiempoRespuestaSegundos} s`
                        : ""}
                    </p>
                  </div>
                  <strong
                    style={{
                      color: respuesta.esCorrecta ? "#2E7D4F" : "#A84B4B",
                      fontSize: 12,
                    }}
                  >
                    {respuesta.esCorrecta ? "Correcta" : "Incorrecta"}
                  </strong>
                </div>

                {respuesta.caso && (
                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#687580",
                      fontSize: 12,
                    }}
                  >
                    Caso: {respuesta.caso.titulo || "Contexto compartido"}
                  </p>
                )}
                <p
                  style={{
                    margin: "0 0 14px",
                    fontSize: 15,
                    lineHeight: 1.55,
                    fontWeight: 650,
                  }}
                >
                  {respuesta.enunciado}
                </p>

                <div style={{ display: "grid", gap: 7, fontSize: 13 }}>
                  <p
                    style={{
                      margin: 0,
                      color: respuesta.esCorrecta ? "#2E7D4F" : "#A84B4B",
                    }}
                  >
                    <strong>Tu respuesta:</strong>{" "}
                    {respuesta.respuestaSeleccionada?.texto ||
                      "Opción no disponible"}
                  </p>
                  {!respuesta.esCorrecta && (
                    <p style={{ margin: 0, color: "#2E7D4F" }}>
                      <strong>Respuesta correcta:</strong>{" "}
                      {respuesta.respuestaCorrecta?.texto ||
                        "Opción no disponible"}
                    </p>
                  )}
                </div>

                {!respuesta.esCorrecta && respuesta.explicacion && (
                  <p
                    style={{
                      margin: "13px 0 0",
                      paddingTop: 12,
                      borderTop: "1px solid #E2E9ED",
                      color: "#50606A",
                      fontSize: 13,
                      lineHeight: 1.55,
                    }}
                  >
                    {respuesta.explicacion}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
