import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { IResponseError } from './common/interfaces/response.interface';

function nestedObjectMessageFormatter(
  error: ValidationError,
  errorMessages: IResponseError[],
  fields: string[] = [],
) {
  fields.push(error.property);

  if (error.children.length === 0) {
    const field = fields.join('.');
    const [message] = Object.values(error.constraints);
    errorMessages.push({ field, message });
  }

  for (const child of error.children) {
    nestedObjectMessageFormatter(child, errorMessages, [...fields]);
  }
}

function exceptionFactory(errors: ValidationError[]) {
  const errorMessages: IResponseError[] = [];

  for (const error of errors) {
    nestedObjectMessageFormatter(error, errorMessages);
  }

  return new BadRequestException('The request payload is not valid.', {
    cause: errorMessages,
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
