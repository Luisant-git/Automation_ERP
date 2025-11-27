export class CreateCategoryDto {
  code: string;
  name: string;
  description?: string;
}

export class UpdateCategoryDto {
  code?: string;
  name?: string;
  description?: string;
}
