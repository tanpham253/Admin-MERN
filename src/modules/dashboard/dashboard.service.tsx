import apiClient from "../../libs/axiosClient";
import type { OrdersResponse } from "../orders/order.type";

// === Fetch orders list ===
export const fetchOrders = async (page = 1, limit = 10): Promise<OrdersResponse> => {
  const { data } = await apiClient.get("/v1/orders", {
    params: { page, limit },
  });
  return data;
};

// === Aggregate stats for dashboard (optional frontend aggregation) ===
export const fetchOrderStats = async () => {
  const { data } = await apiClient.get("/v1/orders", {
    params: { page: 1, limit: 100 },
  });

  const dailyMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};

  data.orders.forEach((order: any) => {
    const date = new Date(order.order_date).toISOString().slice(0, 10);
    dailyMap[date] = (dailyMap[date] || 0) + 1;
    const status = String(order.order_status);
    statusMap[status] = (statusMap[status] || 0) + 1;
  });

  const lineData = Object.entries(dailyMap).map(([date, count]) => ({
    date,
    count,
  }));

  const pieData = Object.entries(statusMap).map(([status, value]) => ({
    type: `Status ${status}`,
    value,
  }));

  return { lineData, pieData };
};