import { Button, Descriptions, Flex, Modal, Pagination, Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { fetchOrders } from './order.service';
import { useQuery } from '@tanstack/react-query';
import type { OrdersResponse, OrderType, ProductInOrder } from './order.type';
import { useNavigate, useSearchParams } from 'react-router';
import { useState } from 'react';
import { EyeOutlined } from '@ant-design/icons';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const page = params.get('page');
  const limit = params.get('limit');
  const int_page = page ? parseInt(page) : 1;
  const int_limit = limit ? parseInt(limit) : 10;

  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  const queryOrders = useQuery<OrdersResponse, Error>({
    queryKey: ['orders', int_page, int_limit],
    queryFn: () => fetchOrders(int_page, int_limit)
  });

  const handleViewDetail = (record: OrderType) => {
    setSelectedOrder(record);
    setIsModalDetailOpen(true);
  };

  const handleModalDetailCancel = () => {
    setIsModalDetailOpen(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'WAITING CONFIRMATION': 'orange',
      'CONFIRMED': 'blue',
      'SHIPPING': 'cyan',
      'COMPLETED': 'green',
      'CANCELLED': 'red',
    };
    return statusColors[status] || 'default';
  };

  const columns: TableProps<OrderType>['columns'] = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      width: 100,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div>{`${record.customer_id.first_name} ${record.customer_id.last_name}`}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.customer_id.email}</div>
        </div>
      ),
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'payment_type',
      key: 'payment_type',
    },
    {
      title: 'Shipping Address',
      key: 'shipping',
      render: (_, record) => (
        <div>
          {record.shipping_address}, {record.shipping_city}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  const productColumns: TableProps<ProductInOrder>['columns'] = [
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Discount (%)',
      dataIndex: 'discount',
      key: 'discount',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      render: (_, record) => {
        const subtotal = record.price * record.quantity * (1 - record.discount / 100);
        return `$${subtotal.toFixed(2)}`;
      },
    },
  ];

  const calculateTotal = (order: OrderType) => {
    return order.order_details.reduce((total, item) => {
      return total + (item.price * item.quantity * (1 - item.discount / 100));
    }, 0);
  };

  return (
    <>
      <Flex justify='space-between' align='center'>
        <h1>Order List</h1>
      </Flex>

      <Table<OrderType>
        key={'_id'}
        loading={queryOrders.isLoading}
        columns={columns}
        dataSource={queryOrders.data?.orders || []}
        pagination={false}
      />

      <div style={{ textAlign: 'right', marginTop: 30 }}>
        <Pagination
          defaultCurrent={1}
          current={int_page}
          total={queryOrders.data?.totalRecords || 0}
          showSizeChanger={false}
          pageSize={int_limit}
          onChange={(page, pageSize) => {
            navigate(`?page=${page}&limit=${pageSize}`);
          }}
          showQuickJumper
          showTotal={(total) => `Total ${total} items`}
        />
      </div>

      <Modal
        title={`Order Details - #${selectedOrder?.order_id}`}
        open={isModalDetailOpen}
        onCancel={handleModalDetailCancel}
        footer={[
          <Button key="close" onClick={handleModalDetailCancel}>
            Close
          </Button>
        ]}
        width={900}
      >
        {selectedOrder && (
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Order ID" span={2}>
                #{selectedOrder.order_id}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <Tag color={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {new Date(selectedOrder.order_date).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Required Date">
                {new Date(selectedOrder.required_date).toLocaleDateString()}
              </Descriptions.Item>
              {selectedOrder.shipped_date && (
                <Descriptions.Item label="Shipped Date" span={2}>
                  {new Date(selectedOrder.shipped_date).toLocaleDateString()}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Payment Type" span={2}>
                {selectedOrder.payment_type}
              </Descriptions.Item>
              <Descriptions.Item label="Customer" span={2}>
                {`${selectedOrder.customer_id.first_name} ${selectedOrder.customer_id.last_name}`}
                <br />
                Email: {selectedOrder.customer_id.email}
                <br />
                Phone: {selectedOrder.customer_id.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Employee" span={2}>
                {`${selectedOrder.employee_id.first_name} ${selectedOrder.employee_id.last_name}`}
                <br />
                Email: {selectedOrder.employee_id.email}
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Address" span={2}>
                {selectedOrder.shipping_address}, {selectedOrder.shipping_city}
              </Descriptions.Item>
              {selectedOrder.description && (
                <Descriptions.Item label="Description" span={2}>
                  {selectedOrder.description}
                </Descriptions.Item>
              )}
            </Descriptions>

            <h3>Order Items</h3>
            <Table<ProductInOrder>
              columns={productColumns}
              dataSource={selectedOrder.order_details}
              pagination={false}
              size="small"
              rowKey="_id"
            />

            <div style={{ textAlign: 'right', marginTop: 20, fontSize: 16, fontWeight: 'bold' }}>
              Total: ${calculateTotal(selectedOrder).toFixed(2)}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default OrdersPage;
