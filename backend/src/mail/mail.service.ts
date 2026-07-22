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
}
