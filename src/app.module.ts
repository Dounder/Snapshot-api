import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ENV_CONFIG, JoiValidationSchema } from './config';
import { ImagesModule } from './images/images.module';
import { SeedModule } from './seed/seed.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [ENV_CONFIG],
      isGlobal: true,
      validationSchema: JoiValidationSchema,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoLoadEntities: true,
        synchronize: true,
        type: 'postgres',
        ssl: configService.get('state') === 'prod' ? { rejectUnauthorized: false, sslmode: 'require' } : (false as any),
        host: configService.get('dbHost'),
        port: configService.get('dbPort'),
        username: configService.get('dbUsername'),
        password: configService.get('dbPassword'),
        database: configService.get('dbName'),
      }),
    }),

    CommonModule,

    UsersModule,

    AuthModule,

    SeedModule,

    ImagesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
