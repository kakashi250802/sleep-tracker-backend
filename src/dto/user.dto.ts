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
    @MinLength(8, { message: 'New password must be at least 8 characters' })
    @MaxLength(20, { message: 'New password must not exceed 20 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/, {
      message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    newPassword: string;
  
    @IsString()
    confirmPassword: string;

   
}
