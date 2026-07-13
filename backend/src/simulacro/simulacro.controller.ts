import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SimulacroService } from './simulacro.service';
import { AreaIcfes, Dificultad } from '@prisma/client';
import { JwtGuard } from '../auth/jwt.guard';

interface CalificarDto {
  area: AreaIcfes;
  respuestas: Array<{
    preguntaId: string;
    respuestaId: string;
  }>;
}

@Controller('simulacros')
export class SimulacroController {
  constructor(private readonly simulacroService: SimulacroService) {}

  // GET /simulacros/generar?area=MATEMATICAS
  @Get('generar')
  obtenerSimulacro(@Query('area') area: AreaIcfes) {
    return this.simulacroService.generarSimulacro(area);
  }

  // POST /simulacros/calificar  ← Ruta protegida con JWT
  // Body: { area: "MATEMATICAS", respuestas: [{ preguntaId: "...", respuestaId: "..." }] }
  @UseGuards(JwtGuard)
  @Post('calificar')
  calificar(@Body() body: CalificarDto, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const usuarioId = req.usuario.sub; // viene del JWT token
    return this.simulacroService.calificarSimulacro(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
    @Query('cantidad') cantidad?: string,
    @Query('dificultad') dificultad?: Dificultad,
  ) {
    const listaAreas = (areas ?? '')
      .split(',')
      .map((a) => a.trim())
      .filter((a): a is AreaIcfes => a.length > 0);

    const cantidadNumero = cantidad ? parseInt(cantidad, 10) : 20;

    return this.simulacroService.generarSimulacroPersonalizado(
      listaAreas,
      Number.isFinite(cantidadNumero) && cantidadNumero > 0
        ? cantidadNumero
        : 20,
      dificultad,
    );
  }

  // POST /simulacros/calificar-personalizado ← Ruta protegida con JWT
  // Body: { respuestas: [{ preguntaId: "...", respuestaId: "..." }] }
  // No requiere "area": se calcula por pregunta y se guarda el desglose.
  @UseGuards(JwtGuard)
  @Post('calificar-personalizado')
  calificarPersonalizado(
    @Body()
    body: { respuestas: Array<{ preguntaId: string; respuestaId: string }> },
    @Request() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const usuarioId = req.usuario.sub;
    return this.simulacroService.calificarSimulacroPersonalizado(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      usuarioId,
      body.respuestas,
    );
  }

  // GET /simulacros/historial  ← Ruta protegida con JWT
  @UseGuards(JwtGuard)
  @Get('historial')
  historial(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const usuarioId = req.usuario.sub;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.simulacroService.obtenerHistorial(usuarioId);
  }

  // POST /simulacros/poblar  ← Solo para desarrollo
  @Post('poblar')
  poblarBd() {
    return this.simulacroService.poblarBaseDeDatos();
  }

  // GET /simulacros/temas?area=MATEMATICAS
  @Get('temas')
  obtenerTemas(@Query('area') area: AreaIcfes) {
    return this.simulacroService.obtenerTemasPorArea(area);
  }
  // POST /simulacros/progreso  ← Marcar tema como visto
  @UseGuards(JwtGuard)
  @Post('progreso')
  actualizarProgreso(
    @Body() body: { subtemaId: string; porcentaje: number },
    @Request() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const usuarioId = req.usuario.sub;
    return this.simulacroService.actualizarProgresoTema(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      usuarioId,
      body.subtemaId,
      body.porcentaje,
    );
  }

  // GET /simulacros/progreso  ← Ver progreso general
  @UseGuards(JwtGuard)
  @Get('progreso')
  obtenerProgreso(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const usuarioId = req.usuario.sub;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.simulacroService.obtenerProgresoGeneral(usuarioId);
  }
}
