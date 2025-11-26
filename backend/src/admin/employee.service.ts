import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Employee } from '@prisma/client';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateEmployeeDto): Promise<Employee> {
    return this.prisma.employee.create({ 
      data: {
        name: data.name || data.employeeName || 'Unknown',
        employeeName: data.employeeName,
        email: data.email || data.emailId || 'unknown@example.com',
        contactNo: data.contactNo,
        emailId: data.emailId,
        phone: data.phone,
        address: data.address,
        designation: data.designation,
        role: data.role,
        dateOfJoin: data.dateOfJoin,
        username: data.username,
        password: data.password,
        isActive: data.isActive ?? true
      }
    });
  }

  findAll(): Promise<Employee[]> {
    return this.prisma.employee.findMany();
  }

  findOne(id: number): Promise<Employee | null> {
    return this.prisma.employee.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateEmployeeDto): Promise<Employee> {
    return this.prisma.employee.update({ where: { id }, data });
  }

  delete(id: number): Promise<Employee> {
    return this.prisma.employee.delete({ where: { id } });
  }
}
