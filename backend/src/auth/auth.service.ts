import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  calcularFechaVencimientoPrueba,
  planEstudianteVencido,
} from './plan.util';
import {
  generarTokenVerificacion,
  calcularExpiracionToken,
  requiereVerificacionCorreo,
} from './verificacion.util';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // ─── REGISTRO ───────────────────────────────────────────────
  async registrarEstudiante(
    nombre: string,
    correo: string,
    contrasena: string,
    rol: string = 'ESTUDIANTE',
  ) {
    const usuarioExiste = await this.prisma.usuario.findUnique({
      where: { correo },
    });
    if (usuarioExiste)
      throw new BadRequestException('El correo ya está registrado');

    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

    // La prueba gratis de 3 días YA NO arranca aquí: arranca cuando se
    // confirma el correo (verificarCorreo), para que nadie la reinicie
    // registrándose con correos falsos. Punto 7.
    const tokenVerificacion = generarTokenVerificacion();
    const tokenVerificacionExpira = calcularExpiracionToken();

    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasenaHash: contrasenaEncriptada,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        rol: rol as any,
        correoVerificado: false,
        tokenVerificacion,
        tokenVerificacionExpira,
      },
    });

    await this.mailService.enviarVerificacionCorreo(
      correo,
      nombre,
      tokenVerificacion,
    );

    return {
      mensaje: '¡Cuenta creada con éxito! Revisa tu correo para confirmarla.',
      usuarioId: nuevoUsuario.id,
    };
  }

  // ─── VERIFICACIÓN DE CORREO ─────────────────────────────────
  async verificarCorreo(token: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { tokenVerificacion: token },
    });

    if (!usuario) {
      throw new BadRequestException('El enlace de verificación no es válido.');
    }

    if (
      usuario.tokenVerificacionExpira &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      usuario.tokenVerificacionExpira.getTime() < Date.now()
    ) {
      throw new BadRequestException(
        'El enlace de verificación venció. Pide que te reenviemos uno nuevo.',
      );
    }

    // Aquí SÍ arranca la prueba gratis de 3 días, ya con el correo confirmado.
    const fechaVencimientoPlan =
      usuario.rol === 'ESTUDIANTE' && !usuario.institucionId
        ? calcularFechaVencimientoPrueba()
        : usuario.fechaVencimientoPlan;

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        correoVerificado: true,
        tokenVerificacion: null,
        tokenVerificacionExpira: null,
        fechaVencimientoPlan,
      },
    });

    return { mensaje: '¡Correo confirmado! Ya puedes empezar a estudiar.' };
  }

  // ─── REENVIAR VERIFICACIÓN ───────────────────────────────────
  async reenviarVerificacion(correo: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { correo } });

    // Mensaje genérico: no revelamos si el correo existe o no.
    const mensajeGenerico = {
      mensaje:
        'Si el correo existe y no está verificado, te reenviamos el enlace.',
    };

    if (!usuario || usuario.correoVerificado) {
      return mensajeGenerico;
    }

    const tokenVerificacion = generarTokenVerificacion();
    const tokenVerificacionExpira = calcularExpiracionToken();

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { tokenVerificacion, tokenVerificacionExpira },
    });

    await this.mailService.enviarVerificacionCorreo(
      correo,
      usuario.nombre,
      tokenVerificacion,
    );

    return mensajeGenerico;
  }

  // ─── LOGIN ──────────────────────────────────────────────────
  async login(correo: string, contrasena: string) {
    // 1. Buscar el usuario por correo
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    // 2. Comparar la contraseña con el hash guardado
    const contrasenaValida = await bcrypt.compare(
      contrasena,
      usuario.contrasenaHash,
    );

    if (!contrasenaValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    // 3. Crear el JWT con la info del usuario (el "payload")
    const payload = {
      sub: usuario.id, // "sub" = subject, estándar JWT
      correo: usuario.correo,
      rol: usuario.rol,
      nombre: usuario.nombre,
      institucionId: usuario.institucionId,
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      mensaje: '¡Bienvenido de vuelta!',
      accessToken: token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        xpTotal: usuario.xpTotal,
        institucionId: usuario.institucionId,
      },
    };
  }
  // ─── OBTENER PERFIL ─────────────────────────────────────────
  async obtenerPerfil(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        xpTotal: true,
        fechaCreacion: true,
        fotoPerfil: true,
        descripcion: true,
        institucionId: true,
        fechaVencimientoPlan: true,
        correoVerificado: true,
      },
    });

    if (!usuario) return usuario;

    return {
      ...usuario,
      // Ya resuelto en el backend para que el frontend no tenga que
      // repetir la lógica de "quién queda exento del muro de pago".
      planVencido: planEstudianteVencido(usuario),
      // Igual, pero para el aviso de "confirma tu correo".
      requiereVerificacionCorreo: requiereVerificacionCorreo(usuario),
    };
  }

  // ─── ACTUALIZAR PERFIL ───────────────────────────────────────
  async actualizarPerfil(
    usuarioId: string,
    descripcion?: string,
    fotoPerfil?: string,
  ) {
    const usuario = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        ...(descripcion !== undefined && { descripcion }),
        ...(fotoPerfil !== undefined && { fotoPerfil }),
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        fotoPerfil: true,
        descripcion: true,
      },
    });
    return { mensaje: 'Perfil actualizado', usuario };
  }
}
