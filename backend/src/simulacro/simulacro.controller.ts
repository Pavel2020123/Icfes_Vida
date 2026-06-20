import { Controller, Get, Query, Post } from '@nestjs/common';
import { SimulacroService } from './simulacro.service';
import { AreaIcfes } from '@prisma/client';

@Controller('simulacros')
export class SimulacroController {
  constructor(private readonly simulacroService: SimulacroService) {}

  @Get('generar')
  obtenerSimulacro(@Query('area') area: AreaIcfes) {
    return this.simulacroService.generarSimulacro(area);
  }
  @Post('poblar')
  poblarBd() {
    return this.simulacroService.poblarBaseDeDatos();
  }
}
