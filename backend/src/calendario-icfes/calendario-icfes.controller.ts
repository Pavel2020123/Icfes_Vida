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
import { CalendarioIcfesService } from './calendario-icfes.service';
import { JwtGuard, AdminGuard } from '../auth/jwt.guard';
import { CalendarioTipo } from '@prisma/client';

interface CrearFechaDto {
  anio: number;
  calendario: CalendarioTipo;
  fechaExamen: string; // ISO, ej. "2027-11-14"
}

interface ActualizarFechaDto {
  fechaExamen: string;
}

@Controller('calendario-icfes')
export class CalendarioIcfesController {
  constructor(private readonly service: CalendarioIcfesService) {}

  // Público (requiere solo login) — lo consume el countdown del estudiante.
  @Get('proxima')
  @UseGuards(JwtGuard)
  proxima(@Query('calendario') calendario: CalendarioTipo) {
    return this.service.obtenerProximaFecha(calendario);
  }

  // ─── ADMIN ──────────────────────────────────────────────────
  @Get('admin')
  @UseGuards(AdminGuard)
  listar() {
    return this.service.listar();
  }

  @Post('admin')
  @UseGuards(AdminGuard)
  crear(@Body() body: CrearFechaDto) {
    return this.service.crear(
      body.anio,
      body.calendario,
      new Date(body.fechaExamen),
    );
  }

  @Patch('admin/:id')
  @UseGuards(AdminGuard)
  actualizar(@Param('id') id: string, @Body() body: ActualizarFechaDto) {
    return this.service.actualizar(id, new Date(body.fechaExamen));
  }

  @Delete('admin/:id')
  @UseGuards(AdminGuard)
  eliminar(@Param('id') id: string) {
    return this.service.eliminar(id);
  }
}
