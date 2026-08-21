import { Module } from '@nestjs/common';
import { SimulacroService } from './simulacro.service';
import { SimulacroController } from './simulacro.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TemaPdfService } from './tema-pdf.service';

@Module({
  imports: [PrismaModule],
  providers: [SimulacroService, TemaPdfService],
  controllers: [SimulacroController],
})
export class SimulacroModule {}
