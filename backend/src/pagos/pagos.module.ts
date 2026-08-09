import { Module } from '@nestjs/common';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CalendarioIcfesModule } from '../calendario-icfes/calendario-icfes.module';

@Module({
  imports: [PrismaModule, CalendarioIcfesModule],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
