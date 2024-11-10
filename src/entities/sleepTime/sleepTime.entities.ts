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
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @Column({ type: 'varchar' })
  value: string; // Type of sleep (e.g., "light", "deep", "rem")
}
