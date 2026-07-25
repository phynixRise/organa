import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(['cafe', 'restaurant', 'boutique', 'gym', 'cabinet_medical', 'tienda', 'hotel', 'rental_property'])
  businessType: string;

  @IsString()
  @IsOptional()
  subdomain?: string;
}

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  subdomain?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  locale?: string;

  @IsString()
  @IsOptional()
  hardwarePackage?: string;
}

export class InviteMemberDto {
  @IsString()
  email: string;

  @IsString()
  @IsIn(['manager', 'staff'])
  role: string;
}
