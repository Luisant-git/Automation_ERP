import { Module } from '@nestjs/common';
import { QuotationController } from './quotation.controller';
import { QuotationService } from './quotation.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [QuotationController],
  providers: [QuotationService, PrismaService],
  exports: [QuotationService],
})
export class QuotationModule {}