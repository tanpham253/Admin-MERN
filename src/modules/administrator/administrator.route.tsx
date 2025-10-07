import { GroupOutlined, UserOutlined } from "@ant-design/icons";
import type { RouteItem } from "../../routes";
import UserListPage from "./pages/UserListPage";

export const routesAdministrator: RouteItem[] = [
  {
    path: '/administrators',
    label: 'Administrators',
    key: 'administrators',
    icon: <UserOutlined />,
    isShowMenu: true,
    isPrivate: true,
    roles: ['admin'],
    permissions: ['roles.view', 'users.view'],
    children: [
      {
        path: '/administrators/users',
        label: 'Users',
        icon: <UserOutlined />,
        key: 'administrators-users',
        element: <UserListPage />,
        isShowMenu: true,
        isPrivate: true,
        roles: ['admin'],
        permissions: ['users.view'],
      },
      // {
      //   path: '/administrators/roles',
      //   label: 'Roles',
      //   icon: <GroupOutlined />,
      //   key: 'administrators-roles',
      //   element: <RoleList />,
      //   isShowMenu: true,
      //   isPrivate: true,
      //   roles: ['admin'],
      //   permissions: ['roles.view'],
      // },
    ],
  },
]