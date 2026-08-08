import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { InstitucionAccesoService } from './institucion-acceso.service';
import { generarCodigoConPrefijo } from './utils/generar-codigo.util';

@Injectable()
export class GrupoService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private institucionAcceso: InstitucionAccesoService,
  ) {}

  async obtenerGruposDeMiInstitucion(usuarioId: string) {
    const institucionId =
      await this.institucionAcceso.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }

    return this.prisma.clase.findMany({
      where: { institucionId },
      select: {
        id: true,
        nombre: true,
        codigoIngreso: true,
        grado: true,
        ClaseEstudiante: {
          select: {
            usuarioId: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async crearGrupoEnMiInstitucion(
    usuarioId: string,
    nombre: string,
    grado: 'DECIMO' | 'ONCE',
  ) {
    const institucionId =
      await this.institucionAcceso.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }

    if (grado !== 'DECIMO' && grado !== 'ONCE') {
      throw new BadRequestException('El grado debe ser DECIMO u ONCE.');
    }

    const codigoIngreso = await this.generarCodigoIngreso();

    return this.prisma.clase.create({
      data: {
        nombre,
        codigoIngreso,
        grado,
        institucionId,
      },
    });
  }

  async actualizarGrupo(usuarioId: string, claseId: string, nombre?: string) {
    const institucionId =
      await this.institucionAcceso.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }

    const grupo = await this.prisma.clase.findUnique({
      where: { id: claseId },
      select: { institucionId: true },
    });
    if (!grupo || grupo.institucionId !== institucionId) {
      throw new NotFoundException('Grupo no encontrado.');
    }

    return this.prisma.clase.update({
      where: { id: claseId },
      data: {
        ...(nombre !== undefined && { nombre }),
      },
    });
  }

  async eliminarGrupo(usuarioId: string, claseId: string) {
    const institucionId =
      await this.institucionAcceso.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }

    const grupo = await this.prisma.clase.findUnique({
      where: { id: claseId },
      select: { institucionId: true },
    });
    if (!grupo || grupo.institucionId !== institucionId) {
      throw new NotFoundException('Grupo no encontrado.');
    }

    return this.prisma.clase.delete({ where: { id: claseId } });
  }

  async agregarEstudianteAGrupo(
    usuarioId: string,
    claseId: string,
    estudianteId: string,
  ) {
    const institucionId =
      await this.institucionAcceso.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }
    const grupo = await this.prisma.clase.findUnique({
      where: { id: claseId },
      select: { institucionId: true, grado: true },
    });
    if (!grupo || grupo.institucionId !== institucionId) {
      throw new NotFoundException('Grupo no encontrado.');
    }
    const estudiante = await this.prisma.usuario.findUnique({
      where: { id: estudianteId },
      select: { rol: true, institucionId: true },
    });
    if (
      !estudiante ||
      estudiante.rol !== 'ESTUDIANTE' ||
      estudiante.institucionId !== institucionId
    ) {
      throw new BadRequestException(
        'Ese estudiante no pertenece a tu institución.',
      );
    }
    const yaAsignado = await this.prisma.claseEstudiante.findUnique({
      where: { usuarioId_claseId: { usuarioId: estudianteId, claseId } },
    });
    if (yaAsignado) {
      throw new BadRequestException('El estudiante ya está en ese grupo.');
    }
    await this.institucionAcceso.verificarCupoDisponible(
      institucionId,
      grupo.grado,
      estudianteId,
    );
    return this.prisma.claseEstudiante.create({
      data: { usuarioId: estudianteId, claseId },
    });
  }

  async quitarEstudianteDeGrupo(
    usuarioId: string,
    claseId: string,
    estudianteId: string,
  ) {
    const institucionId =
      await this.institucionAcceso.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }
    const grupo = await this.prisma.clase.findUnique({
      where: { id: claseId },
      select: { institucionId: true },
    });
    if (!grupo || grupo.institucionId !== institucionId) {
      throw new NotFoundException('Grupo no encontrado.');
    }
    return this.prisma.claseEstudiante.delete({
      where: { usuarioId_claseId: { usuarioId: estudianteId, claseId } },
    });
  }

  async unirseAClase(usuarioId: string, codigoIngreso: string) {
    const codigo = (codigoIngreso || '').trim().toUpperCase();
    if (!codigo) {
      throw new BadRequestException('Debes ingresar un código de clase.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, rol: true, institucionId: true },
    });
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }
    if (usuario.rol !== 'ESTUDIANTE') {
      throw new BadRequestException(
        'Solo los estudiantes pueden unirse a una clase con un código.',
      );
    }

    const clase = await this.prisma.clase.findUnique({
      where: { codigoIngreso: codigo },
      include: { Institucion: { select: { id: true, nombre: true } } },
    });
    if (!clase) {
      throw new NotFoundException('Ese código de clase no existe.');
    }

    if (
      usuario.institucionId &&
      usuario.institucionId !== clase.institucionId
    ) {
      throw new BadRequestException(
        'Ya perteneces a otra institución. Contacta a tu profesor si necesitas cambiarte.',
      );
    }

    const yaInscrito = await this.prisma.claseEstudiante.findUnique({
      where: { usuarioId_claseId: { usuarioId, claseId: clase.id } },
    });
    if (yaInscrito) {
      throw new BadRequestException('Ya estás inscrito en esa clase.');
    }

    await this.institucionAcceso.verificarCupoDisponible(
      clase.institucionId,
      clase.grado,
      usuarioId,
    );

    const [usuarioActualizado] = await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { institucionId: clase.institucionId },
      }),
      this.prisma.claseEstudiante.create({
        data: { usuarioId, claseId: clase.id },
      }),
    ]);

    // Emitimos un token nuevo porque institucionId cambió y viaja en el JWT.
    const payload = {
      sub: usuarioActualizado.id,
      correo: usuarioActualizado.correo,
      rol: usuarioActualizado.rol,
      nombre: usuarioActualizado.nombre,
      institucionId: usuarioActualizado.institucionId,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      mensaje: `¡Te uniste a "${clase.nombre}" con éxito!`,
      accessToken,
      clase: { id: clase.id, nombre: clase.nombre },
      institucion: clase.Institucion,
    };
  }

  private async generarCodigoIngreso() {
    return generarCodigoConPrefijo(
      'GRUPO',
      async (codigo) =>
        (await this.prisma.clase.findUnique({
          where: { codigoIngreso: codigo },
        })) !== null,
    );
  }
}
