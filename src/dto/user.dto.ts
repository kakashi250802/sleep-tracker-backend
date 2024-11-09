import { IsString, IsOptional, IsDate, IsPhoneNumber, IsInt, IsPositive, MinLength, MaxLength } from 'class-validator';

export class UserUpdateDto {
    @IsOptional() // Nếu không thay đổi thì không cần phải có trong request
    @IsString()
    email: string;
  
    @IsOptional()
    @IsPhoneNumber('VN')
    phone_number: string;
  
    @IsOptional()
    @IsDate()
    birth_date: Date;
  
    @IsOptional()
    @IsInt()
    @IsPositive()
    weight: number;
  
    @IsOptional()
    @IsInt()
    @IsPositive()
    height: number;
  
    @IsOptional()
    @IsString()
    gender: string;
  
    @IsOptional()
    @IsString()
    address: string;
  }

export class UserChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  oldPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  newPassword: string;
}
