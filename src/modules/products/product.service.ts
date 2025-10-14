import apiClient from "../../libs/axiosClient";
import type { CategoryType, ProductType } from "./product.type";
import type { BrandType } from "../brand/brand.type";


export const fetchCategories = async (): Promise<CategoryType[]> => {
 const response = await apiClient.get(`/v1/categories`);
 return response.data
};

export const fetchBrands = async (): Promise<BrandType[]> => {
  try {
    const response = await apiClient.get<BrandType[]>("/v1/brands");
    console.log("DEBUG brands raw response =>", response);
    return response;
  } catch (error) {
    console.error("❌ Error fetching brands:", error);
    throw error;
  }
};

//Hàm get Sản phẩm
export const fetchProducts = async (page: number, limit = 10) => {
   const response = await apiClient.get(`/v1/products?page=${page}&limit=${limit}`);
   return response.data
};


export const fetchDelete = async (id: string) =>{
   const response = await apiClient.delete(`/v1/products/${id}`);
  return response.data;
}

export const updateData = async (data: {id: string, formData: ProductType}) => {
   const {id, formData} = data;
  const response = await apiClient.put(`/v1/products/${id}`, formData);
   return response.data
};


export const fetchCreate = async (formData: ProductType) => {
   const response = await apiClient.post(`/v1/products`, formData, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
   });
   return response.data
};
