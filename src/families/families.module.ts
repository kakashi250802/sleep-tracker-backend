import { Module } from '@nestjs/common';
import { FamiliesService } from './families.service';
import { FamiliesController } from './families.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SleepData } from '../entities/sleepData/sleepData.entities';
import { SleepHeart } from '../entities/sleepHeart/sleepHeart.entities';
import { SleepTime } from '../entities/sleepTime/sleepTime.entities';
import { SleepReport } from '../entities/sleepReport/sleepReport.entities';
import { User } from '../entities/user/user.entities';
import { Families } from '../entities/families/families.entities';
import { UserFamilies } from '../entities/userFamilies/userFamilies.entity';
import { FamilyInvitation } from '../entities/familyInvitations/familyInvitations.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [ ConfigModule,
        AuthModule,TypeOrmModule.forFeature([SleepData, SleepHeart, SleepTime,SleepReport,User,Families, UserFamilies, FamilyInvitation])],
  providers: [FamiliesService],
  controllers: [FamiliesController]
})
export class FamiliesModule {}
