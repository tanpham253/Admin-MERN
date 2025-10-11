import apiClient from "../../libs/axiosClient";
import type { OrdersResponse } from "./order.type";

export const fetchOrders = async (
  page: number,
  limit = 10,
  order_status?: number,
  keyword?: string
): Promise<OrdersResponse> => {
  const params: Record<string, any> = { page, limit };

  if (order_status) params.order_status = order_status;
  if (keyword) params.keyword = keyword;

  const response = await apiClient.get("/v1/orders", { params });
  return response.data;
};

export const updateOrderStatus = async (id: string, status: number) => {
  const payload: Record<string, any> = { order_status: status };
  if (status === 11) {
    payload.completed_date = new Date().toISOString();
  }
  const response = await apiClient.put(`/v1/orders/${id}`, payload);
  return response.data;
};
