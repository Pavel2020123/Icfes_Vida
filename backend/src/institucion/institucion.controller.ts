/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  UseInterceptors,
  UseFilters,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InstitucionService } from './institucion.service';
import { JwtGuard } from '../auth/jwt.guard';
import { logoMulterOptions } from './logo-upload.config';
import { MulterExceptionFilter } from './multer-exception.filter';

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
  claseId?: string;
}

interface CrearGrupoDto {
  nombre: string;
  grado: 'DECIMO' | 'ONCE';
}

interface ActualizarGrupoDto {
  nombre?: string;
}

interface AgregarEstudianteExistenteDto {
  correo: string;
  claseId?: string;
}

interface AgregarEstudianteAGrupoDto {
  estudianteId: string;
}

interface UnirseClaseDto {
  codigoIngreso: string;
}

@Controller('instituciones')
@UseGuards(JwtGuard)
export class InstitucionController {
  constructor(private readonly institucionService: InstitucionService) {}

  @Get('me')
  obtenerMiInstitucion(@Request() req: any) {
    return this.institucionService.obtenerMiInstitucion(
      req.usuario.sub as string,
    );
  }

  @Post('unirse')
  unirseAClase(@Body() body: UnirseClaseDto, @Request() req: any) {
    return this.institucionService.unirseAClase(
      req.usuario.sub as string,
      body.codigoIngreso,
    );
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

  @Delete('me')
  eliminarMiInstitucion(@Request() req: any) {
    return this.institucionService.eliminarMiInstitucion(
      req.usuario.sub as string,
    );
  }

  @Post('me/logo')
  @UseInterceptors(FileInterceptor('logo', logoMulterOptions))
  @UseFilters(MulterExceptionFilter)
  subirLogo(@UploadedFile() archivo: Express.Multer.File, @Request() req: any) {
    if (!archivo) {
      throw new BadRequestException(
        'Debes seleccionar una imagen para el logo.',
      );
    }

    return this.institucionService.subirLogoDeMiInstitucion(
      req.usuario.sub as string,
      archivo,
    );
  }

  @Delete('me/logo')
  eliminarLogo(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.institucionService.eliminarLogoDeMiInstitucion(
      req.usuario.sub as string,
    );
  }

  @Get('me/estudiantes')
  obtenerEstudiantes(@Request() req: any) {
    return this.institucionService.obtenerEstudiantesDeMiInstitucion(
      req.usuario.sub as string,
    );
  }

  @Get('me/analiticas')
  obtenerAnaliticas(@Request() req: any) {
    return this.institucionService.obtenerAnaliticasDeMiInstitucion(
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
      body.claseId,
    );
  }

  @Post('me/estudiantes/agregar')
  agregarEstudianteExistente(
    @Body() body: AgregarEstudianteExistenteDto,
    @Request() req: any,
  ) {
    return this.institucionService.agregarEstudianteExistenteAMiInstitucion(
      req.usuario.sub as string,
      body.correo,
      body.claseId,
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
      body.grado,
    );
  }

  @Patch('me/grupos/:id')
  editarGrupo(
    @Param('id') id: string,
    @Body() body: ActualizarGrupoDto,
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
    return this.institucionService.eliminarGrupo(req.usuario.sub as string, id);
  }

  @Post('me/grupos/:id/estudiantes')
  agregarEstudianteAGrupo(
    @Param('id') id: string,
    @Body() body: AgregarEstudianteAGrupoDto,
    @Request() req: any,
  ) {
    return this.institucionService.agregarEstudianteAGrupo(
      req.usuario.sub as string,
      id,
      body.estudianteId,
    );
  }

  @Delete('me/grupos/:id/estudiantes/:estudianteId')
  quitarEstudianteDeGrupo(
    @Param('id') id: string,
    @Param('estudianteId') estudianteId: string,
    @Request() req: any,
  ) {
    return this.institucionService.quitarEstudianteDeGrupo(
      req.usuario.sub as string,
      id,
      estudianteId,
    );
  }
}
