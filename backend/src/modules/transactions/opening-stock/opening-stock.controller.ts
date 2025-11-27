import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OpeningStockService } from './opening-stock.service';

@Controller('opening-stock')
export class OpeningStockController {
  constructor(private readonly openingStockService: OpeningStockService) {}

  @Post()
  create(@Body() createOpeningStockDto: { materialId: number; quantity: number; rate: number; amount: number }) {
    return this.openingStockService.create(createOpeningStockDto);
  }

  @Get()
  findAll() {
    return this.openingStockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.openingStockService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOpeningStockDto: { materialId?: number; quantity?: number; rate?: number; amount?: number }) {
    return this.openingStockService.update(+id, updateOpeningStockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.openingStockService.remove(+id);
  }
}