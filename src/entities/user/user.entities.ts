import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', unique: true, nullable: false })
    email: string;
  
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
}
