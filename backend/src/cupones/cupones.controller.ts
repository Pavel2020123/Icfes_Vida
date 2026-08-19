import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CuponesService } from './cupones.service';
import { JwtGuard, AdminGuard } from '../auth/jwt.guard';
import { TipoPlan } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

class ValidarCuponQueryDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @IsEnum(TipoPlan)
  tipoPlan!: TipoPlan;
}

class CrearCuponDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  porcentajeDescuento!: number;

  // Si no se manda, el cupón aplica a cualquier tipoPlan.
  @IsOptional()
  @IsEnum(TipoPlan)
  tipoPlan?: TipoPlan;

  @IsDateString()
  @IsNotEmpty()
  fechaExpiracion!: string;

  // Si no se manda, el cupón no tiene límite de usos.
  @IsOptional()
  @IsInt()
  @Min(1)
  usosMaximos?: number;
}

class ActualizarCuponDto {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  porcentajeDescuento?: number;

  @IsOptional()
  @IsDateString()
  fechaExpiracion?: string;

  // null explícito = quitar el límite de usos.
  @IsOptional()
  @IsInt()
  @Min(1)
  usosMaximos?: number | null;
}

@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) {}

  // Lo usa el checkout del estudiante para mostrar "cupón válido: -34%"
  // antes de crear la orden. No consume el cupo (eso pasa al pagar).
  @Get('validar')
  @UseGuards(JwtGuard)
  validar(@Query() query: ValidarCuponQueryDto) {
    return this.cuponesService.validar(query.codigo, query.tipoPlan);
  }

  // ─── ADMIN ──────────────────────────────────────────────────
  @Get('admin')
  @UseGuards(AdminGuard)
  listar() {
    return this.cuponesService.listar();
  }

  @Post('admin')
  @UseGuards(AdminGuard)
  crear(@Body() body: CrearCuponDto) {
    return this.cuponesService.crear({
      ...body,
      fechaExpiracion: new Date(body.fechaExpiracion),
    });
  }

  @Patch('admin/:id')
  @UseGuards(AdminGuard)
  actualizar(@Param('id') id: string, @Body() body: ActualizarCuponDto) {
    return this.cuponesService.actualizar(id, {
      ...body,
      fechaExpiracion: body.fechaExpiracion
        ? new Date(body.fechaExpiracion)
        : undefined,
    });
  }

  @Delete('admin/:id')
  @UseGuards(AdminGuard)
  eliminar(@Param('id') id: string) {
    return this.cuponesService.eliminar(id);
  }
}
