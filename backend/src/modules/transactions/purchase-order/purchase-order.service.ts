import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PurchaseOrder } from '@prisma/client';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './purchase-order.dto';

@Injectable()
export class PurchaseOrderService {
  constructor(private prisma: PrismaService) {}

  create(data: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    return this.prisma.purchaseOrder.create({ 
      data: {
        purchaseOrderNumber: data.purchaseOrderNumber,
        baseNumber: data.baseNumber,
        version: data.version || 0,
        purchaseOrderId: data.purchaseOrderId,
        purchaseOrderType: data.purchaseOrderType,
        purchaseOrderDate: new Date(data.purchaseOrderDate),
        validityDays: data.validityDays,
        supplierId: data.supplierId,
        projectName: data.projectName,
        description: data.description,
        status: data.status || 'Draft',
        workOrderNumber: data.workOrderNumber,
        lineItems: data.lineItems ?? [],
        subtotal: data.subtotal,
        totalDiscount: data.totalDiscount || 0,
        gstDetails: data.gstDetails,
        totalAmount: data.totalAmount,
        termsAndConditions: data.termsAndConditions,
        excelFile: data.excelFile
      }
    });
  }

  findAll(): Promise<PurchaseOrder[]> {
    return this.prisma.purchaseOrder.findMany({
      include: {
        supplier: true
      }
    });
  }

  findOne(id: number): Promise<PurchaseOrder | null> {
    return this.prisma.purchaseOrder.findUnique({ 
      where: { id },
      include: {
        supplier: true
      }
    });
  }

  update(id: number, data: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    return this.prisma.purchaseOrder.update({ 
      where: { id }, 
      data: {
        purchaseOrderNumber: data.purchaseOrderNumber,
        baseNumber: data.baseNumber,
        version: data.version,
        purchaseOrderId: data.purchaseOrderId,
        purchaseOrderType: data.purchaseOrderType,
        purchaseOrderDate: data.purchaseOrderDate ? new Date(data.purchaseOrderDate) : undefined,
        validityDays: data.validityDays,
        supplierId: data.supplierId,
        projectName: data.projectName,
        description: data.description,
        status: data.status,
        workOrderNumber: data.workOrderNumber,
        lineItems: data.lineItems ?? undefined,
        subtotal: data.subtotal,
        totalDiscount: data.totalDiscount,
        gstDetails: data.gstDetails,
        totalAmount: data.totalAmount,
        termsAndConditions: data.termsAndConditions,
        excelFile: data.excelFile
      }
    });
  }

  delete(id: number): Promise<PurchaseOrder> {
    return this.prisma.purchaseOrder.delete({ where: { id } });
  }
}