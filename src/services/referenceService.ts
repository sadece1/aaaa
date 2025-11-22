import api from './api';

export interface Reference {
  id: string;
  title: string;
  image: string;
  location?: string | null;
  year?: string | null;
  description?: string | null;
  order_index: number;
  createdAt: string;
  updatedAt: string;
}

export const referenceService = {
  async getAllReferences(): Promise<Reference[]> {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>('/references');
      
      if (response.data.success && response.data.data) {
        return response.data.data.map((ref: any) => ({
          id: ref.id,
          title: ref.title,
          image: ref.image,
          location: ref.location || undefined,
          year: ref.year || undefined,
          description: ref.description || undefined,
          order_index: ref.order_index || 0,
          createdAt: ref.created_at || new Date().toISOString(),
          updatedAt: ref.updated_at || new Date().toISOString(),
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch references:', error);
      return [];
    }
  },

  async getReferenceById(id: string): Promise<Reference | null> {
    try {
      const response = await api.get<{ success: boolean; data: any }>(`/references/${id}`);
      
      if (response.data.success && response.data.data) {
        const ref = response.data.data;
        return {
          id: ref.id,
          title: ref.title,
          image: ref.image,
          location: ref.location || undefined,
          year: ref.year || undefined,
          description: ref.description || undefined,
          order_index: ref.order_index || 0,
          createdAt: ref.created_at || new Date().toISOString(),
          updatedAt: ref.updated_at || new Date().toISOString(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch reference:', error);
      return null;
    }
  },

  async createReference(data: {
    title: string;
    image: string;
    location?: string | null;
    year?: string | null;
    description?: string | null;
    order_index?: number;
  }): Promise<Reference> {
    try {
      const response = await api.post<{ success: boolean; data: any }>('/references', data);
      
      if (response.data.success && response.data.data) {
        const ref = response.data.data;
        return {
          id: ref.id,
          title: ref.title,
          image: ref.image,
          location: ref.location || undefined,
          year: ref.year || undefined,
          description: ref.description || undefined,
          order_index: ref.order_index || 0,
          createdAt: ref.created_at || new Date().toISOString(),
          updatedAt: ref.updated_at || new Date().toISOString(),
        };
      }
      
      throw new Error('Failed to create reference');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Referans oluşturulamadı';
      throw new Error(message);
    }
  },

  async updateReference(id: string, data: Partial<Reference>): Promise<Reference> {
    try {
      const backendData: any = {};
      if (data.title !== undefined) backendData.title = data.title;
      if (data.image !== undefined) backendData.image = data.image;
      if (data.location !== undefined) backendData.location = data.location || null;
      if (data.year !== undefined) backendData.year = data.year || null;
      if (data.description !== undefined) backendData.description = data.description || null;
      if (data.order_index !== undefined) backendData.order_index = data.order_index;

      const response = await api.put<{ success: boolean; data: any }>(`/references/${id}`, backendData);
      
      if (response.data.success && response.data.data) {
        const ref = response.data.data;
        return {
          id: ref.id,
          title: ref.title,
          image: ref.image,
          location: ref.location || undefined,
          year: ref.year || undefined,
          description: ref.description || undefined,
          order_index: ref.order_index || 0,
          createdAt: ref.created_at || new Date().toISOString(),
          updatedAt: ref.updated_at || new Date().toISOString(),
        };
      }
      
      throw new Error('Failed to update reference');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Referans güncellenemedi';
      throw new Error(message);
    }
  },

  async deleteReference(id: string): Promise<void> {
    try {
      await api.delete(`/references/${id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Referans silinemedi';
      throw new Error(message);
    }
  },
};

