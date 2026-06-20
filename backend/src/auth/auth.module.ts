import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importamos Prisma

@Module({
  imports: [PrismaModule], // Lo agregamos aquí
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
