import { fetchAPI } from '../utils/api.js';

export const productService = {
  async getProducts() {
    return await fetchAPI('/productos');
  },
};
