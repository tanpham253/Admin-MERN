export interface BrandType {
  _id: string;
  brand_name: string;
  description?: string;
  slug: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandResponse {
  brands: BrandType[];
  page: number;
  limit: number;
  totalRecords: number;
}
