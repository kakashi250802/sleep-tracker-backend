// families.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { UserFamilies } from '../userFamilies/userFamilies.entity';
import { FamilyInvitation } from '../familyInvitations/familyInvitations.entity';

@Entity('families')
export class Families {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => UserFamilies, userFamily => userFamily.family)
  members: UserFamilies[];
  // Lời mời liên quan đến gia đình
  @OneToMany(() => FamilyInvitation, invitation => invitation.family)
  invitations: FamilyInvitation[];
    
  @CreateDateColumn()
  created_date: Date;
  @CreateDateColumn()
  updated_date: Date;
  
}
