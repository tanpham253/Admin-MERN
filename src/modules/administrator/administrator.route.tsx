import { UserAddOutlined, UsergroupAddOutlined, UserOutlined } from "@ant-design/icons";
import type { RouteItem } from "../../routes";
import UserListPage from "./pages/UserListPage";
import CustomerListPage from "./pages/CustomerListPage";

export const routesAdministrator: RouteItem[] = [
  {
    path: '/administrators',
    label: 'Administrators',
    key: 'administrators',
    icon: <UserOutlined />,
    isShowMenu: true,
    isPrivate: true,
    roles: ['admin'],
    permissions: ['customers.view', 'users.view'],
    children: [
      {
        path: '/administrators/users',
        label: 'Users',
        icon: <UserAddOutlined />,
        key: 'administrators-users',
        element: <UserListPage />,
        isShowMenu: true,
        isPrivate: true,
        roles: ['admin'],
        permissions: ['users.view'],
      },
      {
        path: '/administrators/customers',
        label: 'Customers',
        icon: <UsergroupAddOutlined />,
        key: 'administrators-customers',
        element: <CustomerListPage />,
        isShowMenu: true,
        isPrivate: true,
        roles: ['admin'],
        permissions: ['customers.view'],
      },
    ],
  },
]