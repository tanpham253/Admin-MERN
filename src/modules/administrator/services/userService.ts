const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'staff' | 'admin';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetUsersParams {
  role?: 'staff' | 'admin';
  active?: boolean;
  search?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  count: number;
}

export const userService = {
  async getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
    const queryParams = new URLSearchParams();

    if (params?.role) {
      queryParams.append('role', params.role);
    }

    if (params?.active !== undefined) {
      queryParams.append('active', params.active.toString());
    }

    if (params?.search) {
      queryParams.append('search', params.search);
    }

    if (params?.sortField) {
      queryParams.append('sortField', params.sortField);
    }

    if (params?.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder);
    }

    const url = `${SUPABASE_URL}/functions/v1/get-users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },
};
