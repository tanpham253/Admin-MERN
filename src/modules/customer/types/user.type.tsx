export interface UserType {
  _id: string;
  first_name: string;
  last_name: string;
  fullName: string;
  email: string;
  roles: ('staff' | 'admin')[];
  is_active: boolean;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  roles?: 'staff' | 'admin';
  is_active?: boolean;
}

export type UsersResponse = UserType[];