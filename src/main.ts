// MUST be first: populate process.env from the mode's .env file before any
// other module (AppModule → Mongoose/auth) reads it.
import './load-env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('My Service API')
    .setDescription('API documentation for all modules')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = Number(process.env.PORT) || 3000;
  // Bind ALL interfaces by default. This is required for Docker: inside a
  // container 127.0.0.1 is the container's own loopback, so the published port
  // (host:3000 → container:3000) can't reach an app bound to 127.0.0.1. 0.0.0.0
  // is also what the LAN/prod setup needs. To restrict to local-only on a bare
  // host, set HOST=127.0.0.1 explicitly.
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  console.log(
    `[bootstrap] env=${process.env.NODE_ENV ?? 'unset'} → listening on http://${host}:${port} (Swagger at /api)`,
  );
}
bootstrap();
