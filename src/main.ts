import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import expressEjsLayouts from 'express-ejs-layouts';
import { registerHelpers } from './helpers';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  app.use(expressEjsLayouts);
  app.set('layout', 'layouts/main');

  registerHelpers(app.getHttpAdapter().getInstance());

  const port = process.env.PORT ?? 3000;

  await app.listen(port, () =>
    Logger.log(
      `Application running in http://localhost:${port}`,
      'NestExpressApplication',
    ),
  );
}
bootstrap();
