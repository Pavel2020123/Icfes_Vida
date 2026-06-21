import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

// ─── GUARD PARA USUARIOS LOGUEADOS ──────────────────────────
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException(
        'No hay token. Inicia sesión para continuar.',
      );
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(token, {
        secret:
          process.env.JWT_SECRET || 'icfes-vida-super-secreto-cambiar-en-prod',
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      request['usuario'] = payload;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    return true;
  }

  private extraerToken(request: Request): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}

// ─── GUARD SOLO PARA ADMINS ─────────────────────────────────
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    const tokenLimpio = tipo === 'Bearer' ? token : undefined;

    if (!tokenLimpio) throw new UnauthorizedException('No hay token.');

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(tokenLimpio, {
        secret:
          process.env.JWT_SECRET || 'icfes-vida-super-secreto-cambiar-en-prod',
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (payload.rol !== 'ADMIN') {
        throw new UnauthorizedException('No tienes permiso de administrador.');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      request['usuario'] = payload;
    } catch {
      throw new UnauthorizedException('Token inválido o sin permiso.');
    }

    return true;
  }
}
