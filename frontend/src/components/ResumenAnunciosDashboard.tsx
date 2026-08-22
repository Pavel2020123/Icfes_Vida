"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { obtenerAnuncios, type Anuncio } from "../lib/api";
import styles from "./ResumenAnunciosDashboard.module.css";

export default function ResumenAnunciosDashboard() {
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    obtenerAnuncios()
      .then((datos) => {
        setAnuncio(datos.anuncios.find((item) => !item.leido) ?? null);
        setPendientes(datos.pendientes);
      })
      .catch(() => undefined);
  }, []);

  if (!anuncio) return null;

  return (
    <aside className={styles.banner} aria-label="Nuevo anuncio">
      <div className={styles.accent} data-type={anuncio.tipo} />
      <div className={styles.content}>
        <span className={styles.label}>
          {pendientes === 1 ? "Nuevo anuncio" : `${pendientes} anuncios nuevos`}
        </span>
        <span className={styles.title}>{anuncio.titulo}</span>
        <span className={styles.excerpt}>{anuncio.contenido}</span>
      </div>
      <Link className={styles.link} href="/anuncios">
        Ver tablón
      </Link>
    </aside>
  );
}
