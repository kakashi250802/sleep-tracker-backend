import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { CreateInvitationDto } from 'src/dto/families.dto';
import { Families } from 'src/entities/families/families.entities';
import { FamilyInvitation } from 'src/entities/familyInvitations/familyInvitations.entity';
import { FamiliesService } from './families.service';
import { AuthGuard } from 'src/auth/guard/jwt-auth.guard';

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
}