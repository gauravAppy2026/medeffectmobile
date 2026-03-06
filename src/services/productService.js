import api from './api';

export const productService = {
  getProducts: () => api.get('/products'),
};
