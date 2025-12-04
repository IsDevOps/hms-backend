import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips out properties that aren't in your DTOs
      transform: true, // Auto-transforms payloads to DTO instances
    }),
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('Hotel AI Hackathon API')
    .setDescription(
      'The API documentation for the Hospitality Management Platform',
    )
    .setVersion('1.0')
    .addTag('Auth', 'User authentication endpoints')
    .addTag('Bookings', 'Reservation and AI analysis')
    .addTag('Rooms', 'Room management and status')
    .addTag('Services', 'Guest service requests')
    .addTag('Admin', 'Dashboard analytics and logs')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger Docs available at: ${await app.getUrl()}/api-docs`);
}
bootstrap();
