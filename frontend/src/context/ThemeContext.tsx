'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { obtenerMiInstitucion, obtenerToken, obtenerUrlLogo } from '../lib/api';
import { decodificarToken } from '../lib/auth';

// ─── PUNTO 6: actualización automática del branding ─────────────────
// Sin Supabase todavía no tenemos websockets/tiempo real del lado del
// backend, así que resolvemos "que se refleje sin cerrar sesión" con tres
// mecanismos combinados (baratos y sin dependencias nuevas):
//   1) Polling: cada POLL_INTERVAL_MS volvemos a pedir /instituciones/me.
//      Cubre el caso de dos personas en dispositivos distintos.
//   2) Refetch al volver a la pestaña (visibilitychange) o al enfocar la
//      ventana: el caso más común (el estudiante minimiza y vuelve).
//   3) BroadcastChannel: si el profesor tiene varias pestañas del mismo
//      navegador abiertas, el cambio se refleja al instante en todas,
//      sin esperar al polling.
// El día que migremos a Supabase, esto se puede reemplazar por una
// suscripción realtime sin tocar el resto de la app (todo pasa por
// refrescarBranding()).
const POLL_INTERVAL_MS = 20000;
const CANAL_BRANDING = 'saberplus-branding';

export interface Branding {
  nombre: string | null;
  mensajeBienvenida: string | null;
  logoUrl: string | null;
  colorPrimario: string;
  colorSecundario: string;
  cargando: boolean;
}

interface ThemeContextValue {
  branding: Branding;
  refrescarBranding: () => Promise<void>;
}

const COLOR_PRIMARIO_DEFECTO = '#146C94';
const COLOR_SECUNDARIO_DEFECTO = '#19A7CE';

const BRANDING_INICIAL: Branding = {
  nombre: null,
  mensajeBienvenida: null,
  logoUrl: null,
  colorPrimario: COLOR_PRIMARIO_DEFECTO,
  colorSecundario: COLOR_SECUNDARIO_DEFECTO,
  cargando: true,
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function aplicarVariablesCss(colorPrimario: string, colorSecundario: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--color-primario', colorPrimario);
  document.documentElement.style.setProperty('--color-secundario', colorSecundario);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(BRANDING_INICIAL);

  const refrescarBranding = useCallback(async () => {
    const token = obtenerToken();
    const payload = decodificarToken(token);

    // Sin sesión o sin institución: identidad por defecto de SaberPlus.
    if (!payload?.institucionId) {
      const porDefecto = { ...BRANDING_INICIAL, cargando: false };
      setBranding(porDefecto);
      aplicarVariablesCss(porDefecto.colorPrimario, porDefecto.colorSecundario);
      return;
    }

    try {
      const institucion = await obtenerMiInstitucion();
      const nuevoBranding: Branding = {
        nombre: institucion?.nombre ?? null,
        mensajeBienvenida: institucion?.mensajeBienvenida ?? null,
        logoUrl: obtenerUrlLogo(institucion?.logoUrl),
        colorPrimario: institucion?.colorPrimario || COLOR_PRIMARIO_DEFECTO,
        colorSecundario: institucion?.colorSecundario || COLOR_SECUNDARIO_DEFECTO,
        cargando: false,
      };
      setBranding(nuevoBranding);
      aplicarVariablesCss(nuevoBranding.colorPrimario, nuevoBranding.colorSecundario);
    } catch {
      // Si falla (token vencido, sin red, etc.) caemos a la identidad por defecto.
      const porDefecto = { ...BRANDING_INICIAL, cargando: false };
      setBranding(porDefecto);
      aplicarVariablesCss(porDefecto.colorPrimario, porDefecto.colorSecundario);
    }
  }, []);

  const canalRef = useRef<BroadcastChannel | null>(null);

  // Carga inicial (al iniciar sesión o al recargar la app).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refrescarBranding();
  }, [refrescarBranding]);

  // Mecanismo 1: polling. Se pausa mientras la pestaña está en segundo
  // plano para no gastar peticiones de más, y se reanuda al volver.
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refrescarBranding();
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(intervalo);
  }, [refrescarBranding]);

  // Mecanismo 2: refetch inmediato al volver a la pestaña o al enfocar
  // la ventana (ej. el estudiante minimiza, cambia de app y vuelve).
  useEffect(() => {
    const alVolverVisible = () => {
      if (document.visibilityState === 'visible') {
        refrescarBranding();
      }
    };
    document.addEventListener('visibilitychange', alVolverVisible);
    window.addEventListener('focus', alVolverVisible);
    return () => {
      document.removeEventListener('visibilitychange', alVolverVisible);
      window.removeEventListener('focus', alVolverVisible);
    };
  }, [refrescarBranding]);

  // Mecanismo 3: BroadcastChannel entre pestañas del mismo navegador.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const canal = new BroadcastChannel(CANAL_BRANDING);
    canalRef.current = canal;
    canal.onmessage = () => refrescarBranding();
    return () => {
      canal.close();
      canalRef.current = null;
    };
  }, [refrescarBranding]);

  // Se llama justo después de guardar cambios (nombre, colores o logo)
  // para que la propia pestaña se actualice al instante y, de paso, avise
  // a las demás pestañas abiertas sin esperar al polling.
  const refrescarBrandingYAvisar = useCallback(async () => {
    await refrescarBranding();
    canalRef.current?.postMessage('actualizado');
  }, [refrescarBranding]);

  return (
    <ThemeContext.Provider value={{ branding, refrescarBranding: refrescarBrandingYAvisar }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useBranding() {
  const contexto = useContext(ThemeContext);
  if (!contexto) {
    throw new Error('useBranding debe usarse dentro de un ThemeProvider.');
  }
  return contexto;
}