// src/sleep/sleep.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entities';
import { SleepHeart } from '../sleepHeart/sleepHeart.entities';
import { SleepTime } from '../sleepTime/sleepTime.entities';

@Entity('sleep_data')
export class SleepData {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, user => user.sleepData, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;  // This will create the relationship to the User entity
  @Column()
  user_id: number;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column('float')
  total_time: number;

  @Column('float')
  total_rem_sleep: number;

  @Column('float')
  total_deep_sleep: number;

  @Column()
  heart_rate_below_resting: number;

  @Column({ type: 'timestamp', nullable: true })
  wake_up_time: Date;

  @Column('float')
  heart_rate_avg: number;
  @OneToMany(() => SleepHeart, sleepHeart => sleepHeart.sleepData)
  sleepHeart: SleepHeart[];  // This will allow you to access the user's sleep records
  @OneToMany(() => SleepTime, sleepTime => sleepTime.sleepData)
  sleepTimes: SleepHeart[];  // This will allow you to access the user's sleep records
}
