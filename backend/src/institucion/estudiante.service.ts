import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../common/constants';
import { InstitucionAccesoService } from './institucion-acceso.service';

@Injectable()
export class EstudianteService {
  constructor(
    private prisma: PrismaService,
    private institucionAcceso: InstitucionAccesoService,
  ) {}

  async obtenerEstudiantesDeMiInstitucion(usuarioId: string) {
    const institucionId =
      await this.institucionAcceso.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }

    return this.prisma.usuario.findMany({
      where: {
        institucionId,
        rol: 'ESTUDIANTE',
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        fechaCreacion: true,
        ClaseEstudiante: {
          select: {
            Clase: {
              select: { id: true, nombre: true },
            },
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async crearEstudianteEnMiInstitucion(
    usuarioId: string,
    nombre: string,
    correo: string,
    contrasena: string,
    claseId?: string,
  ) {
    const institucionId =
      await this.institucionAcceso.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }

    const existe = await this.prisma.usuario.findUnique({
      where: { correo },
    });
    if (existe) {
      throw new BadRequestException('Ya existe un usuario con ese correo.');
    }

    if (claseId) {
      const grupo = await this.prisma.clase.findUnique({
        where: { id: claseId },
        select: { institucionId: true, grado: true },
      });
      if (!grupo || grupo.institucionId !== institucionId) {
        throw new NotFoundException('Grupo no encontrado.');
      }
      await this.institucionAcceso.verificarCupoDisponible(
        institucionId,
        grupo.grado,
      );
    }

    const contrasenaHash = await bcrypt.hash(contrasena, BCRYPT_SALT_ROUNDS);

    return this.prisma.$transaction(async (tx) => {
      const nuevoEstudiante = await tx.usuario.create({
        data: {
          nombre,
          correo,
          contrasenaHash,
          rol: 'ESTUDIANTE',
          institucionId,
        },
      });

      if (claseId) {
        await tx.claseEstudiante.create({
          data: { usuarioId: nuevoEstudiante.id, claseId },
        });
      }

      return nuevoEstudiante;
    });
  }

  async agregarEstudianteExistenteAMiInstitucion(
    usuarioId: string,
    correo: string,
    claseId?: string,
  ) {
    const institucionId =
      await this.institucionAcceso.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }

    if (claseId) {
      const grupo = await this.prisma.clase.findUnique({
        where: { id: claseId },
        select: { institucionId: true, grado: true },
      });
      if (!grupo || grupo.institucionId !== institucionId) {
        throw new NotFoundException('Grupo no encontrado.');
      }
      await this.institucionAcceso.verificarCupoDisponible(
        institucionId,
        grupo.grado,
      );
    }

    const estudiante = await this.prisma.usuario.findUnique({
      where: { correo },
      select: { id: true, rol: true, institucionId: true },
    });
    if (!estudiante) {
      throw new NotFoundException(
        'No existe ningún usuario registrado con ese correo.',
      );
    }
    if (estudiante.rol !== 'ESTUDIANTE') {
      throw new BadRequestException(
        'Esa cuenta no corresponde a un estudiante.',
      );
    }
    if (estudiante.institucionId === institucionId) {
      throw new BadRequestException(
        'Ese estudiante ya pertenece a tu institución.',
      );
    }
    if (estudiante.institucionId) {
      throw new BadRequestException(
        'Ese estudiante ya pertenece a otra institución.',
      );
    }
    return this.prisma.$transaction(async (tx) => {
      const actualizado = await tx.usuario.update({
        where: { id: estudiante.id },
        data: { institucionId },
      });

      if (claseId) {
        await tx.claseEstudiante.create({
          data: { usuarioId: estudiante.id, claseId },
        });
      }

      return actualizado;
    });
  }
}
