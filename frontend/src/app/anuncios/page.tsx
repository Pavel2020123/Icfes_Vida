"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  marcarAnuncioLeido,
  marcarTodosAnunciosLeidos,
  obtenerAnuncios,
  type Anuncio,
  type TipoAnuncio,
} from "../../lib/api";
import ProtectedRoute from "../../components/ProtectedRoute";
import { IconoFlechaIzquierda } from "../../components/Iconos";
import styles from "./AnunciosPage.module.css";

const etiquetasTipo: Record<TipoAnuncio, string> = {
  INFORMACION: "Información",
  IMPORTANTE: "Importante",
  EVENTO: "Evento",
};

const clasesTipo: Record<TipoAnuncio, string> = {
  INFORMACION: styles.accentInfo,
  IMPORTANTE: styles.accentImportant,
  EVENTO: styles.accentEvent,
};

function fechaCorta(fecha: string) {
  return new Date(fecha).toLocaleString("es-CO", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AnunciosPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [pendientes, setPendientes] = useState(0);
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerAnuncios()
      .then((datos) => {
        setAnuncios(datos.anuncios);
        setPendientes(datos.pendientes);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el tablón.",
        );
      })
      .finally(() => setCargando(false));
  }, []);

  const visibles = useMemo(
    () =>
      soloPendientes ? anuncios.filter((anuncio) => !anuncio.leido) : anuncios,
    [anuncios, soloPendientes],
  );

  const marcarLeido = async (id: string) => {
    const anuncio = anuncios.find((item) => item.id === id);
    if (!anuncio || anuncio.leido) return;
    try {
      const lectura = await marcarAnuncioLeido(id);
      setAnuncios((actuales) =>
        actuales.map((item) =>
          item.id === id
            ? { ...item, leido: true, fechaLectura: lectura.fechaLectura }
            : item,
        ),
      );
      setPendientes((actual) => Math.max(0, actual - 1));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la lectura.",
      );
    }
  };

  const marcarTodos = async () => {
    if (pendientes === 0) return;
    try {
      await marcarTodosAnunciosLeidos();
      const ahora = new Date().toISOString();
      setAnuncios((actuales) =>
        actuales.map((anuncio) => ({
          ...anuncio,
          leido: true,
          fechaLectura: ahora,
        })),
      );
      setPendientes(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron marcar los anuncios.",
      );
    }
  };

  return (
    <ProtectedRoute rolesPermitidos={["ESTUDIANTE", "PROFESOR"]}>
      <div className={styles.page}>
        <header className={styles.topbar}>
          <div className={styles.topbarInner}>
            <Link className={styles.backLink} href="/dashboard">
              <IconoFlechaIzquierda /> Volver al panel
            </Link>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>SaberPlus al día</p>
              <h1>Tablón de anuncios</h1>
              <p>Novedades importantes de la plataforma.</p>
            </div>
            <button
              className={styles.markAll}
              type="button"
              disabled={pendientes === 0}
              onClick={() => void marcarTodos()}
            >
              Marcar todo como leído
            </button>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.segments} aria-label="Filtrar anuncios">
              <button
                className={!soloPendientes ? styles.selected : ""}
                type="button"
                onClick={() => setSoloPendientes(false)}
              >
                Todos
              </button>
              <button
                className={soloPendientes ? styles.selected : ""}
                type="button"
                onClick={() => setSoloPendientes(true)}
              >
                Pendientes
              </button>
            </div>
            <span className={styles.pendingCount}>
              {pendientes} pendiente{pendientes === 1 ? "" : "s"}
            </span>
          </div>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <div className={styles.list} aria-live="polite">
            {cargando ? (
              <div className={styles.empty}>Cargando anuncios...</div>
            ) : visibles.length === 0 ? (
              <div className={styles.empty}>
                {soloPendientes
                  ? "Estás al día. No tienes anuncios pendientes."
                  : "No hay anuncios vigentes en este momento."}
              </div>
            ) : (
              visibles.map((anuncio) => (
                <article
                  key={anuncio.id}
                  className={styles.announcement}
                  data-read={anuncio.leido}
                >
                  <div className={clasesTipo[anuncio.tipo]} />
                  <div className={styles.content}>
                    <div className={styles.titleRow}>
                      <h2>{anuncio.titulo}</h2>
                      {anuncio.destacado && (
                        <span className={styles.badge}>Destacado</span>
                      )}
                      {!anuncio.leido && (
                        <span className={styles.unread}>Nuevo</span>
                      )}
                    </div>
                    <p className={styles.body}>{anuncio.contenido}</p>
                    <div className={styles.meta}>
                      <span>{etiquetasTipo[anuncio.tipo]}</span>
                      <span>·</span>
                      <span>Publicado {fechaCorta(anuncio.fechaInicio)}</span>
                      {anuncio.fechaFin && (
                        <span>
                          Visible hasta {fechaCorta(anuncio.fechaFin)}
                        </span>
                      )}
                    </div>
                  </div>
                  {!anuncio.leido && (
                    <button
                      className={styles.readAction}
                      type="button"
                      onClick={() => void marcarLeido(anuncio.id)}
                    >
                      Marcar como leído
                    </button>
                  )}
                </article>
              ))
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
