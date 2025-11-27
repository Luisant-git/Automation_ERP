import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Customer } from '@prisma/client';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateCustomerDto): Promise<Customer> {
    return this.prisma.customer.create({ data });
  }

  findAll(): Promise<Customer[]> {
    return this.prisma.customer.findMany();
  }

  findOne(id: number): Promise<Customer | null> {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateCustomerDto): Promise<Customer> {
    return this.prisma.customer.update({ where: { id }, data });
  }

  delete(id: number): Promise<Customer> {
    return this.prisma.customer.delete({ where: { id } });
  }
}