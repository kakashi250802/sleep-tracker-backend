import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { SleepQuality } from "src/dto/sleepReport.dto";

export class CreateSleepReportDto {
    @IsNotEmpty()
    @IsNumber()
    sleepDataId: number;
  
    @IsNotEmpty()
    @IsDateString()
    reportDate: string;
  
    @IsNotEmpty()
    @IsEnum(SleepQuality)
    sleepQuality: SleepQuality;
  
    @IsNotEmpty()
    @IsNumber()
    score: number;
  }
  
  
  export class UpdateSleepReportDto {
      @IsOptional()
      @IsDateString()
      reportDate?: string;
    
      @IsOptional()
      @IsEnum(SleepQuality)
      sleepQuality?: SleepQuality;
    
      @IsOptional()
      @IsNumber()
      score?: number;
    }