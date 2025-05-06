import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) => {
      const messages = errors.map(err => {
        if (err.constraints) {
          return Object.values(err.constraints).join(', ');
        }
        return 'Некорректные данные';
      });
      return new BadRequestException(messages);
    },
  }));
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
