import { IsDateString, IsEnum, IsString } from "class-validator";

export enum SleepStage {
    AWAKE = 'AWAKE',
    INBED = 'INBED',
    REM = 'REM',
    CORE = 'CORE',
    DEEP = 'DEEP',
  }
export class CreateSleepTimeDto {
    @IsDateString()
    startDate: string;
  
    @IsDateString()
    endDate: string;
  
    @IsString()
    sourceId: string;
  
    @IsString()
    sourceName: string;
  
    @IsEnum(SleepStage)
    value: SleepStage;
  }
  