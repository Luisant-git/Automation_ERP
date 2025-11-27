import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LedgerService } from './ledger.service';

@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Post()
  create(@Body() data: any) {
    return this.ledgerService.create(data);
  }

  @Get()
  findAll() {
    return this.ledgerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ledgerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.ledgerService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ledgerService.delete(+id);
  }
}