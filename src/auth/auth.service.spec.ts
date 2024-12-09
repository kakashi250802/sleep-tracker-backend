import { AuthService } from './auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../entities/user/user.entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        { provide: ConfigService, useValue: {} },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid email and password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        phone_number: '123456789',
        password: await bcrypt.hash('Password123!', 10),
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mocked-jwt-token');

      const result = await authService.login('test@example.com', 'Password123!');

      expect(result).toEqual({
        message: 'User login Successfull',
        statusCode: 200,
        access_token: 'mocked-jwt-token',
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        authService.login('test@example.com', 'Password123!')
      ).rejects.toThrow(UnauthorizedException);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = {
        email: 'test@example.com',
        phone_number: '123456789',
        password: await bcrypt.hash('Password123!', 10),
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        authService.login('test@example.com', 'WrongPassword!')
      ).rejects.toThrow(UnauthorizedException);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        email: 'test@example.com',
        phone_number: '123456789',
        password: await bcrypt.hash('Password123!', 10),
        birth_date: new Date('2000-01-01'),
        weight: 70,
        height: 170,
        full_name: 'Test User',
        gender: 'male',
      };
      mockUserRepository.findOne.mockResolvedValue(null); // No conflict
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await authService.register(
        'test@example.com',
        'Test User',
        '123456789',
        'Password123!',
        new Date('2000-01-01'),
        70,
        170,
        'male',
      );

      expect(result).toEqual({
        message: 'Đăng ký thành công!',
        statusCode: 200,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2); // Check for email and phone conflicts
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException for invalid email format', async () => {
      await expect(
        authService.register(
          'invalid-email',
          'Test User',
          '123456789',
          'Password123!',
          new Date('2000-01-01'),
          70,
          170,
          'male',
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid phone number', async () => {
      await expect(
        authService.register(
          'test@example.com',
          'Test User',
          'invalid-phone',
          'Password123!',
          new Date('2000-01-01'),
          70,
          170,
          'male',
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid password format', async () => {
      await expect(
        authService.register(
          'test@example.com',
          'Test User',
          '123456789',
          '123',
          new Date('2000-01-01'),
          70,
          170,
          'male',
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if email is already used', async () => {
      mockUserRepository.findOne.mockResolvedValue({ email: 'test@example.com' });

      await expect(
        authService.register(
          'test@example.com',
          'Test User',
          '123456789',
          'Password123!',
          new Date('2000-01-01'),
          70,
          170,
          'male',
        )
      ).rejects.toThrow(BadRequestException);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if phone number is already used', async () => {
      mockUserRepository.findOne.mockResolvedValue({ phone_number: '123456789' });

      await expect(
        authService.register(
          'test@example.com',
          'Test User',
          '123456789',
          'Password123!',
          new Date('2000-01-01'),
          70,
          170,
          'male',
        )
      ).rejects.toThrow(BadRequestException);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });
});
