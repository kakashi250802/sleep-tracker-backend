// sleep-heart.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SleepData } from '../sleepData/sleepData.entities';

@Entity('sleep_heart')
export class SleepHeart {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SleepData, (sleepData) => sleepData.sleepHeart, { onDelete: 'CASCADE' })
  sleepData: SleepData;


  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'varchar' })
  sourceId: string;

  @Column({ type: 'varchar' })
  sourceName: string;

  @Column({ type: 'float' }) // Using float for the value field
  value: number;
}
