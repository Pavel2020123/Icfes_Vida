"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  obtenerToken,
  obtenerEstadisticasAdmin,
  obtenerTemasAdmin,
  obtenerUsuariosAdmin,
} from "../../lib/api";
import ProtectedRoute from "../../components/ProtectedRoute";
import type { Stats, Tema, Usuario, Pestana } from "./components/tipos";
import EstadisticasTab from "./components/EstadisticasTab";
import TemasTab from "./components/TemasTab";
import PreguntasTab from "./components/PreguntasTab";
import PreguntasAleatoriasTab from "./components/PreguntasAleatoriasTab";
import CasosPreguntasTab from "./components/CasosPreguntasTab";
import UsuariosTab from "./components/UsuariosTab";
import ContenidoTab from "./components/ContenidoTab";
import InteractivoTab from "./components/InteractivoTab";
import CalendarioTab from "./components/CalendarioTab";
import VentasTab from "./components/VentasTab";
import CuponesTab from "./components/CuponesTab";
import SoporteTab from "./components/SoporteTab";
import AnunciosTab from "./components/AnunciosTab";

export default function AdminPage() {
  const router = useRouter();
  const [pestana, setPestana] = useState<Pestana>("stats");

  const [stats, setStats] = useState<Stats | null>(null);
  const [miId, setMiId] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const token = obtenerToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.rol !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMiId(payload.sub);
    } catch {
      router.push("/login");
      return;
    }

    const cargar = async () => {
      setCargando(true);
      try {
        const [statsData, temasData, usuariosData] = await Promise.all([
          obtenerEstadisticasAdmin(),
          obtenerTemasAdmin(),
          obtenerUsuariosAdmin(),
        ]);
        setStats(statsData);
        setTemas(temasData);
        setUsuarios(usuariosData);
      } catch {}
      setCargando(false);
    };

    cargar();
  }, [router]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [statsData, temasData, usuariosData] = await Promise.all([
        obtenerEstadisticasAdmin(),
        obtenerTemasAdmin(),
        obtenerUsuariosAdmin(),
      ]);
      setStats(statsData);
      setTemas(temasData);
      setUsuarios(usuariosData);
    } catch {}
    setCargando(false);
  };

  const mostrarMensaje = useCallback((msg: string) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(""), 3000);
  }, []);

  if (cargando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#F6F1F1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#146C94", fontSize: 18, fontWeight: 600 }}>
          Cargando panel...
        </p>
      </div>
    );
  }

  return (
    <ProtectedRoute rolesPermitidos={["ADMIN"]}>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#F6F1F1",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* NAVBAR */}
        <nav
          style={{
            backgroundColor: "#1a2a3a",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 64,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 800, color: "#ffffff" }}>
              Saber<span style={{ color: "#8DD8FF" }}>Plus</span>
              <span
                style={{
                  marginLeft: 12,
                  fontSize: 13,
                  backgroundColor: "#146C94",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontWeight: 600,
                }}
              >
                Admin
              </span>
            </span>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#ffffff",
                padding: "7px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Salir del panel
            </button>
          </div>
        </nav>

        {mensaje && (
          <div
            style={{
              backgroundColor: "#D2E0FB",
              color: "#146C94",
              padding: "12px",
              textAlign: "center",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {mensaje}
          </div>
        )}

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
          {/* PESTAÑAS */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 32,
              flexWrap: "wrap",
            }}
          >
            {[
              { key: "stats", label: "Estadísticas" },
              { key: "temas", label: "Temas y Subtemas" },
              { key: "casos", label: "Casos y contextos" },
              { key: "preguntas", label: "Preguntas" },
              { key: "aleatorias", label: "🎲 Preguntas aleatorias" },
              { key: "usuarios", label: "Usuarios" },
              { key: "contenido", label: "Contenido de temas" },
              { key: "interactivo", label: "Ejercicio interactivo" },
              { key: "calendario", label: "📅 Calendario ICFES" },
              { key: "ventas", label: "Ventas e instituciones" },
              { key: "cupones", label: "Cupones y promociones" },
              { key: "anuncios", label: "Anuncios" },
              { key: "soporte", label: "Soporte" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPestana(p.key as Pestana)}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  backgroundColor: pestana === p.key ? "#146C94" : "#ffffff",
                  color: pestana === p.key ? "#ffffff" : "#4a5a6a",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* ESTADÍSTICAS */}
          {pestana === "stats" && stats && <EstadisticasTab stats={stats} />}

          {/* TEMAS Y SUBTEMAS */}
          {pestana === "temas" && (
            <TemasTab
              temas={temas}
              mostrarMensaje={mostrarMensaje}
              cargarDatos={cargarDatos}
            />
          )}

          {pestana === "casos" && (
            <CasosPreguntasTab mostrarMensaje={mostrarMensaje} />
          )}

          {/* PREGUNTAS */}
          {pestana === "preguntas" && (
            <PreguntasTab
              temas={temas}
              mostrarMensaje={mostrarMensaje}
              cargarDatos={cargarDatos}
            />
          )}

          {/* PREGUNTAS ALEATORIAS */}
          {pestana === "aleatorias" && (
            <PreguntasAleatoriasTab
              temas={temas}
              mostrarMensaje={mostrarMensaje}
              cargarDatos={cargarDatos}
            />
          )}

          {/* USUARIOS */}
          {pestana === "usuarios" && (
            <UsuariosTab
              usuarios={usuarios}
              miId={miId}
              mostrarMensaje={mostrarMensaje}
              cargarDatos={cargarDatos}
            />
          )}

          {/* CONTENIDO DE TEMAS */}
          {pestana === "contenido" && (
            <ContenidoTab temas={temas} mostrarMensaje={mostrarMensaje} />
          )}

          {/* EJERCICIO INTERACTIVO */}
          {pestana === "interactivo" && (
            <InteractivoTab temas={temas} mostrarMensaje={mostrarMensaje} />
          )}

          {/* CALENDARIO ICFES */}
          {pestana === "calendario" && (
            <CalendarioTab mostrarMensaje={mostrarMensaje} />
          )}

          {pestana === "ventas" && (
            <VentasTab mostrarMensaje={mostrarMensaje} />
          )}

          {pestana === "cupones" && (
            <CuponesTab mostrarMensaje={mostrarMensaje} />
          )}

          {pestana === "anuncios" && (
            <AnunciosTab mostrarMensaje={mostrarMensaje} />
          )}

          {pestana === "soporte" && (
            <SoporteTab mostrarMensaje={mostrarMensaje} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
