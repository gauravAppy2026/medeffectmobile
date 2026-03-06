import api from './api';

export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getStatusCounts: () => api.get('/orders/status-counts'),
};
