import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FamiliesService } from './families.service';
import { Families } from '../entities/families/families.entities';
import { UserFamilies } from '../entities/userFamilies/userFamilies.entity';
import { User } from '../entities/user/user.entities';
import { FamilyInvitation } from '../entities/familyInvitations/familyInvitations.entity';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
});

describe('FamiliesService', () => {
  let service: FamiliesService;
  let familiesRepository: Repository<Families>;
  let userFamiliesRepository: Repository<UserFamilies>;
  let userRepository: Repository<User>;
  let familyInvitationRepository: Repository<FamilyInvitation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FamiliesService,
        { provide: getRepositoryToken(Families), useValue: mockRepository() },
        { provide: getRepositoryToken(UserFamilies), useValue: mockRepository() },
        { provide: getRepositoryToken(User), useValue: mockRepository() },
        { provide: getRepositoryToken(FamilyInvitation), useValue: mockRepository() },
      ],
    }).compile();

    service = module.get<FamiliesService>(FamiliesService);
    familiesRepository = module.get<Repository<Families>>(getRepositoryToken(Families));
    userFamiliesRepository = module.get<Repository<UserFamilies>>(getRepositoryToken(UserFamilies));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    familyInvitationRepository = module.get<Repository<FamilyInvitation>>(getRepositoryToken(FamilyInvitation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFamilyInfoByUserId', () => {
    it('should return family info when user is associated with a family', async () => {
      const mockUserFamily = {
        family: { id: '1', name: 'Family 1' },
        role: 'member',
      };

      jest.spyOn(userFamiliesRepository, 'findOne').mockResolvedValue(mockUserFamily as any);

      const result = await service.getFamilyInfoByUserId(1);
      expect(result).toEqual({ id: '1', name: 'Family 1', userRole: 'member' });
    });

    it('should throw NotFoundException if user is not associated with a family', async () => {
      jest.spyOn(userFamiliesRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getFamilyInfoByUserId(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createFamily', () => {
    it('should create a new family and associate user as admin', async () => {
      const mockUser = { id: 1 };
      const mockFamily = { id: '1', name: 'Family 1' };
      const mockUserFamily = { user: mockUser, family: mockFamily, role: 'admin' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(familiesRepository, 'create').mockReturnValue(mockFamily as any);
      jest.spyOn(familiesRepository, 'save').mockResolvedValue(mockFamily as any);
      jest.spyOn(userFamiliesRepository, 'create').mockReturnValue(mockUserFamily as any);
      jest.spyOn(userFamiliesRepository, 'save').mockResolvedValue(mockUserFamily as any);

      const result = await service.createFamily(1, 'Family 1');
      expect(result).toEqual(mockFamily);
      expect(familiesRepository.create).toHaveBeenCalledWith({ name: 'Family 1' });
      expect(userFamiliesRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        family: mockFamily,
        role: 'admin',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createFamily(1, 'Family 1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendInvitation', () => {
    it('should create a new invitation if receiver is found and not a member of any family', async () => {
      const mockSender = { id: 1 };
      const mockReceiver = { id: 2, userFamily: null };
      const mockFamily = { id: '1', name: 'Family 1' };
      const mockInvitation = { id: 'inv1', status: 'pending' };

      jest.spyOn(userRepository, 'findOne').mockImplementation((options: any) => {
        if (options.where.id === 1) return Promise.resolve(mockSender as any);
        if (options.where.email === 'receiver@example.com') return Promise.resolve(mockReceiver as any);
        return null;
      });

      jest.spyOn(familiesRepository, 'findOne').mockResolvedValue(mockFamily as any);
      jest.spyOn(familyInvitationRepository, 'create').mockReturnValue(mockInvitation as any);
      jest.spyOn(familyInvitationRepository, 'save').mockResolvedValue(mockInvitation as any);

      const result = await service.sendInvitation(1, { receiverEmailOrPhone: 'receiver@example.com', familyId: '1' });
      expect(result).toEqual(mockInvitation);
    });

    it('should throw NotFoundException if sender not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.sendInvitation(1, { receiverEmailOrPhone: 'receiver@example.com', familyId: '1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
