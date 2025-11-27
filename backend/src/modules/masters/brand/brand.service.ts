import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
// import { Brand } from '@prisma/client';
type Brand = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
import { CreateBrandDto, UpdateBrandDto } from './brand.dto';

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
