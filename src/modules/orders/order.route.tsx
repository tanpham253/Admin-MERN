import { ShoppingOutlined } from "@ant-design/icons";
import type { RouteItem } from "../../routes";
import OrdersPage from "./OrdersPage";

export const routesOrders: RouteItem[] = [
  {
    path: '/orders',
    label: 'Orders',
    key: 'orders',
    icon: <ShoppingOutlined />,
    element: <OrdersPage />,
    isShowMenu: true,
    isPrivate: true,
    roles: ['admin', 'staff'],
    permissions: ['order.view'],
  },
];
