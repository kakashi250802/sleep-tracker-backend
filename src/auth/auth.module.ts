import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/entities/user/user.entities';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),  // Đảm bảo đã import đúng User entity
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
              secret: configService.get<string>('JWT_SECRET'),
              // Không cần thiết lập expiresIn để token không hết hạn
            }),  // Nếu bạn sử dụng JWT, cần import module này
            inject: [ConfigService],
        }),
            ConfigModule,
      ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService,JwtModule],
})
export class AuthModule {}
