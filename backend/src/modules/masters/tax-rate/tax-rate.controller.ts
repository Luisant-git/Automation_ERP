import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TaxRateService } from './tax-rate.service';

@Controller('tax-rate')
export class TaxRateController {
  constructor(private readonly taxRateService: TaxRateService) {}

  @Post()
  create(@Body() data: any) {
    return this.taxRateService.create(data);
  }

  @Get()
  findAll() {
    return this.taxRateService.findAll();
  }

  @Get('dropdown/list')
  getDropdownList() {
    return this.taxRateService.getDropdownList();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxRateService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.taxRateService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taxRateService.delete(+id);
  }
}