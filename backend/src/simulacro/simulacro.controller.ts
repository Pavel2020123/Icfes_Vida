import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { SimulacroService } from './simulacro.service';
import { AreaIcfes, Dificultad } from '@prisma/client';
import { AdminGuard, JwtGuard } from '../auth/jwt.guard';
import { PlanVigenteGuard } from '../auth/plan-vigente.guard';
import { EmailVerificadoGuard } from '../auth/email-verificado.guard';
import { AuthenticatedRequest } from '../auth/auth.types';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class RespuestaDto {
  @IsString()
  @IsNotEmpty()
  preguntaId!: string;

  @IsString()
  @IsNotEmpty()
  respuestaId!: string;
}

class CalificarDto {
  @IsEnum(AreaIcfes)
  area!: AreaIcfes;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RespuestaDto)
  respuestas!: RespuestaDto[];
}

class CalificarPersonalizadoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RespuestaDto)
  respuestas!: RespuestaDto[];
}

class ProgresoDto {
  @IsString()
  @IsNotEmpty()
  subtemaId!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  porcentaje!: number;
}

@Controller('simulacros')
export class SimulacroController {
  constructor(private readonly simulacroService: SimulacroService) {}

  // GET /simulacros/generar?area=MATEMATICAS
  @Get('generar')
  obtenerSimulacro(
    @Query('area', new ParseEnumPipe(AreaIcfes)) area: AreaIcfes,
  ) {
    return this.simulacroService.generarSimulacro(area);
  }

  // POST /simulacros/calificar  ← Ruta protegida con JWT
  // Body: { area: "MATEMATICAS", respuestas: [{ preguntaId: "...", respuestaId: "..." }] }
  @UseGuards(JwtGuard, EmailVerificadoGuard, PlanVigenteGuard)
  @Post('calificar')
  calificar(@Body() body: CalificarDto, @Request() req: AuthenticatedRequest) {
    const usuarioId = req.usuario.sub; // viene del JWT token
    return this.simulacroService.calificarSimulacro(
      usuarioId,
      body.area,
      body.respuestas,
    );
  }
  // GET /simulacros/generar-personalizado?areas=MATEMATICAS,LECTURA_CRITICA&cantidad=20&dificultad=MEDIO
  // "Preguntas aleatorias": el estudiante elige 1 o varias áreas.
  @Get('generar-personalizado')
  generarPersonalizado(
    @Query('areas') areas: string,
    @Query('cantidad', new ParseIntPipe({ optional: true })) cantidad?: number,
    @Query('dificultad', new ParseEnumPipe(Dificultad, { optional: true }))
    dificultad?: Dificultad,
  ) {
    const listaAreas = (areas ?? '')
      .split(',')
      .map((a) => a.trim())
      .filter((a): a is AreaIcfes =>
        Object.values(AreaIcfes).includes(a as AreaIcfes),
      );

    if (listaAreas.length === 0) {
      throw new BadRequestException(
        'Debes indicar al menos un área válida para generar el simulacro.',
      );
    }

    return this.simulacroService.generarSimulacroPersonalizado(
      listaAreas,
      cantidad && Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 20,
      dificultad,
    );
  }

  // POST /simulacros/calificar-personalizado ← Ruta protegida con JWT
  // Body: { respuestas: [{ preguntaId: "...", respuestaId: "..." }] }
  // No requiere "area": se calcula por pregunta y se guarda el desglose.
  @UseGuards(JwtGuard, EmailVerificadoGuard, PlanVigenteGuard)
  @Post('calificar-personalizado')
  calificarPersonalizado(
    @Body() body: CalificarPersonalizadoDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const usuarioId = req.usuario.sub;
    return this.simulacroService.calificarSimulacroPersonalizado(
      usuarioId,
      body.respuestas,
    );
  }

  // GET /simulacros/historial  ← Ruta protegida con JWT
  @UseGuards(JwtGuard)
  @Get('historial')
  historial(@Request() req: AuthenticatedRequest) {
    const usuarioId = req.usuario.sub;

    return this.simulacroService.obtenerHistorial(usuarioId);
  }

  // POST /simulacros/poblar  ← Solo para desarrollo
  @UseGuards(JwtGuard, AdminGuard)
  @Post('poblar')
  poblarBd() {
    return this.simulacroService.poblarBaseDeDatos();
  }

  // GET /simulacros/temas?area=MATEMATICAS
  @Get('temas')
  obtenerTemas(@Query('area') area: AreaIcfes) {
    return this.simulacroService.obtenerTemasPorArea(area);
  }

  // GET /simulacros/preguntas/:subtemaId
  @Get('preguntas/:subtemaId')
  obtenerPreguntasPorSubtema(@Param('subtemaId') subtemaId: string) {
    return this.simulacroService.obtenerPreguntasPorSubtema(subtemaId);
  }

  // POST /simulacros/progreso  ← Marcar tema como visto
  @UseGuards(JwtGuard, EmailVerificadoGuard, PlanVigenteGuard)
  @Post('progreso')
  actualizarProgreso(
    @Body() body: ProgresoDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const usuarioId = req.usuario.sub;
    return this.simulacroService.actualizarProgresoTema(
      usuarioId,
      body.subtemaId,
      body.porcentaje,
    );
  }

  // GET /simulacros/progreso  ← Ver progreso general
  @UseGuards(JwtGuard)
  @Get('progreso')
  obtenerProgreso(@Request() req: AuthenticatedRequest) {
    const usuarioId = req.usuario.sub;

    return this.simulacroService.obtenerProgresoGeneral(usuarioId);
  }
}
