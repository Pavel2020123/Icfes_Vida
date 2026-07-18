'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { obtenerMiInstitucion, obtenerToken } from '../lib/api';
import { decodificarToken } from '../lib/auth';

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
        logoUrl: institucion?.logoUrl ?? null,
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refrescarBranding();
  }, [refrescarBranding]);

  return (
    <ThemeContext.Provider value={{ branding, refrescarBranding }}>
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