import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/jwt.guard';
import { AreaIcfes, Dificultad, TipoInteractivo } from '@prisma/client';

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
  cambiarRol(
    @Param('id') id: string,
    @Body() body: { rol: 'ESTUDIANTE' | 'PROFESOR' | 'ADMIN' },
  ) {
    return this.adminService.cambiarRol(id, body.rol);
  }

  // Temas
  @Get('temas')
  temas() {
    return this.adminService.obtenerTemas();
  }

  @Post('temas')
  crearTema(@Body() body: { nombre: string; area: AreaIcfes }) {
    return this.adminService.crearTema(body.nombre, body.area);
  }

  @Delete('temas/:id')
  eliminarTema(@Param('id') id: string) {
    return this.adminService.eliminarTema(id);
  }

  // Subtemas
  @Post('subtemas')
  crearSubtema(@Body() body: { nombre: string; temaId: string }) {
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
  crearPregunta(
    @Body()
    body: {
      enunciado: string;
      subtemaId: string;
      dificultad: Dificultad;
      respuestas: { texto: string; esCorrecta: boolean }[];
      imagenUrl?: string;
    },
  ) {
    return this.adminService.crearPregunta(
      body.enunciado,
      body.subtemaId,
      body.dificultad,
      body.respuestas,
      body.imagenUrl,
    );
  }

  @Delete('preguntas/:id')
  eliminarPregunta(@Param('id') id: string) {
    return this.adminService.eliminarPregunta(id);
  }
  @Patch('subtemas/:id/contenido')
  actualizarContenido(
    @Param('id') id: string,
    @Body() body: { contenido?: string; videoUrl?: string; imagenUrl?: string },
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
    @Body()
    body: {
      tipoInteractivo: TipoInteractivo;
      datosInteractivo: {
        textoConEspacios: string;
        espacios: { opciones: string[]; correctaIndex: number }[];
      };
    },
  ) {
    return this.adminService.actualizarInteractivoSubtema(
      id,
      body.tipoInteractivo,
      body.datosInteractivo,
    );
  }
}
