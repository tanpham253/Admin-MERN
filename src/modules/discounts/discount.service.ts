import apiClient from "../../libs/axiosClient";
import type { DiscountType, DiscountResponse } from "./discount.type";

// === FETCH ALL (có phân trang + tìm kiếm)
export const fetchDiscounts = async (
  page = 1,
  limit = 10,
  keyword = ""
): Promise<DiscountResponse> => {
  const params = { page, limit, keyword };
  const { data } = await apiClient.get(`/v2/discounts`, { params });
  return data;
};

// === FETCH BY ID
export const fetchDiscountById = async (id: string): Promise<DiscountType> => {
  const { data } = await apiClient.get(`/v2/discounts/${id}`);
  return data;
};

// === CREATE
export const fetchCreateDiscount = async (payload: DiscountType) => {
  const { data } = await apiClient.post(`/v2/discounts`, payload);
  return data;
};

// === UPDATE
export const fetchUpdateDiscount = async (id: string, payload: DiscountType) => {
  const { data } = await apiClient.put(`/v2/discounts/${id}`, payload);
  return data;
};

// === DELETE
export const fetchDeleteDiscount = async (id: string) => {
  const { data } = await apiClient.delete(`/v2/discounts/${id}`);
  return data;
};
