import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, IsNull } from 'typeorm';
import { SleepData } from '../sleepData/sleepData.entities';
import { SleepQuality } from '../../dto/sleepReport.dto';
import { User } from '../user/user.entities';

@Entity('sleep_reports')
export class SleepReport {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.sleepReports, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => SleepData, (sleepData) => sleepData.report, { eager: true })
  @JoinColumn({ name: 'Sleep_id' })
  sleepData: SleepData; // This links to the actual SleepData entity

  @Column({ type: 'date' })
  report_date: string;

  @Column({
    type: 'enum',
    enum: SleepQuality, // Use the enum here
    default: SleepQuality.FAIR, // Set a default value if needed
  })
  sleep_quality: SleepQuality;

  @Column({ type: 'float' })
  score: number;
  @Column({ type: 'varchar', nullable: true })
  advice?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

