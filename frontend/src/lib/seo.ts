import type { Metadata } from "next";

const dominioConfigurado =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://icfesvida.com";

export const URL_SITIO = new URL(
  dominioConfigurado.startsWith("http")
    ? dominioConfigurado
    : `https://${dominioConfigurado}`,
);

export const NOMBRE_SITIO = "SaberPlus";
export const DESCRIPCION_SITIO =
  "Prepárate para las pruebas Saber 11 con diagnóstico, planes de estudio, simulacros y seguimiento académico para estudiantes y colegios.";

interface OpcionesMetadata {
  titulo: string;
  descripcion: string;
  ruta: string;
  indexar?: boolean;
}

export function crearMetadataPagina({
  titulo,
  descripcion,
  ruta,
  indexar = true,
}: OpcionesMetadata): Metadata {
  return {
    title: titulo,
    description: descripcion,
    alternates: {
      canonical: ruta,
      languages: { "es-CO": ruta },
    },
    openGraph: {
      title: `${titulo} | ${NOMBRE_SITIO}`,
      description: descripcion,
      url: ruta,
      siteName: NOMBRE_SITIO,
      locale: "es_CO",
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${NOMBRE_SITIO}, preparación para las pruebas Saber 11`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${titulo} | ${NOMBRE_SITIO}`,
      description: descripcion,
      images: ["/opengraph-image"],
    },
    robots: indexar
      ? { index: true, follow: true }
      : { index: false, follow: false, noarchive: true },
  };
}
