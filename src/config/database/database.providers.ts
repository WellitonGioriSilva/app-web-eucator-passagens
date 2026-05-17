import { BaseEntity, DataSource } from 'typeorm';
import { DATABASE_SOURCE } from '../constants/database-source';

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

export const databaseProviders = [
  {
    provide: DATABASE_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? '3306'),
        username: process.env.DB_USERNAME ?? 'root',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME ?? 'db_eucator_passagens',
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: toBoolean(
          process.env.DB_SYNCHRONIZE,
          false,
        ),
        logging: toBoolean(
          process.env.DB_LOGGING,
          false,
        ),
      });

      const initializedDataSource = await dataSource.initialize();
      BaseEntity.useDataSource(initializedDataSource);

      return initializedDataSource;
    },
  },
];
