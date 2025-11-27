import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTaxRateDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsNumber()
  rate: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTaxRateDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  rate?: number;

  @IsOptional()
  @IsString()
  description?: string;
}