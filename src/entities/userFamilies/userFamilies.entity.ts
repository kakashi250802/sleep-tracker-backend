import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, CreateDateColumn } from 'typeorm';

import { Families } from '../families/families.entities';
import { User } from '../user/user.entities';

@Entity('user_families')
export class UserFamilies {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Quan hệ 1-1 với User, một người dùng chỉ có thể tham gia một gia đình
  @OneToOne(() => User, user => user.userFamily, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Quan hệ nhiều-nhiều với Families, một gia đình có thể có nhiều thành viên
  @ManyToOne(() => Families, family => family.members, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'family_id' })
  family: Families;

  // Phân biệt vai trò của người dùng trong gia đình
  @Column({
    type: 'enum',
    enum: ['admin', 'member'],
    default: 'member',  // Mặc định là 'member'
  })
  role: 'admin' | 'member';  // Phân biệt vai trò người dùng trong gia đình
  // Trường ngày tham gia, tự động gán giá trị ngày hiện tại khi tạo bản ghi
  @CreateDateColumn()
  created_date: Date;
  @CreateDateColumn()
  updated_date: Date;
}