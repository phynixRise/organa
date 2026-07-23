import { IsString, IsOptional } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsOptional()
  attributes?: Record<string, any>;
}

export class UpdateLocationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  attributes?: Record<string, any>;
}
