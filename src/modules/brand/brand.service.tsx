import apiClient from "../../libs/axiosClient";
import type { BrandType, BrandResponse } from "./brand.type";

// === FETCH ALL
export const fetchBrands = async (
  page = 1,
  limit = 5,
  keyword = ""
): Promise<BrandResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), keyword });
  const data: BrandResponse = await apiClient.get(`/v1/brands?${params.toString()}`);
  console.log("DEBUG fetched brands =>", `/v2/brands?${params.toString()}`);
  return data;
};

// === CREATE
export const fetchCreateBrand = async (formData: BrandType) => {
  const response = await apiClient.post(`/v2/brands`, formData);
  return response.data;
};

// === UPDATE
export const fetchUpdateBrand = async (data: { id: string; formData: BrandType }) => {
  const { id, formData } = data;
  const response = await apiClient.put(`/v2/brands/${id}`, formData);
  return response.data;
};

// === DELETE
export const fetchDeleteBrand = async (id: string) => {
  const response = await apiClient.delete(`/v2/brands/${id}`);
  return response.data;
};
