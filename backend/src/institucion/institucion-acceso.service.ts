import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Servicio compartido pequeño: agrupa la lógica que necesitan casi todos
// los demás services de este módulo (InstitucionService, GrupoService,
// EstudianteService, EstudianteImportService) para no duplicarla ni forzar
// que se inyecten entre sí.
@Injectable()
export class InstitucionAccesoService {
  constructor(private prisma: PrismaService) {}

  async obtenerInstitucionIdDelUsuario(usuarioId: string) {
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

  async verificarCupoDisponible(
    institucionId: string,
    grado: 'DECIMO' | 'ONCE',
    estudianteId?: string,
    cantidadNueva: number = 1,
  ) {
    const institucion = await this.prisma.institucion.findUnique({
      where: { id: institucionId },
      select: { limiteGrado10: true, limiteGrado11: true },
    });

    const limite =
      grado === 'DECIMO'
        ? institucion?.limiteGrado10
        : institucion?.limiteGrado11;

    // NULL = sin límite fijo (plan "Colegio", cotización directa).
    if (limite === null || limite === undefined) {
      return;
    }

    const estudiantesEnGrado = await this.prisma.claseEstudiante.findMany({
      where: { Clase: { institucionId, grado } },
      select: { usuarioId: true },
      distinct: ['usuarioId'],
    });

    // Si el estudiante ya cuenta para el cupo de este grado (porque ya está
    // en otro grupo del mismo grado), no lo volvemos a contar: no está
    // ocupando un cupo nuevo, solo se está agregando a un segundo grupo.
    const yaContabilizado = estudianteId
      ? estudiantesEnGrado.some((e) => e.usuarioId === estudianteId)
      : false;

    // cantidadNueva permite validar un lote completo de una sola vez (por
    // ejemplo, una importación por CSV) en lugar de un estudiante a la vez.
    if (
      !yaContabilizado &&
      estudiantesEnGrado.length + cantidadNueva - 1 >= limite
    ) {
      const nombreGrado = grado === 'DECIMO' ? '10' : '11';
      if (cantidadNueva > 1) {
        const disponibles = Math.max(limite - estudiantesEnGrado.length, 0);
        throw new BadRequestException(
          `Solo hay ${disponibles} cupo(s) disponible(s) de grado ${nombreGrado} y el archivo trae ${cantidadNueva} estudiantes nuevos.`,
        );
      }
      throw new BadRequestException(
        `Se alcanzó el cupo de ${limite} estudiantes de grado ${nombreGrado} para tu institución.`,
      );
    }
  }
}
