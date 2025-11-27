import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PurchaseEntry } from '@prisma/client';
import { CreatePurchaseEntryDto, UpdatePurchaseEntryDto } from './purchase-entry.dto';

@Injectable()
export class PurchaseEntryService {
  constructor(private prisma: PrismaService) {}

  create(data: CreatePurchaseEntryDto): Promise<PurchaseEntry> {
    return this.prisma.purchaseEntry.create({
      data: {
        purchaseInvoiceNumber: data.purchaseInvoiceNumber,
        purchaseOrderId: data.purchaseOrderId,
        supplierId: data.supplierId,
        invoiceDate: new Date(data.invoiceDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        referenceNumber: data.referenceNumber,
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

  findAll(): Promise<PurchaseEntry[]> {
    return this.prisma.purchaseEntry.findMany({
      include: {
        supplier: true,
        purchaseOrder: true
      }
    });
  }

  findOne(id: number): Promise<PurchaseEntry | null> {
    return this.prisma.purchaseEntry.findUnique({
      where: { id },
      include: {
        supplier: true,
        purchaseOrder: true
      }
    });
  }

  update(id: number, data: UpdatePurchaseEntryDto): Promise<PurchaseEntry> {
    return this.prisma.purchaseEntry.update({
      where: { id },
      data: {
        ...data,
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      }
    });
  }

  delete(id: number): Promise<PurchaseEntry> {
    return this.prisma.purchaseEntry.delete({ where: { id } });
  }
}