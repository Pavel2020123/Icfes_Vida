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
  const esProduccion = process.env.NODE_ENV === 'production';

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
      hsts: esProduccion
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

  // La interfaz autenticada consulta varios recursos en paralelo. El límite
  // global protege la API sin bloquear la navegación normal del usuario.
  const limiteGlobalConfigurado = Number.parseInt(
    process.env.RATE_LIMIT_MAX ?? (esProduccion ? '1000' : '5000'),
    10,
  );
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max:
      Number.isFinite(limiteGlobalConfigurado) && limiteGlobalConfigurado > 0
        ? limiteGlobalConfigurado
        : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (request) => request.path.startsWith('/uploads/'),
    message: {
      statusCode: 429,
      error: 'Too Many Requests',
      message:
        'Has realizado demasiadas solicitudes. Espera un momento e inténtalo nuevamente.',
    },
  });
  app.use(globalLimiter);

  // Endpoints sensibles con límites más estrictos
  const authLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: esProduccion ? 10 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
      statusCode: 429,
      error: 'Too Many Requests',
      message:
        'Demasiados intentos de inicio de sesión. Espera unos minutos antes de volver a intentarlo.',
    },
  });
  app.use('/auth/login', authLoginLimiter);
  app.use(
    '/auth/registro',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: esProduccion ? 20 : 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        statusCode: 429,
        error: 'Too Many Requests',
        message:
          'Demasiados intentos de registro. Espera unos minutos antes de volver a intentarlo.',
      },
    }),
  );

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
