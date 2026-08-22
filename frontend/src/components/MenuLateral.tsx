"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cerrarSesion, obtenerAnuncios, obtenerToken } from "../lib/api";
import { decodificarToken, RolUsuario } from "../lib/auth";
import { useBranding } from "../context/ThemeContext";
import Logotipo from "./Logotipo";

const AREAS = [
  { key: "LECTURA_CRITICA", nombre: "Lectura Crítica" },
  { key: "MATEMATICAS", nombre: "Matemáticas" },
  { key: "CIENCIAS_NATURALES", nombre: "Ciencias Naturales" },
  { key: "SOCIALES_CIUDADANAS", nombre: "Sociales y Ciudadanas" },
  { key: "INGLES", nombre: "Inglés" },
];

interface Props {
  nombre: string;
  progresoGeneral: number;
  temasCompletados: number;
  totalSubtemas: number;
}

export default function MenuLateral({
  nombre,
  progresoGeneral,
  temasCompletados,
  totalSubtemas,
}: Props) {
  const router = useRouter();
  const { branding } = useBranding();
  const [abierto, setAbierto] = useState(false);
  const [areasAbierto, setAreasAbierto] = useState(false);
  const [rol, setRol] = useState<RolUsuario | null>(null);
  const [anunciosPendientes, setAnunciosPendientes] = useState(0);

  useEffect(() => {
    const token = obtenerToken();
    if (token) {
      const payload = decodificarToken(token);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRol(payload?.rol ?? null);
      if (payload?.rol === "ESTUDIANTE" || payload?.rol === "PROFESOR") {
        obtenerAnuncios()
          .then((datos) => setAnunciosPendientes(datos.pendientes))
          .catch(() => setAnunciosPendientes(0));
      }
    }
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    router.push("/");
  };

  const linkStyle = {
    padding: "12px 16px",
    borderRadius: 10,
    color: "#1a2a3a",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    marginBottom: 4,
  };

  return (
    <>
      {/* BOTÓN HAMBURGUESA */}
      <button
        data-tutorial="menu-principal"
        onClick={() => setAbierto(true)}
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 200,
          backgroundColor: "var(--color-primario, #146c94)",
          border: "none",
          borderRadius: 10,
          width: 42,
          height: 42,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <span
          style={{
            width: 20,
            height: 2,
            backgroundColor: "var(--color-sobre-primario, #ffffff)",
            borderRadius: 2,
          }}
        />
        <span
          style={{
            width: 20,
            height: 2,
            backgroundColor: "var(--color-sobre-primario, #ffffff)",
            borderRadius: 2,
          }}
        />
        <span
          style={{
            width: 20,
            height: 2,
            backgroundColor: "var(--color-sobre-primario, #ffffff)",
            borderRadius: 2,
          }}
        />
      </button>

      {/* OVERLAY */}
      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(26,42,58,0.5)",
            zIndex: 300,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* MENÚ LATERAL */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: 300,
          backgroundColor: "#ffffff",
          zIndex: 400,
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
          transform: abierto ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* CABECERA */}
        <div
          style={{
            backgroundColor: "var(--color-primario, #146c94)",
            padding: "24px 20px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            {branding.logoUrl ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <Image
                  src={branding.logoUrl}
                  width={32}
                  height={32}
                  unoptimized
                  alt={branding.nombre ?? "Logo institución"}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    objectFit: "cover",
                    backgroundColor: "#ffffff",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--color-sobre-primario, #ffffff)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {branding.nombre}
                </span>
              </div>
            ) : (
              <Logotipo size={30} colorTexto="#ffffff" colorAcento="var(--marca-acento, #8dd8ff)" />
            )}
            <button
              onClick={() => setAbierto(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-sobre-primario, #ffffff)",
                fontSize: 22,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Info usuario */}
          <p style={{ color: "var(--marca-superficie-fuerte, #d2e0fb)", fontSize: 13, marginBottom: 4 }}>
            Hola,
          </p>
          <p
            style={{
              color: "var(--color-sobre-primario, #ffffff)",
              fontSize: 17,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            {nombre}
          </p>

          {/* Barra de progreso */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ color: "var(--marca-superficie-fuerte, #d2e0fb)", fontSize: 12 }}>
                Progreso general
              </span>
              <span
                style={{
                  color: "var(--color-secundario, #19a7ce)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {progresoGeneral}%
              </span>
            </div>
            <div
              style={{
                height: 6,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 3,
              }}
            >
              <div
                style={{
                  height: "100%",
                  backgroundColor: "var(--color-secundario, #19a7ce)",
                  borderRadius: 3,
                  width: `${progresoGeneral}%`,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <p style={{ color: "var(--marca-superficie-fuerte, #d2e0fb)", fontSize: 11, marginTop: 6 }}>
              {temasCompletados} de {totalSubtemas} temas completados
            </p>
          </div>
        </div>

        {/* LINKS */}
        <div style={{ padding: "16px 12px", flex: 1 }}>
          {/* Inicio */}
          <Link
            href="/dashboard"
            onClick={() => setAbierto(false)}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div
              style={linkStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F6F1F1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Inicio
            </div>
          </Link>

          {/* Mi perfil */}
          <Link
            href="/perfil"
            onClick={() => setAbierto(false)}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div
              style={linkStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F6F1F1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Mi perfil
            </div>
          </Link>

          {(rol === "ESTUDIANTE" || rol === "PROFESOR") && (
            <Link
              href="/anuncios"
              onClick={() => setAbierto(false)}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  ...linkStyle,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F6F1F1")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span>Tablón de anuncios</span>
                {anunciosPendientes > 0 && (
                  <span
                    aria-label={`${anunciosPendientes} anuncios pendientes`}
                    style={{
                      minWidth: 23,
                      height: 23,
                      borderRadius: 12,
                      backgroundColor: "#C44F45",
                      color: "#ffffff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 6px",
                      fontSize: 11,
                      fontWeight: 850,
                    }}
                  >
                    {anunciosPendientes > 99 ? "99+" : anunciosPendientes}
                  </span>
                )}
              </div>
            </Link>
          )}

          {/* Sección PROFESOR: Institución */}
          {rol === "PROFESOR" && (
            <>
              <div
                style={{
                  height: 1,
                  backgroundColor: "#F0F0F0",
                  margin: "8px 0",
                }}
              />
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#8a9aaa",
                  padding: "8px 16px 4px",
                  margin: 0,
                }}
              >
                GESTIÓN DE INSTITUCIÓN
              </p>

              <Link
                href="/institucion"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={linkStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F6F1F1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Mi institución
                </div>
              </Link>

              <Link
                href="/institucion/alertas"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    ...linkStyle,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#FBE9E7")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span>Alertas de riesgo</span>
                  <span
                    aria-hidden="true"
                    style={{ color: "#A43C36", fontWeight: 900 }}
                  >
                    !
                  </span>
                </div>
              </Link>

              <Link
                href="/institucion/estudiantes"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={linkStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F6F1F1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Estudiantes
                </div>
              </Link>

              <Link
                href="/institucion/grupos"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={linkStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F6F1F1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Grupos
                </div>
              </Link>
            </>
          )}

          {/* Sección ADMIN */}
          {rol === "ADMIN" && (
            <>
              <div
                style={{
                  height: 1,
                  backgroundColor: "#F0F0F0",
                  margin: "8px 0",
                }}
              />
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#8a9aaa",
                  padding: "8px 16px 4px",
                  margin: 0,
                }}
              >
                ADMINISTRACIÓN
              </p>
              <Link
                href="/admin"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{ ...linkStyle, color: "#BC7C7C" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#FCD8CD")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Panel Admin
                </div>
              </Link>
            </>
          )}

          {rol === "ESTUDIANTE" && (
            <>
              {/* Divisor */}
              <div
                style={{
                  height: 1,
                  backgroundColor: "#F0F0F0",
                  margin: "8px 0",
                }}
              />

              {/* Áreas desplegable */}
              <button
                onClick={() => setAreasAbierto(!areasAbierto)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#1a2a3a",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F6F1F1")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span>Áreas</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#8a9aaa",
                    display: "inline-block",
                    transition: "transform 0.2s",
                    transform: areasAbierto ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>

              {areasAbierto && (
                <div style={{ paddingLeft: 12, marginBottom: 8 }}>
                  {AREAS.map((area) => (
                    <Link
                      key={area.key}
                      href={`/estudiar/${area.key}`}
                      onClick={() => setAbierto(false)}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <div
                        style={{
                          padding: "9px 16px",
                          borderRadius: 8,
                          color: "#4a5a6a",
                          fontSize: 14,
                          cursor: "pointer",
                          borderLeft: "2px solid var(--marca-superficie-fuerte, #d2e0fb)",
                          marginBottom: 2,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--marca-superficie-fuerte, #d2e0fb)";
                          e.currentTarget.style.color = "var(--color-primario, #146c94)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#4a5a6a";
                        }}
                      >
                        {area.nombre}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Divisor */}
              <div
                style={{
                  height: 1,
                  backgroundColor: "#F0F0F0",
                  margin: "8px 0",
                }}
              />

              <Link
                href="/diagnostico"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    ...linkStyle,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F6F1F1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span>Diagnóstico inicial</span>
                  <span
                    aria-hidden="true"
                    style={{ color: "#16805E", fontWeight: 800 }}
                  >
                    01
                  </span>
                </div>
              </Link>

              <Link
                href="/plan-estudio"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    ...linkStyle,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F6F1F1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span>Plan semanal</span>
                  <span
                    aria-hidden="true"
                    style={{ color: "var(--color-primario, #146c94)", fontWeight: 800 }}
                  >
                    7D
                  </span>
                </div>
              </Link>

              <Link
                href="/referidos"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    ...linkStyle,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F6F1F1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span>Invitar y ganar</span>
                  <span
                    aria-hidden="true"
                    style={{ color: "#16805E", fontWeight: 800 }}
                  >
                    $
                  </span>
                </div>
              </Link>

              {/* Preguntas aleatorias */}
              <Link
                href="/preguntas-aleatorias"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    ...linkStyle,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F6F1F1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span>Preguntas aleatorias</span>
                  <span style={{ fontSize: 16 }}>🎲</span>
                </div>
              </Link>

              <Link
                href="/historial-respuestas"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={linkStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F6F1F1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Historial de respuestas
                </div>
              </Link>

              <Link
                href="/formulas"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    ...linkStyle,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F6F1F1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span>Formulario por área</span>
                  <span
                    aria-hidden="true"
                    style={{ color: "var(--color-primario, #146c94)", fontWeight: 800 }}
                  >
                    ƒx
                  </span>
                </div>
              </Link>

              <Link
                href="/glosario"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    ...linkStyle,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F6F1F1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span>Glosario de términos</span>
                  <span
                    aria-hidden="true"
                    style={{ color: "#8A5C00", fontWeight: 800 }}
                  >
                    A–Z
                  </span>
                </div>
              </Link>

              <Link
                href="/estrategia-examen"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    ...linkStyle,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F6F1F1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span>Estrategia de examen</span>
                  <span
                    aria-hidden="true"
                    style={{ color: "#2E7D4F", fontWeight: 900 }}
                  >
                    ✓
                  </span>
                </div>
              </Link>

              {/* Unirse a una clase */}
              <Link
                href="/unirse-clase"
                onClick={() => setAbierto(false)}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={linkStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F6F1F1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Unirse a una clase
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Marca de SaberPlus cuando se está mostrando el branding de la institución */}
        {branding.logoUrl && (
          <div
            style={{
              padding: "0 16px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: 0.65,
            }}
          >
            <span style={{ fontSize: 11, color: "#8a9aaa" }}>
              Con tecnología de
            </span>
            <Logotipo size={16} colorTexto="#4a5a6a" colorAcento="var(--color-secundario, #19a7ce)" />
          </div>
        )}

        {/* CERRAR SESIÓN */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid var(--marca-borde, #afd3e2)" }}>
          {(rol === "ESTUDIANTE" || rol === "PROFESOR") && (
            <button
              onClick={() => {
                setAbierto(false);
                window.dispatchEvent(
                  new CustomEvent("saberplus:iniciar-tutorial"),
                );
              }}
              style={{
                width: "100%",
                padding: "11px 16px",
                marginBottom: 8,
                borderRadius: 8,
                border: "1px solid #C9DDE5",
                backgroundColor: "#F2F8FA",
                color: "var(--color-primario, #146c94)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 20,
                  height: 20,
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid #7DB2C7",
                  borderRadius: "50%",
                  fontSize: 12,
                }}
              >
                ?
              </span>
              Ayuda y recorrido
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "1.5px solid var(--marca-borde, #afd3e2)",
              backgroundColor: "transparent",
              color: "#BC7C7C",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
