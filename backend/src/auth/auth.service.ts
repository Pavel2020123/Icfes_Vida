import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async registrarEstudiante(
    nombre: string,
    correo: string,
    contrasena: string,
  ) {
    // 1. Verificar si el correo ya existe en PostgreSQL
    const usuarioExiste = await this.prisma.usuario.findUnique({
      where: { correo },
    });
    if (usuarioExiste) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // 2. Encriptar la contraseña (saltos = 10 es el estándar de seguridad)
    const saltos = 10;
    const contrasenaEncriptada = await bcrypt.hash(contrasena, saltos);

    // 3. Guardar el nuevo usuario
    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasenaHash: contrasenaEncriptada,
        rol: 'ESTUDIANTE',
      },
    });

    return {
      mensaje: '¡Estudiante registrado con seguridad profesional!',
      usuarioId: nuevoUsuario.id,
    };
  }
}
