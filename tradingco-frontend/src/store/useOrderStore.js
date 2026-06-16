import { create } from 'zustand';
import { orderApi } from '../api/orderApi';

const useOrderStore = create((set) => ({
  orders: [],
  isLoading: false,

  placeOrder: async (orderData) => {
    const { data } = await orderApi.placeOrder(orderData);
    set((state) => ({ orders: [data, ...state.orders] }));
    return data;
  },

  fetchOrders: async (accountId, filters) => {
    set({ isLoading: true });
    try {
      const { data } = await orderApi.getOrders(accountId, filters);
      set({ orders: data.content || data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  cancelOrder: async (orderId) => {
    const { data } = await orderApi.cancelOrder(orderId);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o)),
    }));
    return data;
  },

  updateOrderStatus: (orderId, updates) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o)),
    }));
  },
}));

export default useOrderStore;
