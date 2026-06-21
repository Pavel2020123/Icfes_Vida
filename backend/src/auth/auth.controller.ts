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
}

interface LoginDto {
  correo: string;
  contrasena: string;
}

interface PerfilDto {
  descripcion?: string;
  fotoPerfil?: string;
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
