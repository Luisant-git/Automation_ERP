export class CreateOpeningStockDto {
  materialId?: number;
  itemCode?: string;
  itemName?: string;
  quantity?: number;
  qty?: number;
  rate?: number;
  amount?: number;
  serialNumber?: string;
  date?: string;
}

export class UpdateOpeningStockDto {
  materialId?: number;
  quantity?: number;
  qty?: number;
  rate?: number;
  amount?: number;
}
