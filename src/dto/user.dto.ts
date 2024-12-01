import { IsString, IsOptional, IsDate, IsPhoneNumber, IsInt, IsPositive, MinLength, MaxLength, Matches, ValidateIf, Min, Max, IsIn } from 'class-validator';
import { SleepData } from '../entities/sleepData/sleepData.entities';
import { OneToMany } from 'typeorm';
import { Transform } from 'class-transformer';
export class UserUpdateDto {
    @IsString()
    email: string;
  
    @Transform(({ value }) => value.trim()) // Tự động trim chuỗi
    @IsString({ message: 'Tên đầy đủ phải là chuỗi' })
    full_name: string;
  
    @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ (phải thuộc mã vùng VN)' })
    phone_number: string;
  
    @Transform(({ value }) => new Date(value)) // Chuyển chuỗi thành đối tượng Date
    @IsDate({ message: 'Ngày sinh phải đúng định dạng YYYY-MM-DD' })
    @ValidateIf(({ birth_date }: { birth_date: Date }) => new Date(birth_date) < new Date(), { 
      message: 'Ngày sinh phải nhỏ hơn ngày hiện tại'
    })
    birth_date: Date;
  
    @IsInt({ message: 'Cân nặng phải là số nguyên' })
    @IsPositive({ message: 'Cân nặng phải lớn hơn 0' })
    @Min(30, { message: 'Cân nặng phải ít nhất là 30kg' })
    @Max(300, { message: 'Cân nặng tối đa là 300kg' })
    weight: number;
  
    @IsInt({ message: 'Chiều cao phải là số nguyên' })
    @IsPositive({ message: 'Chiều cao phải lớn hơn 0' })
    @Min(100, { message: 'Chiều cao phải ít nhất là 100cm' })
    @Max(300, { message: 'Chiều cao tối đa là 300cm' })
    height: number;
  
    @Transform(({ value }) => value.trim().toLowerCase()) // Tự động trim và chuyển về chữ thường
    @IsString({ message: 'Giới tính phải là chuỗi' })
    @IsIn(['male', 'female', 'other'], { message: 'Giới tính chỉ được là male, female hoặc other' })
    gender: string;
  
    @IsOptional()
    @IsString()
    address?: string;
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
