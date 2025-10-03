import apiClient from "../../libs/axiosClient";
import type { OrdersResponse } from "./order.type";

export const fetchOrders = async (page: number, limit = 10): Promise<OrdersResponse> => {
  const response = await apiClient.get(`/v1/orders?page=${page}&limit=${limit}`);
  return response.data;
};
