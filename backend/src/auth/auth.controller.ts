import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';

interface RegistroDto {
  nombre: string;
  correo: string;
  contrasena: string;
  rol?: string;
}

interface LoginDto {
  correo: string;
  contrasena: string;
}

interface PerfilDto {
  descripcion?: string;
  fotoPerfil?: string;
}

interface VerificarCorreoDto {
  token: string;
}

interface ReenviarVerificacionDto {
  correo: string;
}

interface SolicitarRecuperacionDto {
  correo: string;
}

interface RestablecerContrasenaDto {
  token: string;
  nuevaContrasena: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  registrar(@Body() body: RegistroDto) {
    return this.authService.registrarEstudiante(
      body.nombre,
      body.correo,
      body.contrasena,
      body.rol,
    );
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.correo, body.contrasena);
  }

  @Post('verificar-correo')
  verificarCorreo(@Body() body: VerificarCorreoDto) {
    return this.authService.verificarCorreo(body.token);
  }

  @Post('reenviar-verificacion')
  reenviarVerificacion(@Body() body: ReenviarVerificacionDto) {
    return this.authService.reenviarVerificacion(body.correo);
  }

  @Post('solicitar-recuperacion')
  solicitarRecuperacion(@Body() body: SolicitarRecuperacionDto) {
    return this.authService.solicitarRecuperacionContrasena(body.correo);
  }

  @Post('restablecer-contrasena')
  restablecerContrasena(@Body() body: RestablecerContrasenaDto) {
    return this.authService.restablecerContrasena(
      body.token,
      body.nuevaContrasena,
    );
  }

  @UseGuards(JwtGuard)
  @Get('perfil')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obtenerPerfil(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.authService.obtenerPerfil(req.usuario.sub as string);
  }

  @UseGuards(JwtGuard)
  @Patch('perfil')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actualizarPerfil(@Body() body: PerfilDto, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.authService.actualizarPerfil(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.usuario.sub as string,
      body.descripcion,
      body.fotoPerfil,
    );
  }
}
