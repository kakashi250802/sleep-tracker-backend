import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../entities/user/user.services';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService, // To verify the user from DB if needed
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET, // Use the secret stored in environment variables
    });
  }

  async validate(payload: any) {
    // Attach user info to the request object, can also fetch full user data if needed
    return { id: payload.sub };
  }
}
