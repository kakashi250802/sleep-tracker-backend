import { Module } from '@nestjs/common';
import { SleepController } from './sleep.controller';
import { SleepService } from './sleep.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SleepData } from '../entities/sleepData/sleepData.entities';
import { SleepHeart } from '../entities/sleepHeart/sleepHeart.entities';
import { SleepTime } from '../entities/sleepTime/sleepTime.entities';
import { AuthModule } from '../auth/auth.module';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SleepReport } from '../entities/sleepReport/sleepReport.entities';
import { User } from '../entities/user/user.entities';

@Module({
    imports: [ ConfigModule,
        AuthModule,TypeOrmModule.forFeature([SleepData, SleepHeart, SleepTime,SleepReport,User])],
    
    providers: [SleepService],
    controllers: [SleepController],
  })
export class SleepModule {}
