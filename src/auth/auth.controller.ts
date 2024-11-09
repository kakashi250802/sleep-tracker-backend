import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

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

}
