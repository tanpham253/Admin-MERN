export interface BrandType {
  _id: string;
  brand_name: string;
  description?: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandsResponse {
  brands: BrandType[];
  page: number;
  limit: number;
  totalRecords: number;
}
