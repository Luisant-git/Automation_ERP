export class CreateBrandDto {
  code: string;
  name: string;
  description?: string;
}

export class UpdateBrandDto {
  code?: string;
  name?: string;
  description?: string;
}
