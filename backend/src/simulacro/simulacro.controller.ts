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
import { AreaIcfes } from '@prisma/client';
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
}
