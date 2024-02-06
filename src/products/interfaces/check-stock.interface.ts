import { ECheckStockStatus } from '../enums/check-stock.enum';

export interface ICheckStockResult {
  productId: string;
  quantity: number;
  subtotal: number;
  price: number;
  status: ECheckStockStatus;
}
