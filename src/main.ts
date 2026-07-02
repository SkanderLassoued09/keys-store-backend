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
  // Host binding is switched purely by NODE_ENV (set by the npm scripts):
  //   development       → 127.0.0.1  (local machine only)
  //   production/unset  → 0.0.0.0    (reachable on the LAN, e.g. 192.168.x.x)
  // An explicit HOST env var always wins. Unset defaults to 0.0.0.0 so the
  // Docker container (which runs with NODE_ENV unset) stays reachable as before.
  const host =
    process.env.HOST ||
    (process.env.NODE_ENV === 'development' ? '127.0.0.1' : '0.0.0.0');

  await app.listen(port, host);
  console.log(
    `[bootstrap] env=${process.env.NODE_ENV ?? 'unset'} → listening on http://${host}:${port} (Swagger at /api)`,
  );
}
bootstrap();
