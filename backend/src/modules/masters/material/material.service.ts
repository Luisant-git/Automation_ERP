import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Material } from '@prisma/client';
import { CreateMaterialDto, UpdateMaterialDto } from './material.dto';

@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMaterialDto): Promise<Material> {
    // Ensure default category exists
    let categoryId = data.categoryId;
    if (!categoryId) {
      const defaultCategory = await this.prisma.category.upsert({
        where: { code: 'DEFAULT' },
        update: {},
        create: { code: 'DEFAULT', name: 'Default Category' }
      });
      categoryId = defaultCategory.id;
    }

    // Ensure default brand exists
    let brandId = data.brandId;
    if (!brandId) {
      const defaultBrand = await this.prisma.brand.upsert({
        where: { code: 'DEFAULT' },
        update: {},
        create: { code: 'DEFAULT', name: 'Default Brand' }
      });
      brandId = defaultBrand.id;
    }

    return this.prisma.material.create({ 
      data: {
        itemName: data.itemName,
        itemCode: data.itemCode,
        hsnCode: data.hsnCode,
        itemCategory: data.itemCategory,
        brand: data.brand,
        categoryId,
        brandId,
        unit: data.unit,
        tax: data.tax,
        purchaseRate: data.purchaseRate,
        sellingRate: data.sellingRate,
        isActive: data.isActive ?? true,
        description: data.description
      },
      include: { category: true, brandRelation: true } 
    });
  }

  findAll(): Promise<Material[]> {
    return this.prisma.material.findMany({ include: { category: true, brandRelation: true } });
  }

  findOne(id: number): Promise<Material | null> {
    return this.prisma.material.findUnique({ where: { id }, include: { category: true, brandRelation: true } });
  }

  update(id: number, data: UpdateMaterialDto): Promise<Material> {
    return this.prisma.material.update({ where: { id }, data, include: { category: true, brandRelation: true } });
  }

  delete(id: number): Promise<Material> {
    return this.prisma.material.delete({ where: { id } });
  }
}
