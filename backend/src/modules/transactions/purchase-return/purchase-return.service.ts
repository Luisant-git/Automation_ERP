import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PurchaseReturn } from '@prisma/client';
import { CreatePurchaseReturnDto, UpdatePurchaseReturnDto } from './purchase-return.dto';

@Injectable()
export class PurchaseReturnService {
  constructor(private prisma: PrismaService) {}

  create(data: CreatePurchaseReturnDto): Promise<PurchaseReturn> {
    return this.prisma.purchaseReturn.create({
      data: {
        returnNumber: data.returnNumber,
        purchaseInvoiceNumber: data.purchaseInvoiceNumber,
        supplierId: data.supplierId,
        returnDate: new Date(data.returnDate),
        returnType: data.returnType,
        reason: data.reason,
        lineItems: data.lineItems,
        subtotal: data.subtotal,
        totalDiscount: data.totalDiscount || 0,
        gstDetails: data.gstDetails,
        totalAmount: data.totalAmount,
        notes: data.notes,
        status: data.status || 'Draft',
        createdDate: new Date()
      }
    });
  }

  findAll(): Promise<PurchaseReturn[]> {
    return this.prisma.purchaseReturn.findMany({
      include: {
        supplier: true
      }
    });
  }

  findOne(id: number): Promise<PurchaseReturn | null> {
    return this.prisma.purchaseReturn.findUnique({
      where: { id },
      include: {
        supplier: true
      }
    });
  }

  update(id: number, data: UpdatePurchaseReturnDto): Promise<PurchaseReturn> {
    return this.prisma.purchaseReturn.update({
      where: { id },
      data: {
        ...data,
        returnDate: data.returnDate ? new Date(data.returnDate) : undefined
      }
    });
  }

  delete(id: number): Promise<PurchaseReturn> {
    return this.prisma.purchaseReturn.delete({ where: { id } });
  }
}