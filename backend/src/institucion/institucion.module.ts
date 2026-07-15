import { Module } from '@nestjs/common';
import { InstitucionController } from './institucion.controller';
import { InstitucionService } from './institucion.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InstitucionController],
  providers: [InstitucionService],
})
export class InstitucionModule {}
