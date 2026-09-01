import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.service';
import { QueryResourcesDto } from './dto/query-resources.dto';
import { ResourceType } from '@prisma/client';

export const VERIFIED_OFFICIAL_RESOURCES_SEED = [
  {
    authorityName: 'Government of India — National Cyber Crime Reporting Portal',
    resourceType: ResourceType.WEBSITE,
    websiteUrl: 'https://cybercrime.gov.in',
    phoneNumber: '1930',
    instructions:
      'For immediate reporting of cyber financial fraud, call 1930 (24x7 helpline) or submit an official report via the National Cyber Crime Reporting Portal.',
    priority: 1,
    isActive: true,
    lastVerifiedAt: new Date('2026-08-31T00:00:00.000Z'),
  },
  {
    authorityName: 'Reserve Bank of India — Complaint Management System (CMS)',
    resourceType: ResourceType.WEBSITE,
    websiteUrl: 'https://cms.rbi.org.in',
    phoneNumber: null,
    instructions:
      'Alternate grievance-redress portal under the Reserve Bank – Integrated Ombudsman Scheme, 2026 (RB-IOS 2026). First complain to your bank/provider. If unresolved within applicable timeline or dissatisfied with response, escalate via RBI CMS subject to scheme maintainability requirements.',
    priority: 2,
    isActive: true,
    lastVerifiedAt: new Date('2026-08-31T00:00:00.000Z'),
  },
  {
    authorityName: 'DoT — Sanchar Saathi (Chakshu)',
    resourceType: ResourceType.WEBSITE,
    websiteUrl: 'https://sancharsaathi.gov.in/sfc/',
    phoneNumber: null,
    instructions:
      'Report suspected fraudulent communications (calls, SMS, WhatsApp, fake customer-care numbers, or impersonation). If financial loss has occurred, prioritize calling 1930 or reporting on Cyber Crime Portal.',
    priority: 3,
    isActive: true,
    lastVerifiedAt: new Date('2026-08-31T00:00:00.000Z'),
  },
];

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryResourcesDto) {
    if (this.prisma.officialResource?.count) {
      const count = await this.prisma.officialResource.count();
      if (count === 0) {
        for (const res of VERIFIED_OFFICIAL_RESOURCES_SEED) {
          const existing = await this.prisma.officialResource.findFirst({
            where: { authorityName: res.authorityName },
          });
          if (!existing) {
            await this.prisma.officialResource.create({ data: res });
          }
        }
      }
    }

    const where: any = { isActive: true };

    if (query.fraudCategory) {
      where.OR = [
        { fraudCategoryId: null },
        { fraudCategoryId: query.fraudCategory },
        { fraudCategory: { code: query.fraudCategory } },
      ];
    }

    if (query.paymentMode) {
      where.paymentMode = query.paymentMode;
    }

    if (query.resourceType) {
      where.resourceType = query.resourceType;
    }

    return this.prisma.officialResource.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { authorityName: 'asc' }],
    });
  }
}
