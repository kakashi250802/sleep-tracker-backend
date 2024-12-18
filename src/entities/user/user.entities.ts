import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { SleepData } from '../sleepData/sleepData.entities';
import { SleepReport } from '../sleepReport/sleepReport.entities';
import { FamilyInvitation } from '../familyInvitations/familyInvitations.entity';
import { UserFamilies } from '../userFamilies/userFamilies.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', unique: true, nullable: false })
    email: string;

    @Column({ type: 'varchar', nullable: false })
    full_name: string;
  
    @Column({ type: 'varchar', unique: true, nullable: false })
    phone_number: string; // Đảm bảo tính duy nhất cho số điện thoại
  
    @Column({ type: 'varchar', nullable: false })
    password: string;
  
    @Column({ type: 'timestamp', nullable: false })
    created_at: Date;
    
    @Column({ type: 'date', nullable: false })
    birth_date: Date;
    
    @Column('float', { nullable: false })
    weight: number;
    
    @Column('float', { nullable: false })
    height: number;
    
    @Column({ type: 'varchar', nullable: false })
    gender: string;
  
    @Column({ type: 'varchar', nullable: true })
    address?: string; // Trường này không bắt buộc
    @OneToMany(() => SleepData, sleepData => sleepData.user)
    sleepData: SleepData[];  // This will allow you to access the user's sleep records
    @OneToMany(() => SleepReport, (sleepReport) => sleepReport.user)
    sleepReports: SleepReport[];

    // Lời mời mà người dùng đã gửi
    @OneToMany(() => FamilyInvitation, invitation => invitation.sender)
    sentInvitations: FamilyInvitation[];

    // Lời mời mà người dùng đã nhận
    @OneToMany(() => FamilyInvitation, invitation => invitation.receiver)
    receivedInvitations: FamilyInvitation[];
    // Quan hệ 1-1 với UserFamilies, theo dõi gia đình của người dùng
    @OneToOne(() => UserFamilies, userFamily => userFamily.user)
    userFamily: UserFamilies;
    @Column({ type: 'timestamp', nullable: true })
    sleepTime: Date;
    @Column({ type: 'timestamp', nullable: true })
    wakeUpTime: Date;
    @CreateDateColumn()
    created_date: Date;
    @CreateDateColumn()
    updated_date: Date;
}
