import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Quotation } from '@prisma/client';
import { CreateQuotationDto, UpdateQuotationDto } from './quotation.dto';

@Injectable()
export class QuotationService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateQuotationDto): Promise<Quotation> {
    const { createdDate, ...restData } = data as any;
    return this.prisma.quotation.create({ 
      data: {
        ...restData,
        quotationDate: new Date(data.quotationDate),
        version: data.version || 0,
        totalDiscount: data.totalDiscount || 0,
        status: data.status || 'Draft',
        ...(createdDate && { createdDate: new Date(createdDate) })
      }
    });
  }

  findAll(): Promise<Quotation[]> {
    return this.prisma.quotation.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: number): Promise<Quotation | null> {
    return this.prisma.quotation.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateQuotationDto): Promise<Quotation> {
    const updateData: any = { ...data };
    if (data.quotationDate) {
      updateData.quotationDate = new Date(data.quotationDate);
    }
    return this.prisma.quotation.update({ where: { id }, data: updateData });
  }

  delete(id: number): Promise<Quotation> {
    return this.prisma.quotation.delete({ where: { id } });
  }
}
