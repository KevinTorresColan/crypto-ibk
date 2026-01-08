import { Api } from '../utils/api';

export const productService = () => {
  const getProducts = async () => {
    const response = await Api.get('/productos');
    return response.data;
  };

  return {
    getProducts,
  };
};
