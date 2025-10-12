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
} from "antd";
import type { TableProps } from "antd";
import { fetchOrders } from "./order.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  OrdersResponse,
  OrderType,
  ProductInOrder,
} from "./order.type";
import { useNavigate, useSearchParams } from "react-router";
import { useState } from "react";
import { EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { updateOrderStatus } from "./order.service";
import { Select } from "antd";
import type { SelectProps } from "antd";

const OrdersPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const page = params.get("page");
  const limit = params.get("limit");
  const int_page = page ? parseInt(page) : 1;
  const int_limit = limit ? parseInt(limit) : 10;

  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  // get initial status filter from URL and search
  const statusParam = params.get("status");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [keyword, setKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    statusParam ? parseInt(statusParam) : undefined
  );
  const queryOrders = useQuery({
    queryKey: ["orders", int_page, int_limit, statusFilter, keyword],
    queryFn: () => fetchOrders(int_page, int_limit, statusFilter, keyword),
  });

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
  /* ---- Complete Button ---- */
  const queryClient = useQueryClient();
  console.log("Selected order details:", selectedOrder?.order_items);

  // for drop down
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
      render: (_, record) => {
        // console.log("record", record);
        // console.log("record customer", record.customer_id);
        // console.log("record first_name", record.customer_id.first_name);

        const firstName =
          record.first_name || record.first_name || "N/A";
        const lastName =
          record.last_name || record.last_name || "";
        const email = record.email || record.email || "No email";
        const phone = record.phone || record.phone || "No phone";

        return (
          <div>
            <div>{`${firstName} ${lastName}`}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>{email}</div>
          </div>
        );
      },
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
      title: "Payment",
      dataIndex: "payment_type",
      key: "payment_type",
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
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            View Details
          </Button>

          {/* {record.order_status !== 4 && (
            <Button
              type="primary"
              onClick={() => mutationCompleteOrder.mutate(record._id)}
            >
              Complete
            </Button>
          )} */}
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
    // {
    //   title: "Subtotal",
    //   key: "subtotal",
    //   render: (_, record) => {
    //     const price = record.product_id?.price || 0;
    //     const discount = record.discount || 0;
    //     const subtotal = price * record.quantity * (1 - discount / 100);
    //     return `$${subtotal.toFixed(2)}`;
    //   },
    // },
  ];

  //   const calculateTotal = (order: OrderType) => {
  //     return order.order_items.reduce((total, item) => {
  //       return total + (item.price * item.quantity * (1 - item.discount / 100));
  //     }, 0);
  //   };

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
            onPressEnter={() => {
              navigate(`?page=1&limit=${int_limit}&keyword=${keyword}`);
              queryClient.invalidateQueries({ queryKey: ["orders"] });
            }}
            allowClear
            style={{ width: 300 }}
          />

          <Select
            allowClear
            placeholder="Filter by Status"
            style={{ width: 200 }}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              navigate(
                `?page=1&limit=${int_limit}${value ? `&status=${value}` : ""}`
              );
            }}
            options={orderStatusOptions.map((opt) => ({
              value: opt.value,
              label: (
                <span>
                  <Tag color={getStatusColor(opt.value)}>{opt.label}</Tag>
                </span>
              ),
            }))}
          />
        </Space>
      </Flex>

      <Table<OrderType>
        key={"_id"}
        loading={queryOrders.isLoading}
        columns={columns}
        dataSource={queryOrders.data?.orders || []}
        pagination={false}
      />

      <div style={{ textAlign: "right", marginTop: 30 }}>
        <Pagination
          current={int_page}
          total={queryOrders.data?.totalRecords || 0}
          pageSize={int_limit}
          showSizeChanger={false}
          onChange={(page, pageSize) => {
            navigate(`?page=${page}&limit=${pageSize}`);
          }}
          showTotal={(total) => `Total ${total} orders`}
        />
      </div>

      <Modal
        title={`Order Details - #${selectedOrder?._id}`}
        open={isModalDetailOpen}
        onCancel={handleModalDetailCancel}
        footer={[
          <Button key="close" onClick={handleModalDetailCancel}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {selectedOrder && (
          <div style={{ maxHeight: 500, overflowY: "auto" }}>
            <Descriptions
              bordered
              column={2}
              size="small"
              style={{ marginBottom: 20 }}
            >
              <Descriptions.Item label="Order ID" span={2}>
                #{selectedOrder._id}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <Select
                  style={{ width: 220 }}
                  value={selectedOrder.order_status}
                  disabled={
                    selectedOrder.order_status === 3 || // Canceled
                    selectedOrder.order_status === 11 // Completed
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
                      <span>
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
                {selectedOrder.payment_type}
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
              {/* {selectedOrder.description && (
                <Descriptions.Item label="Description" span={2}>
                  {selectedOrder.description}
                </Descriptions.Item>
              )} */}
            </Descriptions>

            <h3>Order Items</h3>
            <Table<ProductInOrder>
              columns={productColumns}
              dataSource={selectedOrder.order_items}
              pagination={false}
              size="small"
              rowKey="_id"
            />

            {/* <div style={{ textAlign: 'right', marginTop: 20, fontSize: 16, fontWeight: 'bold' }}>
              Total: ${calculateTotal(selectedOrder).toFixed(2)}
            </div> */}
          </div>
        )}
      </Modal>
    </>
  );
};

export default OrdersPage;
