import { IsString, IsNumber, IsOptional, IsDateString, IsArray } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePurchaseEntryDto {
  @IsString()
  purchaseInvoiceNumber: string;

  @IsString()
  purchaseOrderId: string;

  @IsNumber()
  supplierId: number;

  @IsDateString()
  invoiceDate: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

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
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdatePurchaseEntryDto extends PartialType(CreatePurchaseEntryDto) {}