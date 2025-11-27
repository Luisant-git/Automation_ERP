export class CreateEmployeeDto {
  name: string;
  employeeName?: string;
  email: string;
  contactNo?: string;
  emailId?: string;
  phone?: string;
  address?: string;
  designation?: string;
  role?: string;
  dateOfJoin?: string;
  username?: string;
  password?: string;
  isActive?: boolean;
}

export class UpdateEmployeeDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  designation?: string;
}
