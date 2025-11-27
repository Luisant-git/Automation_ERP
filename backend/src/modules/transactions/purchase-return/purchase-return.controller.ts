import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PurchaseReturnService } from './purchase-return.service';
import { CreatePurchaseReturnDto, UpdatePurchaseReturnDto } from './purchase-return.dto';

@Controller('purchase-returns')
export class PurchaseReturnController {
  constructor(private readonly purchaseReturnService: PurchaseReturnService) {}

  @Post()
  create(@Body() createPurchaseReturnDto: CreatePurchaseReturnDto) {
    return this.purchaseReturnService.create(createPurchaseReturnDto);
  }

  @Get()
  findAll() {
    return this.purchaseReturnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseReturnService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchaseReturnDto: UpdatePurchaseReturnDto) {
    return this.purchaseReturnService.update(+id, updatePurchaseReturnDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseReturnService.delete(+id);
  }
}