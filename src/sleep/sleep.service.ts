import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSleepTimeDto } from './dto/sleepTime.dto';
import { CreateSleepHeartDto } from './dto/sleepHeart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
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
    ) { }

    async processAndSaveData(
        userId: number,
        heartData: CreateSleepHeartDto[],
        sleepData: CreateSleepTimeDto[],
    ) {
        // Kiểm tra đầu vào
        if (!heartData || heartData.length === 0) {
            throw new BadRequestException('heartData không được trống');
        }
        if (!sleepData || sleepData.length === 0) {
            throw new BadRequestException('sleepData không được trống');
        }

        // Lấy thời gian bắt đầu của giấc ngủ từ bản ghi đầu tiên
        const sleepStartTime = new Date(sleepData[0].startDate);

        // Lấy thời gian thức dậy từ bản ghi cuối cùng
        const wakeUpTime = new Date(sleepData[sleepData.length - 1].endDate);

        const existingSleepData = await this.sleepDataRepository.findOne({
            where: {
                sleep_start_time: sleepStartTime,
                wake_up_time: wakeUpTime,
            },
            });
            
            if (existingSleepData) {
            throw new BadRequestException('Bản ghi với sleep_start_time và wake_up_time này đã tồn tại');
            }

        // Tính toán nhịp tim từ heartData
        const avgHeartRate = heartData.reduce((sum, h) => sum + h.value, 0) / heartData.length;
        const maxHeartRate = Math.max(...heartData.map(h => h.value));
        const minHeartRate = Math.min(...heartData.map(h => h.value));

        // Tính toán tổng thời gian giấc ngủ (theo đơn vị phút)
        const totalSleepTime = sleepData.reduce((sum, s) => {
            const start = new Date(s.startDate).getTime();
            const end = new Date(s.endDate).getTime();
            return sum + (end - start) / (1000 * 60); // Chuyển đổi thời gian từ mili giây sang phút
        }, 0);

        // Tính toán các giai đoạn giấc ngủ (core, deep, rem) từ sleepData
        const coreSleep = sleepData.filter(s => s.value === 'CORE').length * (totalSleepTime / sleepData.length);
        const deepSleep = sleepData.filter(s => s.value === 'DEEP').length * (totalSleepTime / sleepData.length);
        const remSleep = sleepData.filter(s => s.value === 'REM').length * (totalSleepTime / sleepData.length);

        // Tính tỷ lệ phần trăm các giai đoạn giấc ngủ
        const coreSleepPercentage = (coreSleep / totalSleepTime) * 100;
        const deepSleepPercentage = (deepSleep / totalSleepTime) * 100;
        const remSleepPercentage = (remSleep / totalSleepTime) * 100;

        // Tính phần trăm nhịp tim dưới mức nghỉ (có thể điều chỉnh dựa trên dữ liệu)
        const heartRateBelowRestingPercentage = heartData.filter(h => h.value < avgHeartRate).length / heartData.length * 100;

        // Tạo bản ghi giấc ngủ
        const sleepRecord = this.sleepDataRepository.create({
            user_id: userId,
            total_time: totalSleepTime,
            total_rem_sleep: remSleep,
            total_deep_sleep: deepSleep,
            heart_rate_below_resting_percentage: heartRateBelowRestingPercentage,
            wake_up_time: wakeUpTime,
            sleep_start_time: sleepStartTime,
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
    async getSleepRecords(userId: number, days: number): Promise<SleepData[]> {
        // Tính toán ngày bắt đầu
        const endDate = new Date(); // Hôm nay
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days + 1); // Trừ đi số ngày (nếu là 7 ngày thì lấy từ 6 ngày trước và hôm nay)
    
        // Truy vấn dữ liệu
        return await this.sleepDataRepository.find({
          where: {
            user_id: userId,
            sleep_start_time: MoreThanOrEqual(startDate),
            wake_up_time: LessThanOrEqual(endDate),
          },
          order: {
            sleep_start_time: 'ASC', // Sắp xếp theo thời gian bắt đầu giấc ngủ
          },
        });
      }
}
