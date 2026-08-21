"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { obtenerToken } from "../../lib/api";
import {
  AREAS_GLOSARIO,
  AREA_NOMBRE_GLOSARIO,
  TERMINOS_GLOSARIO,
  esAreaGlosario,
  type AreaGlosario,
  type TerminoGlosario,
} from "../../lib/glosario-icfes";
import styles from "./page.module.css";

type FiltroArea = AreaGlosario | "TODAS";

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function inicialDe(termino: string) {
  return normalizar(termino).charAt(0).toUpperCase();
}

function agruparPorInicial(terminos: TerminoGlosario[]) {
  return terminos.reduce<Record<string, TerminoGlosario[]>>((grupos, item) => {
    const inicial = inicialDe(item.termino);
    grupos[inicial] = [...(grupos[inicial] ?? []), item];
    return grupos;
  }, {});
}

function GlosarioContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busqueda, setBusqueda] = useState("");
  const [verificando, setVerificando] = useState(true);
  const parametroArea = searchParams.get("area");
  const area: FiltroArea = esAreaGlosario(parametroArea)
    ? parametroArea
    : "TODAS";

  useEffect(() => {
    if (!obtenerToken()) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVerificando(false);
  }, [router]);

  const terminosFiltrados = useMemo(() => {
    const consulta = normalizar(busqueda.trim());
    return TERMINOS_GLOSARIO.filter((item) => {
      const coincideArea = area === "TODAS" || item.area === area;
      const coincideBusqueda =
        !consulta ||
        normalizar(
          [
            item.termino,
            item.definicion,
            item.ejemplo,
            ...(item.relacionados ?? []),
          ].join(" "),
        ).includes(consulta);
      return coincideArea && coincideBusqueda;
    }).sort((a, b) => a.termino.localeCompare(b.termino, "es"));
  }, [area, busqueda]);

  const grupos = agruparPorInicial(terminosFiltrados);
  const letras = Object.keys(grupos).sort((a, b) => a.localeCompare(b, "es"));

  const cambiarArea = (nuevaArea: FiltroArea) => {
    setBusqueda("");
    router.replace(
      nuevaArea === "TODAS" ? "/glosario" : `/glosario?area=${nuevaArea}`,
      { scroll: false },
    );
  };

  if (verificando) {
    return <div className={styles.loading}>Cargando glosario...</div>;
  }

  return (
    <div className={styles.page}>
      <header className={`${styles.header} ${styles.noPrint}`}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/dashboard">
            Saber<span className={styles.brandAccent}>Plus</span>
          </Link>
          <Link className={styles.backLink} href="/dashboard">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.titleRow}>
          <div>
            <p className={styles.eyebrow}>Conceptos esenciales Saber 11</p>
            <h1 className={styles.title}>Glosario de términos</h1>
            <p className={styles.description}>
              Definiciones y ejemplos breves de los conceptos que aparecen con
              frecuencia en las cinco áreas evaluadas.
            </p>
          </div>
          <button
            className={`${styles.printButton} ${styles.noPrint}`}
            type="button"
            onClick={() => window.print()}
            title="Imprimir glosario"
          >
            Imprimir
          </button>
        </div>

        <div
          className={`${styles.filters} ${styles.noPrint}`}
          role="tablist"
          aria-label="Filtrar glosario por área"
        >
          <button
            type="button"
            role="tab"
            aria-selected={area === "TODAS"}
            className={`${styles.filterButton} ${area === "TODAS" ? styles.filterActive : ""}`}
            onClick={() => cambiarArea("TODAS")}
          >
            Todas las áreas
          </button>
          {AREAS_GLOSARIO.map((opcion) => (
            <button
              key={opcion.key}
              type="button"
              role="tab"
              aria-selected={area === opcion.key}
              className={`${styles.filterButton} ${area === opcion.key ? styles.filterActive : ""}`}
              onClick={() => cambiarArea(opcion.key)}
            >
              {opcion.nombre}
            </button>
          ))}
        </div>

        <div className={`${styles.toolbar} ${styles.noPrint}`}>
          <input
            className={styles.search}
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar término, definición o ejemplo"
            aria-label="Buscar en el glosario"
          />
          <span className={styles.count}>
            {terminosFiltrados.length} término
            {terminosFiltrados.length === 1 ? "" : "s"}
          </span>
        </div>

        {letras.length > 0 && (
          <nav
            className={`${styles.alphabet} ${styles.noPrint}`}
            aria-label="Índice alfabético"
          >
            {letras.map((letra) => (
              <a
                className={styles.letterLink}
                href={`#letra-${letra}`}
                key={letra}
              >
                {letra}
              </a>
            ))}
          </nav>
        )}

        {letras.length === 0 ? (
          <div className={styles.empty}>
            No hay términos que coincidan con “{busqueda}”.
          </div>
        ) : (
          letras.map((letra) => (
            <section className={styles.group} id={`letra-${letra}`} key={letra}>
              <h2 className={styles.groupLetter}>{letra}</h2>
              <div className={styles.termGrid}>
                {grupos[letra].map((item) => (
                  <article
                    className={styles.termCard}
                    data-area={item.area}
                    key={`${item.area}-${item.termino}`}
                  >
                    <div className={styles.termHeader}>
                      <h3 className={styles.termName}>{item.termino}</h3>
                      <span className={styles.areaBadge}>
                        {AREA_NOMBRE_GLOSARIO[item.area]}
                      </span>
                    </div>
                    <p className={styles.definition}>{item.definicion}</p>
                    <p className={styles.example}>{item.ejemplo}</p>
                    {item.relacionados && item.relacionados.length > 0 && (
                      <div
                        className={styles.related}
                        aria-label="Términos relacionados"
                      >
                        {item.relacionados.map((relacionado) => (
                          <span
                            className={styles.relatedTerm}
                            key={relacionado}
                          >
                            {relacionado}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

export default function GlosarioPage() {
  return (
    <Suspense
      fallback={<div className={styles.loading}>Cargando glosario...</div>}
    >
      <GlosarioContenido />
    </Suspense>
  );
}
