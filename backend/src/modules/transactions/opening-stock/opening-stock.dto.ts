import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOpeningStockDto {
  @IsNumber()
  materialId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  rate: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpdateOpeningStockDto extends PartialType(CreateOpeningStockDto) {}