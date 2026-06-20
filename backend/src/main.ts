import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS habilitado para que Next.js pueda conectarse
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const puerto = process.env.PORT ?? 3000;
  await app.listen(puerto);
  console.log(`🚀 Servidor ICFES corriendo en: http://localhost:${puerto}`);
}
void bootstrap();
