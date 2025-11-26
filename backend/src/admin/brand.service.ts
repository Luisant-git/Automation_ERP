import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Brand } from '@prisma/client';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateBrandDto): Promise<Brand> {
    return this.prisma.brand.create({ data });
  }

  findAll(): Promise<Brand[]> {
    return this.prisma.brand.findMany();
  }

  findOne(id: number): Promise<Brand | null> {
    return this.prisma.brand.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateBrandDto): Promise<Brand> {
    return this.prisma.brand.update({ where: { id }, data });
  }

  delete(id: number): Promise<Brand> {
    return this.prisma.brand.delete({ where: { id } });
  }

  getDropdownList() {
    return this.prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        code: true
      },
      orderBy: { name: 'asc' }
    });
  }
}
