import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

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
  ) {
    const usuarioExiste = await this.prisma.usuario.findUnique({
      where: { correo },
    });
    if (usuarioExiste) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasenaHash: contrasenaEncriptada,
        rol: 'ESTUDIANTE',
      },
    });

    return {
      mensaje: '¡Estudiante registrado con éxito!',
      usuarioId: nuevoUsuario.id,
    };
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
      },
    };
  }
}
