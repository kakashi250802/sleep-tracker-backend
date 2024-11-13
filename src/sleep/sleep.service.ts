import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SleepData } from 'src/entities/sleepData/sleepData.entities';
import { SleepHeart } from 'src/entities/sleepHeart/sleepHeart.entities';
import { SleepTime } from 'src/entities/sleepTime/sleepTime.entities';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateSleepHeartDto } from './dto/sleepHeart.dto';
import { CreateSleepTimeDto } from './dto/sleepTime.dto';
import axios from 'axios'; // Import axios for API calls
import { SleepReport } from 'src/entities/sleepReport/sleepReport.entities';
import { User } from 'src/entities/user/user.entities';
import { SleepQuality } from 'src/dto/sleepReport.dto';

@Injectable()
export class SleepService {
    constructor(
        @InjectRepository(SleepData)
        private sleepDataRepository: Repository<SleepData>,
        @InjectRepository(SleepHeart)
        private sleepHeartRepository: Repository<SleepHeart>,
        @InjectRepository(SleepTime)
        private sleepTimeRepository: Repository<SleepTime>,
        @InjectRepository(SleepReport)
        private sleepReportRepository: Repository<SleepReport>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
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

        // Gọi API để lấy điểm giấc ngủ
        // Gọi API để lấy điểm giấc ngủ
        const predictionData = {
            "REM SLEEP": remSleepPercentage / 100, // Chuyển đổi sang tỷ lệ
            "DEEP SLEEP": deepSleepPercentage / 100, // Chuyển đổi sang tỷ lệ
            "HEART RATE BELOW RESTING": heartRateBelowRestingPercentage / 100, // Tỷ lệ
            "MINUTES of Sleep": totalSleepTime,
        };

        const sleepScoreResponse = await axios.post('http://127.0.0.1:5000/predict', predictionData);
        const sleepScore = sleepScoreResponse.data.predictions[0]?.score;
        const sleepQuality: SleepQuality = sleepScoreResponse.data.predictions[0]?.quality;
        // Lưu kết quả sleep score vào bảng sleep_report
        if (sleepScore != null) {
            const sleepReport = this.sleepReportRepository.create({
                user: { id: userId },
                sleepData: { id: savedSleepData.id },
                report_date: sleepStartTime.toISOString().split('T')[0], // Định dạng ngày
                sleep_quality: sleepQuality,
                score: sleepScore,
            });

            await this.sleepReportRepository.save(sleepReport);
        }

        return {
            dataSleep: savedSleepData, dataPredict: {
                sleepScore,
                sleepQuality
            }
        };
    }
    async getSleepRecords(userId: number, days: number) {
        // Tính toán ngày bắt đầu và kết thúc
        const endDate = new Date(); // Hôm nay
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days + 1); // Trừ đi số ngày (nếu là 7 ngày thì lấy từ 6 ngày trước và hôm nay)

        // Truy vấn dữ liệu SleepData với các liên kết sleepTimes và sleepHeart
        const records = await this.sleepDataRepository.find({
            where: {
                user_id: userId,
                sleep_start_time: MoreThanOrEqual(startDate),
                wake_up_time: LessThanOrEqual(endDate),
            },
            order: {
                sleep_start_time: 'ASC', // Sắp xếp theo thời gian bắt đầu giấc ngủ
            },
            relations: ['sleepTimes', 'sleepHeart', 'report'], // Nạp các quan hệ với SleepTime và SleepHeart
        });

        // Tạo danh sách các ngày từ startDate đến endDate
        const dateList: string[] = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dateList.push(currentDate.toISOString().split('T')[0]); // Lưu ngày theo định dạng YYYY-MM-DD
            currentDate.setDate(currentDate.getDate() + 1); // Tiến tới ngày tiếp theo
        }

        // Tạo map từ ngày đến dữ liệu giấc ngủ
        const recordsMap = records.reduce((acc, record) => {
            const dateKey = record.sleep_start_time.toISOString().split('T')[0]; // Lấy phần ngày (YYYY-MM-DD)
            acc[dateKey] = record;
            return acc;
        }, {} as Record<string, SleepData>);

        // Kết hợp các ngày không có dữ liệu với dữ liệu trống
        const response = dateList.map(date => {
            const record = recordsMap[date];
            if (record) {
                // Nếu có dữ liệu cho ngày này, trả về dữ liệu gốc
                return record;
            }
        });

        return response;
    }
    async getSleepRecordByDate(userId: number, startDate: Date, endDate: Date) {
        // Truy vấn dữ liệu SleepData với các liên kết sleepTimes và sleepHeart
        const records = await this.sleepDataRepository.find({
            where: {
                user_id: userId,
                sleep_start_time: MoreThanOrEqual(startDate),
                wake_up_time: LessThanOrEqual(endDate),
            },
            order: {
                sleep_start_time: 'ASC', // Sắp xếp theo thời gian bắt đầu giấc ngủ
            },
            relations: ['sleepTimes', 'sleepHeart', 'report'], // Nạp các quan hệ với SleepTime và SleepHeart
        });
    
        // Tạo danh sách các ngày từ startDate đến endDate
        const dateList: string[] = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            dateList.push(currentDate.toISOString().split('T')[0]); // Lưu ngày theo định dạng YYYY-MM-DD
            currentDate.setDate(currentDate.getDate() + 1); // Tiến tới ngày tiếp theo
        }
    
        // Tạo map từ ngày đến dữ liệu giấc ngủ
        const recordsMap = records.reduce((acc, record) => {
            const dateKey = record.sleep_start_time.toISOString().split('T')[0]; // Lấy phần ngày (YYYY-MM-DD)
            acc[dateKey] = record;
            return acc;
        }, {} as Record<string, SleepData>);
    
        // Kết hợp các ngày không có dữ liệu với dữ liệu trống
        const response = dateList.map(date => {
            const record = recordsMap[date];
            if (record) {
                // Nếu có dữ liệu cho ngày này, trả về dữ liệu gốc
                return record;
            }
        });
    
        return response;
    }
    
}
