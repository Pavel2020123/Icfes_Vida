'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  obtenerConfiguracionSoporte,
  type ConfiguracionSoporte,
} from '../lib/api';

export default function SoporteWhatsApp() {
  const pathname = usePathname();
  const ocultoEnAdmin = pathname.startsWith('/admin');
  const [configuracion, setConfiguracion] =
    useState<ConfiguracionSoporte | null>(null);

  useEffect(() => {
    if (ocultoEnAdmin) return;

    let vigente = true;
    obtenerConfiguracionSoporte()
      .then((datos) => {
        if (vigente) setConfiguracion(datos);
      })
      .catch(() => {
        if (vigente) setConfiguracion(null);
      });

    return () => {
      vigente = false;
    };
  }, [ocultoEnAdmin]);

  if (
    ocultoEnAdmin ||
    !configuracion?.activo ||
    !configuracion.whatsappUrl
  ) {
    return null;
  }

  return (
    <a
      className="soporte-whatsapp"
      href={configuracion.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir soporte por WhatsApp"
      title="Soporte por WhatsApp"
    >
      <span aria-hidden="true">☎</span>
      <span className="soporte-tooltip">Soporte por WhatsApp</span>

      <style jsx>{`
        .soporte-whatsapp {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 250;
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border: 2px solid #ffffff;
          border-radius: 50%;
          background-color: #16805e;
          box-shadow: 0 6px 18px rgba(18, 62, 82, 0.28);
          color: #ffffff;
          font-size: 25px;
          line-height: 1;
          text-decoration: none;
          transition: transform 0.18s ease, background-color 0.18s ease;
        }
        .soporte-whatsapp:hover {
          transform: translateY(-2px);
          background-color: #116a4d;
        }
        .soporte-whatsapp:focus-visible {
          outline: 3px solid #8dd8ff;
          outline-offset: 3px;
        }
        .soporte-tooltip {
          position: absolute;
          right: 66px;
          width: max-content;
          max-width: 190px;
          padding: 8px 10px;
          border-radius: 6px;
          background: #1a2a3a;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.2;
          opacity: 0;
          pointer-events: none;
          transform: translateX(4px);
          transition: opacity 0.16s ease, transform 0.16s ease;
        }
        .soporte-whatsapp:hover .soporte-tooltip,
        .soporte-whatsapp:focus-visible .soporte-tooltip {
          opacity: 1;
          transform: translateX(0);
        }
        @media (max-width: 540px) {
          .soporte-whatsapp {
            right: 16px;
            bottom: 16px;
            width: 52px;
            height: 52px;
          }
        }
      `}</style>
    </a>
  );
}
