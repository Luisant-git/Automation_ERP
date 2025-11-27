import { Module } from '@nestjs/common';
import { LedgerService } from './modules/masters/ledger/ledger.service';
import { TaxRateService } from './modules/masters/tax-rate/tax-rate.service';
import { BrandService } from './modules/masters/brand/brand.service';
import { CategoryService } from './modules/masters/category/category.service';
import { MaterialService } from './modules/masters/material/material.service';
import { EmployeeService } from './modules/masters/employee/employee.service';
import { CustomerService } from './modules/masters/customer/customer.service';
import { SupplierService } from './modules/masters/supplier/supplier.service';
import { OpeningStockService } from './modules/transactions/opening-stock/opening-stock.service';
import { LedgerController } from './modules/masters/ledger/ledger.controller';
import { TaxRateController } from './modules/masters/tax-rate/tax-rate.controller';
import { BrandController } from './modules/masters/brand/brand.controller';
import { CategoryController } from './modules/masters/category/category.controller';
import { MaterialController } from './modules/masters/material/material.controller';
import { EmployeeController } from './modules/masters/employee/employee.controller';
import { CustomerController } from './modules/masters/customer/customer.controller';
import { SupplierController } from './modules/masters/supplier/supplier.controller';
import { OpeningStockController } from './modules/transactions/opening-stock/opening-stock.controller';
import { PrismaService } from './modules/common/prisma/prisma.service';

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
