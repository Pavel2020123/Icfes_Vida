import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  // Fail fast on missing critical envs
  if (!process.env.JWT_SECRET) {
    // eslint-disable-next-line no-console
    console.error('ERROR: Missing required environment variable JWT_SECRET.');
    process.exit(1);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS habilitado para que Next.js pueda conectarse. Usar FRONTEND_URL en
  // producción para evitar orígenes abiertos.
  const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: [frontendOrigin],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Hardening: establecer límites explícitos de body para evitar DoS por payloads grandes
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }));

  // Servimos /uploads como archivos estáticos (así se ven los logos que
  // se suben desde "Editar institución"). Mientras no usemos Supabase
  // Storage, esta carpeta local hace las veces de almacenamiento de archivos.
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  const puerto = process.env.PORT ?? 3000;
  await app.listen(puerto);
  // eslint-disable-next-line no-console
  console.log(`🚀 Servidor ICFES corriendo en: http://localhost:${puerto}`);
}
void bootstrap();
