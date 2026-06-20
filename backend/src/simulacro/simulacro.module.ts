import { Module } from '@nestjs/common';
import { SimulacroService } from './simulacro.service';
import { SimulacroController } from './simulacro.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SimulacroService],
  controllers: [SimulacroController],
})
export class SimulacroModule {}
