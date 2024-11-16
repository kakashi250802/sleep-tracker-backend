export class CreateFamilyDto {
    name: string;
  }

export class AddMemberDto {
  userId: number;
  userEmailOrPhone: string;  // Có thể là email hoặc số điện thoại
}

export class InvitationDto {
    userId: number;
    invitationId: string;  // ID của lời mời để xác nhận hoặc từ chối
}

export class CreateInvitationDto {
    receiverEmailOrPhone: string;  // Email hoặc số điện thoại người nhận
    familyId: string;  // ID của gia đình
  }