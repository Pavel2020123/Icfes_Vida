import type { MetadataRoute } from "next";
import { URL_SITIO } from "../lib/seo";

const rutasPublicas = [
  { ruta: "/", prioridad: 1, frecuencia: "weekly" as const },
  { ruta: "/planes", prioridad: 0.9, frecuencia: "weekly" as const },
  { ruta: "/registro", prioridad: 0.8, frecuencia: "monthly" as const },
  { ruta: "/terminos", prioridad: 0.2, frecuencia: "yearly" as const },
  { ruta: "/privacidad", prioridad: 0.2, frecuencia: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return rutasPublicas.map(({ ruta, prioridad, frecuencia }) => ({
    url: new URL(ruta, URL_SITIO).toString(),
    lastModified: new Date(),
    changeFrequency: frecuencia,
    priority: prioridad,
  }));
}
