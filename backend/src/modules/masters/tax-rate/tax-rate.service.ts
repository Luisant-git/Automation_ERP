import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TaxRate } from '@prisma/client';
import { CreateTaxRateDto, UpdateTaxRateDto } from './tax-rate.dto';

@Injectable()
export class TaxRateService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateTaxRateDto): Promise<TaxRate> {
    return this.prisma.taxRate.create({ data });
  }

  findAll(): Promise<TaxRate[]> {
    return this.prisma.taxRate.findMany();
  }

  findOne(id: number): Promise<TaxRate | null> {
    return this.prisma.taxRate.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateTaxRateDto): Promise<TaxRate> {
    return this.prisma.taxRate.update({ where: { id }, data });
  }

  delete(id: number): Promise<TaxRate> {
    return this.prisma.taxRate.delete({ where: { id } });
  }

  getDropdownList() {
    return this.prisma.taxRate.findMany({
      select: {
        id: true,
        name: true,
        rate: true
      },
      orderBy: { rate: 'asc' }
    });
  }
}
