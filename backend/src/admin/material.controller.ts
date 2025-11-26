import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MaterialService } from './material.service';

@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  create(@Body() data: any) {
    return this.materialService.create(data);
  }

  @Get()
  findAll() {
    return this.materialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.materialService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialService.delete(+id);
  }
}