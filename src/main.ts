import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { createWinstonLogger } from 'logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createWinstonLogger('local')),
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
