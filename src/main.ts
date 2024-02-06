import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

function exceptionFactory(errors: ValidationError[]) {
  return new BadRequestException('The request payload is not valid.', {
    cause: errors.map((e) => ({
      field: e.property,
      message: Object.values(e.constraints).join(', '),
    })),
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory,
    }),
  );

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<string>('PORT') ?? 3000;

  const config = new DocumentBuilder()
    .setTitle('Onboarding Task')
    .setDescription('Onboarding Task API description')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
}
bootstrap();
