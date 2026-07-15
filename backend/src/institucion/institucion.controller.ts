import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Request,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { InstitucionService } from './institucion.service';
import { JwtGuard } from '../auth/jwt.guard';

interface CrearInstitucionDto {
  nombre: string;
  mensajeBienvenida?: string;
  logoUrl?: string;
  colorPrimario?: string;
  colorSecundario?: string;
}

interface ActualizarInstitucionDto {
  nombre?: string;
  mensajeBienvenida?: string;
  logoUrl?: string;
  colorPrimario?: string;
  colorSecundario?: string;
}

interface CrearEstudianteDto {
  nombre: string;
  correo: string;
  contrasena: string;
}

interface CrearGrupoDto {
  nombre: string;
}

@Controller('instituciones')
@UseGuards(JwtGuard)
export class InstitucionController {
  constructor(private readonly institucionService: InstitucionService) {}

  @Get('me')
  obtenerMiInstitucion(@Request() req: any) {
    return this.institucionService.obtenerMiInstitucion(req.usuario.sub as string);
  }

  @Post()
  crearInstitucion(@Body() body: CrearInstitucionDto, @Request() req: any) {
    return this.institucionService.crearInstitucion(
      req.usuario.sub as string,
      body.nombre,
      body.mensajeBienvenida,
      body.logoUrl,
      body.colorPrimario,
      body.colorSecundario,
    );
  }

  @Patch('me')
  actualizarMiInstitucion(
    @Body() body: ActualizarInstitucionDto,
    @Request() req: any,
  ) {
    return this.institucionService.actualizarMiInstitucion(
      req.usuario.sub as string,
      body.nombre,
      body.mensajeBienvenida,
      body.logoUrl,
      body.colorPrimario,
      body.colorSecundario,
    );
  }

  @Get('me/estudiantes')
  obtenerEstudiantes(@Request() req: any) {
    return this.institucionService.obtenerEstudiantesDeMiInstitucion(
      req.usuario.sub as string,
    );
  }

  @Post('me/estudiantes')
  crearEstudiante(@Body() body: CrearEstudianteDto, @Request() req: any) {
    return this.institucionService.crearEstudianteEnMiInstitucion(
      req.usuario.sub as string,
      body.nombre,
      body.correo,
      body.contrasena,
    );
  }

  @Get('me/grupos')
  obtenerGrupos(@Request() req: any) {
    return this.institucionService.obtenerGruposDeMiInstitucion(
      req.usuario.sub as string,
    );
  }

  @Post('me/grupos')
  crearGrupo(@Body() body: CrearGrupoDto, @Request() req: any) {
    return this.institucionService.crearGrupoEnMiInstitucion(
      req.usuario.sub as string,
      body.nombre,
    );
  }

  @Patch('me/grupos/:id')
  editarGrupo(
    @Param('id') id: string,
    @Body() body: CrearGrupoDto,
    @Request() req: any,
  ) {
    return this.institucionService.actualizarGrupo(
      req.usuario.sub as string,
      id,
      body.nombre,
    );
  }

  @Delete('me/grupos/:id')
  eliminarGrupo(@Param('id') id: string, @Request() req: any) {
    return this.institucionService.eliminarGrupo(
      req.usuario.sub as string,
      id,
    );
  }
}
