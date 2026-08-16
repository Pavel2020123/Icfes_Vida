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
import { AuthenticatedRequest } from '../auth/auth.types';

class CrearOrdenDto {
  @IsIn(['DECIMO', 'ONCE'])
  grado!: 'DECIMO' | 'ONCE';

  @IsIn(['MENSUAL', 'TEMPORADA_A', 'TEMPORADA_B'])
  tipoPlan!: 'MENSUAL' | 'TEMPORADA_A' | 'TEMPORADA_B';
}

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  // Sin EmailVerificadoGuard a propósito: la verificación de correo
  // existe para no dejar reiniciar la prueba GRATIS con correos falsos
  // (punto 7), no para bloquear a alguien que ya va a pagar de verdad.
  // Solo necesitamos que tenga sesión (JwtGuard).
  @UseGuards(JwtGuard)
  @Post('crear-orden')
  crearOrden(
    @Body() body: CrearOrdenDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.pagosService.crearOrden(
      req.usuario.sub,
      body.grado,
      body.tipoPlan,
    );
  }

  // ─── WEBHOOK PÚBLICO: lo invoca Wompi servidor a servidor ─────
  // Sin JwtGuard a propósito: Wompi no manda nuestro token, manda su
  // propia firma (signature), que es lo que valida PagosService.
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
