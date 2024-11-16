import { Module } from '@nestjs/common';
import { FamiliesService } from './families.service';
import { FamiliesController } from './families.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SleepData } from 'src/entities/sleepData/sleepData.entities';
import { SleepHeart } from 'src/entities/sleepHeart/sleepHeart.entities';
import { SleepTime } from 'src/entities/sleepTime/sleepTime.entities';
import { SleepReport } from 'src/entities/sleepReport/sleepReport.entities';
import { User } from 'src/entities/user/user.entities';
import { Families } from 'src/entities/families/families.entities';
import { UserFamilies } from 'src/entities/userFamilies/userFamilies.entity';
import { FamilyInvitation } from 'src/entities/familyInvitations/familyInvitations.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [ ConfigModule,
        AuthModule,TypeOrmModule.forFeature([SleepData, SleepHeart, SleepTime,SleepReport,User,Families, UserFamilies, FamilyInvitation])],
  providers: [FamiliesService],
  controllers: [FamiliesController]
})
export class FamiliesModule {}
