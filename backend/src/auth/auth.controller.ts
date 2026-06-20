import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

interface RegistroDto {
  nombre: string;
  correo: string;
  contrasena: string;
}

interface LoginDto {
  correo: string;
  contrasena: string;
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
}
