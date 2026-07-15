'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { obtenerToken } from '../lib/api';
import { decodificarToken, RolUsuario } from '../lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  rolesPermitidos: RolUsuario[];
}

export default function ProtectedRoute({ children, rolesPermitidos }: ProtectedRouteProps) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = obtenerToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const payload = decodificarToken(token);
    if (!payload || !rolesPermitidos.includes(payload.rol)) {
      router.push('/dashboard');
      return;
    }

    setAutorizado(true);
    setCargando(false);
  }, [router, rolesPermitidos]);

  if (cargando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#F6F1F1',
        fontSize: 18,
        color: '#146C94',
      }}>
        Cargando...
      </div>
    );
  }

  return autorizado ? <>{children}</> : null;
}
