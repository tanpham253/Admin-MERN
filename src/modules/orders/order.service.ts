import apiClient from "../../libs/axiosClient";
import type { OrdersResponse, OrderType } from "./order.type";

/* === Fetch Orders (with pagination, filter, search, date range) === */
export const fetchOrders = async (
  page: number,
  limit: number,
  order_status?: number,
  keyword?: string,
  startDate?: string,
  endDate?: string
): Promise<OrdersResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (order_status) params.append("order_status", String(order_status));
  if (keyword) params.append("keyword", keyword);
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  const response = await apiClient.get(`/v1/orders?${params.toString()}`);
  return response.data;
};

/* === Fetch Single Order === */
export const fetchOrderById = async (id: string): Promise<OrderType> => {
  const response = await apiClient.get(`/v1/orders/${id}`);
  return response.data;
};

/* === Update Order Status === */
export const updateOrderStatus = async (id: string, status: number) => {
  const response = await apiClient.put(`/v1/orders/${id}`, {
    order_status: status,
  });
  return response.data;
};

/* === Delete Order (only if canceled) === */
export const deleteOrder = async (id: string) => {
  const response = await apiClient.delete(`/v1/orders/${id}`);
  return response.data;
};

/* === Create Order === */
export const createOrder = async (data: any) => {
  const response = await apiClient.post(`/v1/orders`, data);
  return response.data;
};
