import { Body, Controller, Get, Param, Post, Put, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UpdateSleepScheduleDto, UserChangePasswordDto, UserUpdateDto } from '../dto/user.dto';
import { UserId } from './decorator/user.decorator';
import { User } from '../entities/user/user.entities';
import { AuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post('login')
    async login(@Body() loginDto: { emailOrPhone: string, password: string }) {
      return await this.authService.login(loginDto.emailOrPhone, loginDto.password);
    }
    @Post('register')
    async register(@Body() body: any) {
      const { email,    full_name, phone_number, password, birth_date, weight, height, gender, address } = body;
      return this.authService.register(email,full_name, phone_number, password, birth_date, weight, height, gender, address);
    }
  // Endpoint to update user information (requires JWT token)
  @Post('update-user-info')
  @UseGuards(AuthGuard) // Protect this route
  async updateUser(
    @Body() updateUserDto: UserUpdateDto,
    @Request() req,
  ): Promise<User> {
    const userId = req.user.sub;
    console.log(updateUserDto);
    console.log('updateUserDto');
    console.log(userId);
    if (!userId) {
      throw new UnauthorizedException('Bạn chỉ có quyền cập nhật hồ sơ cá nhân của mình!');
    }
    return this.authService.updateUser(userId, updateUserDto);
  }
  @Post('change-password')
  @UseGuards(AuthGuard) // Protect the endpoint with JWT guard
  
  async changePassword(
      @Body() changePasswordDto: UserChangePasswordDto,
      @Request() req,
  ) {
    const userId = req.user.sub;
    if (!userId) {
        throw new UnauthorizedException('You can only update your own user');
      }
    return this.authService.changePassword(userId, changePasswordDto);
  }
  @Get('information')
  @UseGuards(AuthGuard) // Protect the endpoint with JWT guard
  
  async getInformation(
      @Request() req,
  ) {
    const userId = req.user.sub;
    if (!userId) {
        throw new UnauthorizedException('You can only update your own user');
      }
    return this.authService.getUserById(userId);
  }
  @Post('sleep-schedule')
  @UseGuards(AuthGuard) // Protect the endpoint with JWT guard
  async updateSleepSchedule(
    @Body() updateData: UpdateSleepScheduleDto,
    @Request() req,
  ) {
    const userId = req.user.sub;
    if (!userId) {
        throw new UnauthorizedException('You can only update your own user');
      }
    return this.authService.updateSleepSchedule(
      userId,
      new Date(updateData.sleepTime),
      new Date(updateData.wakeUpTime),
    );
  }

}
