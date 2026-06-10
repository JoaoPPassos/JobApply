import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
export default {
  type: 'postgres' as const,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'jobhub',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../infrastructure/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: false,
  cli: {
    migrationsDir: 'src/migrations',
  },
  autoloadEntities: true,
} as TypeOrmModuleOptions;
