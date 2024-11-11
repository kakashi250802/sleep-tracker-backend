import { Body, Controller, Param, Post, Put, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserChangePasswordDto, UserUpdateDto } from 'src/dto/user.dto';
import { UserId } from './decorator/user.decorator';
import { User } from 'src/entities/user/user.entities';
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
      const { email, phone_number, password, birth_date, weight, height, gender, address } = body;
      return this.authService.register(email, phone_number, password, birth_date, weight, height, gender, address);
    }
  // Endpoint to update user information (requires JWT token)
  @Put('update/:id')
  @UseGuards(AuthGuard) // Protect this route
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UserUpdateDto,
    @UserId() userId: number, // Get userId from the token
  ): Promise<User> {
    if (id !== userId) {
      throw new UnauthorizedException('You can only update your own profile');
    }
    return this.authService.updateUser(id, updateUserDto);
  }
  @Post('change-password')
  @UseGuards(AuthGuard) // Protect the endpoint with JWT guard
  async changePassword(
    @Body() changePasswordDto: UserChangePasswordDto,
    @Param('userId') userId: number, // Get user ID from the token or pass as a param
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
