import React from "react";
import { Card, Col, Row, Statistic, Table, Typography, Tag, Space } from "antd";
import { Line, Pie } from "@ant-design/plots";
import { useQuery } from "@tanstack/react-query";
import { fetchOrders, fetchOrderStats } from "./dashboard.service";
import type { OrderType } from "../orders/order.type";
import { TeamOutlined } from "@ant-design/icons";

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchOrders(1, 10),
  });

  const { data: stats } = useQuery({
    queryKey: ["orderStats"],
    queryFn: fetchOrderStats,
  });

  const totalOrders = ordersData?.totalRecords ?? 0;
  const completed =
    ordersData?.orders.filter((o) => Number(o.order_status) === 9).length ?? 0;
  const pending =
    ordersData?.orders.filter((o) => Number(o.order_status) === 1).length ?? 0;
  const cancelled =
    ordersData?.orders.filter((o) => Number(o.order_status) === 3).length ?? 0;

  const columns = [
    {
      title: "Customer",
      render: (r: OrderType) => `${r.first_name} ${r.last_name}`,
    },
    { title: "Email", dataIndex: "email" },
    { title: "City", dataIndex: "city" },
    {
  title: "Status",
  dataIndex: "order_status",
  render: (s: number) => {
    const statusMap: Record<number, { text: string; color: string }> = {
      1: { text: "Pending", color: "#FFB945" }, // Sunset Orange
      2: { text: "Confirmed", color: "#5B8FF9" }, // Geek Blue
      3: { text: "Canceled", color: "#E86452" }, // Dust Red
      4: { text: "Preparing", color: "#A97BF9" }, // Golden Purple
      5: { text: "Shipping", color: "#5AD8A6" }, // Cyan
      6: { text: "Cancel Shipping", color: "#FF9845" }, // Sunrise Orange
      7: { text: "Shipped", color: "#5B8FF9" }, // Daybreak Blue
      8: { text: "Pending Paid", color: "#F6BD16" }, // Sunrise Yellow
      9: { text: "Paid", color: "#1E9493" }, // Dark Green
      10: { text: "Refund", color: "#FF99C3" }, // Magenta
      11: { text: "Finished", color: "#3de400ff" }, // Green
    };

    const current = statusMap[s] || { text: `Unknown (${s})`, color: "default" };
    return <Tag color={current.color}>{current.text}</Tag>;
  },
},

    {
      title: "Order Date",
      dataIndex: "order_date",
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
          <Space align="center" size="middle">
            <TeamOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                DashBoard
              </Title>
              <Typography.Text type="secondary">
                View and orders and .....
              </Typography.Text>
            </div>
          </Space>
        </Card>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Orders" value={totalOrders} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Completed" value={completed} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Pending" value={pending} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Cancelled" value={cancelled} />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={16}>
          <Card title="Orders Over Time">
            <Line
              data={stats?.lineData ?? []}
              xField="date"
              yField="count"
              smooth
              height={300}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Order Status Distribution">
            <Pie
              data={(stats?.pieData ?? []).filter(
                (item) =>
                  !["11", "3"].includes(item.type.replace("Status ", ""))
              )}
              angleField="value"
              colorField="type"
              radius={0.9}
              innerRadius={0.6}
              label={{
                text: "value",
                style: { fontWeight: "bold" },
              }}
              legend={{
                color: {
                  title: false,
                  position: "right",
                  rowPadding: 5,
                },
              }}
              statistic={{
                title: {
                  content: "Total Orders",
                  style: {
                    fontSize: 14,
                    fontWeight: "normal",
                    color: "#666",
                  },
                },
                content: {
                  content: `${ordersData?.totalRecords ?? 0}`,
                  style: {
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#000",
                  },
                },
              }}
              tooltip={{
                title: "type",
                items: [{ field: "value" }],
              }}
              animation={{
                appear: { animation: "wave-in", duration: 1000 },
              }}
              height={300}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card title="Recent Orders" style={{ marginTop: 24 }}>
        <Table
          loading={isLoading}
          dataSource={ordersData?.orders ?? []}
          columns={columns}
          rowKey="_id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
