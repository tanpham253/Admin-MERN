import apiClient from "../../libs/axiosClient";
import type { CategoryType, ProductType } from "./product.type";


export const fetchCategories = async (): Promise<CategoryType[]> => {
 const response = await apiClient.get(`/v1/categories`);
 return response.data
};

export const fetchBrands = async (): Promise<any> => {
  const response = await apiClient.get(`/v1/brands`);
  console.log("DEBUG brands raw response =>", response);
  return response;
};

//Hàm get Sản phẩm
// export const fetchProducts = async (page: number, limit = 10) => {
//    const response = await apiClient.get(`/v1/products?page=${page}&limit=${limit}`);
//    return response.data
// };

// get and search
export const fetchProducts = async (page: number, limit = 10, keyword = '') => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (keyword) params.append('keyword', keyword);
  const response = await apiClient.get(`/v1/products?${params.toString()}`);
  return response.data;
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


export const fetchCreate = async (formData: any) => {
   const response = await apiClient.post(`/v1/products`, formData, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
   });
   return response.data
};
