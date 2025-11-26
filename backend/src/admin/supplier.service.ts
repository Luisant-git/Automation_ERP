import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Supplier } from '@prisma/client';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateSupplierDto): Promise<Supplier> {
    const firstAddress = data.addresses?.[0] || {};
    const defaultEmail = `supplier_${Date.now()}@example.com`;
    return this.prisma.supplier.create({ 
      data: {
        name: data.name,
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email || data.emailId || defaultEmail,
        phone: data.phone || data.phoneNo || data.contactNo,
        gstNumber: data.gstNumber,
        address: data.address || firstAddress.address,
        city: data.city || firstAddress.city,
        state: data.state || firstAddress.state,
        stateCode: firstAddress.stateCode,
        country: firstAddress.country,
        pincode: data.pincode || firstAddress.pincode,
        contact: firstAddress.contact
      }
    });
  }

  findAll(): Promise<Supplier[]> {
    return this.prisma.supplier.findMany();
  }

  findOne(id: number): Promise<Supplier | null> {
    return this.prisma.supplier.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateSupplierDto): Promise<Supplier> {
    const firstAddress = data.addresses?.[0] || {};
    return this.prisma.supplier.update({ 
      where: { id }, 
      data: {
        name: data.name,
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email || data.emailId,
        phone: data.phone || data.phoneNo || data.contactNo,
        gstNumber: data.gstNumber,
        address: data.address || firstAddress.address,
        city: data.city || firstAddress.city,
        state: data.state || firstAddress.state,
        stateCode: firstAddress.stateCode,
        country: firstAddress.country,
        pincode: data.pincode || firstAddress.pincode,
        contact: firstAddress.contact
      }
    });
  }

  delete(id: number): Promise<Supplier> {
    return this.prisma.supplier.delete({ where: { id } });
  }
}