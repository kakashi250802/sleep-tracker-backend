import { IsNumber, Max, Min } from "class-validator";

export class CreateSleepHeartDto {
    endDate: string;
    sourceId: string;
    sourceName: string;
    startDate: string;
    @IsNumber()
    @Min(0) // Tối thiểu là 0
    @Max(200) // Giới hạn nhịp tim tối đa là 200 (hoặc có thể thay đổi tùy yêu cầu)
    value: number;
  }
  