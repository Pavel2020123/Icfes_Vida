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
import { AuthenticatedRequest } from '../auth/auth.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { InstitucionService } from './institucion.service';
import { JwtGuard } from '../auth/jwt.guard';
import { logoMulterOptions } from './logo-upload.config';
import { csvMulterOptions } from './csv-upload.config';
import { MulterExceptionFilter } from './multer-exception.filter';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

class CrearInstitucionDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsOptional()
  @IsString()
  mensajeBienvenida?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  colorPrimario?: string;

  @IsOptional()
  @IsString()
  colorSecundario?: string;
}

class ActualizarInstitucionDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  mensajeBienvenida?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  colorPrimario?: string;

  @IsOptional()
  @IsString()
  colorSecundario?: string;
}

class CrearEstudianteDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEmail()
  correo!: string;

  @IsString()
  @IsNotEmpty()
  contrasena!: string;

  @IsOptional()
  @IsString()
  claseId?: string;
}

class CrearGrupoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsIn(['DECIMO', 'ONCE'])
  grado!: 'DECIMO' | 'ONCE';
}

class ActualizarGrupoDto {
  @IsOptional()
  @IsString()
  nombre?: string;
}

class AgregarEstudianteExistenteDto {
  @IsEmail()
  correo!: string;

  @IsOptional()
  @IsString()
  claseId?: string;
}

class AgregarEstudianteAGrupoDto {
  @IsString()
  @IsNotEmpty()
  estudianteId!: string;
}

class UnirseClaseDto {
  @IsString()
  @IsNotEmpty()
  codigoIngreso!: string;
}

@Controller('instituciones')
@UseGuards(JwtGuard)
export class InstitucionController {
  constructor(private readonly institucionService: InstitucionService) {}

  @Get('me')
  obtenerMiInstitucion(@Request() req: AuthenticatedRequest) {
    return this.institucionService.obtenerMiInstitucion(req.usuario.sub);
  }

  @Post('unirse')
  unirseAClase(
    @Body() body: UnirseClaseDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.institucionService.unirseAClase(
      req.usuario.sub,
      body.codigoIngreso,
    );
  }

  @Post()
  crearInstitucion(
    @Body() body: CrearInstitucionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.institucionService.crearInstitucion(
      req.usuario.sub,
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
    @Request() req: AuthenticatedRequest,
  ) {
    return this.institucionService.actualizarMiInstitucion(
      req.usuario.sub,
      body.nombre,
      body.mensajeBienvenida,
      body.logoUrl,
      body.colorPrimario,
      body.colorSecundario,
    );
  }

  @Delete('me')
  eliminarMiInstitucion(@Request() req: AuthenticatedRequest) {
    return this.institucionService.eliminarMiInstitucion(req.usuario.sub);
  }

  @Post('me/logo')
  @UseInterceptors(FileInterceptor('logo', logoMulterOptions))
  @UseFilters(MulterExceptionFilter)
  subirLogo(
    @UploadedFile() archivo: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!archivo) {
      throw new BadRequestException(
        'Debes seleccionar una imagen para el logo.',
      );
    }

    return this.institucionService.subirLogoDeMiInstitucion(
      req.usuario.sub,
      archivo,
    );
  }

  @Delete('me/logo')
  eliminarLogo(@Request() req: AuthenticatedRequest) {
    return this.institucionService.eliminarLogoDeMiInstitucion(req.usuario.sub);
  }

  @Get('me/estudiantes')
  obtenerEstudiantes(@Request() req: AuthenticatedRequest) {
    return this.institucionService.obtenerEstudiantesDeMiInstitucion(
      req.usuario.sub,
    );
  }

  @Get('me/analiticas')
  obtenerAnaliticas(@Request() req: AuthenticatedRequest) {
    return this.institucionService.obtenerAnaliticasDeMiInstitucion(
      req.usuario.sub,
    );
  }

  @Post('me/estudiantes')
  crearEstudiante(
    @Body() body: CrearEstudianteDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.institucionService.crearEstudianteEnMiInstitucion(
      req.usuario.sub,
      body.nombre,
      body.correo,
      body.contrasena,
      body.claseId,
    );
  }

  @Post('me/estudiantes/agregar')
  agregarEstudianteExistente(
    @Body() body: AgregarEstudianteExistenteDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.institucionService.agregarEstudianteExistenteAMiInstitucion(
      req.usuario.sub,
      body.correo,
      body.claseId,
    );
  }

  @Post('me/estudiantes/importar-csv')
  @UseInterceptors(FileInterceptor('archivo', csvMulterOptions))
  @UseFilters(MulterExceptionFilter)
  importarEstudiantesCsv(
    @UploadedFile() archivo: Express.Multer.File,
    @Body('claseId') claseId: string | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!archivo) {
      throw new BadRequestException('Debes seleccionar un archivo CSV.');
    }

    return this.institucionService.importarEstudiantesCsv(
      req.usuario.sub,
      archivo,
      claseId || undefined,
    );
  }

  @Get('me/grupos')
  obtenerGrupos(@Request() req: AuthenticatedRequest) {
    return this.institucionService.obtenerGruposDeMiInstitucion(
      req.usuario.sub,
    );
  }

  @Post('me/grupos')
  crearGrupo(
    @Body() body: CrearGrupoDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.institucionService.crearGrupoEnMiInstitucion(
      req.usuario.sub,
      body.nombre,
      body.grado,
    );
  }

  @Patch('me/grupos/:id')
  editarGrupo(
    @Param('id') id: string,
    @Body() body: ActualizarGrupoDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.institucionService.actualizarGrupo(
      req.usuario.sub,
      id,
      body.nombre,
    );
  }

  @Delete('me/grupos/:id')
  eliminarGrupo(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.institucionService.eliminarGrupo(req.usuario.sub, id);
  }

  @Post('me/grupos/:id/estudiantes')
  agregarEstudianteAGrupo(
    @Param('id') id: string,
    @Body() body: AgregarEstudianteAGrupoDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.institucionService.agregarEstudianteAGrupo(
      req.usuario.sub,
      id,
      body.estudianteId,
    );
  }

  @Delete('me/grupos/:id/estudiantes/:estudianteId')
  quitarEstudianteDeGrupo(
    @Param('id') id: string,
    @Param('estudianteId') estudianteId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.institucionService.quitarEstudianteDeGrupo(
      req.usuario.sub,
      id,
      estudianteId,
    );
  }
}
