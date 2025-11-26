export class CreateSupplierDto {
  name: string;
  companyName?: string;
  contactPerson?: string;
  contactNo?: string;
  emailId?: string;
  phoneNo?: string;
  gstNumber?: string;
  isActive?: boolean;
  addresses?: any[];
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export class UpdateSupplierDto {
  name?: string;
  companyName?: string;
  contactPerson?: string;
  contactNo?: string;
  emailId?: string;
  phoneNo?: string;
  gstNumber?: string;
  isActive?: boolean;
  addresses?: any[];
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}
