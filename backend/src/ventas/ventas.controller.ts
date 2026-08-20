import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { AdminGuard } from '../auth/jwt.guard';
import { LineaInteres } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

class CrearLeadVentasDto {
  @IsString()
  @IsNotEmpty()
  nombreColegio!: string;

  @IsString()
  @IsNotEmpty()
  nombreContacto!: string;

  @IsEmail()
  correo!: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsEnum(LineaInteres)
  linea!: LineaInteres;

  @IsIn(['Básico', 'Plus', 'Colegio', 'Institucional'])
  plan!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numeroEstudiantesAprox?: number;

  @IsOptional()
  @IsString()
  mensaje?: string;
}

class MarcarAtendidoDto {
  @IsBoolean()
  atendido!: boolean;
}

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  // Público y sin guard a propósito: el director de colegio interesado
  // todavía no tiene cuenta en la plataforma (ver "Flujo de cotización"
  // del roadmap) — por eso este formulario no puede pedir sesión.
  @Post('contacto')
  crearLead(@Body() body: CrearLeadVentasDto) {
    return this.ventasService.crearLead(body);
  }

  // ─── ADMIN ────────────────────────────────────────────────────
  @Get('admin')
  @UseGuards(AdminGuard)
  listar(@Query('atendido') atendido?: string) {
    const filtro = atendido === undefined ? undefined : atendido === 'true';
    return this.ventasService.listar(filtro);
  }

  @Patch('admin/:id/atendido')
  @UseGuards(AdminGuard)
  marcarAtendido(@Param('id') id: string, @Body() body: MarcarAtendidoDto) {
    return this.ventasService.marcarAtendido(id, body.atendido);
  }
}
