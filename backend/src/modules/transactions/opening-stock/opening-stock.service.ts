import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OpeningStockEntry } from '@prisma/client';
import { CreateOpeningStockDto, UpdateOpeningStockDto } from './opening-stock.dto';

@Injectable()
export class OpeningStockService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateOpeningStockDto): Promise<OpeningStockEntry> {
    return this.prisma.openingStockEntry.create({ 
      data: {
        materialId: data.materialId,
        quantity: data.quantity,
        rate: data.rate,
        amount: data.amount,
        serialNumber: data.serialNumber,
        date: data.date ? new Date(data.date) : null
      }
    });
  }

  findAll(): Promise<OpeningStockEntry[]> {
    return this.prisma.openingStockEntry.findMany({ include: { material: true } });
  }

  findOne(id: number): Promise<OpeningStockEntry | null> {
    return this.prisma.openingStockEntry.findUnique({ where: { id }, include: { material: true } });
  }

  update(id: number, data: UpdateOpeningStockDto): Promise<OpeningStockEntry> {
    return this.prisma.openingStockEntry.update({ 
      where: { id }, 
      data: {
        materialId: data.materialId,
        quantity: data.quantity,
        rate: data.rate,
        amount: data.amount,
        serialNumber: data.serialNumber,
        date: data.date ? new Date(data.date) : undefined
      }
    });
  }

  delete(id: number): Promise<OpeningStockEntry> {
    return this.prisma.openingStockEntry.delete({ where: { id } });
  }

  remove(id: number): Promise<OpeningStockEntry> {
    return this.delete(id);
  }
}
