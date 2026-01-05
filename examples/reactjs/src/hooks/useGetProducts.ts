import { useEffect, useState } from 'react';
import { productService } from '../services/product.service';
import type { Product } from '../interface/service';

export const useGetProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { getProducts } = productService();

  const handleProducts = (product: Product) =>
    setProducts((preV) => [...preV, product]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data.data);
    };

    fetchProducts();
  }, []);

  return { products, handleProducts };
};
