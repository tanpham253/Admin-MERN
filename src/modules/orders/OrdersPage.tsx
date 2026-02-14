// ✅ ĐÃ FIX NÚT REFRESH + MẶC ĐỊNH STATUS = PENDING
import apiClient from "../../libs/axiosClient";
import {
  Button,
  Descriptions,
  Flex,
  Input,
  message,
  Modal,
  Pagination,
  Space,
  Table,
  Tag,
  DatePicker,
  Select,
} from "antd";
import type { TableProps } from "antd";
import { EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrders, updateOrderStatus } from "./order.service";
import type { OrdersResponse, OrderType, ProductInOrder } from "./order.type";

const { RangePicker } = DatePicker;

const OrdersPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const page = params.get("page");
  const limit = params.get("limit");
  const statusParam = params.get("status");

  const int_page = page ? parseInt(page) : 1;
  const int_limit = limit ? parseInt(limit) : 10;

  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  // ==========================
  // DEFAULT: status = Pending (1)
  // ==========================
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    statusParam ? parseInt(statusParam) : 1
  );
  const [keyword, setKeyword] = useState<string>("");
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  const queryClient = useQueryClient();

  const queryOrders = useQuery({
    queryKey: ["orders", int_page, int_limit],
    queryFn: () => fetchOrders(int_page, int_limit),
  });

  // Nếu không có param status => set luôn status=1 lên URL
  useEffect(() => {
    if (!statusParam) {
      navigate(`?page=1&limit=${int_limit}&status=1`, { replace: true });
    }
  }, [statusParam, int_limit, navigate]);

  const handleViewDetail = (record: OrderType) => {
    setSelectedOrder(record);
    setIsModalDetailOpen(true);
  };

  const handleModalDetailCancel = () => {
    setIsModalDetailOpen(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: number) => {
    const colors: Record<number, string> = {
      1: "#FFB945",
      2: "#5B8FF9",
      3: "#E86452",
      4: "#A97BF9",
      5: "#5AD8A6",
      6: "#FF9845",
      7: "#5B8FF9",
      8: "#F6BD16",
      9: "#1E9493",
      10: "#FF99C3",
      11: "#3de400ff",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status: number) => {
    const labels: Record<number, string> = {
      1: "Pending",
      2: "Confirmed",
      3: "Canceled",
      4: "Preparing Shipping",
      5: "Shipping",
      6: "Shipping Canceled",
      7: "Shipped",
      8: "Pending Payment",
      9: "Paid",
      10: "Refunded",
      11: "Completed",
    };
    return labels[status] || "Unknown";
  };

  const getPaymentTypeLabel = (type: number | string | undefined) => {
    const num = typeof type === "string" ? parseInt(type, 10) : type;
    const map: Record<number, string> = {
      1: "Cash",
      2: "Credit Card",
      3: "Bank Transfer",
      4: "E-Wallet",
    };
    return typeof num === "number" && !isNaN(num) ? map[num] || "Unknown" : "Unknown";
  };

  const orderStatusOptions: { value: number; label: string }[] = [
    { value: 1, label: "Pending" },
    { value: 2, label: "Confirmed" },
    { value: 3, label: "Canceled" },
    { value: 4, label: "Preparing Shipping" },
    { value: 5, label: "Shipping" },
    { value: 6, label: "Shipping Canceled" },
    { value: 7, label: "Shipped" },
    { value: 8, label: "Pending Payment" },
    { value: 9, label: "Paid" },
    { value: 10, label: "Refunded" },
    { value: 11, label: "Completed" },
  ];

  const mutationUpdateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      message.success("Order status updated!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      message.error("Failed to update order status");
    },
  });

  const columns: TableProps<OrderType>["columns"] = [
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div>
          <div>{`${record.first_name || ""} ${record.last_name || ""}`}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: "Order Date",
      dataIndex: "order_date",
      key: "order_date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "order_status",
      key: "order_status",
      render: (status: number) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Payment Type",
      dataIndex: "payment_type",
      key: "payment_type",
      render: (type: number) => getPaymentTypeLabel(type),
    },
    {
      title: "Customer Number",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Shipping Address",
      dataIndex: "street",
      key: "street",
      render: (_, record) => (
        <div>
          {record.street}, {record.city}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  const productColumns: TableProps<ProductInOrder>["columns"] = [
    {
      title: "Product Name",
      dataIndex: ["product_id", "product_name"],
      key: "product_name",
      render: (_, record) => record.product_id?.product_name || "N/A",
    },
    {
      title: "Price",
      dataIndex: ["product_id", "price"],
      key: "price",
      render: (_, record) => `$${(record.product_id?.price || 0).toFixed(2)}`,
    },
    {
      title: "Discount (%)",
      dataIndex: "discount",
      key: "discount",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
  ];

  // ===== FRONTEND FILTERING =====
  const rawOrders = queryOrders.data?.orders || [];

  const filteredOrders = rawOrders.filter((order) => {
    let matchKeyword = true;
    if (keyword) {
      const key = keyword.toLowerCase();
      matchKeyword =
        (order.first_name || "").toLowerCase().includes(key) ||
        (order.last_name || "").toLowerCase().includes(key) ||
        (order.email || "").toLowerCase().includes(key) ||
        (order.phone || "").toLowerCase().includes(key);
    }

    let matchStatus = true;
    if (statusFilter !== undefined && statusFilter !== null) {
      matchStatus = order.order_status === statusFilter;
    }

    let matchDate = true;
    if (startDate && endDate) {
      const orderMs = dayjs(order.order_date).valueOf();
      const startMs = dayjs(startDate).startOf("day").valueOf();
      const endMs = dayjs(endDate).endOf("day").valueOf();
      matchDate = orderMs >= startMs && orderMs <= endMs;
    }

    return matchKeyword && matchStatus && matchDate;
  });

  // ✅ Refresh thật sự reset tất cả filter + refetch
  const handleRefresh = () => {
    setKeyword("");
    setStatusFilter(1); // ✅ reset về Pending luôn
    setStartDate(undefined);
    setEndDate(undefined);
    navigate(`?page=1&limit=${int_limit}&status=1`);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    message.success("Page refreshed successfully!");
  };

  return (
    <>
      <Flex justify="space-between" align="center">
        <h1>Order List</h1>
        <Space>
          <Input
            placeholder="Search by Name, Email, or Phone"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => queryClient.invalidateQueries({ queryKey: ["orders"] })}
            allowClear
            style={{ width: 300 }}
          />

          <RangePicker
            style={{ width: 260 }}
            onChange={(dates) => {
              if (dates && dates.length === 2) {
                setStartDate(dayjs(dates[0]).format("YYYY-MM-DD"));
                setEndDate(dayjs(dates[1]).format("YYYY-MM-DD"));
              } else {
                setStartDate(undefined);
                setEndDate(undefined);
              }
            }}
            value={
              startDate && endDate
                ? [dayjs(startDate, "YYYY-MM-DD"), dayjs(endDate, "YYYY-MM-DD")]
                : undefined
            }
          />

          <Select
            allowClear
            placeholder="Filter by Status"
            style={{ width: 200 }}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={orderStatusOptions.map((opt) => ({
              value: opt.value,
              label: (
                <span key={opt.value}>
                  <Tag color={getStatusColor(opt.value)}>{opt.label}</Tag>
                </span>
              ),
            }))}
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={queryOrders.isFetching}
          >
            Refresh
          </Button>
        </Space>
      </Flex>

      <Table<OrderType>
        rowKey="_id"
        loading={queryOrders.isLoading}
        columns={columns}
        dataSource={filteredOrders}
        pagination={false}
      />

      <div style={{ textAlign: "right", marginTop: 30 }}>
        <Pagination
          current={int_page}
          total={queryOrders.data?.totalRecords || 0}
          pageSize={int_limit}
          showSizeChanger={false}
          onChange={(page, pageSize) =>
            navigate(`?page=${page}&limit=${pageSize}&status=${statusFilter || 1}`)
          }
          showTotal={(total) => `Total ${total} orders`}
        />
      </div>

      <Modal
        title={`Order Details - #${selectedOrder?._id}`}
        open={isModalDetailOpen}
        onCancel={handleModalDetailCancel}
        footer={[<Button key="close" onClick={handleModalDetailCancel}>Close</Button>]}
        width={900}
      >
        {selectedOrder && (
          <div style={{ maxHeight: 500, overflowY: "auto" }}>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Order ID" span={2}>
                #{selectedOrder._id}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <Select
                  style={{ width: 220 }}
                  value={selectedOrder.order_status}
                  disabled={
                    selectedOrder.order_status === 3 ||
                    selectedOrder.order_status === 11
                  }
                  onChange={(newStatus) => {
                    if (!selectedOrder?._id) return;
                    mutationUpdateStatus.mutate({
                      id: selectedOrder._id,
                      status: newStatus,
                    });
                    setSelectedOrder({
                      ...selectedOrder,
                      order_status: newStatus,
                    });
                  }}
                  options={orderStatusOptions.map((opt) => ({
                    value: opt.value,
                    label: (
                      <span key={opt.value}>
                        <Tag color={getStatusColor(opt.value)}>{opt.label}</Tag>
                      </span>
                    ),
                  }))}
                />
              </Descriptions.Item>

              <Descriptions.Item label="Order Date">
                {new Date(selectedOrder.order_date).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Completed Date">
                {selectedOrder.completed_date
                  ? new Date(selectedOrder.completed_date).toLocaleDateString()
                  : "N/A"}
              </Descriptions.Item>

              {selectedOrder.shipping_date && (
                <Descriptions.Item label="Shipped Date" span={2}>
                  {new Date(selectedOrder.shipping_date).toLocaleDateString()}
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Payment Type" span={2}>
                {getPaymentTypeLabel(selectedOrder.payment_type)}
              </Descriptions.Item>

              <Descriptions.Item label="Customer" span={2}>
                {`${selectedOrder.first_name} ${selectedOrder.last_name}`}
                <br />
                Email: {selectedOrder.email}
                <br />
                Phone: {selectedOrder.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Staff" span={2}>
                {`${selectedOrder.staff_id?.first_name || "N/A"} ${
                  selectedOrder.staff_id?.last_name || ""
                }`}
                <br />
                Email: {selectedOrder.staff_id?.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Address" span={2}>
                {selectedOrder.street}, {selectedOrder.city}
              </Descriptions.Item>
            </Descriptions>

            <h3>Order Items</h3>
            <Table<ProductInOrder>
              columns={productColumns}
              dataSource={selectedOrder.order_items}
              pagination={false}
              size="small"
              rowKey="_id"
            />

            {selectedOrder.order_items && (
              <div style={{ textAlign: "right", marginTop: 10, fontWeight: 600 }}>
                Total: $
                {selectedOrder.order_items
                  .reduce((sum, item) => {
                    const price = item.product_id?.price || 0;
                    const discount = item.discount || 0;
                    const quantity = item.quantity || 0;
                    const discountedPrice = price * (1 - discount / 100);
                    return sum + discountedPrice * quantity;
                  }, 0)
                  .toFixed(2)}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default OrdersPage;
