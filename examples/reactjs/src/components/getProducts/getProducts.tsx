import type { Product } from '../../interface/service';

interface GetProductsProps {
  products: Product[];
}

const GetProducts = ({ products }: GetProductsProps) => {
  return (
    <>
      {products?.map((product: Product, i) => (
        <div key={i}>
          <h3>{product.nombre}</h3>
          <p>Stock: {product.stock}</p>
        </div>
      ))}
    </>
  );
};

export default GetProducts;
