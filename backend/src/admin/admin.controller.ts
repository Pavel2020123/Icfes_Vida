import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/jwt.guard';
import { AuthenticatedRequest } from '../auth/auth.types';
import {
  AreaIcfes,
  CalendarioTipo,
  Dificultad,
  TipoInteractivo,
} from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CambiarRolDto {
  @IsIn(['ESTUDIANTE', 'PROFESOR', 'ADMIN'])
  rol!: 'ESTUDIANTE' | 'PROFESOR' | 'ADMIN';
}

class CrearTemaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEnum(AreaIcfes)
  area!: AreaIcfes;
}

class CrearSubtemaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  temaId!: string;
}

class RespuestaDto {
  @IsString()
  @IsNotEmpty()
  texto!: string;

  @IsBoolean()
  esCorrecta!: boolean;

  @IsOptional()
  @IsString()
  explicacion?: string;
}

class CrearPreguntaDto {
  @IsString()
  @IsNotEmpty()
  enunciado!: string;

  @IsString()
  @IsNotEmpty()
  subtemaId!: string;

  @IsEnum(Dificultad)
  dificultad!: Dificultad;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RespuestaDto)
  respuestas!: RespuestaDto[];

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  explicacion?: string;
}

class CrearPreguntaAleatoriaDto {
  @IsEnum(AreaIcfes)
  area!: AreaIcfes;

  @IsString()
  @IsNotEmpty()
  enunciado!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RespuestaDto)
  respuestas!: RespuestaDto[];

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  explicacion?: string;
}

class ActualizarContenidoDto {
  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;
}

class EspacioInteractivoDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  opciones!: string[];

  @IsNotEmpty()
  correctaIndex!: number;
}

class DatosInteractivoDto {
  @IsString()
  @IsNotEmpty()
  textoConEspacios!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EspacioInteractivoDto)
  espacios!: EspacioInteractivoDto[];
}

class ActualizarInteractivoDto {
  @IsEnum(TipoInteractivo)
  tipoInteractivo!: TipoInteractivo;

  @ValidateNested()
  @Type(() => DatosInteractivoDto)
  datosInteractivo!: DatosInteractivoDto;
}

// Punto 12: el administrador convierte un lead ya negociado en una
// institución operativa y crea su primer responsable (PROFESOR).
class CrearInstitucionDesdeLeadDto {
  @IsString()
  @IsNotEmpty()
  leadId!: string;

  @IsString()
  @IsNotEmpty()
  contrasenaTemporal!: string;

  @IsOptional()
  @IsString()
  planActual?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limiteEstudiantes?: number;

  @IsOptional()
  @IsEnum(CalendarioTipo)
  calendarioIcfes?: CalendarioTipo;

  @IsOptional()
  @IsDateString()
  fechaVencimientoPlan?: string;
}

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Estadísticas
  @Get('estadisticas')
  estadisticas() {
    return this.adminService.obtenerEstadisticas();
  }

  // Usuarios
  @Get('usuarios')
  usuarios() {
    return this.adminService.obtenerUsuarios();
  }

  @Patch('usuarios/:id/rol')
  cambiarRol(@Param('id') id: string, @Body() body: CambiarRolDto) {
    return this.adminService.cambiarRol(id, body.rol);
  }

  @Delete('usuarios/:id')
  eliminarUsuario(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminService.eliminarUsuario(id, req.usuario.sub);
  }

  @Post('instituciones-desde-lead')
  crearInstitucionDesdeLead(@Body() body: CrearInstitucionDesdeLeadDto) {
    return this.adminService.crearInstitucionDesdeLead({
      ...body,
      fechaVencimientoPlan: body.fechaVencimientoPlan
        ? new Date(body.fechaVencimientoPlan)
        : undefined,
    });
  }

  // Temas
  @Get('temas')
  temas() {
    return this.adminService.obtenerTemas();
  }

  @Post('temas')
  crearTema(@Body() body: CrearTemaDto) {
    return this.adminService.crearTema(body.nombre, body.area);
  }

  @Delete('temas/:id')
  eliminarTema(@Param('id') id: string) {
    return this.adminService.eliminarTema(id);
  }

  // Subtemas
  @Post('subtemas')
  crearSubtema(@Body() body: CrearSubtemaDto) {
    return this.adminService.crearSubtema(body.nombre, body.temaId);
  }

  @Delete('subtemas/:id')
  eliminarSubtema(@Param('id') id: string) {
    return this.adminService.eliminarSubtema(id);
  }

  // Preguntas
  @Get('preguntas/:subtemaId')
  preguntas(@Param('subtemaId') subtemaId: string) {
    return this.adminService.obtenerPreguntasPorSubtema(subtemaId);
  }

  @Post('preguntas')
  crearPregunta(@Body() body: CrearPreguntaDto) {
    return this.adminService.crearPregunta(
      body.enunciado,
      body.subtemaId,
      body.dificultad,
      body.respuestas,
      body.imagenUrl,
      body.explicacion,
    );
  }

  // Preguntas aleatorias: carga rápida, solo pide el área (no subtema)
  @Post('preguntas-aleatorias')
  crearPreguntaAleatoria(@Body() body: CrearPreguntaAleatoriaDto) {
    return this.adminService.crearPreguntaAleatoria(
      body.area,
      body.enunciado,
      body.respuestas,
      body.imagenUrl,
      body.explicacion,
    );
  }

  @Delete('preguntas/:id')
  eliminarPregunta(@Param('id') id: string) {
    return this.adminService.eliminarPregunta(id);
  }

  @Patch('subtemas/:id/contenido')
  actualizarContenido(
    @Param('id') id: string,
    @Body() body: ActualizarContenidoDto,
  ) {
    return this.adminService.actualizarContenidoSubtema(
      id,
      body.contenido,
      body.videoUrl,
      body.imagenUrl,
    );
  }

  // Ejercicio interactivo (cloze)
  @Patch('subtemas/:id/interactivo')
  actualizarInteractivo(
    @Param('id') id: string,
    @Body() body: ActualizarInteractivoDto,
  ) {
    return this.adminService.actualizarInteractivoSubtema(
      id,
      body.tipoInteractivo,
      body.datosInteractivo,
    );
  }
}
