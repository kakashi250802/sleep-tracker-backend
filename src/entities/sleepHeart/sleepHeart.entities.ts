// sleep-heart.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SleepData } from '../sleepData/sleepData.entities';

@Entity('sleep_heart')
export class SleepHeart {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SleepData, (sleepData) => sleepData.sleepHeart, { onDelete: 'CASCADE' })
  sleepData: SleepData;

  @Column({ type: 'float' })
  value: number;
  @Column()
  start_date: Date;

  @Column()
  end_date: Date;
}
