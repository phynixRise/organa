import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../common/types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const account = await this.prisma.account.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, tokenVersion: true },
    });

    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    if ((payload.tokenVersion ?? 0) !== account.tokenVersion) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return { sub: account.id, email: account.email };
  }
}
