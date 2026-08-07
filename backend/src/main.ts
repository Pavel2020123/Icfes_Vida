import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  // Fail fast on missing critical envs
  if (!process.env.JWT_SECRET) {
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

  // Security headers
  // CSP is disabled here to avoid breaking existing static assets and frontend
  // routes until an explicit policy can be defined and tested for this app.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      frameguard: { action: 'deny' },
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      hsts:
        process.env.NODE_ENV === 'production'
          ? { maxAge: 15552000, includeSubDomains: true, preload: true }
          : false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Rate limiting (defensa en profundidad)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);

  // Endpoints sensibles con límites más estrictos
  const authLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 login attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/auth/login', authLoginLimiter);
  app.use('/auth/registro', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

  // Hardening: establecer límites explícitos de body para evitar DoS por payloads grandes
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }));

  // Servimos /uploads como archivos estáticos (así se ven los logos que
  // se suben desde "Editar institución"). Mientras no usemos Supabase
  // Storage, esta carpeta local hace las veces de almacenamiento de archivos.
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  const puerto = process.env.PORT ?? 3000;
  await app.listen(puerto);

  console.log(`🚀 Servidor ICFES corriendo en: http://localhost:${puerto}`);
}
void bootstrap();
