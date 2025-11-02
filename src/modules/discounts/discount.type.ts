export interface DiscountType {
  _id?: string;
  code: string;
  name: string;
  description?: string;
  discountPercent: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DiscountResponse {
  discounts: DiscountType[];
  page: number;
  limit: number;
  totalRecords: number;
}
