import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async enviarVerificacionCorreo(
    correo: string,
    nombre: string,
    token: string,
  ) {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verificar-correo?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || '"ICFES Vida" <no-reply@icfesvida.com>',
        to: correo,
        subject: 'Confirma tu correo — ICFES Vida',
        html: `
          <p>Hola ${nombre},</p>
          <p>Gracias por registrarte en ICFES Vida. Confirma tu correo para activar tu prueba gratis de 3 días:</p>
          <p><a href="${url}">Confirmar mi correo</a></p>
          <p>Si no fuiste tú, ignora este mensaje.</p>
        `,
      });
    } catch (error) {
      // No tumbamos el registro si el envío falla; el usuario puede pedir
      // el reenvío desde /auth/reenviar-verificacion.
      this.logger.error(
        `No se pudo enviar el correo de verificación a ${correo}`,
        error as Error,
      );
    }
  }

  async enviarRecuperacionContrasena(
    correo: string,
    nombre: string,
    token: string,
  ) {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/restablecer-contrasena?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || '"ICFES Vida" <no-reply@icfesvida.com>',
        to: correo,
        subject: 'Recupera tu contraseña — ICFES Vida',
        html: `
          <p>Hola ${nombre},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Este enlace vence en 1 hora:</p>
          <p><a href="${url}">Elegir una nueva contraseña</a></p>
          <p>Si no fuiste tú, ignora este mensaje: tu contraseña actual sigue funcionando.</p>
        `,
      });
    } catch (error) {
      // No revelamos si el envío falló al frontend; el mensaje siempre
      // es genérico para no filtrar qué correos existen.
      this.logger.error(
        `No se pudo enviar el correo de recuperación a ${correo}`,
        error as Error,
      );
    }
  }

  // Punto 11 del roadmap: aviso interno cuando un director de colegio
  // llena el formulario "Hablar con ventas". No es correo transaccional
  // para el lead — el lead no recibe nada, solo el equipo de ventas.
  async enviarNotificacionNuevoLead(lead: {
    id: string;
    nombreColegio: string;
    nombreContacto: string;
    correo: string;
    telefono?: string | null;
    ciudad?: string | null;
    linea: string;
    plan: string;
    numeroEstudiantesAprox?: number | null;
    mensaje?: string | null;
  }) {
    const correoDestino =
      process.env.VENTAS_NOTIFICACION_CORREO || 'ventas@icfesvida.com';

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || '"ICFES Vida" <no-reply@icfesvida.com>',
        to: correoDestino,
        subject: `Nuevo lead: ${lead.nombreColegio} — ${lead.linea} ${lead.plan}`,
        html: `
          <p>Nuevo colegio interesado en un plan institucional.</p>
          <ul>
            <li><strong>Colegio:</strong> ${lead.nombreColegio}</li>
            <li><strong>Contacto:</strong> ${lead.nombreContacto}</li>
            <li><strong>Correo:</strong> ${lead.correo}</li>
            <li><strong>Teléfono:</strong> ${lead.telefono || '—'}</li>
            <li><strong>Ciudad:</strong> ${lead.ciudad || '—'}</li>
            <li><strong>Línea / plan:</strong> ${lead.linea} ${lead.plan}</li>
            <li><strong>Estudiantes aprox.:</strong> ${lead.numeroEstudiantesAprox ?? '—'}</li>
            <li><strong>Mensaje:</strong> ${lead.mensaje || '—'}</li>
          </ul>
          <p>ID del lead: ${lead.id}</p>
        `,
      });
    } catch (error) {
      // No tumbamos la creación del lead si el correo de aviso falla:
      // el admin igual puede verlo en /ventas/admin.
      this.logger.error(
        `No se pudo enviar el aviso de nuevo lead (${lead.id})`,
        error as Error,
      );
    }
  }
}
