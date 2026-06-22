import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  controllers: [AdminController],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  providers: [AdminService],
})
export class AdminModule {}