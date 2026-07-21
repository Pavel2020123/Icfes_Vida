import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { planEstudianteVencido } from './plan.util';

// ─── GUARD: MURO DE PAGO DEL ESTUDIANTE INDIVIDUAL ──────────
// IMPORTANTE: siempre se usa DESPUÉS de JwtGuard, así:
//   @UseGuards(JwtGuard, PlanVigenteGuard)
// porque necesita que JwtGuard ya haya puesto el payload en request['usuario'].
@Injectable()
export class PlanVigenteGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const usuarioId = request['usuario']?.sub as string | undefined;

    if (!usuarioId) {
      throw new UnauthorizedException(
        'No hay token. Inicia sesión para continuar.',
      );
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { institucionId: true, rol: true, fechaVencimientoPlan: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (planEstudianteVencido(usuario)) {
      throw new ForbiddenException({
        codigo: 'PLAN_VENCIDO',
        mensaje:
          'Tu prueba gratuita de 3 días terminó. Activa tu plan para seguir estudiando.',
      });
    }

    return true;
  }
}
