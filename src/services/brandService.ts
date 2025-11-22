// Brand Management Service
// Manages brands using backend API

import api from './api';

export interface Brand {
  id: string;
  name: string;
  logo?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Helper function to transform backend brand to frontend format
const transformBrand = (brand: any): Brand => ({
  id: brand.id,
  name: brand.name,
  logo: brand.logo || undefined,
  createdAt: brand.created_at || new Date().toISOString(),
  updatedAt: brand.updated_at || new Date().toISOString(),
});

export const brandService = {
  async getAllBrands(): Promise<Brand[]> {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>('/brands');
      
      if (response.data.success && response.data.data) {
        return response.data.data.map(transformBrand);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      return [];
    }
  },

  async getBrandById(id: string): Promise<Brand | undefined> {
    try {
      const response = await api.get<{ success: boolean; data: any }>(`/brands/${id}`);
      
      if (response.data.success && response.data.data) {
        return transformBrand(response.data.data);
      }
      
      return undefined;
    } catch (error) {
      console.error('Failed to fetch brand:', error);
      return undefined;
    }
  },

  async getBrandByName(name: string): Promise<Brand | undefined> {
    const brands = await this.getAllBrands();
    return brands.find(b => b.name.toLowerCase() === name.toLowerCase());
  },

  async createBrand(data: { name: string; logo?: string | null }): Promise<Brand> {
    try {
      const response = await api.post<{ success: boolean; data: any }>('/brands', {
        name: data.name.trim(),
        logo: data.logo || null,
      });
      
      if (response.data.success && response.data.data) {
        return transformBrand(response.data.data);
      }
      
      throw new Error('Failed to create brand');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Marka oluşturulamadı';
      throw new Error(message);
    }
  },

  async updateBrand(id: string, data: { name?: string; logo?: string | null }): Promise<Brand> {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.logo !== undefined) updateData.logo = data.logo || null;

      const response = await api.put<{ success: boolean; data: any }>(`/brands/${id}`, updateData);
      
      if (response.data.success && response.data.data) {
        return transformBrand(response.data.data);
      }
      
      throw new Error('Failed to update brand');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Marka güncellenemedi';
      throw new Error(message);
    }
  },

  async deleteBrand(id: string): Promise<void> {
    try {
      await api.delete(`/brands/${id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Marka silinemedi';
      throw new Error(message);
    }
  },
};














