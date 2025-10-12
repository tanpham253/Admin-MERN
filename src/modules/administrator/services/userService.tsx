import apiClient from '../../../libs/axiosClient';
import type { GetUsersParams, UsersResponse, UserType } from '../types/user.type';

export const userService = {
  getUsers: async (params: GetUsersParams): Promise<UsersResponse> => {
    const query = new URLSearchParams();

    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.sortField) query.append('sortField', params.sortField);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.search) query.append('keyword', params.search);
    if (params.roles) query.append('role', params.roles);
    if (params.is_active !== undefined) query.append('active', String(params.is_active));

    const response = await apiClient.get(`/v1/users?${query.toString()}`);
    return response.data;
  },

  createUser: async (payload: Partial<UserType>) => {
    const response = await apiClient.post(`/v1/users`, payload);
    return response.data;
  },

  updateUser: async (id: string, payload: Partial<UserType>) => {
    const response = await apiClient.put(`/v1/users/${id}`, payload);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/v1/users/${id}`);
    return response.data;
  },
};
