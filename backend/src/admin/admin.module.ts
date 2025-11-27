import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthService } from '../modules/auth/auth.service';
import { AuthController } from '../modules/auth/auth.controller';
import { PrismaService } from '../modules/common/prisma/prisma.service';

// Master Controllers
import { LedgerController } from '../modules/masters/ledger/ledger.controller';
import { OpeningStockController } from '../modules/transactions/opening-stock/opening-stock.controller';
import { TaxRateController } from '../modules/masters/tax-rate/tax-rate.controller';
import { BrandController } from '../modules/masters/brand/brand.controller';
import { CategoryController } from '../modules/masters/category/category.controller';
import { MaterialController } from '../modules/masters/material/material.controller';
import { EmployeeController } from '../modules/masters/employee/employee.controller';
import { CustomerController } from '../modules/masters/customer/customer.controller';
import { SupplierController } from '../modules/masters/supplier/supplier.controller';
import { QuotationController } from '../modules/transactions/quotation/quotation.controller';
import { PurchaseOrderController } from '../modules/transactions/purchase-order/purchase-order.controller';
import { PurchaseEntryController } from '../modules/transactions/purchase-entry/purchase-entry.controller';
import { PurchaseReturnController } from '../modules/transactions/purchase-return/purchase-return.controller';

// Master Services
import { LedgerService } from '../modules/masters/ledger/ledger.service';
import { OpeningStockService } from '../modules/transactions/opening-stock/opening-stock.service';
import { TaxRateService } from '../modules/masters/tax-rate/tax-rate.service';
import { BrandService } from '../modules/masters/brand/brand.service';
import { CategoryService } from '../modules/masters/category/category.service';
import { MaterialService } from '../modules/masters/material/material.service';
import { EmployeeService } from '../modules/masters/employee/employee.service';
import { CustomerService } from '../modules/masters/customer/customer.service';
import { SupplierService } from '../modules/masters/supplier/supplier.service';
import { QuotationService } from '../modules/transactions/quotation/quotation.service';
import { PurchaseOrderService } from '../modules/transactions/purchase-order/purchase-order.service';
import { PurchaseEntryService } from '../modules/transactions/purchase-entry/purchase-entry.service';
import { PurchaseReturnService } from '../modules/transactions/purchase-return/purchase-return.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your_jwt_secret',
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [
    AdminController,
    AuthController,
    LedgerController,
    OpeningStockController,
    TaxRateController,
    BrandController,
    CategoryController,
    MaterialController,
    EmployeeController,
    CustomerController,
    SupplierController,
    QuotationController,
    PurchaseOrderController,
    PurchaseEntryController,
    PurchaseReturnController,
  ],
  providers: [
    AdminService,
    AuthService,
    PrismaService,
    LedgerService,
    OpeningStockService,
    TaxRateService,
    BrandService,
    CategoryService,
    MaterialService,
    EmployeeService,
    CustomerService,
    SupplierService,
    QuotationService,
    PurchaseOrderService,
    PurchaseEntryService,
    PurchaseReturnService,
  ],
})
export class AdminModule {}
