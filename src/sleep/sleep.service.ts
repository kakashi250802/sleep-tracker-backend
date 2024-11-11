import { Injectable } from '@nestjs/common';
import { CreateSleepTimeDto } from './dto/sleepTime.dto';
import { CreateSleepHeartDto } from './dto/sleepHeart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SleepData } from 'src/entities/sleepData/sleepData.entities';
import { SleepHeart } from 'src/entities/sleepHeart/sleepHeart.entities';
import { SleepTime } from 'src/entities/sleepTime/sleepTime.entities';

@Injectable()
export class SleepService {
    constructor(
        @InjectRepository(SleepData)
        private sleepDataRepository: Repository<SleepData>,
        @InjectRepository(SleepHeart)
        private sleepHeartRepository: Repository<SleepHeart>,
        @InjectRepository(SleepTime)
        private sleepTimeRepository: Repository<SleepTime>,
      ) {}
      
      async processAndSaveData(
        userId: number,
        heartData: CreateSleepHeartDto[],
        sleepData: CreateSleepTimeDto[],
      ) {
        // Tính toán các giá trị
        const avgHeartRate = heartData.reduce((sum, h) => sum + h.value, 0) / heartData.length;
        const maxHeartRate = Math.max(...heartData.map(h => h.value));
        const minHeartRate = Math.min(...heartData.map(h => h.value));
    
        // Giả lập tính toán giấc ngủ (tùy chỉnh theo yêu cầu)
        const coreSleep = 103; // giá trị giả lập
        const coreSleepPercentage = (coreSleep / 250) * 100;
        const deepSleep = 63.5;
        const deepSleepPercentage = 25.4;
        const remSleep = 42.5;
        const remSleepPercentage = 17;
        const totalSleepTime = 250;
        const heartRateBelowRestingPercentage = 45; // Giả định
    
        // Tạo và lưu SleepData
        const sleepRecord = this.sleepDataRepository.create({
          user_id: userId,
          total_time: totalSleepTime,
          total_rem_sleep: remSleep,
          total_deep_sleep: deepSleep,
          heart_rate_below_resting: heartRateBelowRestingPercentage,
          wake_up_time: new Date(),
          heart_rate_avg: avgHeartRate,
          avg_heart_rate: avgHeartRate,
          core_sleep: coreSleep,
          core_sleep_percentage: coreSleepPercentage,
          deep_sleep: deepSleep,
          deep_sleep_percentage: deepSleepPercentage,
          max_heart_rate: maxHeartRate,
          min_heart_rate: minHeartRate,
          rem_sleep: remSleep,
          rem_sleep_percentage: remSleepPercentage,
        });
        const savedSleepData = await this.sleepDataRepository.save(sleepRecord);
    
        // Lưu dữ liệu nhịp tim
        const heartEntities = heartData.map(h => {
          return this.sleepHeartRepository.create({
            ...h,
            sleepData: savedSleepData,
          });
        });
        await this.sleepHeartRepository.save(heartEntities);
    
        // Lưu dữ liệu thời gian ngủ
        const sleepEntities = sleepData.map(s => {
          return this.sleepTimeRepository.create({
            ...s,
            sleepData: savedSleepData,
          });
        });
        await this.sleepTimeRepository.save(sleepEntities);
    
        return savedSleepData;
      }
}
