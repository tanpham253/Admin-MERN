import { GiftOutlined } from "@ant-design/icons";
import type { RouteItem } from "../../routes";
import DiscountsPage from "./discount.route";

export const routesDiscounts: RouteItem[] = [
  {
    path: "/discounts",
    label: "Discounts",
    key: "discounts",
    icon: <GiftOutlined />,
    element: <DiscountsPage />,
    isShowMenu: true,
    isPrivate: true,
    roles: ["admin", "staff"],
    permissions: ["discount.view"],
  },
];
