import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateInvitationDto } from 'src/dto/families.dto';
import { Families } from 'src/entities/families/families.entities';
import { FamilyInvitation } from 'src/entities/familyInvitations/familyInvitations.entity';
import { User } from 'src/entities/user/user.entities';
import { UserFamilies } from 'src/entities/userFamilies/userFamilies.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FamiliesService {
    constructor(
        @InjectRepository(Families)
        private familiesRepository: Repository<Families>,
    
        @InjectRepository(UserFamilies)
        private userFamiliesRepository: Repository<UserFamilies>,
    
        @InjectRepository(User)
        private userRepository: Repository<User>,
    
        @InjectRepository(FamilyInvitation)
        private familyInvitationRepository: Repository<FamilyInvitation>,
    ) {

    }
     // 1. Tạo gia đình mới
    async createFamily(userId: number, familyName: string): Promise<Families> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
          });
        if (!user) throw new NotFoundException('User not found');

        const family = this.familiesRepository.create({
        name: familyName,
        });

        await this.familiesRepository.save(family);

        // Tạo một bản ghi UserFamilies cho người dùng với vai trò 'admin'
        const userFamily = this.userFamiliesRepository.create({
        user,
        family,
        role: 'admin',
        });

        await this.userFamiliesRepository.save(userFamily);
        return family;
    }

    // 2. Thêm thành viên vào gia đình
    async addMemberToFamily(userId: number, familyId: string, role: 'admin' | 'member'): Promise<UserFamilies> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
          });
        const family = await this.familiesRepository.findOne({ where: { id: familyId },});
        if (!user || !family) throw new NotFoundException('User or Family not found');

        // Kiểm tra xem người dùng đã là thành viên của gia đình chưa
        const existingMember = await this.userFamiliesRepository.findOne({
        where: { user: user, family: family },
        });

        if (existingMember) throw new BadRequestException('User is already a member of this family');

        const userFamily = this.userFamiliesRepository.create({
        user,
        family,
        role,
        });

        await this.userFamiliesRepository.save(userFamily);
        return userFamily;
    }

    // Gửi lời mời tham gia gia đình
  async sendInvitation(senderId ,createInvitationDto: CreateInvitationDto) {
    console.log(createInvitationDto);
    const {  receiverEmailOrPhone, familyId } = createInvitationDto;

    // Tìm người gửi lời mời
    const sender = await this.userRepository.findOne({where: { id: senderId },});
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    // Tìm người nhận lời mời
    let receiver: User | undefined;
    if (receiverEmailOrPhone.includes('@')) {
      receiver = await this.userRepository.findOne({
        where: { email: receiverEmailOrPhone },
      });
    } else {
      receiver = await this.userRepository.findOne({
        where: { phone_number: receiverEmailOrPhone },
      });
    }

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    // Kiểm tra xem người nhận đã tham gia gia đình nào chưa
    const existingUserFamily = await this.userRepository.findOne({
      where: { id: receiver.id },
      relations: ['userFamily'],
    });

    if (existingUserFamily && existingUserFamily.userFamily) {
      throw new BadRequestException('Receiver is already a member of a family');
    }

    // Tìm gia đình
    const family = await this.familiesRepository.findOne({where: { id: familyId                                                                                                                               },});
    if (!family) {
      throw new NotFoundException('Family not found');
    }

      // Kiểm tra xem người nhận đã được mời tham gia gia đình này chưa
    const existingInvitation = await this.familyInvitationRepository.findOne({
        where: { receiver: {id: receiver.id}, family: { id: familyId }, status: 'pending' },
    });

    console.log(existingInvitation);

    if (existingInvitation) {
        throw new BadRequestException('Receiver has already been invited to this family');
    }

    // Tạo lời mời
    const invitation = this.familyInvitationRepository.create({
      sender,
      receiver,
      family,
      status: 'pending',
    });

    await this.familyInvitationRepository.save(invitation);

    return invitation;
  }

    // 3. Xác nhận lời mời gia đình
    async acceptInvitation(invitationId: string) {
        const invitation = await this.familyInvitationRepository.findOne({
            where: { id: invitationId , status :'pending' },
            relations: ['receiver', 'family'],
          });
        if (!invitation) throw new NotFoundException('Invitation not found');

        invitation.status = 'accepted';
        await this.familyInvitationRepository.save(invitation);

        // Thêm người dùng vào gia đình
        await this.addMemberToFamily(invitation.receiver.id, invitation.family.id, 'member');

        return { message: 'Invitation accepted and receiver added to the family' };
    }

    // 4. Từ chối lời mời gia đình
    async rejectInvitation(invitationId: string) {
        const invitation = await this.familyInvitationRepository.findOne({where: { id: invitationId , status :'pending' },});
        if (!invitation) throw new NotFoundException('Invitation not found');

        invitation.status = 'rejected';
        await this.familyInvitationRepository.save(invitation);
        return { message: 'Invitation rejected!' };

    }

    // 5. Xoá lời mời gia đình
    async deleteInvitation(invitationId: string) {
        const invitation = await this.familyInvitationRepository.findOne({where: { id: invitationId },});
        if (!invitation) throw new NotFoundException('Invitation not found');

        await this.familyInvitationRepository.remove(invitation);

    }

    // 6. Xem danh sách thành viên trong gia đình
    async getMembers(userId: number,familyId: string) {
        

        
          // Kiểm tra xem người dùng có phải là thành viên của gia đình hay không


        const family = await this.familiesRepository.findOne({
            where: { id: familyId },
            relations: ['members', 'members.user'], // Lấy thông tin user của các thành viên
          });
          const isMember = family.members.some(member => member.user.id === userId);
        
          if (!isMember) {
            throw new ForbiddenException('User is not a member of the family');
          }
          if (!family) {
            throw new NotFoundException('Family not found');
          }
          
          // Trả về thông tin gia đình cùng các thành viên và thông tin người dùng
          return {
            familyId: family.id,
            familyName: family.name,
            members: family.members.map(member => ({
              userId: member.user.id,
              fullName: member?.user?.full_name,
              email: member.user.email,
              role: member.role,
              createdDate: member.created_date,
              updatedDate: member.updated_date
            }))
          };
    }
}
