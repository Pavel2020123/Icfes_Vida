import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest, JwtPayload } from './auth.types';

// ─── GUARD PARA USUARIOS LOGUEADOS ──────────────────────────
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException(
        'No hay token. Inicia sesión para continuar.',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.usuario = payload;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    return true;
  }

  private extraerToken(request: AuthenticatedRequest): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}

// ─── GUARD SOLO PARA ADMINS ─────────────────────────────────
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extraerToken(request);

    if (!token && !request.usuario) {
      throw new UnauthorizedException('No hay token.');
    }

    const payload = request.usuario
      ? request.usuario
      : await this.jwtService.verifyAsync<JwtPayload>(token);

    if (payload.rol !== 'ADMIN') {
      throw new UnauthorizedException('No tienes permiso de administrador.');
    }

    request.usuario = payload;
    return true;
  }

  private extraerToken(request: AuthenticatedRequest): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}
