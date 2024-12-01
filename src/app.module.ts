import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module'; // Import AuthModule
import { User } from './entities/user/user.entities';
import { ConfigModule } from '@nestjs/config';
import { SleepData } from './entities/sleepData/sleepData.entities';
import { SleepHeart } from './entities/sleepHeart/sleepHeart.entities';
import { SleepTime } from './entities/sleepTime/sleepTime.entities';
import { SleepModule } from './sleep/sleep.module';
import { SleepReport } from './entities/sleepReport/sleepReport.entities';
import { SleepReportsService } from './sleep-reports/sleep-reports.service';
import { SleepReportsModule } from './sleep-reports/sleep-reports.module';
import { FamilyInvitation } from './entities/familyInvitations/familyInvitations.entity';
import { UserFamilies } from './entities/userFamilies/userFamilies.entity';
import { Families } from './entities/families/families.entities';
import { FamiliesModule } from './families/families.module';
import { AdviceModule } from './openai/openai.module';


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
      entities: [User,SleepData,SleepHeart,SleepTime,SleepReport,Families,FamilyInvitation,UserFamilies], // Đảm bảo User entity được bao gồm
      synchronize: true,
    }),
    AuthModule,
    SleepModule,
    SleepReportsModule, 
    FamiliesModule, AdviceModule

  ],

})
export class AppModule {}
