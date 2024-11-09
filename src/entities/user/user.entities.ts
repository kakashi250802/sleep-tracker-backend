// src/entities/user/user.entities.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'timestamp' })
  created_at: Date;
  
  @Column({ type: 'date' })
  birth_date: Date;
  
  @Column('float')
  weight: number;
  
  @Column('float')
  height: number;
  
  @Column()
  gender: string;
}
