import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SleepData } from '../entities/sleepData/sleepData.entities';
import { SleepHeart } from '../entities/sleepHeart/sleepHeart.entities';
import { SleepTime } from '../entities/sleepTime/sleepTime.entities';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateSleepHeartDto } from './dto/sleepHeart.dto';
import { CreateSleepTimeDto } from './dto/sleepTime.dto';
import axios from 'axios'; // Import axios for API calls
import { SleepReport } from '../entities/sleepReport/sleepReport.entities';
import { User } from '../entities/user/user.entities';
import { SleepQuality } from '../dto/sleepReport.dto';
import { OpenAIService } from 'src/openai/openai.service';

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
        private readonly openAIService: OpenAIService,
    ) { }

    async processAndSaveData(
        userId: number,
        heartData: CreateSleepHeartDto[],
        sleepData: CreateSleepTimeDto[],
        forceSleepTime:string,
        forceWakeTime:string,
    ) {
        // // Kiểm tra đầu vào
        // if (!heartData || heartData.length === 0) {
        //     throw new BadRequestException('heartData không được trống');
        // }
        // if (!sleepData || sleepData.length === 0) {
        //     throw new BadRequestException('sleepData không được trống');
        // }
    
        // Lấy thời gian bắt đầu của giấc ngủ từ bản ghi đầu tiên
        const sleepStartTime = new Date(sleepData[0]?.startDate || forceSleepTime);
        // Lấy thời gian thức dậy từ bản ghi cuối cùng
        const wakeUpTime = new Date(sleepData[sleepData.length - 1]?.endDate || forceWakeTime);
        console.log(sleepStartTime, wakeUpTime);
        // Kiểm tra bản ghi giấc ngủ đã tồn tại
        let existingSleepData = await this.sleepDataRepository.findOne({
            where: {
              user_id: userId,
              sleep_start_time: MoreThanOrEqual(sleepStartTime),
              wake_up_time: LessThanOrEqual(wakeUpTime),
            },
            relations: ['sleepTimes', 'sleepHeart', 'report'],
          });
    
        if (existingSleepData) {
            // Gọi API để lấy điểm giấc ngủ cho bản ghi đã tồn tại
            console.log(existingSleepData);
            return {
                dataSleep: existingSleepData,

            };
        }
    
        // Tính toán nhịp tim từ heartData
        const avgHeartRate = heartData.reduce((sum, h) => sum + h.value, 0) / heartData.length;
        const maxHeartRate = Math.max(...heartData.map(h => h.value));
        const minHeartRate = Math.min(...heartData.map(h => h.value));
    
        // Tính toán tổng thời gian giấc ngủ (đơn vị phút)
        const totalSleepTime = sleepData.reduce((sum, s) => {
            const start = new Date(s.startDate).getTime();
            const end = new Date(s.endDate).getTime();
            return sum + (end - start) / (1000 * 60); // Chuyển đổi thời gian từ mili giây sang phút
        }, 0);
    
        // Tính toán các giai đoạn giấc ngủ
        const coreSleep = sleepData.filter(s => s.value === 'CORE').length * (totalSleepTime / sleepData.length);
        const deepSleep = sleepData.filter(s => s.value === 'DEEP').length * (totalSleepTime / sleepData.length);
        const remSleep = sleepData.filter(s => s.value === 'REM').length * (totalSleepTime / sleepData.length);
    
        // Tính tỷ lệ phần trăm các giai đoạn giấc ngủ
        const coreSleepPercentage = (coreSleep / totalSleepTime) * 100;
        const deepSleepPercentage = (deepSleep / totalSleepTime) * 100;
        const remSleepPercentage = (remSleep / totalSleepTime) * 100;
    
        // Tính phần trăm nhịp tim dưới mức nghỉ
        const heartRateBelowRestingPercentage = heartData.filter(h => h.value < avgHeartRate).length / heartData.length * 100;
    
        // Tạo bản ghi giấc ngủ mới
        const sleepRecord = this.sleepDataRepository.create({
            user_id: userId,
            total_time: totalSleepTime,
            total_rem_sleep: remSleep,
            total_deep_sleep: deepSleep,
            heart_rate_below_resting_percentage: heartRateBelowRestingPercentage,
            wake_up_time: wakeUpTime,
            sleep_start_time: sleepStartTime,
            heart_rate_avg: avgHeartRate,
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
        const heartEntities = heartData.map(h => this.sleepHeartRepository.create({ ...h, sleepData: savedSleepData }));
        await this.sleepHeartRepository.save(heartEntities);
    
        // Lưu dữ liệu thời gian ngủ
        const sleepEntities = sleepData.map(s => this.sleepTimeRepository.create({ ...s, sleepData: savedSleepData }));
        await this.sleepTimeRepository.save(sleepEntities);
    
        // Gọi API để lấy điểm giấc ngủ cho bản ghi mới
        const predictionData = {
            "REM SLEEP": remSleepPercentage / 100,
            "DEEP SLEEP": deepSleepPercentage / 100,
            "HEART RATE BELOW RESTING": heartRateBelowRestingPercentage / 100,
            "MINUTES of Sleep": totalSleepTime,
        };
    
        const sleepScoreResponse = await axios.post('http://127.0.0.1:5000/predict', predictionData);
        const sleepScore = sleepScoreResponse.data.predictions[0]?.score;
        const sleepQuality: SleepQuality = sleepScoreResponse.data.predictions[0]?.quality;
        console.log(sleepScore,sleepQuality,process.env.OPEN_AI_KEY);
        // Tạo prompt để lấy lời khuyên
        const advicePrompt = `
        Dưới đây là thông tin về giấc ngủ của người dùng:
        - Tổng thời gian ngủ: ${totalSleepTime} phút
        - Thời gian ngủ REM: ${remSleep} phút (${remSleepPercentage.toFixed(2)}%)
        - Thời gian ngủ sâu (Deep Sleep): ${deepSleep} phút (${deepSleepPercentage.toFixed(2)}%)
        - Nhịp tim trung bình: ${avgHeartRate} bpm
        - Nhịp tim tối đa: ${maxHeartRate} bpm
        - Nhịp tim tối thiểu: ${minHeartRate} bpm
        - Tỷ lệ nhịp tim dưới mức nghỉ: ${heartRateBelowRestingPercentage.toFixed(2)}%
        - Thời gian bắt đầu giấc ngủ: ${sleepStartTime.toISOString()}
        - Thời gian thức dậy: ${wakeUpTime.toISOString()}
        - Thời gian ngủ cốt lõi: ${coreSleep} phút (${coreSleepPercentage.toFixed(2)}%)
        - Với điểm số giấc ngủ(theo chuẩn fitbit): ${sleepScore}
        - Với đánh giá giấc ngủ(theo chuẩn fitbit): ${sleepQuality}
        Dựa trên các dữ liệu trên, vui lòng đưa ra lời khuyên thật ngắn gọn nhất có thể khoảng 40 từ tập trung vào 3 vấn đề dưới đây:
        1. Nếu giấc ngủ không đủ hoặc không tốt, hãy khuyên người dùng ngủ sớm hơn hoặc cải thiện giấc ngủ.
        2. Nếu giấc ngủ tốt nhưng nhịp tim không ổn, hãy khuyên người dùng kiểm tra sức khoẻ hoặc gặp bác sĩ.
        3. Nếu giấc ngủ ổn và nhịp tim bình thường, hãy khuyên người dùng duy trì thói quen này.
        mẫu promt trả về sẽ như này:"tổng quan giấc ngủ của bạn..., Giờ đi ngủ của bạn..., các chỉ số giấc ngủ của bạn..., bạn nên ..."
        `;

// Gọi OpenAIService để lấy lời khuyên
        const advice = await this.openAIService.getAdvice(advicePrompt);
        console.log(advice);
        // Lưu kết quả sleep score vào bảng sleep_report
        if (sleepScore != null) {
            const sleepReport = this.sleepReportRepository.create({
                user: { id: userId },
                sleepData: { id: savedSleepData.id },
                report_date: sleepStartTime.toISOString().split('T')[0],
                sleep_quality: sleepQuality,
                score: sleepScore,
                advice
            });
    
            await this.sleepReportRepository.save(sleepReport);
        }
    
        return {
            dataSleep: savedSleepData,
            dataPredict: {
                sleepScore,
                sleepQuality,
                advice,
            },
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
