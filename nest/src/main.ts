import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';

const PORT = process.env.PORT || 8000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConf = new DocumentBuilder()
    .setTitle('Title')
    .setDescription('Description')
    .setVersion('0.1')
    .build();
  const doc = SwaggerModule.createDocument(app, swaggerConf);
  SwaggerModule.setup('api', app, doc);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  await app.listen(PORT);
  console.info(`🚀 Nest service is running on: ${await app.getUrl()}`);
  console.info(`📖 Swagger is running on: ${await app.getUrl()}/api`);
}
bootstrap();
