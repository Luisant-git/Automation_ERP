import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { OpeningStockEntry } from '@prisma/client';
import { CreateOpeningStockDto, UpdateOpeningStockDto } from './dto/opening-stock.dto';

@Injectable()
export class OpeningStockService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOpeningStockDto): Promise<OpeningStockEntry> {
    // If materialId is not provided, try to find material by itemCode
    let materialId = data.materialId;
    if (!materialId && data.itemCode) {
      const material = await this.prisma.material.findUnique({
        where: { itemCode: data.itemCode }
      });
      materialId = material?.id || 1;
    }
    
    return this.prisma.openingStockEntry.create({ 
      data: {
        materialId: materialId || 1,
        quantity: data.quantity || data.qty || 0,
        rate: data.rate || 0,
        amount: data.amount || (data.qty || 0) * (data.rate || 0),
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
        quantity: data.quantity || data.qty || 0,
        rate: data.rate || 0,
        amount: data.amount || 0
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
