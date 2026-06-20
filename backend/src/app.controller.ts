import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('crear-estudiante')
  async crearEstudianteTest() {
    const nuevoEstudiante = await this.prisma.usuario.create({
      data: {
        nombre: 'Juan Perez',
        correo: 'juan.test@gmail.com',
        contrasenaHash: '123456', // Luego aprenderemos a encriptar esto
        rol: 'ESTUDIANTE',
      },
    });

    return {
      mensaje: '¡Estudiante creado con éxito en PostgreSQL desde el código!',
      datos: nuevoEstudiante,
    };
  }
}
