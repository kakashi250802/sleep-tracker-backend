// src/sleep/sleep.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entities';
import { SleepHeart } from '../sleepHeart/sleepHeart.entities';
import { SleepTime } from '../sleepTime/sleepTime.entities';
import { SleepReport } from '../sleepReport/sleepReport.entities';

@Entity('sleep_data')
export class SleepData {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, user => user.sleepData, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;  // This will create the relationship to the User entity
  @Column()
  user_id: number;

  @Column({ type: 'float' })
  total_time: number;

  @Column({ type: 'float' })
  total_rem_sleep: number;

  @Column({ type: 'float' })
  total_deep_sleep: number;

  @Column({ type: 'timestamp' })
  wake_up_time: Date;
  
  @Column({ type: 'timestamp' })
  sleep_start_time: Date;

  @Column({ type: 'float' })
  heart_rate_avg: number;

  // New fields based on the provided data

  @Column({ type: 'float', nullable: true })
  avg_heart_rate: number;

  @Column({ type: 'float', nullable: true })
  core_sleep: number;

  @Column({ type: 'float', nullable: true })
  core_sleep_percentage: number;

  @Column({ type: 'float', nullable: true })
  deep_sleep: number;

  @Column({ type: 'float', nullable: true })
  deep_sleep_percentage: number;

  @Column({ type: 'float', nullable: true })
  heart_rate_below_resting_percentage: number;

  @Column({ type: 'float', nullable: true })
  max_heart_rate: number;

  @Column({ type: 'float', nullable: true })
  min_heart_rate: number;

  @Column({ type: 'float', nullable: true })
  rem_sleep: number;

  @Column({ type: 'float', nullable: true })
  rem_sleep_percentage: number;

  @OneToMany(() => SleepHeart, sleepHeart => sleepHeart.sleepData)
  sleepHeart: SleepHeart[];  // This will allow you to access the user's sleep records
  @OneToMany(() => SleepTime, sleepTime => sleepTime.sleepData)
  sleepTimes: SleepTime[];  // This will allow you to access the user's sleep records
  @OneToOne(() => SleepReport, (sleepReport) => sleepReport.sleepData)
  report: SleepReport;
  @CreateDateColumn()
  created_date: Date;
  @CreateDateColumn()
  updated_date: Date;
}
