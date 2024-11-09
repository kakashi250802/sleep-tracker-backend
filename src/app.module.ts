import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module'; // Import AuthModule
import { User } from './entities/user/user.entities';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal: true,  // Làm cho ConfigService có sẵn toàn cục
      }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'sleep_tracker',
      entities: [User], // Đảm bảo User entity được bao gồm
      synchronize: true,
    }),
    AuthModule, // Đảm bảo AuthModule được import
  ],
})
export class AppModule {}