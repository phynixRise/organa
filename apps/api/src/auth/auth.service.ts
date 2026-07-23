import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existing = await this.prisma.account.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName: dto.fullName,
        },
      });

      const org = await tx.organization.create({
        data: {
          name: dto.businessName,
          businessType: dto.businessType,
          ownerAccountId: account.id,
        },
      });

      await tx.membership.create({
        data: {
          accountId: account.id,
          orgId: org.id,
          role: 'owner',
        },
      });

      let plan = await tx.plan.findFirst({ where: { name: 'Free' } });
      if (!plan) {
        plan = await tx.plan.create({
          data: {
            name: 'Free',
            priceMillimes: 0,
            maxOrgs: 3,
            features: '{}',
          },
        });
      }

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await tx.subscription.create({
        data: {
          accountId: account.id,
          planId: plan.id,
          status: 'active',
          currentPeriodEnd: periodEnd,
        },
      });

      return { account, org };
    });

    const token = this.generateToken(result.account);

    return {
      token,
      account: {
        id: result.account.id,
        email: result.account.email,
        fullName: result.account.fullName,
      },
    };
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const account = await this.prisma.account.findUnique({
      where: { email: normalizedEmail },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(dto.password, account.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(account);

    return {
      token,
      account: {
        id: account.id,
        email: account.email,
        fullName: account.fullName,
      },
    };
  }

  async getProfile(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    return account;
  }

  async requestPasswordReset(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const account = await this.prisma.account.findUnique({
      where: { email: normalizedEmail },
    });

    if (!account) {
      return { message: 'If an account exists, a reset email has been sent' };
    }

    await this.prisma.authToken.deleteMany({
      where: {
        accountId: account.id,
        purpose: 'password_reset',
      },
    });

    const token = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 4);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.authToken.create({
      data: {
        accountId: account.id,
        tokenHash,
        purpose: 'password_reset',
        expiresAt,
      },
    });

    console.log(`Password reset token for ${normalizedEmail}: ${token}`);

    return { message: 'If an account exists, a reset email has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const authTokens = await this.prisma.authToken.findMany({
      where: {
        purpose: 'password_reset',
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: { account: true },
    });

    let matchedToken = null;
    let matchedAccount = null;

    for (const at of authTokens) {
      const valid = await bcrypt.compare(dto.token, at.tokenHash);
      if (valid) {
        matchedToken = at;
        matchedAccount = at.account;
        break;
      }
    }

    if (!matchedToken || !matchedAccount) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: matchedAccount.id },
        data: { passwordHash },
      });

      await tx.authToken.update({
        where: { id: matchedToken.id },
        data: { usedAt: new Date() },
      });
    });

    return { message: 'Password has been reset successfully' };
  }

  private generateToken(account: { id: string; email: string }): string {
    return this.jwtService.sign({
      sub: account.id,
      email: account.email,
    });
  }
}
