import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from './prisma.service';

// Master Controllers
import { LedgerController } from './ledger.controller';
import { OpeningStockController } from './opening-stock.controller';
import { TaxRateController } from './tax-rate.controller';
import { BrandController } from './brand.controller';
import { CategoryController } from './category.controller';
import { MaterialController } from './material.controller';
import { EmployeeController } from './employee.controller';
import { CustomerController } from './customer.controller';
import { SupplierController } from './supplier.controller';

// Master Services
import { LedgerService } from './ledger.service';
import { OpeningStockService } from './opening-stock.service';
import { TaxRateService } from './tax-rate.service';
import { BrandService } from './brand.service';
import { CategoryService } from './category.service';
import { MaterialService } from './material.service';
import { EmployeeService } from './employee.service';
import { CustomerService } from './customer.service';
import { SupplierService } from './supplier.service';

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
  ],
})
export class AdminModule {}
