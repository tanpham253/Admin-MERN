import { TeamOutlined } from "@ant-design/icons";
import type { RouteItem } from "../../routes";
import RolesPage from "./role.route";

export const routesRoles: RouteItem[] = [
  {
    path: "/roles",
    label: "Roles",
    key: "roles",
    icon: <TeamOutlined />,
    element: <RolesPage />,
    isShowMenu: true,
    isPrivate: true,
    roles: ["admin"],
    permissions: ["role.view"],
  },
];
