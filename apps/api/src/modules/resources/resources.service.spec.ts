import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesService } from './resources.service';
import { PrismaService } from '../../providers/database/prisma.service';

describe('ResourcesService Unit Tests (Step 12A)', () => {
  let service: ResourcesService;
  let prisma: any;

  const mockActiveResource = {
    id: 'res_1',
    authorityName: 'Government of India — National Cyber Crime Reporting Portal',
    websiteUrl: 'https://cybercrime.gov.in',
    phoneNumber: '1930',
    isActive: true,
    priority: 1,
  };

  beforeEach(async () => {
    prisma = {
      officialResource: {
        findMany: jest.fn().mockResolvedValue([mockActiveResource]),
        count: jest.fn().mockResolvedValue(1),
        findFirst: jest.fn().mockResolvedValue(mockActiveResource),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
  });

  it('1. Empty verified resource set returns [] without throwing error', async () => {
    prisma.officialResource.findMany.mockResolvedValueOnce([]);
    const res = await service.findAll({});
    expect(res).toEqual([]);
    expect(prisma.officialResource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) }),
    );
  });

  it('2. Active verified resources are returned and inactive resources are excluded', async () => {
    const res = await service.findAll({});
    expect(res).toHaveLength(1);
    expect(res[0].authorityName).toBe('Government of India — National Cyber Crime Reporting Portal');
    expect(prisma.officialResource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      }),
    );
  });

  it('3. Category and payment mode resource filtering', async () => {
    await service.findAll({ fraudCategory: 'UPI_FRAUD', paymentMode: 'UPI' as any });
    expect(prisma.officialResource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          paymentMode: 'UPI',
        }),
      }),
    );
  });
});
