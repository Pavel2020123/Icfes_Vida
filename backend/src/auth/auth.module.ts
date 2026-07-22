import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    JwtModule.register({
      global: true, // disponible en TODO el app sin reimportarlo
      secret:
        process.env.JWT_SECRET || 'icfes-vida-super-secreto-cambiar-en-prod',
      signOptions: { expiresIn: '7d' }, // token válido 7 días
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
