import type { ColumnsType } from "antd/es/table";
import type { OrderType } from "../orders/order.type";
import { Tag } from "antd";

// === color map for order_status ===
const statusColorMap: Record<number, string> = {
  1: "#FFB945", // Pending
  2: "#5B8FF9", // Confirmed
  3: "#E86452", // Canceled
  4: "#A97BF9", // Preparing
  5: "#5AD8A6", // Shipping
  6: "#FF9845", // Cancel Shipping
  7: "#5B8FF9", // Shipped
  8: "#F6BD16", // Pending Paid
  9: "#1E9493", // Paid
  10: "#FF99C3", // Refund
  11: "#3de400ff", // Finished
};

// === readable labels for statuses ===
const statusLabelMap: Record<number, string> = {
  1: "Pending",
  2: "Confirmed",
  3: "Canceled",
  4: "Preparing",
  5: "Shipping",
  6: "Cancel Shipping",
  7: "Shipped",
  8: "Pending Paid",
  9: "Paid",
  10: "Refund",
  11: "Finished",
};

export const columns: ColumnsType<OrderType> = [
  {
    title: "Customer",
    key: "customer_name",
    render: (_: unknown, record: OrderType) =>
      `${record.first_name ?? ""} ${record.last_name ?? ""}`,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Total",
    key: "total",
    render: (_: unknown, record: OrderType) => {
      const total = record.order_items.reduce((acc, item) => {
        const price = item.product_id?.price ?? 0;
        return acc + price * item.quantity;
      }, 0);
      return `$${total.toFixed(2)}`;
    },
  },
  {
    title: "Status",
    dataIndex: "order_status",
    key: "order_status",
    render: (status: number) => (
      <Tag color={statusColorMap[status] || "gray"}>
        {statusLabelMap[status] || `Status ${status}`}
      </Tag>
    ),
  },
];
