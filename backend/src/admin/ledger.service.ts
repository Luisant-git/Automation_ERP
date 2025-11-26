import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Ledger } from '@prisma/client';
import { CreateLedgerDto, UpdateLedgerDto } from './dto/ledger.dto';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateLedgerDto): Promise<Ledger> {
    return this.prisma.ledger.create({ 
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        group: data.group,
        subgroup: data.subgroup,
        openingBalance: data.openingBalance,
        balanceType: data.balanceType,
        isControl: data.isControl ?? false,
        gstTag: data.gstTag,
        bankReco: data.bankReco ?? false,
        currency: data.currency || 'INR',
        branch: data.branch,
        costCenter: data.costCenter,
        description: data.description
      }
    });
  }

  findAll(): Promise<Ledger[]> {
    return this.prisma.ledger.findMany();
  }

  findOne(id: number): Promise<Ledger | null> {
    return this.prisma.ledger.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateLedgerDto): Promise<Ledger> {
    return this.prisma.ledger.update({ 
      where: { id }, 
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        group: data.group,
        subgroup: data.subgroup,
        openingBalance: data.openingBalance,
        balanceType: data.balanceType,
        isControl: data.isControl,
        gstTag: data.gstTag,
        bankReco: data.bankReco,
        currency: data.currency,
        branch: data.branch,
        costCenter: data.costCenter,
        description: data.description
      }
    });
  }

  delete(id: number): Promise<Ledger> {
    return this.prisma.ledger.delete({ where: { id } });
  }
}
