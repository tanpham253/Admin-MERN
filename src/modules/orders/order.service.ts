import apiClient from "../../libs/axiosClient";
import type { OrdersResponse } from "./order.type";

export const fetchOrders = async (page: number, limit = 10): Promise<OrdersResponse> => {
  const response = await apiClient.get(`/v1/orders?page=${page}&limit=${limit}`);
  return response.data;
};

export const updateOrderStatus = async (id: string, status: number) => {
  const payload: Record<string, any> = {
    order_status: status,
  };

  // ✅ if user selects "Completed" (11), add completed_date
  if (status === 11) {
    payload.completed_date = new Date().toISOString();
  }

  const response = await apiClient.put(`/v1/orders/${id}`, payload);
  return response.data;
};