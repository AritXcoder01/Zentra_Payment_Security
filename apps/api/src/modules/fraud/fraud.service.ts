import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateFraudReportDto } from './dto/create-fraud-report.dto';
import { PaymentMode, SeverityLevel, ResourceType } from '@prisma/client';

export const SEEDED_FRAUD_CATEGORIES = [
  { code: 'WRONG_RECIPIENT', name: 'Wrong / Accidental Transfer', description: 'Money sent to incorrect recipient mobile number or account', severity: SeverityLevel.LOW },
  { code: 'UNAUTHORIZED_TRANSACTION', name: 'Unauthorized Transaction', description: 'Debit completed without account holder consent', severity: SeverityLevel.CRITICAL },
  { code: 'UPI_FRAUD', name: 'UPI / QR Code Fraud', description: 'Fraudulent UPI collect request or QR scan deception', severity: SeverityLevel.HIGH },
  { code: 'CARD_FRAUD', name: 'Debit / Credit Card Fraud', description: 'Unauthorized card charges, skimming, or online misuse', severity: SeverityLevel.HIGH },
  { code: 'PHISHING', name: 'Phishing Link / SMS Fraud', description: 'Malicious SMS links claiming rewards or account block', severity: SeverityLevel.MEDIUM },
  { code: 'FAKE_CUSTOMER_CARE', name: 'Fake Customer Care Scam', description: 'Helpline number impersonation on web search', severity: SeverityLevel.HIGH },
  { code: 'OTP_SCAM', name: 'OTP / PIN Scam', description: 'Deceptive sharing of single-use passcode or PIN', severity: SeverityLevel.CRITICAL },
  { code: 'INVESTMENT_SCAM', name: 'Fake Investment / Task Scam', description: 'Promises of returns via work-from-home or crypto schemes', severity: SeverityLevel.MEDIUM },
  { code: 'ACCOUNT_TAKEOVER', name: 'Account Takeover', description: 'Unauthorized access to banking app or payment wallet', severity: SeverityLevel.CRITICAL },
  { code: 'SIM_RELATED', name: 'SIM Swap / Port Fraud', description: 'Unauthorized SIM swap or mobile porting', severity: SeverityLevel.HIGH },
  { code: 'OTHER', name: 'Other Payment Security Threat', description: 'Unclassified payment security issue', severity: SeverityLevel.MEDIUM },
];

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
export class FraudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getCategories() {
    let categories = await this.prisma.fraudCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    if (categories.length === 0) {
      for (const cat of SEEDED_FRAUD_CATEGORIES) {
        await this.prisma.fraudCategory.upsert({
          where: { code: cat.code },
          update: {},
          create: {
            code: cat.code,
            name: cat.name,
            description: cat.description,
            severity: cat.severity,
            recommendedActions: ['Notify bank', 'Change PINs'],
            isActive: true,
          },
        });
      }
      categories = await this.prisma.fraudCategory.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    }

    return categories;
  }

  async createReport(
    userId: string,
    dto: CreateFraudReportDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const category = await this.prisma.fraudCategory.findFirst({
      where: {
        OR: [{ code: dto.fraudCategory }, { id: dto.fraudCategory }],
      },
    });

    if (!category) {
      throw new BadRequestException('Invalid fraud category specified');
    }

    if (dto.relatedTransactionId) {
      const tx = await this.prisma.transaction.findFirst({
        where: { id: dto.relatedTransactionId, userId },
      });
      if (!tx) {
        throw new ForbiddenException('Related transaction not found or access denied');
      }
    }

    const report = await this.prisma.fraudReport.create({
      data: {
        userId,
        fraudCategoryId: category.id,
        paymentMode: dto.paymentMode,
        amount: dto.amount,
        incidentDate: new Date(dto.incidentDate),
        description: dto.description,
        transactionReference: dto.transactionReference || null,
        transactionId: dto.relatedTransactionId || null,
        status: 'SUBMITTED',
      },
      include: {
        fraudCategory: true,
      },
    });

    await this.auditService.log({
      userId,
      action: 'FRAUD_REPORT_CREATED',
      ipAddress,
      userAgent,
      metadata: {
        reportId: report.id,
        categoryCode: category.code,
        amount: dto.amount,
      },
    });

    return report;
  }

  async findAllReports(userId: string) {
    return this.prisma.fraudReport.findMany({
      where: { userId },
      include: { fraudCategory: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneReport(userId: string, id: string) {
    const report = await this.prisma.fraudReport.findFirst({
      where: { id, userId },
      include: { fraudCategory: true },
    });

    if (!report) {
      throw new NotFoundException('Fraud report not found');
    }

    return report;
  }

  async getGuidance(userId: string, reportId: string) {
    const report = await this.findOneReport(userId, reportId);
    const categoryCode = report.fraudCategory.code;
    const paymentMode = report.paymentMode;

    let dbResources: any[] = [];
    if (this.prisma.officialResource?.count) {
      const count = await this.prisma.officialResource.count();
      if (count === 0) {
        for (const res of VERIFIED_OFFICIAL_RESOURCES_SEED) {
          await this.prisma.officialResource.create({ data: res });
        }
      }
      dbResources = await this.prisma.officialResource.findMany({
        where: { isActive: true },
        orderBy: [{ priority: 'asc' }, { authorityName: 'asc' }],
      });
    }

    return this.generateDeterministicGuidance(categoryCode, paymentMode, dbResources);
  }

  generateDeterministicGuidance(
    categoryCode: string,
    paymentMode: PaymentMode,
    dbResources: any[] = [],
  ) {
    let severity = 'MEDIUM';
    const immediateActions: string[] = [];
    const safetyRecommendations: string[] = [];

    if (categoryCode === 'WRONG_RECIPIENT') {
      severity = 'LOW';
      immediateActions.push(
        'Contact your bank or payment provider through its verified official channel to request wrong-recipient reversal.',
      );
      immediateActions.push(
        'If the recipient refuses voluntary reversal or deception was involved, raise a formal dispute with your bank.',
      );
    } else if (['UNAUTHORIZED_TRANSACTION', 'OTP_SCAM', 'ACCOUNT_TAKEOVER'].includes(categoryCode)) {
      severity = 'HIGH';
      immediateActions.push(
        'Contact your bank customer care immediately using the official number on your payment card to freeze accounts or block cards.',
      );
      immediateActions.push('Update your UPI PIN, banking app passwords, and email credentials right away.');
    } else {
      severity = 'HIGH';
      immediateActions.push('Contact your bank or payment app support channel to raise a transaction dispute.');
      immediateActions.push('Save screenshots of SMS messages, transaction reference numbers (UTR), and payment receipts.');
    }

    if (paymentMode === PaymentMode.UPI) {
      immediateActions.push('Report the fraudster VPA/UPI ID directly inside your UPI app (Google Pay, PhonePe, Paytm, BHIM).');
      safetyRecommendations.push('Remember: Entering your UPI PIN is ONLY for transferring money OUT of your account, NEVER for receiving money.');
    } else if (paymentMode === PaymentMode.CARD) {
      immediateActions.push('Block your debit/credit card via net banking or SMS service immediately.');
      safetyRecommendations.push('Disable international transactions and lower online transaction limits on your card.');
    } else if (paymentMode === PaymentMode.ATM) {
      immediateActions.push('Report potential ATM card skimming or cash retraction failure to your card issuer.');
    }

    safetyRecommendations.push('For immediate reporting of cyber financial fraud, call 1930 (24x7 helpline) or submit an official report via the National Cyber Crime Reporting Portal.');
    safetyRecommendations.push('Zentra will never ask for your PIN, UPI PIN, CVV, password, or OTP.');

    let relevantResources = dbResources;
    if (categoryCode === 'WRONG_RECIPIENT') {
      relevantResources = dbResources.filter((r) => r.authorityName && r.authorityName.includes('RBI'));
    }

    return {
      reportCategory: categoryCode,
      paymentMode,
      severity,
      immediateActions,
      safetyRecommendations,
      officialResources: relevantResources,
    };
  }
}
