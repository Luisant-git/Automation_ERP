import { IsString, IsNumber, IsOptional, IsDateString, IsArray } from 'class-validator';

export class CreatePurchaseReturnDto {
  @IsString()
  returnNumber: string;

  @IsString()
  @IsOptional()
  purchaseInvoiceNumber?: string;

  @IsNumber()
  supplierId: number;

  @IsDateString()
  returnDate: string;

  @IsString()
  @IsOptional()
  returnType?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  lineItems: string; // JSON string

  @IsNumber()
  subtotal: number;

  @IsNumber()
  @IsOptional()
  totalDiscount?: number;

  @IsString()
  gstDetails: string; // JSON string

  @IsNumber()
  totalAmount: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdatePurchaseReturnDto {
  @IsString()
  @IsOptional()
  returnNumber?: string;

  @IsString()
  @IsOptional()
  purchaseInvoiceNumber?: string;

  @IsNumber()
  @IsOptional()
  supplierId?: number;

  @IsDateString()
  @IsOptional()
  returnDate?: string;

  @IsString()
  @IsOptional()
  returnType?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  lineItems?: string;

  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @IsNumber()
  @IsOptional()
  totalDiscount?: number;

  @IsString()
  @IsOptional()
  gstDetails?: string;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  status?: string;
}