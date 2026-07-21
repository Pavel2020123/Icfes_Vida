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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

    // El autoregistro siempre es un estudiante/profesor INDIVIDUAL (sin
    // institución todavía). Solo el estudiante individual arranca con la
    // prueba gratis de 3 días; los que luego entren a una institución
    // quedan regidos por el cupo/vigencia del colegio, no por esta fecha.
    const fechaVencimientoPlan =
      rol === 'ESTUDIANTE' ? calcularFechaVencimientoPrueba() : null;

    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasenaHash: contrasenaEncriptada,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        rol: rol as any,
        fechaVencimientoPlan,
      },
    });

    return { mensaje: '¡Cuenta creada con éxito!', usuarioId: nuevoUsuario.id };
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
      },
    });

    if (!usuario) return usuario;

    return {
      ...usuario,
      // Ya resuelto en el backend para que el frontend no tenga que
      // repetir la lógica de "quién queda exento del muro de pago".
      planVencido: planEstudianteVencido(usuario),
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
