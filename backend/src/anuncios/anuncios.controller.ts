import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AudienciaAnuncio, TipoAnuncio } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AuthenticatedRequest } from '../auth/auth.types';
import { AdminGuard, JwtGuard } from '../auth/jwt.guard';
import { AnunciosService } from './anuncios.service';

class CrearAnuncioDto {
  @IsString()
  @MaxLength(120)
  titulo!: string;

  @IsString()
  @MaxLength(3000)
  contenido!: string;

  @IsEnum(TipoAnuncio)
  tipo!: TipoAnuncio;

  @IsEnum(AudienciaAnuncio)
  audiencia!: AudienciaAnuncio;

  @IsISO8601()
  fechaInicio!: string;

  @IsOptional()
  @IsISO8601()
  fechaFin?: string | null;

  @IsBoolean()
  activo!: boolean;

  @IsBoolean()
  destacado!: boolean;
}

class ActualizarAnuncioDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  contenido?: string;

  @IsOptional()
  @IsEnum(TipoAnuncio)
  tipo?: TipoAnuncio;

  @IsOptional()
  @IsEnum(AudienciaAnuncio)
  audiencia?: AudienciaAnuncio;

  @IsOptional()
  @IsISO8601()
  fechaInicio?: string;

  @IsOptional()
  @IsISO8601()
  fechaFin?: string | null;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsBoolean()
  destacado?: boolean;
}

@Controller('anuncios')
export class AnunciosController {
  constructor(private readonly anunciosService: AnunciosService) {}

  @Get()
  @UseGuards(JwtGuard)
  listar(@Request() req: AuthenticatedRequest) {
    return this.anunciosService.listarParaUsuario(
      req.usuario.sub,
      req.usuario.rol,
    );
  }

  @Patch('leer-todos')
  @UseGuards(JwtGuard)
  marcarTodosLeidos(@Request() req: AuthenticatedRequest) {
    return this.anunciosService.marcarTodosLeidos(
      req.usuario.sub,
      req.usuario.rol,
    );
  }

  @Patch(':id/leer')
  @UseGuards(JwtGuard)
  marcarLeido(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.anunciosService.marcarLeido(
      id,
      req.usuario.sub,
      req.usuario.rol,
    );
  }

  @Get('admin/listado')
  @UseGuards(AdminGuard)
  listarAdmin() {
    return this.anunciosService.listarAdmin();
  }

  @Post('admin')
  @UseGuards(AdminGuard)
  crear(@Body() body: CrearAnuncioDto) {
    return this.anunciosService.crear(body);
  }

  @Patch('admin/:id')
  @UseGuards(AdminGuard)
  actualizar(@Param('id') id: string, @Body() body: ActualizarAnuncioDto) {
    return this.anunciosService.actualizar(id, body);
  }

  @Delete('admin/:id')
  @UseGuards(AdminGuard)
  eliminar(@Param('id') id: string) {
    return this.anunciosService.eliminar(id);
  }
}
