import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS habilitado para que Next.js pueda conectarse
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Servimos /uploads como archivos estáticos (así se ven los logos que
  // se suben desde "Editar institución"). Mientras no usemos Supabase
  // Storage, esta carpeta local hace las veces de almacenamiento de archivos.
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  const puerto = process.env.PORT ?? 3000;
  await app.listen(puerto);
  console.log(`🚀 Servidor ICFES corriendo en: http://localhost:${puerto}`);
}
void bootstrap();
