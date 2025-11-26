export class CreateMaterialDto {
  itemName: string;
  itemCode: string;
  hsnCode?: string;
  itemCategory?: string;
  brand?: string;
  categoryId?: number;
  brandId?: number;
  unit?: string;
  tax?: number;
  purchaseRate?: number;
  sellingRate?: number;
  isActive?: boolean;
  description?: string;
}

export class UpdateMaterialDto {
  itemName?: string;
  itemCode?: string;
  hsnCode?: string;
  itemCategory?: string;
  brand?: string;
  categoryId?: number;
  brandId?: number;
  unit?: string;
  tax?: number;
  purchaseRate?: number;
  sellingRate?: number;
  isActive?: boolean;
  description?: string;
}
