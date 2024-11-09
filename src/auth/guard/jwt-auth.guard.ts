// src/auth/guard/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportJwtAuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends PassportJwtAuthGuard('jwt') {}
