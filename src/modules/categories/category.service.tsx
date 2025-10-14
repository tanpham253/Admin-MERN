import apiClient from "../../libs/axiosClient";
import type { CategoriesResponse, CategoryType } from "./category.type";

// === FETCH ALL
export const fetchCategories = async (
  page = 1,
  limit = 5,
  keyword = ""
): Promise<CategoriesResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), keyword });
  const data: CategoriesResponse = await apiClient.get(`/v1/categories?${params.toString()}`);
  console.log("DEBUG fetched categories =>", `/v2/categories?${params.toString()}`);
  console.log("DEBUG fetched categories data =>", data);
  return data;
};

// === CREATE
export const fetchCreateCategory = async (formData: CategoryType) => {
  const response = await apiClient.post(`/v2/categories`, formData);
  return response.data;
};

// === UPDATE
export const fetchUpdateCategory = async (data: { id: string; formData: CategoryType }) => {
  const { id, formData } = data;
  const response = await apiClient.put(`/v2/categories/${id}`, formData);
  return response.data;
};

// === DELETE
export const fetchDeleteCategory = async (id: string) => {
  const response = await apiClient.delete(`/v2/categories/${id}`);
  return response.data;
};
