import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { CreateInvitationDto } from '../dto/families.dto';
import { Families } from '../entities/families/families.entities';
import { FamilyInvitation } from '../entities/familyInvitations/familyInvitations.entity';
import { FamiliesService } from './families.service';
import { AuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  // Tạo gia đình mới
  @Post('create')
  @UseGuards(AuthGuard) // Xác thực JWT
  async createFamily( @Body('familyName') familyName:string, @Request() req) {
    const userId = req.user.sub;
    return this.familiesService.createFamily(userId, familyName);
  }

    // Gửi lời mời tham gia gia đình
    @Get('info')
    @UseGuards(AuthGuard) // Xác thực JWT
    async getFamilyInfo(
     @Request() req
    ) {
        try {
            const userId = req.user.sub;
            const familyInfo = await this.familiesService.getFamilyInfoByUserId(userId);
            return { success: true, data: familyInfo };
          } catch (error) {
            if (error instanceof NotFoundException) {
              return { success: false, message: error.message };
            }
            throw error;
          }
    }
    // Gửi lời mời tham gia gia đình
    @Post('invite')
    @UseGuards(AuthGuard) // Xác thực JWT
    async sendInvitation(
        @Body('receiverEmailOrPhone') receiverEmailOrPhone: string,
        @Body('familyId') familyId: string,
     @Request() req) {
      console.log('object',req);
      const userId = req.user.sub;
      const createInvitationDto:CreateInvitationDto = {receiverEmailOrPhone, familyId}
      return this.familiesService.sendInvitation(userId, createInvitationDto);
    }
  

  // Xem tất cả thành viên trong gia đình
  @Get('members')
  @UseGuards(AuthGuard) // Xác thực JWT

  async getFamilyMembers(@Param('familyId') familyId: string, @Request() req,) {
    const userId = req.user.sub;

    const members = await this.familiesService.getMembers(userId, familyId);
    if (!members) throw new NotFoundException('Family not found or no members');
    return members;
  }

  // Xác nhận lời mời tham gia gia đình
  @Post('invitations/accept')
  @UseGuards(AuthGuard) // Xác thực JWT
  async acceptInvitation(
    @Body('invitationId') invitationId: string,
  ) {
    return this.familiesService.acceptInvitation(invitationId);
  }

  // Từ chối lời mời tham gia gia đình
  @Post('invitations/reject')
  async rejectInvitation(
    @Body('invitationId') invitationId: string,
  ) {
    return this.familiesService.rejectInvitation(invitationId);
  }

  // Xóa lời mời
  @Delete(':familyId/invitations/:invitationId')
  async deleteInvitation(
    @Param('familyId') familyId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.familiesService.deleteInvitation(invitationId);
  }
  // Rời gia đình
  @Post('leave')
  @UseGuards(AuthGuard)
  async leaveFamily(@Body('familyId') familyId: string, @Request() req) {
    const userId = req.user.sub;  // Lấy userId từ JWT
    console.log(familyId);
    return this.familiesService.leaveFamily(userId, familyId);
  }

  // Xóa thành viên khỏi gia đình (Chỉ admin)
  @Post('members/remove')
  @UseGuards(AuthGuard)
  async removeMember(
    @Body('familyId') familyId: string,
    @Body('userId') userId: number,
    @Request() req,
  ) {
    const adminId = req.user.sub;  // Lấy adminId từ JWT
    return this.familiesService.removeMember(adminId, familyId, userId);
  }

  // Xóa gia đình (Chỉ admin)
  @Post('delete')
  @UseGuards(AuthGuard)
  async deleteFamily(@Body('familyId') familyId: string, @Request() req) {
    const adminId = req.user.sub;  // Lấy adminId từ JWT
    return this.familiesService.deleteFamily(adminId, familyId);
  }
}