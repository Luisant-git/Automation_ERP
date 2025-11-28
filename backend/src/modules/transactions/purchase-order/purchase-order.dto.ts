import { IsString, IsNumber, IsOptional, IsDateString, IsArray, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePurchaseOrderDto {
  @IsString()
  purchaseOrderNumber: string;

  @IsString()
  baseNumber: string;

  @IsString()
  purchaseOrderId: string;

  @IsString()
  purchaseOrderType: string;

  @IsDateString()
  purchaseOrderDate: string;

  @IsNumber()
  validityDays: number;

  @IsNumber()
  supplierId: number;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  workOrderNumber?: string;

  @IsOptional()
  lineItems?: any;

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
}

export class UpdatePurchaseOrderDto extends PartialType(CreatePurchaseOrderDto) {}