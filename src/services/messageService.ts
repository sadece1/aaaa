import api from './api';
import { Message, PaginatedResponse } from '@/types';

// Helper function to transform backend message to frontend format
const transformMessage = (msg: any): Message => ({
  id: msg.id,
  name: msg.name,
  email: msg.email,
  subject: msg.subject,
  message: msg.message,
  read: msg.read === true || msg.read === 1 || msg.read === '1' || String(msg.read).toLowerCase() === 'true',
  createdAt: msg.created_at || msg.createdAt || new Date().toISOString(),
  updatedAt: msg.updated_at || msg.updatedAt,
});

// REMOVED: All mock data and localStorage - now using backend API only

export const messageService = {
  async getMessages(page = 1): Promise<PaginatedResponse<Message>> {
      const response = await api.get<PaginatedResponse<Message>>('/messages', {
        params: { page },
      });
    
    // Backend returns { success: true, data: [...], pagination: {...} }
    if ((response.data as any).success && (response.data as any).data) {
      return {
        data: (response.data as any).data.map(transformMessage),
        total: (response.data as any).pagination?.total || (response.data as any).data.length,
        page: (response.data as any).pagination?.page || page,
        limit: (response.data as any).pagination?.limit || 20,
        totalPages: (response.data as any).pagination?.totalPages || Math.ceil(((response.data as any).pagination?.total || (response.data as any).data.length) / 20),
      };
    }
    
    // If response is not in expected format, try to transform it
    if (Array.isArray((response.data as any).data)) {
      return {
        ...response.data,
        data: (response.data as any).data.map(transformMessage),
      };
    }
    
    return response.data;
  },

  async getMessageById(id: string): Promise<Message> {
    const response = await api.get<{ success: boolean; data: Message } | Message>(`/messages/${id}`);
    
    // Backend returns { success: true, data: message }
    if ((response.data as any).success && (response.data as any).data) {
      return transformMessage((response.data as any).data);
    }
    
    return transformMessage(response.data as any);
  },

  async markAsRead(id: string): Promise<Message> {
    const response = await api.patch<{ success: boolean; data: Message } | Message>(`/messages/${id}/read`);
    
    // Backend returns { success: true, data: message }
    if ((response.data as any).success && (response.data as any).data) {
      return transformMessage((response.data as any).data);
    }
    
    return transformMessage(response.data as any);
  },

  async deleteMessage(id: string): Promise<void> {
      await api.delete(`/messages/${id}`);
  },
};
