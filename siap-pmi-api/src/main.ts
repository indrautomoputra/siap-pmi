import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import {
  DomainExceptionFilter,
  RequestLoggingInterceptor,
} from './infrastructure/observability';

function validateEnv(): void {
  const missing: string[] = [];
  const required = ['SUPABASE_URL', 'KAP_HASH_SALT', 'JWT_SECRET'];
  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });
  const anonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLIC_KEY ?? '';
  if (!anonKey) {
    missing.push('SUPABASE_ANON_KEY');
  }
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  validateEnv();
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV ?? 'production',
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    });
  }
  app.enableCors({
    origin: (process.env.ADMIN_ORIGIN ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0) || ['https://admin.siap-pmi.com'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalFilters(new DomainExceptionFilter());
  app.useGlobalInterceptors(new RequestLoggingInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
