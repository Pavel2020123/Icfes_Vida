import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InstitucionService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async obtenerInstitucionIdDelUsuario(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { institucionId: true, rol: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (!usuario.institucionId) {
      return null;
    }

    return usuario.institucionId;
  }

  async obtenerMiInstitucion(usuarioId: string) {
    const institucionId = await this.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      return null;
    }

    return this.prisma.institucion.findUnique({
      where: { id: institucionId },
      include: {
        Usuario: {
          select: { id: true, nombre: true, rol: true },
        },
        Clase: {
          select: { id: true, nombre: true, codigoIngreso: true },
        },
      },
    });
  }

  async crearInstitucion(
    usuarioId: string,
    nombre: string,
    mensajeBienvenida?: string,
    logoUrl?: string,
    colorPrimario?: string,
    colorSecundario?: string,
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { institucionId: true, rol: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (usuario.institucionId) {
      throw new BadRequestException('Ya perteneces a una institución.');
    }

    if (usuario.rol !== 'PROFESOR' && usuario.rol !== 'ADMIN') {
      throw new UnauthorizedException(
        'Solo profesores o administradores pueden crear una institución.',
      );
    }

    const codigoUnico = await this.generarCodigoUnico();

    return this.prisma.institucion.create({
      data: {
        nombre,
        codigoUnico,
        mensajeBienvenida: mensajeBienvenida || null,
        logoUrl: logoUrl || null,
        colorPrimario: colorPrimario || null,
        colorSecundario: colorSecundario || null,
        Usuario: {
          connect: { id: usuarioId },
        },
      },
    });
  }

  async actualizarMiInstitucion(
    usuarioId: string,
    nombre?: string,
    mensajeBienvenida?: string,
    logoUrl?: string,
    colorPrimario?: string,
    colorSecundario?: string,
  ) {
    const institucionId = await this.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }

    return this.prisma.institucion.update({
      where: { id: institucionId },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(mensajeBienvenida !== undefined && { mensajeBienvenida }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(colorPrimario !== undefined && { colorPrimario }),
        ...(colorSecundario !== undefined && { colorSecundario }),
      },
    });
  }

  async obtenerEstudiantesDeMiInstitucion(usuarioId: string) {
    const institucionId = await this.obtenerInstitucionIdDelUsuario(usuarioId);
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
  ) {
    const institucionId = await this.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }

    const existe = await this.prisma.usuario.findUnique({
      where: { correo },
    });
    if (existe) {
      throw new BadRequestException('Ya existe un usuario con ese correo.');
    }

    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    return this.prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasenaHash,
        rol: 'ESTUDIANTE',
        institucionId,
      },
    });
  }

  async agregarEstudianteExistenteAMiInstitucion(
    usuarioId: string,
    correo: string,
  ) {
    const institucionId = await this.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
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
    return this.prisma.usuario.update({
      where: { id: estudiante.id },
      data: { institucionId },
    });
  }

  async obtenerGruposDeMiInstitucion(usuarioId: string) {
    const institucionId = await this.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }

    return this.prisma.clase.findMany({
      where: { institucionId },
      select: {
        id: true,
        nombre: true,
        codigoIngreso: true,
        ClaseEstudiante: {
          select: {
            usuarioId: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async crearGrupoEnMiInstitucion(usuarioId: string, nombre: string) {
    const institucionId = await this.obtenerInstitucionIdDelUsuario(usuarioId);
    if (!institucionId) {
      throw new BadRequestException('No perteneces a una institución.');
    }

    const codigoIngreso = await this.generarCodigoIngreso();

    return this.prisma.clase.create({
      data: {
        nombre,
        codigoIngreso,
        institucionId,
      },
    });
  }

  async actualizarGrupo(usuarioId: string, claseId: string, nombre?: string) {
    const institucionId = await this.obtenerInstitucionIdDelUsuario(usuarioId);
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
    const institucionId = await this.obtenerInstitucionIdDelUsuario(usuarioId);
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
    const institucionId = await this.obtenerInstitucionIdDelUsuario(usuarioId);
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
    return this.prisma.claseEstudiante.create({
      data: { usuarioId: estudianteId, claseId },
    });
  }

  async quitarEstudianteDeGrupo(
    usuarioId: string,
    claseId: string,
    estudianteId: string,
  ) {
    const institucionId = await this.obtenerInstitucionIdDelUsuario(usuarioId);
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

  private async generarCodigoUnico() {
    let codigo = '';
    let existe = true;

    while (existe) {
      codigo = `INST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      existe =
        (await this.prisma.institucion.findUnique({
          where: { codigoUnico: codigo },
        })) !== null;
    }

    return codigo;
  }

  private async generarCodigoIngreso() {
    let codigo = '';
    let existe = true;

    while (existe) {
      codigo = `GRUPO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      existe =
        (await this.prisma.clase.findUnique({
          where: { codigoIngreso: codigo },
        })) !== null;
    }

    return codigo;
  }
}
