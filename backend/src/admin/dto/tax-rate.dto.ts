export class CreateTaxRateDto {
  code: string;
  name: string;
  rate: number;
  description?: string;
}

export class UpdateTaxRateDto {
  code?: string;
  name?: string;
  rate?: number;
  description?: string;
}
