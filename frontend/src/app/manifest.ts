import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SaberPlus | Preparación Saber 11",
    short_name: "SaberPlus",
    description: "Diagnóstico, estudio y simulacros para las pruebas Saber 11.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1f1",
    theme_color: "#146c94",
    lang: "es-CO",
    categories: ["education"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
