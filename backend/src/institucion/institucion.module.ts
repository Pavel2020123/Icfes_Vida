import { Module } from '@nestjs/common';
import { InstitucionController } from './institucion.controller';
import { InstitucionService } from './institucion.service';
import { InstitucionAccesoService } from './institucion-acceso.service';
import { GrupoService } from './grupo.service';
import { EstudianteService } from './estudiante.service';
import { EstudianteImportService } from './estudiante-import.service';
import { ArchivoAlmacenamientoService } from './archivo-almacenamiento.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AlertasRiesgoService } from './alertas-riesgo.service';

@Module({
  imports: [PrismaModule],
  controllers: [InstitucionController],
  providers: [
    InstitucionService,
    InstitucionAccesoService,
    GrupoService,
    EstudianteService,
    EstudianteImportService,
    ArchivoAlmacenamientoService,
    AlertasRiesgoService,
  ],
})
export class InstitucionModule {}
