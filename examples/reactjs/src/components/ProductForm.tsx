import React, { useState } from 'react';
import type { Product } from '../interface/service';

interface ProductFormProps {
  onDataChange?: (data: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onDataChange }) => {
  const [formData, setFormData] = useState<Product>({
    nombre: '',
    stock: '',
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = {
      ...formData,
      [name]: value,
    };
    setFormData(newData);

    if (onDataChange) {
      onDataChange(newData);
    }
  };

  return (
    <article>
      <div>
        <label htmlFor="name"></label>
        <input
          onChange={handleInput}
          type="text"
          id="name"
          placeholder="Nombre del producto"
          name="nombre"
          value={formData.nombre}
        />
      </div>
      <br />
      <div>
        <label htmlFor="stock"></label>
        <input
          onChange={handleInput}
          type="tel"
          id="stock"
          placeholder="Stock del producto"
          name="stock"
          value={formData.stock}
        />
      </div>
    </article>
  );
};

export default ProductForm;
