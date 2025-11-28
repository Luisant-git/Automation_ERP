import { IsString, IsNumber, IsOptional, IsDateString, IsArray } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateQuotationDto {
  @IsString()
  quotationNumber: string;

  @IsString()
  baseNumber: string;

  @IsString()
  quotationId: string;

  @IsString()
  quotationType: string;

  @IsDateString()
  quotationDate: string;

  @IsNumber()
  validityDays: number;

  @IsNumber()
  customerId: number;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  workOrderNumber?: string;

  @IsArray()
  lineItems: any[];

  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsNumber()
  totalDiscount?: number;

  gstDetails: any;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsOptional()
  excelFile?: any;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  version?: number;

  @IsOptional()
  @IsDateString()
  createdDate?: string;
}

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {}