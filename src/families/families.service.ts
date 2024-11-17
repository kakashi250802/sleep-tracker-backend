import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { CreateInvitationDto } from '../dto/families.dto';
import { Families } from '../entities/families/families.entities';
import { FamilyInvitation } from '../entities/familyInvitations/familyInvitations.entity';
import { User } from '../entities/user/user.entities';
import { UserFamilies } from '../entities/userFamilies/userFamilies.entity';
import { In, Repository } from 'typeorm';

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
    ) {}

    async getFamilyInfoByUserId(userId: number) {
        const userFamily = await this.userFamiliesRepository.findOne({
          where: {user: {id: userId}  },
          relations: ['family'],
        });
        if (!userFamily) {
          throw new NotFoundException('User is not associated with any family.');
        }
        const response ={...userFamily.family, userRole: userFamily?.role }
        return response; // Trả về thông tin gia đình
      }
    async getOrganizationInvitations(familyId: string) {
    // Tìm danh sách lời mời dựa trên familyId
    const invitations = await this.familyInvitationRepository.find({
        where: { family: { id: familyId } },
        relations: ['sender', 'receiver', 'family'],
    });
    
    // Trả về danh sách lời mời cùng thông tin chi tiết
    return invitations.map(invitation => ({
        invitationId: invitation.id,
        senderName: invitation.sender.full_name,
        senderId: invitation.sender.id,
        receiverName: invitation.receiver.full_name,
        receiverId: invitation.receiver.id,
        familyId: invitation.family.id,
        familyName: invitation.family.name,
        status: invitation.status,
        createdDate: invitation.created_date,
    }));
    }

    async getUserInvitations(userId: number) {
        // Tìm danh sách lời mời nhận được của người dùng
        const invitations = await this.familyInvitationRepository.find({
          where: { receiver: { id: userId ,},
          status: In(['pending', 'rejected']), // Chỉ lấy các lời mời có trạng thái 'pending' hoặc 'rejected'
         },
          relations: ['sender', 'family'],
        });

      
        // Trả về danh sách lời mời cùng thông tin chi tiết
        return invitations.map(invitation => ({
          invitationId: invitation.id,
          senderName: invitation.sender.full_name,
          senderId: invitation.sender.id,
          familyId: invitation.family.id,
          familyName: invitation.family.name,
          status: invitation.status,
          createdDate: invitation.created_date,
        }));
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
            where: { id: invitationId, status: 'pending' },
            relations: ['receiver', 'family'],
        });
        if (!invitation) throw new NotFoundException('Invitation not found');
    
        invitation.status = 'accepted';
        await this.familyInvitationRepository.save(invitation);
    
        // Thêm người dùng vào gia đình
        await this.addMemberToFamily(invitation.receiver.id, invitation.family.id, 'member');
    
        // Xóa các lời mời khác tới người dùng này cho cùng gia đình
        await this.familyInvitationRepository.delete({
            receiver: { id: invitation.receiver.id },
            family: { id: invitation.family.id },
            status: 'pending',
        });
    
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
    async getMembers(userId: number, familyId: string) {
        console.log(userId, familyId);
        const family = await this.familiesRepository.findOne({
            where: { id: familyId },
            relations: ['members','members.user'],
          });
        console.log(family);
        if (!family) {
            throw new NotFoundException('Family not found');
        }
        console.log(family.members);
        const member = family.members.find(member => member.user?.id === userId);
        console.log(member);
        if (!member) {
            throw new ForbiddenException('User is not a member of the family');
        }
        
        // Trả về thông tin gia đình cùng các thành viên và thông tin người dùng
        return {
            familyId: family.id,
            familyName: family.name,
            yourRole: member?.role,
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
    
    async leaveFamily(userId: number, familyId: string): Promise<any> {
        // Kiểm tra xem gia đình có tồn tại không

        if (!isUUID(familyId)) {
            throw new NotFoundException('Family not found');
        }
        const family = await this.familiesRepository.findOne({
          where: { id: familyId },
        });


        if (!family) {
          throw new NotFoundException('Family not found');
        }
      
        // Kiểm tra người dùng có phải là admin không
        const userFamily = await this.userFamiliesRepository.findOne({
          where: { user: { id: userId }, family: { id: familyId } },
          relations: ['user', 'family'],
        });
      
        if (!userFamily) {
          throw new NotFoundException('User is not a member of this family');
        }
      
        // Nếu người dùng là admin, không cho phép rời gia đình
        if (userFamily.role === 'admin') {
          throw new BadRequestException('Admin cannot leave the family');
        }
      
        // Xóa người dùng khỏi gia đình
        await this.userFamiliesRepository.remove(userFamily);
      
        return { message: 'Successfully left the family' };
      }

  // Xóa thành viên khỏi gia đình (Chỉ Admin có quyền)
  async removeMember(adminId: number, familyId: string, userId: number): Promise<any> {
    const family = await this.familiesRepository.findOne({
      where: { id: familyId },
      relations: ['members','members.user'],
    });

    if (!family) {
      throw new NotFoundException('Family not found');
    }
    if (Array.isArray(family.members)) {
        const isAdmin = family.members.some(
          (member) => member.user && member.user.id === adminId && member.role === 'admin',
        );
        // Tiến hành xử lý tiếp nếu isAdmin là true
        if (isAdmin) {
            const userFamily = await this.userFamiliesRepository.findOne({
                where: { user: { id: userId }, family: { id: familyId } },
              });
          
              if (!userFamily) {
                throw new NotFoundException('User is not a member of this family');
              }
          
              await this.userFamiliesRepository.remove(userFamily);
        } else {
            throw new ForbiddenException('Only admin can remove members');

        }
      } else {
        throw new BadRequestException('Invalid members data');
      }

    // Kiểm tra xem có phải là thành viên của gia đình và có quyền admin không

    return { message: 'Member removed successfully' };
  }

  // Xóa gia đình (Chỉ Admin có quyền)
  async deleteFamily(adminId: number, familyId: string): Promise<any> {
    const family = await this.familiesRepository.findOne({
      where: { id: familyId },
      relations: ['members','members.user'],
    });

    if (!family) {
      throw new NotFoundException('Family not found');
    }

    // Kiểm tra quyền admin
    const isAdmin = family.members.some(
      (member) => member.user.id === adminId && member.role === 'admin',
    );

    if (!isAdmin) {
      throw new ForbiddenException('Only admin can delete the family');
    }

    await this.familiesRepository.remove(family);

    return { message: 'Family deleted successfully' };
  }
    
}
