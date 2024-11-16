import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entities';
import { Families } from '../families/families.entities';


@Entity('family_invitations')
export class FamilyInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Người mời
  @ManyToOne(() => User, user => user.sentInvitations, { nullable: false })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  // Người được mời
  @ManyToOne(() => User, user => user.receivedInvitations, { nullable: false })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  // Gia đình mà lời mời được gửi đến
  @ManyToOne(() => Families, family => family.invitations, { nullable: false })
  @JoinColumn({ name: 'family_id' })
  family: Families;

  // Trạng thái của lời mời
  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'accepted' | 'rejected';

  // Thời gian mời
  @CreateDateColumn()
  created_date: Date;
  @CreateDateColumn()
  updated_date: Date;

}
