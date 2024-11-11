// sleep-time.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SleepData } from '../sleepData/sleepData.entities';

@Entity('sleep_time')
export class SleepTime {
  @PrimaryGeneratedColumn()
  id: number;


  @ManyToOne(() => SleepData, (sleepData) => sleepData.sleepTimes, { onDelete: 'CASCADE' })
  sleepData: SleepData;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'varchar' })
  sourceId: string;

  @Column({ type: 'varchar' })
  sourceName: string;

  @Column({
    type: 'enum',
    enum: ['AWAKE', 'INBED', 'REM', 'CORE', 'DEEP'],
    default: 'AWAKE',
  })
  value: 'AWAKE' | 'INBED' | 'REM' | 'CORE' | 'DEEP';
}
