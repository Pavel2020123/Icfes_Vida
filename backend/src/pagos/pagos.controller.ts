import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsIn } from 'class-validator';
import { PagosService } from './pagos.service';
import { JwtGuard } from '../auth/jwt.guard';
import { EmailVerificadoGuard } from '../auth/email-verificado.guard';
import { AuthenticatedRequest } from '../auth/auth.types';

class CrearOrdenDto {
  @IsIn(['DECIMO', 'ONCE'])
  grado!: 'DECIMO' | 'ONCE';
}

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  // El estudiante debe tener el correo verificado antes de poder pagar
  // (mismo requisito que para estudiar, ver EmailVerificadoGuard).
  @UseGuards(JwtGuard, EmailVerificadoGuard)
  @Post('crear-orden')
  crearOrden(
    @Body() body: CrearOrdenDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.pagosService.crearOrden(req.usuario.sub, body.grado);
  }

  // ─── WEBHOOK PÚBLICO: lo invoca ePayco servidor a servidor ────
  // Sin JwtGuard a propósito: ePayco no manda nuestro token, manda su
  // propia firma (x_signature), que es lo que valida PagosService.
  @Post('confirmacion')
  @HttpCode(200)
  confirmacion(@Body() body: Record<string, string>) {
    return this.pagosService.confirmarPago(body);
  }

  // Usado por la página de respuesta del frontend para saber si el
  // webhook (que es la fuente confiable) ya actualizó la orden.
  @UseGuards(JwtGuard)
  @Get('estado/:factura')
  estado(
    @Param('factura') factura: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.pagosService.obtenerEstadoOrden(req.usuario.sub, factura);
  }
}
