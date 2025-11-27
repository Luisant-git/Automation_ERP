export class CreateLedgerDto {
  name: string;
  code: string;
  type: string;
  group?: string;
  subgroup?: string;
  openingBalance?: number;
  balanceType?: string;
  isControl?: boolean;
  gstTag?: string;
  bankReco?: boolean;
  currency?: string;
  branch?: string;
  costCenter?: string;
  description?: string;
}

export class UpdateLedgerDto {
  name?: string;
  code?: string;
  type?: string;
  group?: string;
  subgroup?: string;
  openingBalance?: number;
  balanceType?: string;
  isControl?: boolean;
  gstTag?: string;
  bankReco?: boolean;
  currency?: string;
  branch?: string;
  costCenter?: string;
  description?: string;
}
