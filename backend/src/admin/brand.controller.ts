import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BrandService } from './brand.service';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  create(@Body() data: any) {
    return this.brandService.create(data);
  }

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Get('dropdown/list')
  getDropdownList() {
    return this.brandService.getDropdownList();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.brandService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.delete(+id);
  }
}