import React from "react";
import { Card, Row, Col, Statistic, Table } from "antd";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "../orders/order.service";
import { Pie, Line } from "@ant-design/plots";
import { columns } from "./dashboard.type";

// === color map for order_status ===
// === color map for order_status ===
const statusColorMap: Record<number, string> = {
  1: "#FFB945", // Pending → Sunset Orange
  2: "#5B8FF9", // Confirmed → Geek Blue
  3: "#E86452", // Canceled → Dust Red
  4: "#A97BF9", // Preparing → Golden Purple
  5: "#5AD8A6", // Shipping → Cyan
  6: "#FF9845", // Cancel Shipping → Sunrise Orange
  7: "#5B8FF9", // Shipped → Daybreak Blue (same hue as Geek Blue)
  8: "#F6BD16", // Pending Paid → Sunrise Yellow
  9: "#1E9493", // Paid → Dark Green
  10: "#FF99C3", // Refund → Magenta
  11: "#3de400ff", // Finished → green
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

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["orders", 1],
    queryFn: () => fetchOrders(1, 100),
  });

  if (isLoading) return <div>Loading dashboard...</div>;

  const orders = data?.orders || [];
  const totalOrders = orders.length;

  // === Total revenue ===
  const totalRevenue = orders.reduce((sum, order) => {
    return (
      sum +
      order.order_items.reduce(
        (acc, item) => acc + (item.product_id?.price ?? 0) * item.quantity,
        0
      )
    );
  }, 0);

  // === Count orders by status ===
  const statusCounts: Record<number, number> = {};
  for (const order of orders) {
    statusCounts[order.order_status] =
      (statusCounts[order.order_status] ?? 0) + 1;
  }

  // === Transform into chart-friendly data ===
  const statusData = Object.entries(statusCounts)
    .filter(([key]) => Number(key) !== 11) // exclude "Finished"
    .map(([key, value]) => ({
      type: statusLabelMap[Number(key)] || `Status ${key}`,
      value,
      color: statusColorMap[Number(key)] || "gray",
    }));

  // === Line chart data ===
  const lineData = orders.map((order) => ({
    date: new Date(order.order_date).toLocaleDateString(),
    value: order.order_items.reduce(
      (acc, item) => acc + (item.product_id?.price ?? 0) * item.quantity,
      0
    ),
  }));

  // === Compute total non-finished orders ===
  const totalActiveOrders = statusData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Orders" value={totalOrders} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Finished Orders"
              value={statusCounts[11] ?? 0}
              valueStyle={{ color: statusColorMap[11] }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={statusCounts[1] ?? 0}
              valueStyle={{ color: statusColorMap[1] }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              prefix="$"
              value={totalRevenue.toFixed(2)}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Orders by Status">
            <Pie
              data={statusData}
              angleField="value"
              colorField="type"
              innerRadius={0.6}
              scale={{
                color: {
                  range: statusData.map((d) => d.color),
                },
              }}
              legend={{
                color: {
                  position: "bottom",
                },
              }}
              label={{
                text: "value",
                style: {
                  fontWeight: "bold",
                  fill: "#fff",
                },
              }}
              annotations={[
                {
                  type: "text",
                  style: {
                    text: `Total\n${totalActiveOrders}`,
                    x: "50%",
                    y: "50%",
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: "bold",
                    fill: "#8c8c8c",
                  },
                },
              ]}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Revenue Over Time">
            <Line
              data={lineData}
              xField="date"
              yField="value"
              point={{ size: 4 }}
              smooth
            />
          </Card>
        </Col>
      </Row>

      <Card title="Latest Orders" style={{ marginTop: 16 }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={orders.slice(0, 8)}
          pagination={false}
        />
      </Card>
    </div>
  );
}
