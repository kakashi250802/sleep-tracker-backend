import { Injectable, ConflictException, InternalServerErrorException, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user/user.entities';
import { ConfigService } from '@nestjs/config';
import { emailRegex, passwordRegex, phoneRegex } from '../utils';
import { UserChangePasswordDto, UserUpdateDto } from '../dto/user.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    getJwtSecret(): string {
        return this.configService.get<string>('JWT_SECRET');
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(emailOrPhone: string, password: string) {
        // Kiểm tra xem tài khoản có tồn tại bằng email hoặc phone_number
        const user = await this.userRepository.findOne({
            where: [
                { email: emailOrPhone }, // Kiểm tra email
                { phone_number: emailOrPhone }, // Kiểm tra phone_number
            ],
        });

        // Nếu không tìm thấy tài khoản, trả về lỗi Unauthorized
        if (!user) {
            throw new UnauthorizedException('Sai tài thông tin đăng nhập vui lòng kiển tra lại!');
        }

        // So sánh mật khẩu đã nhập với mật khẩu trong cơ sở dữ liệu
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // Nếu mật khẩu không đúng, trả về lỗi Unauthorized
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email/phone number or password');
        }

        // Nếu mọi thứ đều đúng, tạo payload và trả về token
        const payload = { username: user.email, sub: user.id };
        return {
            message: "User login Successfull",
            statusCode: 200,
            access_token: this.jwtService.sign(payload),
        };
    }

    // Hàm lấy thông tin người dùng theo userId
    async getUserById(userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return user;
    }

    // Chỉnh sửa hàm register để nhận các trường thông tin từ người dùng
    async register(
        email: string,
        full_name:string,
        phone_number: string,
        password: string,
        birth_date: Date,
        weight: number,
        height: number,
        gender: string,
        address?: string, // Address là trường không bắt buộc
    ) {
        // Kiểm tra xem email đã tồn tại trong hệ thống chưa
        const existingUser = await this.userRepository.findOne({ where: { email } });
        const existingPhoneNumber = await this.userRepository.findOne({ where: { phone_number } });
        if (existingPhoneNumber) {
            throw new BadRequestException('Số điện thoại đã tồn tại');
        }
        if (existingUser) {
            throw new BadRequestException('Email đã được sử dụng');
        }

        const validatedPassword = passwordRegex.test(password);
        const validatedPhone = phoneRegex.test(phone_number);
        const validatedEmail = emailRegex.test(email);
        if (!validatedEmail) {
            throw new BadRequestException('Email sai định dạng!');
        }
        if (!validatedPhone) {
            throw new BadRequestException('Số điện thoại sai định dạng!');
        }
        if (!validatedPassword) {
            throw new BadRequestException('Mật khẩu sai định dạng, phải từ 8 -25 ký tự có ít nhất 1 chữ hoa 1 chữ thường 1 ký tự đặc biệt và 1 chữ số!');
        }

        // Kiểm tra điều kiện birth_date nhỏ hơn ngày hiện tại
        if (new Date(birth_date) >= new Date()) {
            throw new BadRequestException('Ngày sinh phải nhỏ hơn hoặc bằng ngày hiện tại');
        }

        // Kiểm tra weight và height phải lớn hơn 0
        if (weight <= 30 || weight>=300) {
            throw new BadRequestException('Cân nặng không hợp lệ. Cân nặng phải từ 30kg-300kg');
        }
        if (height <= 100 || height >=250) {
            throw new BadRequestException('Chiều cao không hợp lê. Chiều cao phải từ 100cm -250cm');
        }
        // Kiểm tra giới tính hợp lệ
        const validGenders = ['male', 'female', 'other'];
        if (!validGenders.includes(gender.toLowerCase())) {
            throw new BadRequestException('Giới tính không hợp lệ. Yêu cầu: male, female, hoặc other');
        }
        // Mã hóa mật khẩu trước khi lưu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo đối tượng User mới
        const newUser = this.userRepository.create({
            email,
            phone_number,
            password: hashedPassword,
            birth_date,
            weight,
            height,
            full_name,
            gender,
            address,
            created_at: new Date(), // Gán thời gian hiện tại cho trường created_at
        });

        // Lưu User vào cơ sở dữ liệu
        try {
            await this.userRepository.save(newUser);
            // Trả về thông báo đăng ký thành công
            return {
                message: 'Đăng ký thành công!',
                statusCode: 200,
            };
        } catch (error) {
            throw new InternalServerErrorException('Có lỗi khi đăng ký!');
        }
    }
    async updateUser(id: number, updateUserDto: UserUpdateDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        console.log(user);
        if (!user) {
          throw new NotFoundException('Người dùng không tồn tại');
        }
    
        // Check for email conflict
        if (updateUserDto.email) {
          const existingEmail = await this.userRepository.findOne({ where: { email: updateUserDto.email } });
          if (existingEmail && existingEmail.id !== id) {
            throw new BadRequestException('Email đã tồn tại');
          }
        }
    
        // Check for phone number conflict
        if (updateUserDto.phone_number) {
          const existingPhoneNumber = await this.userRepository.findOne({ where: { phone_number: updateUserDto.phone_number } });
          if (existingPhoneNumber && existingPhoneNumber.id !== id) {
            throw new BadRequestException('Số điện thoại đã tồn tại');
          }
        }
    
        const newUserUpdate = {...user,updateUserDto,birth_date: new Date(updateUserDto.birth_date)}

        return this.userRepository.save(newUserUpdate);
      }
        // Change Password Method
  async changePassword(userId: number, changePasswordDto: UserChangePasswordDto): Promise<{ message: string }> {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      throw new UnauthorizedException('Mật khẩu mới và xác nhận mật khẩu không giống nhau!');
    }

    // Find user by ID
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng!');
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    return { message: 'Cập nhật mật khẩu thành công!' };
}
}
