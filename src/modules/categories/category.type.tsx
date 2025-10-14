export interface CategoryType {
  _id: string;
  category_name: string;
  description?: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriesResponse {
  categories: CategoryType[];
  page: number;
  limit: number;
  totalRecords: number;
}
