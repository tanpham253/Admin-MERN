import apiClient from "../../../libs/axiosClient";
import type { GetCustomersParams, CustomersResponse } from "../types/customer.type";

export const customerService = {
  getCustomers: async (params: GetCustomersParams): Promise<CustomersResponse> => {
    const query = new URLSearchParams();

    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.sortField) query.append("sort_by", params.sortField);
    if (params.sortOrder) query.append("sort_type", params.sortOrder);
    if (params.search) query.append("keyword", params.search);

    const response = await apiClient.get(`/v1/customers?${query.toString()}`);
    return response.data;
  },
};
