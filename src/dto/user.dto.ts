import { IsString, IsOptional, IsDate, IsPhoneNumber, IsInt, IsPositive, MinLength, MaxLength, Matches } from 'class-validator';
import { SleepData } from '../entities/sleepData/sleepData.entities';
import { OneToMany } from 'typeorm';

export class UserUpdateDto {
    @IsOptional() // Nếu không thay đổi thì không cần phải có trong request
    @IsString()
    email: string;

    @IsOptional() // Nếu không thay đổi thì không cần phải có trong request
    @IsString()
    full_name:string;
  
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
    oldPassword: string;
  
    @IsString()
    @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
    @MaxLength(25, { message: 'Mật khẩu mới không được hơn 25 ký tự' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/, {
      message: 'Mật khẩu mới có ít nhất 1 chữ hoa, 1 chữ thường 1 số và 1 ký tự đặc biệt!',
    })
    newPassword: string;
  
    @IsString()
    confirmPassword: string;

   
}
