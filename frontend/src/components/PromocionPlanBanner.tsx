import type { PromocionActiva } from '../lib/api';

interface PromocionPlanBannerProps {
  promocion: PromocionActiva;
}

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

export default function PromocionPlanBanner({
  promocion,
}: PromocionPlanBannerProps) {
  return (
    <aside
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        width: '100%',
        padding: '14px 18px',
        marginBottom: 22,
        boxSizing: 'border-box',
        border: '1px solid #F0C85A',
        borderRadius: 8,
        backgroundColor: '#FFF8DD',
        color: '#1a2a3a',
      }}
    >
      <strong
        style={{
          flex: '0 0 auto',
          fontSize: 22,
          lineHeight: 1,
          color: '#146C94',
        }}
      >
        -{promocion.porcentajeDescuento}%
      </strong>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
          {promocion.titulo}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#5F6872' }}>
          Hasta {formatoFecha.format(new Date(promocion.fechaExpiracion))}
        </p>
      </div>
    </aside>
  );
}
