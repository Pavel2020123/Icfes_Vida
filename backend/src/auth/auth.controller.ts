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
import { AuthenticatedRequest } from './auth.types';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

class RegistroDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEmail()
  correo!: string;

  @IsString()
  @MinLength(6)
  contrasena!: string;
}

class LoginDto {
  @IsEmail()
  correo!: string;

  @IsString()
  @MinLength(6)
  contrasena!: string;
}

class PerfilDto {
  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  fotoPerfil?: string;
}

class VerificarCorreoDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

class ReenviarVerificacionDto {
  @IsEmail()
  correo!: string;
}

class SolicitarRecuperacionDto {
  @IsEmail()
  correo!: string;
}

class RestablecerContrasenaDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(6)
  nuevaContrasena!: string;
}

class CambiarContrasenaInicialDto {
  @IsString()
  @MinLength(6)
  nuevaContrasena!: string;
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
  obtenerPerfil(@Request() req: AuthenticatedRequest) {
    return this.authService.obtenerPerfil(req.usuario.sub);
  }

  @UseGuards(JwtGuard)
  @Patch('perfil')
  actualizarPerfil(
    @Body() body: PerfilDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.authService.actualizarPerfil(
      req.usuario.sub,
      body.descripcion,
      body.fotoPerfil,
    );
  }

  @UseGuards(JwtGuard)
  @Patch('cambiar-contrasena-inicial')
  cambiarContrasenaInicial(
    @Body() body: CambiarContrasenaInicialDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.authService.cambiarContrasenaInicial(
      req.usuario.sub,
      body.nuevaContrasena,
    );
  }
}
