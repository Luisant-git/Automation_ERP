export class CreateCustomerDto {
  name: string;
  companyName?: string;
  contactPerson?: string;
  contactNo?: string;
  emailId?: string;
  phoneNo?: string;
  gstNumber?: string;
}

export class UpdateCustomerDto {
  name?: string;
  companyName?: string;
  contactPerson?: string;
  contactNo?: string;
  emailId?: string;
  phoneNo?: string;
  gstNumber?: string;
}
