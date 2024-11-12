import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SleepReportsService } from './sleep-reports.service';
import { SleepReport } from 'src/entities/sleepReport/sleepReport.entities';
import { SleepData } from 'src/entities/sleepData/sleepData.entities';


@Module({
  imports: [TypeOrmModule.forFeature([SleepReport, SleepData])],
  providers: [SleepReportsService],
  exports: [SleepReportsService],
})
export class SleepReportsModule {}
