import api from './api';
import { UserOrder, UserOrderForm } from '@/types';

const USER_ORDERS_STORAGE_KEY = 'camp_user_orders_storage';

const loadOrders = (): UserOrder[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(USER_ORDERS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load user orders:', error);
  }
  return [];
};

const saveOrders = (orders: UserOrder[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_ORDERS_STORAGE_KEY, JSON.stringify(orders));
    }
  } catch (error) {
    console.error('Failed to save user orders:', error);
  }
};

export const userOrderService = {
  async createOrder(data: UserOrderForm): Promise<UserOrder> {
    try {
      const response = await api.post<{ success: boolean; data: UserOrder }>('/user-orders', data);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to create order');
    } catch (error) {
      // Fallback: save to localStorage
      const newOrder: UserOrder = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const orders = loadOrders();
      orders.unshift(newOrder);
      saveOrders(orders);
      
      return newOrder;
    }
  },

  async getOrders(userId?: string): Promise<UserOrder[]> {
    try {
      const response = await api.get<{ success: boolean; data: UserOrder[] }>('/user-orders', { params: { userId } });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      // Fallback: load from localStorage
      const orders = loadOrders();
      if (userId) {
        return orders.filter(order => order.userId === userId);
      }
      return orders;
    }
  },

  async getOrderById(id: string): Promise<UserOrder> {
    try {
      const response = await api.get<{ success: boolean; data: UserOrder }>(`/user-orders/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Order not found');
    } catch (error) {
      // Fallback: load from localStorage
      const orders = loadOrders();
      const order = orders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return order;
    }
  },

  async updateOrder(id: string, data: Partial<UserOrderForm>): Promise<UserOrder> {
    try {
      const response = await api.put<{ success: boolean; data: UserOrder }>(`/user-orders/${id}`, data);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to update order');
    } catch (error) {
      // Fallback: update in localStorage
      const orders = loadOrders();
      const orderIndex = orders.findIndex(o => o.id === id);
      if (orderIndex === -1) throw new Error('Order not found');
      
      const updatedOrder: UserOrder = {
        ...orders[orderIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      orders[orderIndex] = updatedOrder;
      saveOrders(orders);
      
      return updatedOrder;
    }
  },

  async deleteOrder(id: string): Promise<void> {
    try {
      await api.delete(`/user-orders/${id}`);
    } catch (error) {
      // Fallback: delete from localStorage
      const orders = loadOrders();
      const filtered = orders.filter(o => o.id !== id);
      saveOrders(filtered);
    }
  },
};





