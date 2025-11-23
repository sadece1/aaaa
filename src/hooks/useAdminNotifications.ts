import { useEffect, useState } from 'react';
import { useMessageStore } from '@/store/messageStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useNewsletterStore } from '@/store/newsletterStore';
import { userOrderService } from '@/services/userOrderService';
import { authService } from '@/services/authService';

interface NotificationCounts {
  users: number;
  orders: number;
  messages: number;
  newsletters: number;
  appointments: number;
}

export const useAdminNotifications = () => {
  const { messages, fetchMessages } = useMessageStore();
  const { appointments, fetchAppointments } = useAppointmentStore();
  const { subscriptions, fetchSubscriptions } = useNewsletterStore();
  const [counts, setCounts] = useState<NotificationCounts>({
    users: 0,
    orders: 0,
    messages: 0,
    newsletters: 0,
    appointments: 0,
  });

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Load messages to get unread count
        await fetchMessages(1);
        
        // Load appointments to get pending count
        await fetchAppointments(1);
        
        // Load newsletters to get new subscriptions (last 24 hours)
        await fetchSubscriptions(1);
        
        // Load pending orders
        try {
          const orders = await userOrderService.getOrders();
          const pendingOrders = Array.isArray(orders) 
            ? orders.filter((order: any) => order.status === 'pending' || order.status === 'processing')
            : [];
          setCounts(prev => ({ ...prev, orders: pendingOrders.length }));
        } catch (error) {
          console.error('Failed to load pending orders:', error);
        }
        
        // Load new users (last 24 hours)
        try {
          const users = await authService.getAllUsers();
          const now = new Date();
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const newUsers = Array.isArray(users) 
            ? users.filter((user: any) => {
                const createdAt = new Date(user.createdAt || user.created_at);
                return createdAt >= yesterday;
              }).length
            : 0;
          setCounts(prev => ({ ...prev, users: newUsers }));
        } catch (error) {
          console.error('Failed to load new users:', error);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchMessages, fetchAppointments, fetchSubscriptions]);

  // Update counts when data changes
  useEffect(() => {
    const unreadMessages = messages.filter(m => !m.read).length;
    const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
    
    // New newsletters (last 24 hours)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const newNewsletters = subscriptions.filter((sub: any) => {
      const createdAt = new Date(sub.createdAt || sub.created_at);
      return createdAt >= yesterday;
    }).length;

    setCounts(prev => ({
      ...prev,
      messages: unreadMessages,
      appointments: pendingAppointments,
      newsletters: newNewsletters,
    }));
  }, [messages, appointments, subscriptions]);

  return counts;
};

