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
    void grado;
    const institucion = await this.prisma.institucion.findUnique({
      where: { id: institucionId },
      select: {
        limiteEstudiantes: true,
        limiteGrado10: true,
        limiteGrado11: true,
      },
    });

    const limiteLegado =
      (institucion?.limiteGrado10 ?? 0) + (institucion?.limiteGrado11 ?? 0);
    const limite =
      institucion?.limiteEstudiantes ??
      (limiteLegado > 0 ? limiteLegado : null);

    // NULL = sin límite fijo (plan "Colegio", cotización directa).
    if (limite === null || limite === undefined) {
      return;
    }

    const estudiantesInstitucion = await this.prisma.claseEstudiante.findMany({
      where: { Clase: { institucionId } },
      select: { usuarioId: true },
      distinct: ['usuarioId'],
    });

    // Si el estudiante ya cuenta para el cupo de este grado (porque ya está
    // en otro grupo del mismo grado), no lo volvemos a contar: no está
    // ocupando un cupo nuevo, solo se está agregando a un segundo grupo.
    const yaContabilizado = estudianteId
      ? estudiantesInstitucion.some((e) => e.usuarioId === estudianteId)
      : false;

    // cantidadNueva permite validar un lote completo de una sola vez (por
    // ejemplo, una importación por CSV) en lugar de un estudiante a la vez.
    if (
      !yaContabilizado &&
      estudiantesInstitucion.length + cantidadNueva > limite
    ) {
      if (cantidadNueva > 1) {
        const disponibles = Math.max(limite - estudiantesInstitucion.length, 0);
        throw new BadRequestException(
          `Solo hay ${disponibles} cupo(s) disponible(s) y el archivo trae ${cantidadNueva} estudiantes nuevos.`,
        );
      }
      throw new BadRequestException(
        `Se alcanzó el cupo total de ${limite} estudiantes para tu institución.`,
      );
    }
  }
}
