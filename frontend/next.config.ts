import type { NextConfig } from "next";
import path from "node:path";

const frontendRoot = path.resolve(__dirname);

const rutasNoIndex = [
  "/admin",
  "/cambiar-contrasena-inicial",
  "/dashboard",
  "/diagnostico",
  "/estrategia-examen",
  "/estudiar",
  "/formulas",
  "/glosario",
  "/historial-respuestas",
  "/institucion",
  "/login",
  "/pagos",
  "/perfil",
  "/plan-estudio",
  "/planes/resultado-pago",
  "/preguntas-aleatorias",
  "/recuperar-contrasena",
  "/referidos",
  "/registro/confirmar",
  "/restablecer-contrasena",
  "/resultados",
  "/simulacro",
  "/simulacro-personalizado",
  "/unirse-clase",
  "/verificar-correo",
];

const cabeceraNoIndex = {
  key: "X-Robots-Tag",
  value: "noindex, nofollow, noarchive",
};

const nextConfig: NextConfig = {
  turbopack: {
    root: frontendRoot,
  },
  outputFileTracingRoot: frontendRoot,
  async headers() {
    return rutasNoIndex.flatMap((ruta) => [
      { source: ruta, headers: [cabeceraNoIndex] },
      { source: `${ruta}/:path*`, headers: [cabeceraNoIndex] },
    ]);
  },
};

export default nextConfig;
