export class CreateSleepTimeDto {
    endDate: string;
    sourceId: string;
    sourceName: string;
    startDate: string;
    value: 'AWAKE' | 'INBED' | 'REM' | 'CORE' | 'DEEP';
  }
  