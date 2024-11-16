import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../entities/user/user.entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ConflictException, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';

const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

const mockConfigService = {
    get: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn(),
};

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getRepositoryToken(User), useValue: mockUserRepository },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should throw a ConflictException if email already exists', async () => {
            mockUserRepository.findOne.mockResolvedValueOnce({ email: 'test@example.com' });
            await expect(
                service.register(
                    'test@example.com',
                    'John Doe',
                    '0123456789',
                    'password123',
                    new Date('1990-01-01'),
                    70,
                    175,
                    'male'
                ),
            ).rejects.toThrow(ConflictException);
        });

        it('should throw a BadRequestException if password format is invalid', async () => {
            mockUserRepository.findOne.mockResolvedValueOnce(null);
            await expect(
                service.register(
                    'new@example.com',
                    'John Doe',
                    '0123456789',
                    'short',
                    new Date('1990-01-01'),
                    70,
                    175,
                    'male'
                ),
            ).rejects.toThrow(BadRequestException);
        });

        it('should create and save a user if all checks pass', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            mockUserRepository.create.mockImplementation(dto => dto);
            mockUserRepository.save.mockResolvedValue({ id: 1, email: 'new@example.com' });

            const result = await service.register(
                'new@example.com',
                'John Doe',
                '0123456789',
                'ValidPassword123!',
                new Date('1990-01-01'),
                70,
                175,
                'male'
            );

            expect(result).toEqual({ message: 'User registered successfully', statusCode: 200 });
            expect(mockUserRepository.save).toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('should throw an UnauthorizedException if user does not exist', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(service.login('nonexistent@example.com', 'password')).rejects.toThrow(UnauthorizedException);
        });

        it('should throw an UnauthorizedException if password is invalid', async () => {
            mockUserRepository.findOne.mockResolvedValue({ email: 'test@example.com', password: 'hashedpassword' });
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

            await expect(service.login('test@example.com', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
        });

        it('should return a token if login is successful', async () => {
            mockUserRepository.findOne.mockResolvedValue({ email: 'test@example.com', id: 1, password: 'hashedpassword' });
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('testtoken');

            const result = await service.login('test@example.com', 'password');
            expect(result).toEqual({
                message: 'User login Successfull',
                statusCode: 200,
                access_token: 'testtoken',
            });
        });
    });
    
});
