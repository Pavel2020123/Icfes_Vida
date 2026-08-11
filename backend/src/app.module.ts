import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SimulacroModule } from './simulacro/simulacro.module';
import { AdminModule } from './admin/admin.module';
import { InstitucionModule } from './institucion/institucion.module';
import { CalendarioIcfesModule } from './calendario-icfes/calendario-icfes.module';
import { PagosModule } from './pagos/pagos.module';
import { VentasModule } from './ventas/ventas.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    SimulacroModule,
    AdminModule,
    InstitucionModule,
    CalendarioIcfesModule,
    PagosModule,
    VentasModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
