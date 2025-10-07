import apiClient from "../../../libs/axiosClient";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetUsersParams {
  roles: string[];
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  count: number;
}

export const fetchUsers = async (page: number, limit = 10) => {
  const response = await apiClient.get(`/v1/users?page=${page}&limit=${limit}`);
  // console.log("DEBUG users raw response =>", response);
  return response; // ✅ whole object
};

export const fetchUserById = async (id: string): Promise<User> => {
  const response = await apiClient.get(`/v1/users/${id}`);
  return response.data;
};

export const createUser = async (formData: Partial<User>): Promise<User> => {
  const response = await apiClient.post(`/v1/users`, formData);
  return response.data;
};

export const updateUser = async (id: string, formData: Partial<User>): Promise<User> => {
  const response = await apiClient.put(`/v1/users/${id}`, formData);
  return response.data;
};

export const deleteUser = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/v1/users/${id}`);
  return response.data;
};
