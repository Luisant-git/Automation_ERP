import { Module } from '@nestjs/common';
import { LedgerService } from './admin/ledger.service';
import { TaxRateService } from './admin/tax-rate.service';
import { BrandService } from './admin/brand.service';
import { CategoryService } from './admin/category.service';
import { MaterialService } from './admin/material.service';
import { EmployeeService } from './admin/employee.service';
import { CustomerService } from './admin/customer.service';
import { SupplierService } from './admin/supplier.service';
import { OpeningStockService } from './admin/opening-stock.service';
import { LedgerController } from './admin/ledger.controller';
import { TaxRateController } from './admin/tax-rate.controller';
import { BrandController } from './admin/brand.controller';
import { CategoryController } from './admin/category.controller';
import { MaterialController } from './admin/material.controller';
import { EmployeeController } from './admin/employee.controller';
import { CustomerController } from './admin/customer.controller';
import { SupplierController } from './admin/supplier.controller';
import { OpeningStockController } from './admin/opening-stock.controller';
import { PrismaService } from './admin/prisma.service';

@Module({
  controllers: [
    LedgerController,
    TaxRateController,
    BrandController,
    CategoryController,
    MaterialController,
    EmployeeController,
    CustomerController,
    SupplierController,
    OpeningStockController,
  ],
  providers: [
    LedgerService,
    TaxRateService,
    BrandService,
    CategoryService,
    MaterialService,
    EmployeeService,
    CustomerService,
    SupplierService,
    OpeningStockService,
    PrismaService,
  ],
})
export class MasterModule {}
