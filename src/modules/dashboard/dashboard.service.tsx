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

  const statusNames: Record<string, string> = {
  "1": "Pending",
  "2": "Confirmed",
  "3": "Canceled",
  "4": "Preparing",
  "5": "Shipping",
  "6": "Cancel Shipping",
  "7": "Shipped",
  "8": "Pending Paid",
  "9": "Paid",
  "10": "Refund",
  "11": "Finished",
};

const statusColors: Record<string, string> = {
  "1": "#FFB945",
  "2": "#5B8FF9",
  "3": "#E86452",
  "4": "#A97BF9",
  "5": "#5AD8A6",
  "6": "#FF9845",
  "7": "#5B8FF9",
  "8": "#F6BD16",
  "9": "#1E9493",
  "10": "#FF99C3",
  "11": "#3de400ff",
};

const pieData = Object.entries(statusMap).map(([status, value]) => ({
  type: statusNames[status] || `Unknown (${status})`,
  value,
  color: statusColors[status],
}));


  return { lineData, pieData };
};