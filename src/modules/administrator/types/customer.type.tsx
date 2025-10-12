export interface CustomerType {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  active: boolean;
  createdAt: string;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface CustomersResponse {
  customers: CustomerType[];
  page: number;
  limit: number;
  totalRecords: number;
}
