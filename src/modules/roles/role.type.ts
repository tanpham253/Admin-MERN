export interface RoleType {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleResponse {
  roles: RoleType[];
  page: number;
  limit: number;
  totalRecords: number;
}
